// src/lib/validation.ts
interface ValidationErrors {
  [key: string]: string[];
}

export const REQUIRED_FIELDS = [
  'fojas',
  'numero',
  'anno',
  'cbr',
  'comuna',
  'fechaEscritura',
  'latitud',
  'longitud',
  'predio',
  'vendedor',
  'comprador',
  'superficie',
  'monto',
  'rolAvaluo'
] as const;

export const validateReferencial = (formData: FormData): ValidationErrors | null => {
  const errors: ValidationErrors = {};

  // Validación de campos requeridos
  REQUIRED_FIELDS.forEach(field => {
    if (!formData.get(field)) {
      errors[field] = ['Este campo es requerido'];
    }
  });

  // Validación de coordenadas
  const latitud = parseFloat(formData.get('latitud') as string);
  const longitud = parseFloat(formData.get('longitud') as string);
  if (isNaN(latitud)) errors['latitud'] = ['Latitud inválida'];
  if (isNaN(longitud)) errors['longitud'] = ['Longitud inválida'];

  // Validación de números positivos
  const superficie = parseFloat(formData.get('superficie') as string);
  const monto = parseFloat(formData.get('monto') as string);
  if (isNaN(superficie) || superficie <= 0) errors['superficie'] = ['Superficie debe ser un número positivo'];
  if (isNaN(monto) || monto <= 0) errors['monto'] = ['Monto debe ser un número positivo'];

  return Object.keys(errors).length > 0 ? errors : null;
};

export const validateAuth = (userId: string | null): ValidationErrors | null => {
  if (!userId) {
    return {
      userId: ['Usuario no autenticado']
    };
  }
  return null;
};