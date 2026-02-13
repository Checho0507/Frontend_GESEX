import React from "react";
import { Formulario } from "../types";

interface Props {
  formularios: Formulario[];
  formularioSeleccionado: string | null;
  onSelect: (formulario: Formulario) => void;
}

export const SelectorFormularios: React.FC<Props> = ({
  formularios,
  formularioSeleccionado,
  onSelect,
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
        Selecciona un tipo de cuestionario
      </h2>
      <div className="flex flex-wrap justify-center gap-4">
        {formularios.map((formulario) => (
          <button
            key={formulario.id}
            onClick={() => onSelect(formulario)}
            className={`px-6 py-3 rounded-lg font-semibold text-white transition duration-200 ${
              formularioSeleccionado === formulario.id
                ? "bg-red-700 shadow-lg transform scale-105"
                : "bg-red-600 hover:bg-red-700 hover:shadow-md"
            }`}
          >
            {formulario.caracterizacion_template.tipo_participante}
          </button>
        ))}
      </div>
    </div>
  );
};