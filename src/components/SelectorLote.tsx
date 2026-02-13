import React from "react";
import { LOTES } from "../types";

interface Props {
  loteSeleccionado: string | null;
  onChange: (lote: string) => void;
  plantasGeneradas: boolean;
}

export const SelectorLote: React.FC<Props> = ({
  loteSeleccionado,
  onChange,
  plantasGeneradas,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Seleccione el lote a monitorear
      </h2>
      <div className="max-w-md">
        <select
          value={loteSeleccionado || ""}
          onChange={handleChange}
          className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
          required
        >
          <option value="" disabled>
            -- Seleccione un lote --
          </option>
          {LOTES.map((lote) => (
            <option key={lote.value} value={lote.value}>
              {lote.label}
            </option>
          ))}
        </select>
        {plantasGeneradas && (
          <p className="text-sm text-green-600 mt-2">
            ✅ 5 plantas generadas automáticamente para este lote.
          </p>
        )}
      </div>
    </div>
  );
};