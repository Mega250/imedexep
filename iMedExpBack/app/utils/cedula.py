"""Verificación de cédula profesional contra el padrón público de la SEP.

La SEP expone el backend Solr que usa su portal oficial
(https://www.cedulaprofesional.sep.gob.mx). No es una API documentada, así que
tratamos cualquier respuesta inesperada como "no verificable" para nunca
bloquear un registro legítimo si el servicio cambia o se cae.

Además del existir/no existir, clasificamos el título profesional en:
  - "health": pertenece al área de la salud (médico, enfermería, odontología…).
  - "non_health": claramente NO es del área de la salud (ingeniería, derecho…).
  - "unknown": no se pudo clasificar con certeza (se deja pasar).
"""
import logging
import unicodedata
from dataclasses import dataclass

import httpx

logger = logging.getLogger(__name__)

SEP_SOLR_URL = "http://search.sep.gob.mx/solr/cedulasCore/select"
_TIMEOUT_SECONDS = 4.0

# Raíces (sin acentos, mayúsculas) que identifican títulos del área de la salud.
_HEALTH_KEYWORDS = (
    "MEDIC", "CIRUJAN", "ENFERMER", "ODONTOLOG", "DENTIST", "ESTOMATOLOG",
    "PSICOLOG", "NUTRIC", "NUTRIOLOG", "FARMAC", "FISIOTERAP", "REHABILITAC",
    "OPTOMETR", "QUIROPRACT", "OBSTETR", "PARTER", "SALUD", "GINECOLOG",
    "PEDIATR", "CARDIOLOG", "NEUROLOG", "DERMATOLOG", "ONCOLOG", "RADIOLOG",
    "ANESTESIOLOG", "TRAUMATOLOG", "ORTOPED", "UROLOG", "OFTALMOLOG",
    "OTORRINO", "PSIQUIATR", "GERIATR", "GASTROENTEROLOG", "ENDOCRINOLOG",
    "NEFROLOG", "NEUMOLOG", "HEMATOLOG", "INFECTOLOG", "REUMATOLOG",
    "PATOLOG", "INTERNISTA", "BIOMEDIC", "AUDIOLOG", "PODOLOG", "PARAMEDIC",
    "TERAPIA", "TERAPEUT", "EPIDEMIOLOG", "INMUNOLOG", "TOXICOLOG",
    "GENETIC", "ANATOMIA", "FISIOLOG",
)

# Raíces que identifican títulos claramente FUERA del área de la salud.
_NON_HEALTH_KEYWORDS = (
    "INGENIER", "DERECHO", "ABOGAD", "CONTAD", "CONTADUR", "ARQUITECT",
    "ADMINISTRAC", "MERCADOTEC", "INFORMATIC", "COMPUTAC", "SISTEMAS",
    "COMUNICAC", "PERIODISM", "GASTRONOM", "TURISM", "PEDAGOG", "DOCENCIA",
    "FINANZAS", "ECONOMIA", "COMERCIO", "DISEÑO", "DISENO", "MUSIC",
    "VETERINAR", "AGRONOM", "SOCIOLOG", "ANTROPOLOG", "FILOSOFIA",
    "LETRAS", "TEOLOG", "CRIMINOLOG", "ACTUARIA", "MATEMATIC",
    "ARTES", "PUBLICIDAD", "NEGOCIOS", "LOGISTICA", "GEOLOG", "GEOGRAF",
)


@dataclass
class CedulaResult:
    status: str  # "found" | "not_found" | "unverified"
    titulo: str | None = None
    area: str = "unknown"  # "health" | "non_health" | "unknown"
    nombre: str | None = None
    paterno: str | None = None
    materno: str | None = None
    institucion: str | None = None
    anio: str | None = None


def _normalize(text: str) -> str:
    stripped = unicodedata.normalize("NFKD", text)
    stripped = "".join(ch for ch in stripped if not unicodedata.combining(ch))
    return stripped.upper()


def _only_digits(value: str) -> str:
    return "".join(ch for ch in value if ch.isdigit())


def classify_titulo(titulo: str | None) -> str:
    if not titulo:
        return "unknown"
    normalized = _normalize(titulo)
    # Exclusiones que contienen subcadenas "de salud" pero no son salud humana
    # (p. ej. "MEDICINA VETERINARIA" contiene "MEDIC").
    if "VETERINAR" in normalized:
        return "non_health"
    if any(keyword in normalized for keyword in _HEALTH_KEYWORDS):
        return "health"
    if any(keyword in normalized for keyword in _NON_HEALTH_KEYWORDS):
        return "non_health"
    return "unknown"


async def _solr_query(client: httpx.AsyncClient, query: str) -> dict | None:
    try:
        resp = await client.get(
            SEP_SOLR_URL,
            params={"q": query, "rows": 10, "wt": "json", "fl": "numCedula,titulo"},
        )
    except Exception as exc:  # noqa: BLE001 - cualquier fallo de red = no verificable
        logger.warning("SEP cedula request failed (%s): %s", query, exc)
        return None
    if resp.status_code != 200:
        logger.warning("SEP cedula non-200 (%s): %s", query, resp.status_code)
        return None
    try:
        return resp.json()
    except Exception as exc:  # noqa: BLE001 - respuesta no-JSON
        logger.warning("SEP cedula parse failed (%s): %s", query, exc)
        return None


def _field(doc: dict, key: str) -> str | None:
    value = doc.get(key)
    if isinstance(value, list):
        value = value[0] if value else None
    if value is None:
        return None
    text = str(value).strip()
    return text or None


def _pick_record(data: dict, digits: str) -> dict | None:
    response = data.get("response", {}) if isinstance(data, dict) else {}
    docs = response.get("docs", []) or []
    if not docs:
        return None
    target = digits.lstrip("0")
    for doc in docs:
        num = _only_digits(str(doc.get("numCedula", ""))).lstrip("0")
        if num and num == target:
            return doc
    # Sin coincidencia exacta de número: usa el primero como mejor esfuerzo.
    return docs[0]


async def verify_cedula(cedula: str) -> CedulaResult:
    digits = _only_digits(cedula)
    if not digits:
        return CedulaResult(status="unverified")

    async with httpx.AsyncClient(timeout=_TIMEOUT_SECONDS) as client:
        data = await _solr_query(client, f"numCedula:{digits}")
        if data is None:
            data = await _solr_query(client, digits)
        if data is None:
            return CedulaResult(status="unverified")

    response = data.get("response", {}) if isinstance(data, dict) else {}
    num_found = int(response.get("numFound", 0) or 0)
    if num_found <= 0:
        return CedulaResult(status="not_found")

    doc = _pick_record(data, digits) or {}
    titulo = _field(doc, "titulo")
    return CedulaResult(
        status="found",
        titulo=titulo,
        area=classify_titulo(titulo),
        nombre=_field(doc, "nombre"),
        paterno=_field(doc, "paterno"),
        materno=_field(doc, "materno"),
        institucion=_field(doc, "institucion"),
        anio=_field(doc, "anioRegistro"),
    )


async def verify_cedula_exists(cedula: str) -> bool | None:
    """Compatibilidad: True (existe), False (no existe), None (no verificable)."""
    result = await verify_cedula(cedula)
    if result.status == "found":
        return True
    if result.status == "not_found":
        return False
    return None
