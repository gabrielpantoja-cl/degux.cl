// components/ui/referenciales/FormFields.tsx
import React from 'react';
import { Input } from '@/components/ui/input';

interface FormState {
  errors: {
    [key: string]: string[];
  };
  message: string | null;
  messageType: 'error' | 'success' | null;
  invalidFields: Set<string>;
  isSubmitting: boolean;
}

interface CurrentUser {
  id: string;
  name: string;
}

interface FormFieldsProps {
  state: FormState;
  currentUser: CurrentUser;
}

const FormFields: React.FC<FormFieldsProps> = ({ state, currentUser }) => (
  <>
    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
      <p className="text-sm text-gray-700">
        <span className="font-medium">Usuario:</span> {currentUser.name}
        <br />
        <span className="font-medium">ID:</span> {currentUser.id}
      </p>
    </div>
    <div className="mb-4">
      <label htmlFor="fojas" className="block text-sm font-medium text-gray-700">
        Fojas
      </label>
      <input
        type="text"
        name="fojas"
        id="fojas"
        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
          state.invalidFields.has('fojas') ? 'border-red-500' : ''
        }`}
        placeholder="Ejemplos: 157v, 1586 v, 1838 vuelta"
        pattern="^[0-9]+(\s?[vV](?:uelta)?)?$"
        title="Ingrese un número seguido opcionalmente de 'v', 'V' o 'vuelta'"
        required
      />
      {state.errors.fojas && (
        <p className="mt-2 text-sm text-red-600">{state.errors.fojas.join(', ')}</p>
      )}
    </div>

    <Input
      label="Número"
      id="numero"
      name="numero"
      type="number"
      placeholder="Escribe el número de la inscripción"
      error={state.errors.numero}
      required={true}
    />

    <Input
      label="Año"
      id="anno"
      name="anno"
      type="number"
      placeholder="Escribe el año de la inscripción"
      error={state.errors.anno}
      required={true}
    />

    <Input
      label="CBR"
      id="cbr"
      name="cbr"
      placeholder="Escribe el nombre del Conservador de Bienes Raíces"
      error={state.errors.cbr}
      required={true}
    />

    <Input
      label="Comuna"
      id="comuna"
      name="comuna"
      placeholder="Escribe el nombre de la comuna"
      error={state.errors.comuna}
      required={true}
    />

    <Input
      label="Rol de Avalúo"
      id="rolAvaluo"
      name="rolAvaluo"
      placeholder="Escribe el rol de avalúo de la propiedad"
      error={state.errors.rolAvaluo}
      required={true}
    />

    <Input
      label="Predio"
      id="predio"
      name="predio"
      placeholder="Escribe el nombre del predio"
      error={state.errors.predio}
      required={true}
    />

    <Input
      label="Vendedor"
      id="vendedor"
      name="vendedor"
      placeholder="Escribe el nombre del vendedor"
      error={state.errors.vendedor}
      required={true}
    />

    <Input
      label="Comprador"
      id="comprador"
      name="comprador"
      placeholder="Escribe el nombre del comprador"
      error={state.errors.comprador}
      required={true}
    />

    <Input
      label="Superficie"
      id="superficie"
      name="superficie"
      type="number"
      placeholder="Digita la superficie de la propiedad en m²"
      error={state.errors.superficie}
      required={true}
    />

    <Input
      label="Monto"
      id="monto"
      name="monto"
      type="number"
      placeholder="Digita el monto de la transacción en CLP"
      error={state.errors.monto}
      required={true}
    />

    <Input
      label="Fecha de escritura"
      id="fechaEscritura"
      name="fechaEscritura"
      type="date"
      placeholder="dd-mm-aaaa"
      pattern="\d{2}-\d{2}-\d{4}"
      error={state.errors.fechaEscritura}
      required={true}
    />

    <Input
      label="Latitud"
      id="latitud"
      name="latitud"
      type="number"
      placeholder="-39.851241"
      step="any"
      error={state.errors.latitud}
      required={true}
    />

    <Input
      label="Longitud"
      id="longitud"
      name="longitud"
      type="number"
      placeholder="-73.215171"
      step="any"
      error={state.errors.longitud}
      required={true}
    />

    <Input
      label="Observaciones"
      id="observaciones"
      name="observaciones"
      placeholder="Escribe observaciones como deslindes o número de plano"
      error={state.errors.observaciones}
    />
  </>
);

export default FormFields;