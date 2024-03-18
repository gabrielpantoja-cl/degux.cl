import { useState } from 'react';
import ReactMapGL, { ViewState } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const Mapa = () => {
    const [viewport, setViewport] = useState<ViewState>({
        latitude: 51.505,
        longitude: -0.09,
        zoom: 13,
        width: "100%",
        height: "100vh",
    });

    return (
        <ReactMapGL
            {...viewport}
            mapboxAccessToken={process.env.MAPBOX_TOKEN}
            onViewportChange={(viewport: ViewState) => setViewport(viewport)}
        />
    );
};

export default Mapa;