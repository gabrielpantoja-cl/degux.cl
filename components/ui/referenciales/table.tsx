// app/ui/referenciales/table.tsx
"use client";

import { formatDateToLocal } from '@/lib/utils';
import { fetchFilteredReferenciales } from '@/lib/referenciales';
import { useState, useEffect } from 'react';
import { Referencial } from '@/types/referenciales';

// Mantener la definición de campos sensibles
const SENSITIVE_FIELDS = ['comprador', 'vendedor'];
const isSensitiveField = (key: string) => SENSITIVE_FIELDS.includes(key);

// Definir tipo para referencial con relaciones
interface ReferencialWithRelations extends Omit<Referencial, 'conservador'> {
  user: {
    name: string | null;
    email: string;
  };
  conservador: {
    id: string;
    nombre: string;
    comuna: string;
  } | null;
}

// Función helper para manejar la visualización de datos sensibles
const formatFieldValue = (key: string, value: any, referencial?: ReferencialWithRelations) => {
  if (isSensitiveField(key)) {
    return '• • • • •';
  }

  if (key === 'fechaescritura' && value) {
    return formatDateToLocal(new Date(value).toISOString());
  }
  if ((key === 'monto' || key === 'superficie') && value !== undefined) {
    return value.toLocaleString('es-CL');
  }
  if (key === 'conservador' && referencial?.conservador) {
    return referencial.conservador.nombre;
  }
  return value || '';
};

interface ReferencialTableProps {
  query: string;
  currentPage: number;
}

type BaseKeys = keyof Omit<Referencial, 'user' | 'conservador'>;
type DisplayKeys = BaseKeys | 'conservador';

// Campos alineados con schema.prisma
const ALL_TABLE_HEADERS: { key: DisplayKeys, label: string }[] = [
  { key: 'cbr', label: 'CBR' },
  { key: 'fojas', label: 'Fojas' },
  { key: 'numero', label: 'Número' },
  { key: 'anio', label: 'Año' },
  { key: 'predio', label: 'Predio' },
  { key: 'comuna', label: 'Comuna' },
  { key: 'rol', label: 'Rol' },
  { key: 'fechaescritura', label: 'Fecha de escritura' },
  { key: 'monto', label: 'Monto ($)' },
  { key: 'superficie', label: 'Superficie (m²)' },
  { key: 'observaciones', label: 'Observaciones' },
  { key: 'conservador', label: 'Conservador' },
];

// Filtrar headers excluyendo campos sensibles
const VISIBLE_HEADERS = ALL_TABLE_HEADERS.filter(
  header => !SENSITIVE_FIELDS.includes(header.key)
);

export default function ReferencialesTable({
  query,
  currentPage,
}: ReferencialTableProps) {
  const [referenciales, setReferenciales] = useState<ReferencialWithRelations[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Set loading state at the beginning of data fetch
    setLoading(true);
    console.log(`Fetching data for page ${currentPage} with query "${query}"`);
    
    const fetchData = async () => {
      try {
        // Asegurarse de que query y currentPage sean válidos antes de pasar a la función
        const safeQuery = typeof query === 'string' ? query : '';
        const safePage = typeof currentPage === 'number' && !isNaN(currentPage) ? currentPage : 1;
        
        console.log(`Calling fetchFilteredReferenciales with query="${safeQuery}", page=${safePage}`);
        const data = await fetchFilteredReferenciales(safeQuery, safePage);
        
        // Asegurarse de que data es un array antes de actualizar el estado
        if (data && Array.isArray(data)) {
          // Asegurar que cada referencial tiene las propiedades necesarias
          const validReferenciales = data.filter(ref => 
            ref && typeof ref === 'object' && 'id' in ref
          ) as ReferencialWithRelations[];
          
          console.log(`Received ${validReferenciales.length} referenciales for page ${safePage}`);
          setReferenciales(validReferenciales);
        } else {
          console.error('Los datos recibidos no son un array:', data);
          setReferenciales([]);
        }
      } catch (error) {
        console.error('Error al cargar referenciales:', error);
        setReferenciales([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [query, currentPage]); // Include both dependencies directly

  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        {/* Show current page information */}
        <div className="text-sm text-gray-500 mb-2">
          {loading ? (
            "Cargando datos..."
          ) : (
            <>
              Mostrando página {currentPage} {query ? `con filtro "${query}"` : ""}
            </>
          )}
        </div>
        
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          {loading ? (
            // Loading state
            <div className="flex justify-center items-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : referenciales.length === 0 ? (
            // Empty state
            <div className="text-center py-10">
              <p className="text-gray-500">No hay resultados para mostrar</p>
              {query && <p className="text-sm text-gray-400 mt-2">Prueba con una búsqueda diferente</p>}
            </div>
          ) : (
            <>
              {/* Vista móvil */}
              <div className="md:hidden">
                {referenciales.map((referencial) => (
                  <div key={referencial.id} className="mb-2 w-full rounded-md bg-white p-4">
                    <div className="flex items-center justify-between border-b pb-4">
                      <div>
                        {VISIBLE_HEADERS.map(({ key, label }) => (
                          <p key={key} className={key === 'cbr' ? 'font-medium' : ''}>
                            {label}: {
                              key === 'conservador' 
                                ? (referencial.conservador?.nombre || '-') 
                                : formatFieldValue(key, (referencial as any)[key], referencial)
                            }
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Vista desktop */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full text-gray-900">
                  <thead className="rounded-lg text-left text-sm font-normal">
                    <tr>
                      {VISIBLE_HEADERS.map(({ key, label }) => (
                        <th key={key} scope="col" className="px-3 py-5 font-medium">
                          {label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {referenciales.map((referencial) => (
                      <tr key={referencial.id} 
                          className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg">
                        {VISIBLE_HEADERS.map(({ key }) => (
                          <td key={key} className="whitespace-nowrap px-3 py-3">
                            {key === 'conservador' 
                              ? (referencial.conservador?.nombre || '-') 
                              : formatFieldValue(key, (referencial as any)[key], referencial)
                            }
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}