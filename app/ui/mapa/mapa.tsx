// app/ui/mapa/mapa.tsx
'use client';
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { fetchReferencialesForMap } from '../../lib/mapData';

type Point = {
    id: string; // Asumiendo que cada punto tiene un identificador único
    geom: [number, number]; // geom no es opcional
};

const Mapa = () => {
    const [data, setData] = useState<Point[]>([]);

    useEffect(() => {
        fetchReferencialesForMap()
            .then(response => {
                console.log('Datos recibidos del backend:', response); // Verificar la respuesta del backend
                const points = response.map(point => {
                    if (!point.geom) {
                        console.error('Error: point.geom is undefined for point', point);
                        return null; // O manejar el error de otra manera
                    }
                    // Asumiendo que el backend no proporciona un ID, usamos el índice como fallback
                    const uniqueId = point.id || `point-${point.geom.join('-')}`;
                    return {
                        ...point,
                        id: uniqueId,
                        geom: [point.geom[1], point.geom[0]] // Invertir las coordenadas
                    };
                }).filter(point => point !== null); // Filtrar puntos nulos
                setData(points);
            })
            .catch(error => {
                console.error('Error fetching data: ', error);
            });
    }, []);

    return (
        <MapContainer center={[-39.8142, -73.2459]} zoom={13} style={{ height: "100vh", width: "100vw" }}>
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {data.map(point => (
                <CircleMarker
                    key={point.id} // Usar el ID único como clave
                    center={point.geom} // Asegurarse de que geom esté definido
                    radius={20}
                />
            ))}
        </MapContainer>
    );
};

export default Mapa;