// types/referenciales.ts
export interface Referencial {
  id: string;
  lat: number;
  lng: number;
  fojas: string;
  numero: number;
  anio: number;
  cbr: string;
  comprador: string;
  vendedor: string;
  predio: string;
  comuna: string;
  rol: string;
  fechaescritura: Date;
  monto: number;
  superficie: number;
  observaciones: string | null;
  userId: string;
  user: {
    name: string | null;
    email: string;
  };
}