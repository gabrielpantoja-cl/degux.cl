// app/dashboard/referenciales/page.tsx
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
import { Referencial } from '@/lib/types/referenciales'; // Asegúrate de que la ruta sea correcta

// Definición de VISIBLE_HEADERS
const VISIBLE_HEADERS: { key: "id" | "lat" | "lng" | "fojas" | "numero" | "anio" | "cbr" | "comprador" | "vendedor" | "predio" | "comuna" | "rol" | "fechaescritura" | "superficie" | "monto" | "observaciones" | "userId"; label: string }[] = [
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

export default function Page({
  searchParams,
}: {
  searchParams?: {
    query?: string;
    page?: string;
  };
}) {
  const query = searchParams?.query || '';
  const currentPage = Number(searchParams?.page) || 1;
  const [referenciales, setReferenciales] = useState<Referencial[]>([]);
  const [totalPages, setTotalPages] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchFilteredReferenciales(query, currentPage);
      setReferenciales(data);
      const pages = await fetchReferencialesPages();
      setTotalPages(pages);
    };
    fetchData();
  }, [query, currentPage]);

  const handleExport = () => {
    exportReferencialesToXlsx(referenciales, VISIBLE_HEADERS);
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
      <Suspense key={query + currentPage} fallback={<ReferencialesTableSkeleton />}>
        <Table query={query} currentPage={currentPage} />
      </Suspense>
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
  );
}