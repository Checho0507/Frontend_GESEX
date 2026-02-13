import React, { useMemo } from "react";
import { Toaster } from "react-hot-toast";

import { useFormularios } from "../hooks/useFormularios";
import { useEncuestaState } from "../hooks/useEncuestaState";
import { useValidacion } from "../hooks/useValidacion";
import { useEnvio } from "../hooks/useEnvio";

import { SelectorFormularios } from "./SelectorFormularios";
import { SelectorLote } from "./SelectorLote";
import { CaracterizacionForm } from "./CaracterizacionForm";
import { CensoSection } from "./CensoSection";
import { FenologicoSection } from "./FenologicoSection";
import { Loading, ErrorDisplay } from "./LoadingError";

const Encuesta: React.FC = () => {
  const { formularios, error, cargando } = useFormularios();
  const {
    formularioSeleccionado,
    tipoParticipante,
    caracterizacion,
    setCaracterizacion,
    loteSeleccionado,
    plantasSeleccionadas,
    plantasFenologico,
    resetearFormulario,
    handleFaseChange,
    handleLoteChange,
    seleccionarFormulario,
  } = useEncuestaState();

  // Formulario actual
  const formularioActual = formularioSeleccionado
    ? formularios.find((f) => f.id === formularioSeleccionado)
    : null;

  // Nombre del campo "¿Qué se va a monitorear?"
  const nombreCampoMonitoreo = useMemo(() => {
    if (!formularioActual) return null;
    return (
      formularioActual.caracterizacion_template.campos_requeridos.find(
        (campo) =>
          campo.toLowerCase().includes("qué") &&
          campo.toLowerCase().includes("monitorear")
      ) || null
    );
  }, [formularioActual]);

  const valorMonitoreo = nombreCampoMonitoreo
    ? caracterizacion[nombreCampoMonitoreo]
    : undefined;

  // Validación
  const { validarFormulario } = useValidacion({
    formularioSeleccionado,
    formularios,
    caracterizacion,
    nombreCampoMonitoreo,
    loteSeleccionado,
    plantasSeleccionadas,
    plantasFenologico,
  });

  // Envío
  const { handleSubmit } = useEnvio({
    formularioSeleccionado,
    formularios,
    caracterizacion,
    tipoParticipante,
    loteSeleccionado,
    plantasSeleccionadas,
    plantasFenologico,
    valorMonitoreo,
    onExito: resetearFormulario,
  });

  // Handlers
  const handleCaracterizacionChange = (campo: string, valor: string) => {
    setCaracterizacion((prev) => ({ ...prev, [campo]: valor }));
  };

  // Renderizado condicional
  if (cargando) return <Loading />;
  if (error) return <ErrorDisplay error={error} onRetry={() => window.location.reload()} />;
  if (formularios.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <p className="text-lg font-medium text-gray-700">
          No hay cuestionarios disponibles en este momento.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12 px-4 md:px-10 py-8">
      <Toaster position="top-center" />

      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        Sistema de Encuestas
      </h1>

      <SelectorFormularios
        formularios={formularios}
        formularioSeleccionado={formularioSeleccionado}
        onSelect={seleccionarFormulario}
      />

      {formularioActual && (
        <SelectorLote
          loteSeleccionado={loteSeleccionado}
          onChange={handleLoteChange}
          plantasGeneradas={plantasSeleccionadas.length > 0}
        />
      )}

      {formularioActual && loteSeleccionado && (
        <form onSubmit={handleSubmit} className="space-y-8 border rounded-lg shadow-md p-6 bg-white">
          {/* Texto introductorio */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 text-gray-800 text-sm rounded-r">
            <p className="mb-2 font-medium">📋 Propósito del formulario</p>
            <p>
              El presente formulario tiene como finalidad registrar de manera estandarizada la información
              obtenida en los procesos de monitoreo del cultivo de cítricos, incluyendo plagas, enfermedades,
              controladores biológicos, polinizadores y arvenses. Estos registros permiten evaluar el estado
              fitosanitario del sistema productivo, apoyar la toma de decisiones bajo el enfoque de Manejo
              Integrado.
            </p>
            <p className="mt-2 font-medium text-yellow-700">
              ⚠️ Nota importante: este formulario está diseñado para registrar un solo ítem por diligenciamiento.
              Por favor, seleccione y complete únicamente el módulo que corresponda a la observación realizada.
            </p>
          </div>

          <CaracterizacionForm
            formulario={formularioActual}
            caracterizacion={caracterizacion}
            onChange={handleCaracterizacionChange}
          />

          {valorMonitoreo === "poblacion" && (
            <CensoSection
              plantas={plantasSeleccionadas}
              caracterizacion={caracterizacion}
              onCampoChange={handleCaracterizacionChange}
            />
          )}

          {valorMonitoreo === "fenologico" && (
            <FenologicoSection
              plantas={plantasFenologico}
              caracterizacion={caracterizacion}
              onCampoChange={handleCaracterizacionChange}
              onFaseChange={handleFaseChange}
            />
          )}

          <div className="flex justify-center pt-6">
            <button
              type="submit"
              className="bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Enviar Respuestas
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Encuesta;