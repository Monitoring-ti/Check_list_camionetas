/** Normaliza RUT chileno: quita puntos/guión, DV en mayúscula */
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

function formatBody(body: string): string {
  return body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/** Valida dígito verificador módulo 11 */
export function isValidRut(rut: string): boolean {
  const clean = normalizeRut(rut);
  if (clean.length < 2) return false;

  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);
  if (!/^\d+$/.test(body) || body.length < 7 || body.length > 8) return false;

  return dv === computeRutDv(body);
}

/**
 * Formato visual con DV automático.
 * - Escribe solo el número (cuerpo): al llegar a 7–8 dígitos se completa el DV.
 * - Si pega un RUT completo válido, se respeta.
 */
export function formatRutInput(value: string): string {
  const raw = value.replace(/[^0-9kK]/g, '').toUpperCase();
  if (!raw) return '';

  // Pegado / edición de RUT completo válido (cuerpo + DV)
  if (raw.length >= 8) {
    const bodyGuess = raw.slice(0, -1).replace(/\D/g, '');
    const dvGuess = raw.slice(-1);
    if (
      bodyGuess.length >= 7 &&
      bodyGuess.length <= 8 &&
      /^[\dK]$/.test(dvGuess) &&
      computeRutDv(bodyGuess) === dvGuess
    ) {
      return `${formatBody(bodyGuess)}-${dvGuess}`;
    }
  }

  // Solo cuerpo numérico (máx. 8). DV se calcula solo.
  const body = raw.replace(/\D/g, '').slice(0, 8);
  if (body.length === 0) return '';
  if (body.length < 7) return formatBody(body);

  const dv = computeRutDv(body);
  return `${formatBody(body)}-${dv}`;
}
