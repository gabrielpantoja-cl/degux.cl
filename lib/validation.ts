// lib/validation.ts
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
];

export const validateReferencial = (formData: FormData): {
  isValid: boolean;
  errors: { [key: string]: string[] };
  message?: string;
} => {
  const errors: { [key: string]: string[] } = {};
  const userId = formData.get('userId');

  if (!userId) {
    errors['userId'] = ['Usuario no autenticado'];
    return {
      isValid: false,
      errors,
      message: 'Se requiere autenticación'
    };
  }

  // Validación de campos requeridos
  REQUIRED_FIELDS.forEach(field => {
    if (!formData.get(field)) {
      errors[field] = ['Este campo es requerido'];
    }
  });

  // Validación de fojas
  const fojas = formData.get('fojas') as string;
  if (fojas && !/^\d+[vV]?$/.test(fojas)) {
    errors['fojas'] = ['El campo fojas debe ser un número seguido opcionalmente de "v" o "V"'];
  }

  // Validación de números
  const numericalValidations = {
    latitud: { value: parseFloat(formData.get('latitud') as string), message: 'Latitud inválida' },
    longitud: { value: parseFloat(formData.get('longitud') as string), message: 'Longitud inválida' },
    superficie: { value: parseFloat(formData.get('superficie') as string), min: 0, message: 'Superficie inválida' },
    monto: { value: parseFloat(formData.get('monto') as string), min: 0, message: 'Monto inválido' }
  };

  Object.entries(numericalValidations).forEach(([field, validation]) => {
    if (isNaN(validation.value) || ('min' in validation && validation.value <= validation.min)) {
      errors[field] = [validation.message];
    }
  });

  // Validación de fecha
  const fechaEscritura = formData.get('fechaEscritura') as string;
  if (fechaEscritura && isNaN(Date.parse(fechaEscritura))) {
    errors['fechaEscritura'] = ['Fecha de escritura inválida'];
  }

  // Validación de campos de texto
  const textFields = ['cbr', 'comuna', 'predio', 'vendedor', 'comprador', 'rolAvaluo'];
  textFields.forEach(field => {
    const value = formData.get(field) as string;
    if (value && value.trim().length === 0) {
      errors[field] = ['Este campo no puede estar vacío'];
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    message: Object.keys(errors).length > 0 ? 'Por favor complete todos los campos requeridos correctamente' : undefined
  };
};