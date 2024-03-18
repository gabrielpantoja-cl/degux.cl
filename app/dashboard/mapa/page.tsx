export interface Referencial {
    id: number;
    lat: number;
    lng: number;
    name: string;
}

export interface MapaProps {
    referenciales: Referencial[];
}