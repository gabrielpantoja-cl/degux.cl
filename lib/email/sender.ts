// lib/email/sender.ts
import { emailTemplates } from './templates';

// Crear un logger simple para mantener la funcionalidad
const emailLogger = {
  debug: (message: string, data?: Record<string, unknown>) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[Email Debug] ${message}:`, data);
    }
  },
  error: (message: string, error: Error) => {
    console.error(`[Email Error] ${message}:`, error);
  }
};

// Función provisional que registra el intento de envío pero no envía realmente
export async function sendWelcomeEmail(user: { email: string, name?: string }) {
  try {
    // Solo registrar el intento de envío
    emailLogger.debug('Welcome email would be sent', { 
      email: user.email,
      name: user.name 
    });
    return true;
  } catch (error) {
    emailLogger.error('Error in welcome email handler', error as Error);
    return false;
  }
}

// TODO: Implementar el sistema de correos después de resolver la autenticación
// export async function configureEmailTransport() {
//   // Futura implementación del transporte de correo
// }