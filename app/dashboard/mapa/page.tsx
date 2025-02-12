// app/dashboard/mapa/page.tsx
'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const Mapa = dynamic(() => import('@/components/ui/mapa/mapa'), {
    ssr: false, // Esto evitará que el componente se renderice en el servidor.
});

const MapPage = () => {
    return (
        <div>
            <Mapa />
        </div>
    );
};

export default MapPage;