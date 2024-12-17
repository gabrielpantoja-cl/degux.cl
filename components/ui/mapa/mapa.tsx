// app/ui/mapa/mapa.tsx
'use client';
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { fetchReferencialesForMap } from '@/lib/mapData';

type Point = {
    id: string;
    latLng: [number, number];
    lat: number;
    lng: number;
    userId: string;
    geom: [number, number];
    fojas?: string;
    numero?: string;
    anio: string;
    cbr?: string;
    comprador?: string;
    vendedor?: string;
    predio?: string;
    comuna?: string;
    rol?: string;
    fechaescritura?: Date;
    superficie?: number;
    monto?: number;
    observaciones?: string;
    [key: string]: any;
};

const Mapa = () => {
    const [data, setData] = useState<Point[]>([]);

    useEffect(() => {
        fetchReferencialesForMap()
            .then(response => {
                console.log('Datos recibidos del backend:', response);
                const points = response
                    .filter(point => point?.geom && Array.isArray(point.geom) && point.geom.length === 2)
                    .map(point => ({
                        ...point,
                        id: point.id,
                        latLng: [point.geom[1], point.geom[0]] as [number, number],
                        anio: point.anio?.toString() || '',
                        lat: point.lat,
                        lng: point.lng,
                        geom: point.geom
                    } as Point));
                
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
                    key={point.id}
                    center={point.latLng}
                    radius={20}
                >
                    <Popup>
                        <div>
                            {Object.entries(point).map(([key, value]) => (
                                key !== 'id' && key !== 'latLng' && (
                                    <p key={key}><strong>{key}:</strong> {value}</p>
                                )
                            ))}
                        </div>
                    </Popup>
                </CircleMarker>
            ))}
        </MapContainer>
    );
};

export default Mapa;