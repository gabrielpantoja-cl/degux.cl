// components/ui/mapa/LocationButton.tsx
import React, { useState } from 'react';
import { useMap } from 'react-leaflet';

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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0z" />
                </svg>
            )}   
        </button>
    );
};

export default LocationButton;