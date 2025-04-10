// app/terms/components/Footer.tsx
import React from 'react';
import WhatsAppIcon from './WhatsAppIcon'; // Asumiendo que este componente existe y funciona
// Opcional: Importa un icono de GitHub si tienes uno disponible (ej. react-icons)
// import { FaGithub } from 'react-icons/fa'; 

const Footer: React.FC = () => {
  // --- CONFIGURACIÓN: Reemplaza estas URLs con las tuyas ---
  // 1. URL a las Discussions de tu repositorio GitHub
  const githubDiscussionsUrl = 'https://github.com/TheCuriousSloth/referenciales.cl/discussions'; // ¡Asegúrate que esta URL sea correcta!
  
  // 2. URL de WhatsApp para chat 1-a-1 (formato wa.me) con tu número dedicado
  // Reemplaza 569XXXXXXXX con tu número completo (código de país + número)
  const whatsappUrl = 'https://wa.me/56931769472'; // Ejemplo: https://wa.me/56931769472 
  // --- FIN CONFIGURACIÓN ---

  return (
    <footer className="mt-8 pt-4 border-t border-gray-200 text-sm text-gray-600 text-center">
      {/* Párrafo para GitHub Discussions (recomendado para público/técnico) */}
      <p className="mb-2">
        Para preguntas técnicas, sugerencias y discusiones públicas que puedan ayudar a otros, 
        visita nuestras{' '}
        <a
          href={githubDiscussionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-800 hover:text-black underline font-medium inline-flex items-center align-middle" // Estilo ligeramente diferente para destacar GitHub
        >
          {/* Opcional: Icono de GitHub */}
          {/* <FaGithub className="inline h-4 w-4 mr-1" /> */}
          GitHub Discussions
        </a>.
      </p>
      
      {/* Párrafo para WhatsApp (para consultas rápidas/directas) */}
      <p>
        Para consultas rápidas o contacto directo, puedes escribirnos por{' '}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-green-600 hover:text-green-800 font-medium inline-flex items-center align-middle" // Mantenemos estilo WhatsApp
        >
          WhatsApp
          {/* Asumiendo que WhatsAppIcon acepta className para margen */}
          <WhatsAppIcon className="ml-1 h-4 w-4" /> 
        </a>.
      </p>
    </footer>
  );
};

export default Footer;
