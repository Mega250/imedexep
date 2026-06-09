from __future__ import annotations

import base64
import os
import re
from typing import Optional

_INJECTION = re.compile(
    r"(ignor[ae].{0,25}(instrucc|anterior|previo|sistema|system)|olvida.{0,25}(instrucc|regla)|system\s*prompt|"
    r"eres\s+ahora|act[uú]a\s+como\s+si|modo\s+desarrollador|developer\s+mode|jailbreak|disregard\s+(the\s+)?above|"
    r"reveal.{0,25}(prompt|instrucc)|muestra.{0,25}(tu\s+prompt|tus\s+instrucc))",
    re.IGNORECASE,
)

_SIGNATURES = (b"\xff\xd8\xff", b"\x89PNG\r\n\x1a\n", b"GIF8", b"RIFF", b"BM", b"II*\x00", b"MM\x00*")


def max_image_bytes() -> int:
    return int(os.environ.get("GUMI_MAX_IMAGE_BYTES", str(8 * 1024 * 1024)))


def looks_injection(text: str) -> bool:
    return bool(_INJECTION.search(text or ""))


def image_ok(b64: Optional[str]) -> bool:
    if not b64:
        return True
    raw = b64.split(",", 1)[-1]
    try:
        decoded = base64.b64decode(raw, validate=False)
    except Exception:
        return False
    if not decoded or len(decoded) > max_image_bytes():
        return False
    return decoded[:8].startswith(_SIGNATURES) or decoded[:4] in (b"\xff\xd8\xff\xe0", b"\xff\xd8\xff\xe1")
