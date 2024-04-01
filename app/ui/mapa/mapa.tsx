// app/ui/mapa/mapa.tsx
'use client';
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { fetchReferencialesForMap } from '../../lib/mapData';

// Define el tipo para los puntos
type Point = {
    lat: number;
    lng: number;
    latLng: [number, number];
};

const Mapa = () => {
    // Usa la anotación de tipo con useState
    const [data, setData] = useState<Point[]>([]);

    useEffect(() => {
        fetchReferencialesForMap()
            .then(response => {
                setData(response);
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
            {data.map((point, index) => (
                <CircleMarker
                    key={index}
                    center={point.latLng}
                    radius={20}
                />
            ))}
        </MapContainer>
    );
};

export default Mapa;