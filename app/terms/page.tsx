// app/terms/page.tsx
'use client';

import React from 'react';

export default function TermsPage() {
  const currentDate = new Date().toLocaleDateString('es-CL');

  return (
    <main className="container mx-auto p-6 max-w-4xl">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Términos y Condiciones de Uso – Referenciales.cl</h1>
        <p className="text-sm text-gray-600 mb-6">Última actualización: {currentDate}</p>

        <div className="prose prose-slate max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">1. Introducción</h2>
            <p className="mb-4 text-gray-700">
              Referenciales.cl es una aplicación web diseñada para proporcionar una base de datos colaborativa relacionada con transacciones de suelo en Chile, basada en información recolectada por peritos voluntarios. Esta información incluye datos de compraventa de propiedades obtenidos en Conservadores de Bienes Raíces (CBR).
            </p>
            <p className="mb-4 text-gray-700 font-semibold">
              Importante: Referenciales.cl no garantiza la exactitud, completitud o actualidad de los datos, ni se responsabiliza por el uso que los usuarios hagan de esta información.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">2. Uso de la Plataforma</h2>
            <h3 className="text-xl font-medium mb-2 text-gray-700">2.1. Finalidad</h3>
            <p className="mb-4 text-gray-700">
              Referenciales.cl está diseñado para promover la transparencia en el mercado de transacciones de suelo, proporcionando datos con fines informativos y estadísticos.
            </p>
            
            <h3 className="text-xl font-medium mb-2 text-gray-700">2.2. Prohibiciones</h3>
            <ul className="list-disc pl-6 mb-4 text-gray-700">
              <li>Queda estrictamente prohibido utilizar la información para acoso, fraude, o cualquier actividad contraria a la ley.</li>
              <li>No se permite la recolección masiva de datos desde la plataforma (scraping).</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">3. Marco Legal</h2>
            <p className="mb-4 text-gray-700">
              El acceso y uso del sitio web se rige íntegramente por las leyes de la República de Chile, específicamente:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700">
              <li>Ley N° 19.628 de Protección de Datos Personales</li>
              <li>Ley N° 19.496 sobre Derechos del Consumidor</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">4. Derechos del Usuario</h2>
            <p className="mb-4 text-gray-700">
              Los usuarios gozan de todos los derechos reconocidos por la legislación de protección al consumidor vigente en Chile, incluyendo los derechos de información, rectificación y cancelación de datos personales.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">5. Protección de Datos</h2>
            <p className="mb-4 text-gray-700">
              La plataforma cumple con la Ley N° 19.628, garantizando la protección de datos personales y el derecho a solicitar modificación o eliminación de información personal.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">6. Responsabilidades</h2>
            <p className="mb-4 text-gray-700">
              Los usuarios son responsables del uso ético y legal de la información proporcionada por la plataforma, respetando la privacidad y los derechos de terceros.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">7. Limitaciones</h2>
            <p className="mb-4 text-gray-700">
              La plataforma no garantiza la disponibilidad continua del servicio y se reserva el derecho de modificar o suspender el acceso sin previo aviso.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">8. Jurisdicción</h2>
            <p className="mb-4 text-gray-700">
              Cualquier controversia será sometida a la jurisdicción de los tribunales de justicia de la República de Chile.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">9. Modificaciones</h2>
            <p className="mb-4 text-gray-700">
              Referenciales.cl se reserva el derecho de modificar estos términos y condiciones en cualquier momento, notificando los cambios a través de la plataforma.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">10. Declaración de Buenas Prácticas</h2>
            <p className="mb-4 text-gray-700">
              Referenciales.cl fomenta el uso ético y responsable de la información pública, respetando la privacidad de los involucrados y promoviendo la transparencia en el mercado de bienes raíces en Chile.
            </p>
          </section>
        </div>

        <footer className="mt-8 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600 text-center">
            Para consultas y soporte: Comunidad WhatsApp +56912345678
          </p>
        </footer>
      </div>
    </main>
  );
}