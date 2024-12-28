// components/ui/referenciales/CsvUploader.tsx
'use client';

import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

interface CsvUploaderProps {
  users: Array<{ id: string; name: string; }>;
}

export default function CsvUploader({ users }: CsvUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', users[0]?.id || '');

      const response = await fetch('/api/referenciales/upload-csv', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Error al cargar archivo');
      toast.success('Archivo cargado exitosamente');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar el archivo');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadTemplate = () => {
    const headers = [
      'lat',
      'lng',
      'fojas',
      'numero',
      'anio',
      'cbr',
      'comprador',
      'vendedor',
      'predio',
      'comuna',
      'rol',
      'fechaescritura',
      'superficie',
      'monto',
      'observaciones'
    ].join(',');

    const exampleRow = [
      '-39.851241',
      '-73.215171',
      '100',
      '123',
      '2024',
      'Santiago',
      'Ana Compradora',
      'Juan Vendedor',
      'Fundo El Example',
      'Santiago',
      '123-45',
      '2024-03-21',
      '5000',
      '50000000',
      'Deslinde Norte: Río Example'
    ].join(',');

    const csvContent = `${headers}\n${exampleRow}`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'plantilla_referenciales.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm">
      <div className="space-y-4">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
            id="csv-upload"
            disabled={isUploading}
          />
          <label
            htmlFor="csv-upload"
            className="block cursor-pointer text-blue-600 hover:text-blue-800 mb-4"
          >
            {isUploading ? 'Cargando...' : 'Seleccionar archivo CSV'}
          </label>
          
          <button
            onClick={handleDownloadTemplate}
            className="text-sm text-gray-600 hover:text-gray-800 underline"
            type="button"
          >
            Descargar plantilla CSV
          </button>
          
          <p className="mt-2 text-sm text-gray-600">
            Descarga la plantilla, completa los datos y súbela para registrar múltiples referenciales.
            Los campos lat y lng son las coordenadas geográficas en grados decimales.
          </p>
        </div>
      </div>
    </div>
  );
}