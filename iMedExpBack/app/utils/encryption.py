import hashlib

from cryptography.fernet import Fernet, InvalidToken

from app.core.config import settings


class Encryptor:
    def __init__(self) -> None:
        if not settings.encryption_key:
            raise RuntimeError(
                "ENCRYPTION_KEY no configurada. "
                "Genera una con: python -c \"from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())\""
            )
        self._fernet = Fernet(settings.encryption_key.encode())

    def encrypt(self, plaintext: str) -> bytes:
        return self._fernet.encrypt(plaintext.encode("utf-8"))

    def decrypt(self, ciphertext: bytes) -> str:
        try:
            return self._fernet.decrypt(ciphertext).decode("utf-8")
        except InvalidToken as exc:
            raise ValueError("No se pudo descifrar el dato.") from exc

    @staticmethod
    def hash_curp(curp: str) -> str:
        normalized = curp.strip().upper()
        return hashlib.sha256(normalized.encode("utf-8")).hexdigest()

_encryptor: Encryptor | None = None


def get_encryptor() -> Encryptor:
    global _encryptor
    if _encryptor is None:
        _encryptor = Encryptor()
    return _encryptor