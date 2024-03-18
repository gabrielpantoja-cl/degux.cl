import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const Mapa = () => {
    const mapRef = useRef(null);

    useEffect(() => {
        if (mapRef.current) {
            L.map(mapRef.current).setView([51.505, -0.09], 13);
        }
    }, []);

    return <div id="map" ref={mapRef} style={{ height: "100vh", width: "100vw" }} />;
};

export default Mapa;