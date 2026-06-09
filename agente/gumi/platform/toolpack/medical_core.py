from __future__ import annotations

import math
import os
import re
import uuid
from typing import Any

import httpx

_CURP = re.compile(r"\b[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d\b", re.IGNORECASE)
_EMAIL = re.compile(r"[\w.+-]+@[\w-]+\.[\w.-]+")
_PHONE = re.compile(r"\b(?:\+?52[\s-]?)?(?:\(?\d{2,3}\)?[\s-]?)?\d{3,4}[\s-]?\d{4}\b")
_DOSE = re.compile(
    r"\b([A-Za-zÁÉÍÓÚÑáéíóúñ][\wáéíóúñ-]+(?:\s+[A-Za-zÁÉÍÓÚÑáéíóúñ][\wáéíóúñ-]+){0,2})\s+(\d+(?:[.,]\d+)?)\s?(mg|g|mcg|µg|ml|ui)\b",
    re.IGNORECASE,
)

_CONVERSIONS = {
    ("mg/dl", "mmol/l"): lambda v: round(v / 18.0, 2),
    ("mmol/l", "mg/dl"): lambda v: round(v * 18.0, 1),
    ("c", "f"): lambda v: round(v * 9 / 5 + 32, 1),
    ("f", "c"): lambda v: round((v - 32) * 5 / 9, 1),
    ("kg", "lb"): lambda v: round(v * 2.2046226, 2),
    ("lb", "kg"): lambda v: round(v / 2.2046226, 2),
    ("cm", "in"): lambda v: round(v / 2.54, 2),
    ("in", "cm"): lambda v: round(v * 2.54, 1),
}

_REVIEWS: dict[str, dict] = {}


def _ok(**fields: Any) -> dict:
    return {"ok": True, "status": "success", **fields}


def _err(message: str, status: str = "invalid_input") -> dict:
    return {"ok": False, "status": status, "outcome": "terminal", "error": message}


def redact_phi(texto: Any, **_: Any) -> dict:
    salida = _CURP.sub("[CURP]", str(texto or ""))
    salida = _EMAIL.sub("[EMAIL]", salida)
    salida = _PHONE.sub("[TEL]", salida)
    return _ok(texto=salida)


def normalize_units(valor: Any, de: Any, a: Any, **_: Any) -> dict:
    try:
        numero = float(valor)
    except (TypeError, ValueError):
        return _err("valor no numerico")
    if not math.isfinite(numero):
        return _err("valor no finito")
    clave = (str(de).lower().strip(), str(a).lower().strip())
    conversion = _CONVERSIONS.get(clave)
    if conversion is None:
        return _err(f"conversion no soportada: {de} -> {a}")
    return _ok(valor_original=numero, de=clave[0], a=clave[1], resultado=conversion(numero))


def extract_medication_names(texto: Any, **_: Any) -> dict:
    encontrados: list[dict] = []
    for nombre, dosis, unidad in _DOSE.findall(str(texto or "")):
        encontrados.append({"medicamento": " ".join(nombre.split()), "dosis": f"{dosis} {unidad.lower()}"})
    return _ok(n=len(encontrados), medicamentos=encontrados)


def source_citation(titulo: Any, fuente: Any = "", autores: Any = "", anio: Any = "", url: Any = "", **_: Any) -> dict:
    partes = [str(parte).strip() for parte in (autores, titulo, fuente, anio) if str(parte).strip()]
    if not partes:
        return _err("se requiere al menos un titulo o una fuente")
    cita = ". ".join(partes)
    if str(url).strip():
        cita = f"{cita}. Disponible en: {str(url).strip()}"
    return _ok(cita=cita, trazable=bool(str(fuente).strip() or str(url).strip()))


def clinician_review_request(resumen: Any, hallazgos: Any = "", urgencia: Any = "rutina", **_: Any) -> dict:
    review_id = uuid.uuid4().hex[:12]
    registro = {
        "review_id": review_id,
        "resumen": str(resumen or ""),
        "hallazgos": str(hallazgos or ""),
        "urgencia": str(urgencia or "rutina"),
        "status": "pending_clinician_review",
        "requires_licensed_clinician": True,
    }
    _REVIEWS[review_id] = registro
    return _ok(review=registro, nota="Este contenido NO es un diagnostico; requiere revision y decision de un medico con licencia.")


_DISCLAIMER = (
    "ANALISIS PRELIMINAR generado por IA medica (MedGemma). NO es un diagnostico clinico ni reemplaza la "
    "interpretacion de un medico o radiologo con licencia; requiere verificacion y correlacion clinica humana."
)


async def analyze_medical_image(imagen: Any, instruccion: Any = "", **_: Any) -> dict:
    contenido = str(imagen or "").strip()
    if not contenido:
        return _err("imagen vacia (se espera base64 o URL)")
    base_url = os.environ.get("GUMI_MEDGEMMA_URL", "").rstrip("/")
    if not base_url:
        return {
            "ok": False,
            "status": "error",
            "outcome": "transient",
            "error": "MedGemma no esta configurado (define GUMI_MEDGEMMA_URL con un endpoint OpenAI-compatible); el analisis de imagenes medicas lo realiza el modelo MedGemma servido aparte.",
        }
    model = os.environ.get("GUMI_MEDGEMMA_MODEL", "google/medgemma-1.5-4b-it")
    image_url = contenido if contenido.startswith(("http://", "https://", "data:")) else f"data:image/png;base64,{contenido}"
    pregunta = str(instruccion or "").strip() or "Describe de forma PRELIMINAR los hallazgos visibles en esta imagen medica. No emitas un diagnostico definitivo."
    payload = {
        "model": model,
        "messages": [{"role": "user", "content": [{"type": "text", "text": pregunta}, {"type": "image_url", "image_url": {"url": image_url}}]}],
        "max_tokens": 700,
        "temperature": 0.0,
    }
    headers = {}
    key = os.environ.get("GUMI_MEDGEMMA_KEY")
    if key:
        headers["Authorization"] = f"Bearer {key}"
    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(f"{base_url}/chat/completions", json=payload, headers=headers)
    except Exception as exc:
        return {"ok": False, "status": "error", "outcome": "transient", "error": f"MedGemma no disponible: {exc}"}
    if response.status_code >= 400:
        return {"ok": False, "status": "error", "outcome": "transient", "error": f"MedGemma respondio http {response.status_code}"}
    analisis = response.json()["choices"][0]["message"]["content"]
    return _ok(analisis=analisis, disclaimer=_DISCLAIMER, requiere_revision_clinica=True)
