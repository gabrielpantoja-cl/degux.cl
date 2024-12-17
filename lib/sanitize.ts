// /lib/utils/sanitize.ts

/**
 * Sanitiza los datos de entrada para prevenir XSS y otros ataques
 * @param value - Valor a sanitizar
 * @returns Valor sanitizado
 */
export function sanitizeInput(value: string | number | undefined | null): string {
  if (value === undefined || value === null) {
    return '';
  }

  // Convertir a string si es número
  const stringValue = value.toString();

  return stringValue
    // Eliminar HTML tags
    .replace(/<[^>]*>/g, '')
    // Convertir caracteres especiales HTML
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    // Eliminar caracteres de control y unicode no imprimibles
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
    // Trim espacios en blanco
    .trim();
}