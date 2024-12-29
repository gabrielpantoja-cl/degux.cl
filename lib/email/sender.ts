// lib/email/sender.ts
import nodemailer from 'nodemailer';
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

// Configurar el transporte de correo
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendWelcomeEmail(user: { email: string, name?: string }) {
  try {
    const template = emailTemplates.welcome(user.name || '');
    
    await transporter.sendMail({
      from: {
        name: 'Referenciales',
        address: process.env.EMAIL_USER!
      },
      to: user.email,
      subject: template.subject,
      html: template.html
    });

    emailLogger.debug('Welcome email sent', { email: user.email });
    return true;
  } catch (error) {
    emailLogger.error('Failed to send welcome email', error as Error);
    return false;
  }
}