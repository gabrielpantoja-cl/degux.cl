import { useEffect, useState } from 'react';
import ReactMapGL, { Marker, Popup } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface Referencial {
    id: number;
    lat: number;
    lng: number;
    name: string;
}

interface MapaProps {
    referenciales: Referencial[];
}

const Mapa = ({ referenciales }: MapaProps) => {
    const [viewport, setViewport] = useState({
        latitude: 51.505,
        longitude: -0.09,
        zoom: 13,
        width: "100%",
        height: "100vh",
    });

    return (
        <ReactMapGL
            {...viewport}
            mapboxApiAccessToken={process.env.MAPBOX_TOKEN}
            onViewportChange={(viewport) => setViewport(viewport)}
        >
            {referenciales.map((referencial) => (
                <Marker key={referencial.id} latitude={referencial.lat} longitude={referencial.lng}>
                    <Popup latitude={referencial.lat} longitude={referencial.lng} closeButton={true} closeOnClick={false}>
                        {referencial.name}
                    </Popup>
                </Marker>
            ))}
        </ReactMapGL>
    );
};

export async function getServerSideProps() {
    // Aquí debes reemplazar con tu lógica para obtener los datos de la base de datos
    const referenciales: Referencial[] = await fetchFromDatabase();

    return {
        props: {
            referenciales,
        },
    };
}

export default Mapa;