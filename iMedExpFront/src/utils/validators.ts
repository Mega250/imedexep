const NAME_REGEX = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s'.-]+$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const CURP_REGEX = /^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z\d]\d$/;
const PHONE_MX_REGEX = /^\d{10}$/;
const POSTAL_CODE_MX_REGEX = /^\d{5}$/;

function hasLongRepeat(value: string, maxRepeat = 3): boolean {
  const re = new RegExp(`(.)\\1{${maxRepeat},}`, "i");
  return re.test(value);
}

function hasSpamPattern(value: string): boolean {
  const letters = value.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/g, "");
  if (letters.length < 2) return false;
  const lower = letters.toLowerCase();
  if (letters.length >= 4) {
    const unique = new Set(lower).size;
    if (unique <= 2) return true;
  }
  if (/^(j[aeo]|h[aeio]|qw|asdf|zxcv|test|prueba|aaaa|nnnn)+j?$/i.test(lower)) return true;
  return false;
}

export function validateName(value: string, label = "Nombre"): string | null {
  const v = value.trim();
  if (v.length < 2) return `${label} debe tener al menos 2 caracteres.`;
  if (v.length > 80) return `${label} es demasiado largo.`;
  if (!NAME_REGEX.test(v)) return `${label} sólo admite letras, espacios y guiones.`;
  if (hasLongRepeat(v, 3)) return `${label} contiene caracteres repetidos no válidos.`;
  if (hasSpamPattern(v)) return `${label} no parece válido. Revísalo.`;
  if (!/[aeiouáéíóúAEIOUÁÉÍÓÚ]/.test(v)) return `${label} no parece válido. Revísalo.`;
  return null;
}

export function validateEmail(value: string): string | null {
  const v = value.trim().toLowerCase();
  if (!v) return "El correo es obligatorio.";
  if (v.length > 254) return "El correo es demasiado largo.";
  if (!EMAIL_REGEX.test(v)) return "Ingresa un correo válido (ej. tu@correo.com).";
  return null;
}

export function validatePassword(value: string): string | null {
  if (!value) return "La contraseña es obligatoria.";
  if (value.length < 8) return "La contraseña debe tener al menos 8 caracteres.";
  if (value.length > 128) return "La contraseña es demasiado larga.";
  if (!/[A-ZÁÉÍÓÚÜÑ]/.test(value)) return "La contraseña debe incluir al menos una mayúscula.";
  if (!/\d/.test(value)) return "La contraseña debe incluir al menos un número.";
  if (!/[^A-Za-z0-9]/.test(value)) return "La contraseña debe incluir al menos un símbolo (ej. ! ? . @).";
  return null;
}

export function validateProfessionalLicense(value: string): string | null {
  const v = value.trim();
  if (!v) return "La cédula profesional es obligatoria.";
  if (!/^\d{7,8}$/.test(v)) return "La cédula profesional debe tener 7 u 8 dígitos.";
  return null;
}

const CURP_DICT = "0123456789ABCDEFGHIJKLMNÑOPQRSTUVWXYZ";

function curpCheckDigit(curp: string): number {
  let total = 0;
  for (let i = 0; i < 17; i += 1) {
    const value = CURP_DICT.indexOf(curp[i]);
    if (value < 0) return -1;
    total += value * (18 - i);
  }
  return (10 - (total % 10)) % 10;
}

export function validateCurp(value: string): string | null {
  const v = value.trim().toUpperCase();
  if (!v) return "La CURP es obligatoria.";
  if (v.length !== 18) return "La CURP debe tener exactamente 18 caracteres.";
  if (!CURP_REGEX.test(v)) return "La CURP no tiene el formato oficial.";
  const expected = curpCheckDigit(v);
  if (expected < 0 || String(expected) !== v[17]) {
    return "El dígito verificador de la CURP no coincide.";
  }
  return null;
}

export function validatePhoneMx(value: string): string | null {
  if (!value) return null;
  const v = value.replace(/\D/g, "");
  if (!PHONE_MX_REGEX.test(v)) return "El teléfono debe tener 10 dígitos.";
  return null;
}

export function validatePostalCodeMx(value: string): string | null {
  if (!value) return null;
  const v = value.replace(/\D/g, "");
  if (!POSTAL_CODE_MX_REGEX.test(v)) return "El código postal debe tener 5 dígitos.";
  return null;
}

export function validateRequired(value: string, label: string): string | null {
  if (!value || !value.trim()) return `${label} es obligatorio.`;
  return null;
}
