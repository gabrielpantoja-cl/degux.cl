// app/ui/referenciales/table.tsx
import { referenciales } from '@prisma/client';
import { formatDateToLocal } from '@/lib/utils';
import { fetchFilteredReferenciales } from '@/lib/referenciales';

// Mantener la definición de campos sensibles
const SENSITIVE_FIELDS = ['comprador', 'vendedor'];
const isSensitiveField = (key: string) => SENSITIVE_FIELDS.includes(key);

// Función helper para manejar la visualización de datos sensibles
const formatFieldValue = (key: string, value: any) => {
  if (isSensitiveField(key)) {
    return '• • • • •';
  }

  if (key === 'fechaescritura' && value) {
    return formatDateToLocal(value.toISOString());
  }
  if ((key === 'monto' || key === 'superficie') && value) {
    return value.toLocaleString('es-CL');
  }
  return value;
};

interface ReferencialTableProps {
  query: string;
  currentPage: number;
}

type ReferencialKeys = keyof referenciales;

// Campos alineados con schema.prisma
const ALL_TABLE_HEADERS: { key: ReferencialKeys, label: string }[] = [
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
];

// Filtrar headers excluyendo campos sensibles
const VISIBLE_HEADERS = ALL_TABLE_HEADERS.filter(
  header => !SENSITIVE_FIELDS.includes(header.key)
);

export default async function ReferencialesTable({
  query,
  currentPage,
}: ReferencialTableProps) {
  const referenciales = await fetchFilteredReferenciales(query, currentPage);

  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          {/* Vista móvil */}
          <div className="md:hidden">
            {referenciales?.map((referencial: referenciales) => (
              <div key={referencial.id} className="mb-2 w-full rounded-md bg-white p-4">
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    {VISIBLE_HEADERS.map(({ key, label }) => (
                      <p key={key} className={key === 'cbr' ? 'font-medium' : ''}>
                        {label}: {formatFieldValue(key, referencial[key])}
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
                {referenciales?.map((referencial: referenciales) => (
                  <tr key={referencial.id} 
                      className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg">
                    {VISIBLE_HEADERS.map(({ key }) => (
                      <td key={key} className="whitespace-nowrap px-3 py-3">
                        {formatFieldValue(key, referencial[key])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}