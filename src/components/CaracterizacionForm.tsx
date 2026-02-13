import React, { useMemo } from "react";
import { Formulario } from "../types";

interface Props {
  formulario: Formulario;
  caracterizacion: Record<string, string>;
  onChange: (campo: string, valor: string) => void;
}

export const CaracterizacionForm: React.FC<Props> = ({
  formulario,
  caracterizacion,
  onChange,
}) => {
  // Detectar el nombre del campo "¿Qué se va a monitorear?" (puede variar)
  const nombreCampoMonitoreo = useMemo(() => {
    return (
      formulario.caracterizacion_template.campos_requeridos.find(
        (campo) =>
          campo.toLowerCase().includes("qué") &&
          campo.toLowerCase().includes("monitorear")
      ) || null
    );
  }, [formulario]);

  return (
    <div className="bg-gray-50 p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Información de Caracterización
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {formulario.caracterizacion_template.campos_requeridos
          .filter((campo) => !campo.toLowerCase().includes("lote"))
          .map((campo, index) => {
            const campoLower = campo.toLowerCase();
            const esCampoMonitoreo =
              campoLower.includes("qué") && campoLower.includes("monitorear");
            const esCondicionesDia =
              campoLower.includes("condiciones") && campoLower.includes("día");

            return (
              <div key={index} className="flex flex-col">
                <label className="font-semibold text-gray-700 mb-2 text-sm uppercase tracking-wide">
                  {campo.replace(/_/g, " ")}
                </label>

                {esCampoMonitoreo ? (
                  <select
                    name={campo}
                    value={caracterizacion[campo] || ""}
                    onChange={(e) => onChange(campo, e.target.value)}
                    className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="" disabled>
                      Seleccione una opción
                    </option>
                    <option value="poblacion">Censo Poblacional</option>
                    <option value="fenologico">Monitoreo Fenológico</option>
                    <option value="artropodos">Artrópodos</option>
                    <option value="enfermedades">Enfermedades</option>
                    <option value="arvenses">Arvenses</option>
                    <option value="biologicos">Controladores Biológicos</option>
                    <option value="polinizadores">Polinizadores</option>
                  </select>
                ) : esCondicionesDia ? (
                  <select
                    name={campo}
                    value={caracterizacion[campo] || ""}
                    onChange={(e) => onChange(campo, e.target.value)}
                    className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="" disabled>
                      Seleccione una opción
                    </option>
                    <option value="soleado">Soleado</option>
                    <option value="nublado">Nublado</option>
                    <option value="lluvia">Lluvia</option>
                  </select>
                ) : (
                  <input
                    type="text"
                    name={campo}
                    value={caracterizacion[campo] || ""}
                    onChange={(e) => onChange(campo, e.target.value)}
                    className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={`Ingrese ${campo.replace(/_/g, " ")}`}
                    required
                  />
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
};