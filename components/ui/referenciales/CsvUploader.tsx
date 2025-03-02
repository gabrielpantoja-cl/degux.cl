// components/ui/referenciales/CsvUploader.tsx
'use client';

import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

interface ValidationError {
  row: number;
  field: string;
  message: string;
}

interface ProcessingError {
  row: number;
  error: string;
}

interface CsvUploaderProps {
  users: Array<{ id: string; name: string; }>;
}

export default function CsvUploader({ users }: CsvUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadErrors, setUploadErrors] = useState<ValidationError[] | ProcessingError[] | null>(null);
  const [uploadStats, setUploadStats] = useState<{
    successCount?: number;
    errorCount?: number;
    partialSuccess?: boolean;
  } | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset state
    setUploadErrors(null);
    setUploadStats(null);
    
    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', users[0]?.id || '');

      const response = await fetch('/api/referenciales/upload-csv', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        if (result.success) {
          toast.success(`¡Éxito! Se cargaron ${result.count} registros.`);
          setUploadStats({
            successCount: result.count,
          });
        } else if (result.partialSuccess) {
          // Caso de éxito parcial (status 207)
          toast.success(`Se cargaron ${result.successCount} registros con ${result.errorCount} errores.`);
          setUploadErrors(result.errors);
          setUploadStats({
            successCount: result.successCount,
            errorCount: result.errorCount,
            partialSuccess: true
          });
        }
      } else {
        // Manejo de errores
        if (response.status === 400 && result.validationErrors) {
          // Errores de validación
          toast.error('Error de validación en el archivo CSV');
          setUploadErrors(result.validationErrors);
        } else if (response.status === 400 && result.errors) {
          // Errores de procesamiento
          toast.error('Error al procesar registros');
          setUploadErrors(result.errors);
        } else {
          // Error general
          toast.error(result.error || 'Error al cargar el archivo');
          console.error('Error en la respuesta:', result);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar el archivo. Revise la consola para más detalles.');
    } finally {
      setIsUploading(false);
      
      // Limpiar el input para permitir cargar el mismo archivo nuevamente
      const fileInput = document.getElementById('csv-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
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
      'Nueva Imperial', // Usando nombre del conservador, no su ID
      'Ana Compradora',
      'Juan Vendedor',
      'Fundo El Example',
      'Nueva Imperial',
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

  const renderErrorList = () => {
    if (!uploadErrors || uploadErrors.length === 0) return null;

    return (
      <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
        <h3 className="text-sm font-medium text-red-800 mb-2">
          {uploadStats?.partialSuccess 
            ? `Se encontraron ${uploadErrors.length} errores:`
            : 'Errores encontrados en el archivo CSV:'}
        </h3>
        <ul className="text-xs text-red-700 list-disc pl-5 space-y-1 max-h-64 overflow-y-auto">
          {uploadErrors.map((error, index) => (
            <li key={index}>
              {'field' in error 
                ? `Fila ${error.row}: ${error.message}`
                : `Fila ${error.row}: ${error.error}`}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const renderSuccessMessage = () => {
    if (!uploadStats?.successCount) return null;
    
    return (
      <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
        <h3 className="text-sm font-medium text-green-800">
          {uploadStats.partialSuccess 
            ? `Carga parcial completada: ${uploadStats.successCount} registros cargados exitosamente`
            : `Carga completada: ${uploadStats.successCount} registros cargados exitosamente`}
        </h3>
      </div>
    );
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
            className={`block cursor-pointer ${isUploading ? 'text-gray-400' : 'text-blue-600 hover:text-blue-800'} mb-4`}
          >
            {isUploading ? 'Cargando...' : 'Seleccionar archivo CSV'}
          </label>
          
          <button
            onClick={handleDownloadTemplate}
            className="text-sm text-gray-600 hover:text-gray-800 underline"
            type="button"
            disabled={isUploading}
          >
            Descargar plantilla CSV
          </button>
          
          <p className="mt-2 text-sm text-gray-600">
            Descarga la plantilla, completa los datos y súbela para registrar múltiples referenciales.
            Los campos lat y lng son las coordenadas geográficas en grados decimales.
          </p>

          <p className="mt-2 text-sm text-blue-600">
            Nota: En el campo &quot;cbr&quot; ingresa el nombre del conservador (ej. &quot;Nueva Imperial&quot;).
            No es necesario incluir el ID del conservador.
          </p>
        </div>

        {renderSuccessMessage()}
        {renderErrorList()}
        
      </div>
    </div>
  );
}