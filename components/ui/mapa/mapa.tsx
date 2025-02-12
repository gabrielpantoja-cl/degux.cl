'use client';
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import 'leaflet/dist/leaflet.css';
import 'leaflet-geosearch/dist/geosearch.css';
import './mapa.css'; // Importa el archivo CSS personalizado
import { fetchReferencialesForMap } from '@/lib/mapData';
import { MapMarker, Point } from '@/components/ui/mapa/MapMarker';
import LocationButton from '@/components/ui/mapa/LocationButton'; // Importa el componente LocationButton
import { Icon, Map } from 'leaflet'; // Importa el tipo Map de leaflet

// Configura el icono del marcador personalizado
const redIcon = new Icon({
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
    const [mapInstance] = useState<Map | null>(null);

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

    useEffect(() => {
        return () => {
            if (mapInstance) {
                mapInstance.remove();
            }
        };
    }, [mapInstance]);

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
                whenReady={() => {
                    // Accede a la instancia del mapa directamente desde el componente
                    // 'event.target' ya no está disponible aquí
                    // En su lugar, usa 'mapInstance' que se actualiza después de que el mapa se inicializa
                    if (mapInstance) {
                        // Puedes realizar acciones con la instancia del mapa aquí
                        console.log('Mapa listo', mapInstance);
                    }
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