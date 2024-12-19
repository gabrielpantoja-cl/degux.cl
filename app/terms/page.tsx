// app/terms/page.tsx

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
              Referenciales.cl es una aplicación web diseñada para proporcionar una base de datos colaborativa relacionada con transacciones de suelo en Chile, basada en información recolectada por personas voluntarias. Esta información incluye datos de compraventas de propiedades obtenidos en Conservadores de Bienes Raíces (CBR).
            </p>
            <p className="mb-4 text-gray-700">
            Referenciales.cl es una iniciativa sin fines de lucro que busca contribuir al acceso libre de información. No garantizamos la exactitud, completitud o actualidad de los datos, ni nos responsabilizamos por el uso que los usuarios hagan de esta información. Nuestro objetivo es facilitar el acceso a datos de referencia para beneficio de la comunidad.
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
              <li>Está estrictamente prohibido utilizar la información para acoso, fraude, o cualquier actividad contraria a la ley.</li>
              <li>No se permite la recolección masiva de datos desde la plataforma (scraping).</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">3. Autenticación y Uso de Servicios de Terceros</h2>
            <p className="mb-4 text-gray-700">
                            
            Referenciales.cl utiliza Google como único autenticador.
            Los usuarios deben iniciar sesión con su cuenta de Google,
            delegando la gestión de seguridad y datos a Google según sus términos y políticas.
            Referenciales.cl no almacena contraseñas y sigue las mejores prácticas de seguridad.
            
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">4. Marco Legal</h2>
            <p className="mb-4 text-gray-700">
              El acceso y uso del sitio web se rige íntegramente por las leyes de la República de Chile, incluyendo, pero no limitado a:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700">
              <li>Ley N° 19.628 de Protección de Datos Personales</li>
              <li>Ley N° 19.496 sobre Derechos del Consumidor</li>
              <li>Ley N° 20.285 sobre Acceso a la Información Pública</li>
              <li>Código Civil de Chile</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">5. Derechos del Usuario</h2>
            <p className="mb-4 text-gray-700">
              Los usuarios gozan de todos los derechos reconocidos por la legislación de protección al consumidor vigente en Chile, incluyendo los derechos de información, rectificación y cancelación de datos personales.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">6. Protección de Datos</h2>
            <p className="mb-4 text-gray-700">
              Referenciales.cl se compromete a cumplir con la Ley N° 19.628 sobre Protección de Datos Personales, asegurando que todos los datos personales recolectados y procesados en la plataforma sean tratados de manera segura y conforme a la ley. Esto incluye, pero no se limita a, los siguientes aspectos:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>
                <span className="font-medium">Derecho de Acceso:</span> Los usuarios tienen el derecho a acceder a sus datos personales almacenados en la plataforma.
              </li>
              <li>
                <span className="font-medium">Derecho de Rectificación:</span> Los usuarios pueden solicitar la corrección de sus datos personales si estos son inexactos o están desactualizados.
              </li>
              <li>
                <span className="font-medium">Derecho de Cancelación:</span> Los usuarios tienen el derecho a solicitar la eliminación de sus datos personales cuando estos ya no sean necesarios para los fines para los que fueron recolectados, o cuando el usuario retire su consentimiento.
              </li>
              <li>
                <span className="font-medium">Derecho de Oposición:</span> En casos específicos, los usuarios pueden oponerse al tratamiento de sus datos personales.
              </li>
            </ul>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h3 className="text-lg font-medium mb-2 text-gray-800">Proceso de Reclamación</h3>
              <p className="text-gray-700">
                Para ejercer cualquiera de estos derechos o realizar consultas privadas, contáctanos directamente al número oficial de WhatsApp:{' '}
                <a 
                  href="https://wa.me/569931769472" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-green-600 hover:text-green-800 inline-flex items-center"
                >
                  +56 9 9317 6947
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24" 
                    fill="currentColor" 
                    className="w-4 h-4 ml-1"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                     <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 22c-5.523 0-10-4.477-10-10S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                    </svg>
                    </a>
                  </p>
              </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium mb-2 text-gray-800">Medidas de Seguridad</h3>
              <p className="text-gray-700">
                Referenciales.cl implementa medidas técnicas y organizativas adecuadas para proteger los datos personales contra el acceso no autorizado, la divulgación, la alteración o la destrucción.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">7. Responsabilidades</h2>
            <p className="mb-4 text-gray-700">
              Los usuarios son responsables del uso ético y legal de la información proporcionada por la plataforma, respetando la privacidad y los derechos de terceros. Cualquier uso indebido de la información será responsabilidad exclusiva del usuario.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">8. Limitaciones</h2>
            <p className="mb-4 text-gray-700">
              La plataforma no garantiza la disponibilidad continua del servicio y se reserva el derecho de modificar o suspender el acceso sin previo aviso.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">9. Jurisdicción</h2>
            <p className="mb-4 text-gray-700">
              Cualquier controversia será sometida a la jurisdicción de los tribunales de justicia de la República de Chile.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">10. Modificaciones</h2>
            <p className="mb-4 text-gray-700">
              Referenciales.cl se reserva el derecho de modificar estos términos y condiciones en cualquier momento, notificando los cambios a través de la plataforma.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">11. Declaración de Buenas Prácticas</h2>
            <p className="mb-4 text-gray-700">
              Referenciales.cl fomenta el uso ético y responsable de la información pública, respetando la privacidad de los involucrados y promoviendo la transparencia en el mercado de bienes raíces en Chile.
            </p>
          </section>
        </div>

        <footer className="mt-8 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-center space-x-2">
           <p className="text-sm text-gray-600 text-center">
              Para consultas públicas sobre el proyecto, puedes unirte a nuestro grupo de WhatsApp{' '}
              <a 
                href="https://chat.whatsapp.com/K9ez4VsZ8O51X8Qsk3MxzV" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-green-600 hover:text-green-700 inline-flex items-center"
              >
                haciendo clic aquí
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  fill="currentColor" 
                  className="w-4 h-4 ml-1"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
               </svg>
               </a>
              </p>
           </div>
        </footer>
      </div>
    </main>
  );
}