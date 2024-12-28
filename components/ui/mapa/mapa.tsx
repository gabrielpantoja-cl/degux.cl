// components/ui/mapa/mapa.tsx
'use client';
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import 'leaflet/dist/leaflet.css';
import 'leaflet-geosearch/dist/geosearch.css';
import './mapa.css'; // Importa el archivo CSS personalizado
import { fetchReferencialesForMap } from '@/lib/mapData';
import { MapMarker, Point } from '@/components/ui/mapa/MapMarker';
import L from 'leaflet';

// Componente para el botón de ubicación
const LocationButton = () => {
    const map = useMap();
    const [loading, setLoading] = useState(false);

    const handleLocationClick = () => {
        setLoading(true);

        // verificar si estamos en https
        if (typeof window !== 'undefined' && window.location.protocol !== 'https:' && process.env.NODE_ENV === 'production') {
            alert('La geolocalización requiere una conexión segura (HTTPS)');
            setLoading(false);
            return;
        }

        // Verificar si la geolocalización está disponible
        if (!navigator.geolocation) {
            alert('Tu navegador no soporta geolocalización');
            setLoading(false);
            return;
        }

        const options = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        };

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                map.flyTo([latitude, longitude], 15, {
                    duration: 2
                });
                setLoading(false);
            },
            (error) => {
                setLoading(false);
                let errorMessage = 'No se pudo obtener tu ubicación';
                
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = 'Permiso denegado para obtener ubicación';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = 'Ubicación no disponible';
                        break;
                    case error.TIMEOUT:
                        errorMessage = 'Se agotó el tiempo de espera';
                        break;
                }
                
                console.error('Error de geolocalización:', error.message);
                alert(errorMessage);
            },
            options
        );
    };

    return (
        <button 
            onClick={handleLocationClick}
            className="absolute z-[1000] bottom-8 right-8 bg-blue-500 bg-opacity-80 hover:bg-opacity-100 hover:bg-blue-600 text-white rounded-full p-2 shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            disabled={loading}
            title="Obtener mi ubicación"
        >
            {loading ? (
                <span className="animate-spin text-sm">⌛</span>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            )}   
        </button>
    );
};

// Configura el icono del marcador personalizado
const redIcon = new L.Icon({
  iconUrl: '/images/marker-icon.png',
  iconSize: [25, 41], // Tamaño del icono
  iconAnchor: [12, 41], // Punto del icono que corresponde a la ubicación del marcador
  popupAnchor: [1, -34], // Punto desde el cual se abrirá el popup relativo al icono
  shadowUrl: '/images/marker-shadow.png', // Ruta a la sombra del marcador
  shadowSize: [41, 41], // Tamaño de la sombra
  shadowAnchor: [12, 41] // Punto del icono que corresponde a la ubicación de la sombra
});

// Componente para el control de búsqueda
const SearchField = (): null => {
    const map = useMap();
    
    useEffect(() => {
        const provider = new OpenStreetMapProvider({
            params: {
                'accept-language': 'es',
                countrycodes: 'cl',
            },
            searchUrl: '/api/geocode', // Proxy endpoint
        });

        const searchControl = new (GeoSearchControl as any)({
            provider: provider,
            style: 'bar',
            searchLabel: 'Buscar dirección...',
            autoComplete: true,
            autoCompleteDelay: 250,
            showMarker: true,
            showPopup: false,
            retainZoomLevel: false,
            animateZoom: true,
            keepResult: false,
            maxMarkers: 1,
            marker: {
                icon: redIcon // Usa el icono personalizado
            }
        });

        map.addControl(searchControl);
        return () => {
            map.removeControl(searchControl);
        };
    }, [map]);

    return null;
};

const Mapa = () => {
    const [filteredData, setFilteredData] = useState<Point[]>([]);

    useEffect(() => {
        fetchReferencialesForMap()
            .then(response => {
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
                
                setFilteredData(points);
            })
            .catch(error => {
                console.error('Error fetching data: ', error);
            });
    }, []);

    return (
        <div className="relative w-full">
            <MapContainer 
                center={[-38.7445, -72.9507]}
                zoom={13} 
                style={{ 
                    height: "70vh",    
                    width: "90%",      
                    margin: "auto",    
                    borderRadius: "8px" 
                }}
            >          
                <SearchField />
                <LocationButton />
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    maxZoom={19}
                    minZoom={5}      
                    tileSize={256}
                    keepBuffer={2}
                    updateWhenZooming={false}
                    updateWhenIdle={true}
                />  
                {filteredData.map(point => (
                    <MapMarker key={point.id} point={point} />
                ))}
            </MapContainer>
        </div>
    );
};

export default Mapa;