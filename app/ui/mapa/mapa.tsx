// app/ui/mapa/mapa.tsx
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const Mapa = () => {
    const mapRef = useRef(null);

    useEffect(() => {
        if (mapRef.current) {
            const map = L.map(mapRef.current).setView([51.505, -0.09], 13);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                maxZoom: 19,
            }).addTo(map);
        }
    }, []);

    return <div id="map" ref={mapRef} style={{ height: "100vh", width: "100vw" }} />;
};

export default Mapa;