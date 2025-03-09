"use client";

import Pagination from '@/components/ui/referenciales/pagination';
import Search from '@/components/ui/search';
import Table from '@/components/ui/referenciales/table';
import { CreateReferencial } from '@/components/ui/referenciales/buttons';
import { lusitana } from '@/components/ui/fonts';
import { ReferencialesTableSkeleton } from '@/components/ui/skeletons';
import { useState, useEffect, useCallback, Suspense } from 'react';
import { fetchReferencialesPages, fetchFilteredReferenciales } from '@/lib/referenciales';
import { exportReferencialesToXlsx } from '@/lib/exportToXlsx';
import { Referencial } from '@/types/referenciales';
import { useSearchParams } from 'next/navigation';

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

// Nuevo componente interno que usa useSearchParams
function ReferencialesContent() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [referenciales, setReferenciales] = useState<Referencial[]>([]);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const getSearchParams = useCallback(() => {
    const queryParam = searchParams?.get('query') || '';
    const pageParam = Number(searchParams?.get('page')) || 1;
    return { queryParam, pageParam };
  }, [searchParams]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { queryParam, pageParam } = getSearchParams();
      setQuery(queryParam);
      setCurrentPage(pageParam);

      const data = await fetchFilteredReferenciales(queryParam, pageParam);
      
      if (data && Array.isArray(data)) {
        setReferenciales(data as Referencial[]);
      } else {
        console.error('Datos inválidos:', data);
        setReferenciales([]);
        setError('Error en formato de datos');
      }

      const pages = await fetchReferencialesPages(queryParam);
      setTotalPages(typeof pages === 'number' ? pages : 1);
    } catch (error) {
      console.error('Error:', error);
      setReferenciales([]);
      setTotalPages(1);
      setError('Error al cargar datos');
    } finally {
      setIsLoading(false);
    }
  }, [getSearchParams]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleExport = () => {
    const exportableData = referenciales.map((ref) => ({
      ...ref,
      conservadorNombre: ref.conservador?.nombre || '',
      conservadorComuna: ref.conservador?.comuna || '',
    }));

    exportReferencialesToXlsx(exportableData, VISIBLE_HEADERS);
  };

  return (
    <div className="w-full relative">
      <div className="flex w-full items-center justify-between">
        <h1 className={`${lusitana.className} text-2xl`}>Referenciales de Compraventas</h1>
      </div>

      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <Search placeholder="Buscar referencial..." />
        <CreateReferencial />
      </div>

      {isLoading ? (
        <ReferencialesTableSkeleton />
      ) : error ? (
        <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-md">
          {error}
          <button
            onClick={fetchData}
            className="ml-4 px-2 py-1 bg-red-100 rounded hover:bg-red-200"
          >
            Reintentar
          </button>
        </div>
      ) : (
        <>
          <Table
            query={query}
            currentPage={currentPage}
            referenciales={referenciales}
          />

          <div className="mt-5 flex w-full justify-center">
            <Pagination totalPages={totalPages} />
          </div>
        </>
      )}

      <button
        onClick={handleExport}
        className="fixed bottom-4 right-4 mb-4 rounded bg-blue-200 px-3 py-1 text-xs text-blue-700 hover:bg-blue-300 z-[8888]"
        disabled={isLoading || referenciales.length === 0}
      >
        Exportar a XLSX
      </button>
    </div>
  );
}

// Componente principal que envuelve en Suspense
export default function Page() {
  return (
    <Suspense fallback={<ReferencialesTableSkeleton />}>
      <ReferencialesContent />
    </Suspense>
  );
}