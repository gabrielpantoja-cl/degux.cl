'use client';

import React, { useEffect } from 'react';
import dynamic from 'next/dynamic';

const Mapa = dynamic(() => import('@/components/ui/mapa/mapa'), {
    ssr: false, // Esto evitará que el componente se renderice en el servidor.
});

const MapPage = () => {
    useEffect(() => {
        return () => {
            // Limpia el contenedor del mapa cuando el componente se desmonte
            const mapContainer = document.getElementById('map-container');
            if (mapContainer) {
                mapContainer.innerHTML = '';
            }
        };
    }, []);

    return (
        <div id="map-container">
            <Mapa />
        </div>
    );
};

export default MapPage;