import { useState } from 'react';
import ReactMapGL from 'react-map-gl';

const Mapa = () => {
    const [viewport, setViewport] = useState({
        latitude: 51.505,
        longitude: -0.09,
        zoom: 13,
        width: "100vw",
        height: "100vh",
    });

    return (
        <ReactMapGL
            {...viewport}
            mapboxApiAccessToken={process.env.MAPBOX_TOKEN}
            onViewportChange={nextViewport => setViewport(nextViewport)}
        />
    );
};

export default Mapa;