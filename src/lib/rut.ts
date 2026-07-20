/** Normaliza RUT chileno: quita puntos/guión, DV en mayúscula (incluye K) */
export function normalizeRut(rut: string): string {
  return rut.replace(/\./g, '').replace(/-/g, '').toUpperCase();
}

/** Calcula dígito verificador (módulo 11) para el cuerpo numérico del RUT */
export function computeRutDv(body: string): string {
  const digits = body.replace(/\D/g, '');
  if (!digits) return '';

  let sum = 0;
  let mul = 2;
  for (let i = digits.length - 1; i >= 0; i--) {
    sum += parseInt(digits[i], 10) * mul;
    mul = mul === 7 ? 2 : mul + 1;
  }

  const expected = 11 - (sum % 11);
  if (expected === 11) return '0';
  if (expected === 10) return 'K';
  return String(expected);
}

/** Valida formato y dígito verificador (módulo 11). Acepta DV 0–9 o K. */
export function isValidRut(rut: string): boolean {
  const clean = normalizeRut(rut);
  if (clean.length < 2) return false;

  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);

  // Cuerpo solo dígitos; DV dígito o K
  if (!/^\d+$/.test(body)) return false;
  if (body.length < 7 || body.length > 8) return false;
  if (!/^[\dK]$/.test(dv)) return false;

  return dv === computeRutDv(body);
}

/**
 * Formato visual 12.345.678-9 / 12.345.678-K mientras escribe.
 * El usuario ingresa cuerpo + DV (incluida K); no se calcula solo.
 */
export function formatRutInput(value: string): string {
  // Permitir dígitos y K/k; el resto se ignora
  let clean = value.replace(/[^0-9kK]/g, '').toUpperCase();
  if (!clean) return '';

  // Evitar K en el cuerpo: solo el último carácter puede ser K
  const kIndex = clean.indexOf('K');
  if (kIndex !== -1 && kIndex !== clean.length - 1) {
    clean = clean.replace(/K/g, '');
  }

  // Máx. 8 dígitos de cuerpo + 1 DV
  if (clean.length > 9) clean = clean.slice(0, 9);

  if (clean.length <= 1) return clean;

  const body = clean.slice(0, -1).replace(/\D/g, '');
  const dv = clean.slice(-1);
  if (!body) return /^[\dK]$/.test(dv) ? dv : '';

  const formatted = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${formatted}-${dv}`;
}
