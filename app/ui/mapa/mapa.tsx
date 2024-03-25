// app/ui/mapa/mapa.tsx
'use client';
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';

// Define el tipo para los puntos
type Point = {
    lat: number;
    lng: number;
};

const Mapa = () => {
    // Usa la anotación de tipo con useState
    const [data, setData] = useState<Point[]>([]);

    useEffect(() => {
        // Reemplaza la URL con la URL de tu base de datos
        axios.get('https://api.vercel.com/postgres-database-url')
            .then(response => {
                setData(response.data);
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
                    center={[point.lat, point.lng]}
                    radius={20}
                />
            ))}
        </MapContainer>
    );
};

export default Mapa;