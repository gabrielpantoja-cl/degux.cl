import { Config } from 'tailwindcss';
import tailwindcssAnimate from 'tailwindcss-animate';

const config: Config = {
  darkMode: ['class'], // Habilitar modo oscuro basado en clases
  content: [
    './pages/**/*.{ts,tsx}', // Incluir archivos en la carpeta pages
    './components/**/*.{ts,tsx}', // Incluir archivos en la carpeta components
    './app/**/*.{ts,tsx}', // Incluir archivos en la carpeta app
    './src/**/*.{ts,tsx}' // Incluir archivos en la carpeta src
  ],
  theme: {
    extend: {
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' }
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out'
      }
    }
  },
  plugins: [tailwindcssAnimate]
};

export default config;