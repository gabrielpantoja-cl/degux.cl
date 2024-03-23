// app/ui/mapa/mapa.tsx
'use client';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const Mapa = () => {
    return (
        <MapContainer center={[51.505, -0.09]} zoom={13} style={{ height: "100vh", width: "100vw" }}>
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
        </MapContainer>
    );
};

export default Mapa;