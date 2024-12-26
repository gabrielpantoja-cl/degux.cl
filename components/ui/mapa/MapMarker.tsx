// components/ui/mapa/MapMarker.tsx
import { CircleMarker, Popup } from 'react-leaflet';

// Función para formatear números
const formatNumber = (num: number) => {
    return num.toLocaleString('es-CL');
};

// Mapeo de nombres de campos
export const fieldNames: { [key: string]: string } = {
    cbr: 'CBR',
    fojas: 'Fojas',
    numero: 'Número',
    anio: 'Año',
    comprador: 'Comprador',
    vendedor: 'Vendedor',
    predio: 'Predio',
    comuna: 'Comuna',
    rol: 'Rol',
    fechaescritura: 'Fecha Escritura',
    superficie: 'Superficie (m²)',
    monto: 'Monto ($)',
    observaciones: 'Observaciones'
};

// Orden de campos
export const fieldOrder = [
    'cbr', 'fojas', 'numero', 'anio', 'comprador',
    'vendedor', 'predio', 'comuna', 'rol', 'fechaescritura',
    'monto', 'superficie', 'observaciones'
];

const renderField = (key: string, value: any) => {
    if (['id', 'latLng', 'geom', 'userId', 'lat', 'lng'].includes(key)) {
        return null;
    }

    if (value instanceof Date) {
        return (
            <p key={key}>
                <strong>{fieldNames[key] || key}:</strong>{' '}
                {value.toLocaleDateString('es-CL')}
            </p>
        );
    }

    if ((key === 'monto' || key === 'superficie') && typeof value === 'number') {
        return (
            <p key={key}>
                <strong>{fieldNames[key]}:</strong>{' '}
                {formatNumber(value)}
            </p>
        );
    }

    if (typeof value === 'string' || typeof value === 'number') {
        return (
            <p key={key}>
                <strong>{fieldNames[key] || key}:</strong>{' '}
                {value}
            </p>
        );
    }

    return null;
};

export type Point = {
    id: string;
    latLng: [number, number];
    lat: number;
    lng: number;
    userId: string;
    geom: [number, number];
    fojas?: string;
    numero?: string;
    anio: string;
    cbr?: string;
    comprador?: string;
    vendedor?: string;
    predio?: string;
    comuna?: string;
    rol?: string;
    fechaescritura?: Date;
    superficie?: number;
    monto?: number;
    observaciones?: string;
    [key: string]: any;
};

export const MapMarker = ({ point }: { point: Point }) => (
    <CircleMarker
        key={point.id}
        center={point.latLng}
        radius={20}
    >
        <Popup>
            <div className="popup-content">
                {fieldOrder.map(key => renderField(key, point[key]))}
            </div>
        </Popup>
    </CircleMarker>
);