import React from 'react';

export interface Referencial {
    id: number;
    lat: number;
    lng: number;
    name: string;
}

export interface MapaProps {
    referenciales: Referencial[];
}

const MapaPage: React.FC<MapaProps> = ({ referenciales }) => {
    // Aquí va tu lógica de renderizado
    return (
        <div>
            {/* Renderiza tus referenciales aquí */}
        </div>
    );
}

export default MapaPage;