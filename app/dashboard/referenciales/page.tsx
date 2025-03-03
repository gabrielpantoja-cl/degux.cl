"use client";

import Pagination from '@/components/ui/referenciales/pagination';
import Search from '@/components/ui/search';
import Table from '@/components/ui/referenciales/table';
import { CreateReferencial } from '@/components/ui/referenciales/buttons';
import { lusitana } from '@/components/ui/fonts';
import { ReferencialesTableSkeleton } from '@/components/ui/skeletons';
import { Suspense, useState, useEffect } from 'react';
import { fetchReferencialesPages, fetchFilteredReferenciales } from '@/lib/referenciales';
import { exportReferencialesToXlsx } from '@/lib/exportToXlsx';
import { Referencial } from '@/types/referenciales';

// Definimos un tipo específico para las claves exportables
type ExportableKeys =
  | 'cbr'
  | 'fojas'
  | 'numero'
  | 'anio'
  | 'predio'
  | 'comuna'
  | 'rol'
  | 'fechaescritura'
  | 'monto'
  | 'superficie'
  | 'observaciones'
  | 'conservadorId';

// Actualizamos VISIBLE_HEADERS para usar ExportableKeys
const VISIBLE_HEADERS: { key: ExportableKeys; label: string }[] = [
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
  { key: 'conservadorId', label: 'ID Conservador' },
];

// Definimos un tipo específico para los datos que devuelve fetchFilteredReferenciales
interface ReferencialWithRelations extends Omit<Referencial, 'conservador'> {
  user: {
    name: string | null;
    email: string;
  };
  conservador: {
    nombre: string;
    comuna: string;
  };
}

// Actualizamos PageProps para que searchParams pueda ser una Promise
interface PageProps {
  searchParams?: Promise<{ query?: string; page?: string }>;
}

export default function Page({ searchParams }: PageProps) {
  const [query, setQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [referenciales, setReferenciales] = useState<ReferencialWithRelations[]>([]);
  const [totalPages, setTotalPages] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Resolvemos searchParams si es una Promise
        const resolvedSearchParams = await searchParams;
        const queryParam = resolvedSearchParams?.query || '';
        const pageParam = Number(resolvedSearchParams?.page) || 1;

        // Actualizamos el estado con los parámetros resueltos
        setQuery(queryParam);
        setCurrentPage(pageParam);

        console.log(`Fetching data with query: "${queryParam}", page: ${pageParam}`);

        // Obtenemos los datos filtrados
        const data = await fetchFilteredReferenciales(queryParam, pageParam);

        if (data && Array.isArray(data)) {
          setReferenciales(data as ReferencialWithRelations[]);
        } else {
          console.error('Datos de referenciales inválidos:', data);
          setReferenciales([]);
        }

        // Obtenemos el total de páginas
        const pages = await fetchReferencialesPages(queryParam);
        setTotalPages(typeof pages === 'number' ? pages : 1);
      } catch (error) {
        console.error('Error al cargar datos:', error);
        setReferenciales([]);
        setTotalPages(1);
      }
    };

    fetchData();
  }, [searchParams]);

  const handleExport = () => {
    const exportableData = referenciales.map((ref) => {
      const { conservador, ...rest } = ref;
      return {
        ...rest,
        conservadorNombre: conservador?.nombre || '',
        conservadorComuna: conservador?.comuna || '',
      };
    });

    exportReferencialesToXlsx(exportableData, VISIBLE_HEADERS);
  };

  const tableKey = `table-${currentPage}-${query}`;

  return (
    <Suspense fallback={<ReferencialesTableSkeleton />}>
      <div className="w-full relative">
        <div className="flex w-full items-center justify-between">
          <h1 className={`${lusitana.className} text-2xl`}>Referenciales de Compraventas</h1>
        </div>
        <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
          <Search placeholder="Buscar referencial..." />
          <CreateReferencial />
        </div>

        <div key={tableKey}>
          <Table query={query} currentPage={currentPage} />
        </div>

        <div className="mt-5 flex w-full justify-center">
          <Pagination totalPages={totalPages} />
        </div>

        <button
          onClick={handleExport}
          className="fixed bottom-4 right-4 mb-4 rounded bg-blue-200 px-3 py-1 text-xs text-blue-700 hover:bg-blue-300 z-[8888]"
        >
          Exportar a XLSX
        </button>
      </div>
    </Suspense>
  );
}