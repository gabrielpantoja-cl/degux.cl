// app/dashboard/mapa/page.tsx
import React from 'react';
import dynamic from 'next/dynamic';

const Mapa = dynamic(() => import('../../ui/mapa/mapa'), {
    ssr: false, // This will prevent the component from rendering on the server.
});

const MapPage = () => {
    return (
        <div>
            <Mapa />
        </div>
    );
};

export default MapPage;