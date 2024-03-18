import { useState } from 'react';
import ReactMapGL, { ViewState } from 'react-map-gl';

const Mapa = () => {
    const [viewport, setViewport] = useState<ViewState>({
        latitude: 51.505,
        longitude: -0.09,
        zoom: 13,
        width: "100vw",
        height: "100vh",
    });

    return (
        <ReactMapGL
            {...viewport}
            mapboxAccessToken={process.env.MAPBOX_TOKEN}
            onViewportChange={(nextViewport: ViewState) => setViewport(nextViewport)}
        />
    );
};

export default Mapa;