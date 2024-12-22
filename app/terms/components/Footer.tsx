// app/terms/components/Footer.tsx
import React from 'react';
import WhatsAppIcon from './WhatsAppIcon';

const Footer: React.FC = () => (
  <footer className="mt-8 pt-4 border-t border-gray-200">
    <div className="flex items-center justify-center space-x-2">
      <p className="text-sm text-gray-600 text-center">
        Para consultas públicas sobre el proyecto, puedes unirte al grupo de WhatsApp{' '}
        <a 
          href="https://chat.whatsapp.com/K9ez4VsZ8O51X8Qsk3MxzV" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-green-600 hover:text-green-700 inline-flex items-center"
        >
          haciendo clic aquí
          <WhatsAppIcon />
        </a>
      </p>
    </div>
  </footer>
);

export default Footer;