'use client';

import { useEffect, useState } from 'react';

interface UfData {
  valor: number;
  fecha: string;
}

export default function UfDisplay() {
  const [ufData, setUfData] = useState<UfData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUf = async () => {
      try {
        const response = await fetch('/api/uf', {
          cache: 'no-store'
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Error al obtener el valor de la UF');
        }
        
        const data = await response.json();
        setUfData(data);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Error desconocido');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUf();
  }, []);

  if (isLoading) {
    return (
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-md animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-3/4"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <p className="text-red-600">Error: {error}</p>
      </div>
    );
  }

  if (!ufData) return null;

  const formattedValue = new Intl.NumberFormat('es-CL', { 
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(ufData.valor);

  const formattedDate = new Date(ufData.fecha).toLocaleDateString('es-CL');

  return (
    <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
      <div className="flex flex-col space-y-1">
        <h3 className="text-lg font-medium text-primary">Valor UF</h3>
        <p className="text-2xl font-bold text-primary">$ {formattedValue}</p>
        <p className="text-sm text-gray-600">Fecha: {formattedDate}</p>
      </div>
    </div>
  );
}