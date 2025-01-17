// components/ui/dashboard/ProgressBar.tsx
'use client';

import { useEffect, useState } from 'react';

function ProgressBar({ totalReferenciales }: { totalReferenciales: number }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = Math.min((totalReferenciales / 100) * 100, 100);
    const duration = 2000; // Duración de la animación en milisegundos
    const increment = end / (duration / 10);

    const interval = setInterval(() => {
      start += increment;
      if (start >= end) {
        start = end;
        clearInterval(interval);
      }
      setProgress(start);
    }, 10);

    return () => clearInterval(interval);
  }, [totalReferenciales]);

  return (
    <div className="p-4 bg-blue-50 border border-blue-200 rounded-md mb-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-blue-700">Referenciales agregados: {totalReferenciales}</span>
        <span className="text-blue-700">Objetivo: 100</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-4">
        <div
          className="bg-blue-500 h-4 rounded-full transition-all duration-500 ease-in-out"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
}

export default ProgressBar;