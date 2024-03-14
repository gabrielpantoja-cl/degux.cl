// mapa.tsx
import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const Mapa = ({ referenciales }) => {
    useEffect(() => {
        // Corrige el problema con los marcadores en Leaflet con Webpack
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
            iconUrl: require('leaflet/dist/images/marker-icon.png'),
            shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
        });
    }, []);

    return (
        <MapContainer center={[51.505, -0.09]} zoom={13} style={{ height: "100vh", width: "100%" }}>
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            />
            {referenciales.map((referencial) => (
                <Marker key={referencial.id} position={[referencial.lat, referencial.lng]}>
                    <Popup>
                        {referencial.name}
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
};

export async function getServerSideProps() {
    // Aquí debes reemplazar con tu lógica para obtener los datos de la base de datos
    const referenciales = await fetchFromDatabase();

    return {
        props: {
            referenciales,
        },
    };
}

export default Mapa;