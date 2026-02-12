import React, { useEffect, useState, useCallback } from "react";
import { toast, Toaster } from "react-hot-toast";

import { obtenerFormularios, enviarRespuestas } from "../services/Cuestionarios";
import { obtenerFingerprint } from "../Utils/fingerprint";

// Interfaces para TypeScript
interface Dimension {
  nombre: string;
  preguntas: string[];
}

interface CaracterizacionTemplate {
  campos_requeridos: string[];
  tipo_participante: string;
}

interface Formulario {
  id: string;
  dimensiones: Dimension[];
  caracterizacion_template: CaracterizacionTemplate;
}

interface RespuestasDimension {
  dimension: string;
  respuestas: number[];
}

interface DatosEnvio {
  test_id: string;
  respuestas: RespuestasDimension[];
  caracterizacion_datos: Record<string, string>;
  fecha: string;
  fingerprint: string;
}

const Encuesta: React.FC = () => {
  const [formularios, setFormularios] = useState<Formulario[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);
  const [formularioSeleccionado, setFormularioSeleccionado] = useState<string | null>(null);
  const [tipoParticipante, setTipoParticipante] = useState<string | null>(null);
  const [caracterizacion, setCaracterizacion] = useState<Record<string, string>>({});
  const [respuestas, setRespuestas] = useState<Record<string, string>>({});

  // Cargar los formularios al iniciar el componente
  useEffect(() => {
    const cargarFormularios = async () => {
      try {
        setCargando(true);
        const response = await obtenerFormularios();

        if (!response.data || response.data.length === 0) {
          throw new Error("No se encontraron formularios disponibles.");
        }

        setFormularios(response.data);
        setError(null);
      } catch (err: any) {
        setError(`Error al cargar los formularios: ${err.message || "Error desconocido"}`);
        console.error("Detalles del error:", err);
        toast.error("Error al cargar los formularios");
      } finally {
        setCargando(false);
      }
    };

    cargarFormularios();
  }, []);

  // Handlers
  const handleCaracterizacionChange = (campo: string, valor: string) => {
    setCaracterizacion((prev) => ({ ...prev, [campo]: valor }));
  };

  const handleRespuestaChange = (preguntaId: string, valor: string) => {
    setRespuestas((prev) => ({ ...prev, [preguntaId]: valor }));
  };

  const handleSeleccionFormulario = useCallback((formulario: Formulario) => {
    setFormularioSeleccionado(formulario.id);
    setTipoParticipante(formulario.caracterizacion_template.tipo_participante);
    // Reiniciar respuestas y caracterización al cambiar de formulario
    setRespuestas({});
    setCaracterizacion({});
  }, []);

  // Función para validar los campos del formulario
  const validarFormulario = useCallback((): boolean => {
    if (!formularioSeleccionado) {
      toast.error("Por favor selecciona un formulario");
      return false;
    }

    const formulario = formularios.find((f) => f.id === formularioSeleccionado);
    if (!formulario) {
      toast.error("Formulario no encontrado");
      return false;
    }

    // Validar caracterización
    const camposRequeridos = formulario.caracterizacion_template.campos_requeridos;
    const camposFaltantes = camposRequeridos.filter(
      (campo) => !caracterizacion[campo] || caracterizacion[campo].trim() === ""
    );

    if (camposFaltantes.length > 0) {
      toast.error(`Por favor completa todos los campos de caracterización requeridos: ${camposFaltantes.join(", ")}`);
      return false;
    }

    // Validar que todas las preguntas estén respondidas
    let totalPreguntas = 0;
    formulario.dimensiones.forEach((dimension) => {
      totalPreguntas += dimension.preguntas.length;
    });

    const respuestasCompletas = Object.keys(respuestas).length === totalPreguntas;

    if (!respuestasCompletas) {
      toast.error("Por favor responde todas las preguntas antes de enviar");
      return false;
    }

    return true;
  }, [formularioSeleccionado, formularios, caracterizacion, respuestas]);

  // Función para enviar las respuestas
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validarFormulario()) {
      return;
    }

    try {
      const formulario = formularios.find((f) => f.id === formularioSeleccionado);
      if (!formulario) throw new Error("Formulario no encontrado");

      // Preparar respuestas por dimensión
      let contadorPregunta = 1;
      const respuestasPorDimension = formulario.dimensiones.map((dimension) => {
        const respuestasDimension = dimension.preguntas.map(() => {
          const preguntaId = `pregunta-${contadorPregunta++}`;
          return parseInt(respuestas[preguntaId] || "0", 10);
        });

        return {
          dimension: dimension.nombre,
          respuestas: respuestasDimension,
        };
      });

      // Añadir tipo de participante a la caracterización si está disponible
      const caracterizacionCompleta = { ...caracterizacion };
      if (tipoParticipante) {
        caracterizacionCompleta["tipo_participante"] = tipoParticipante;
      }

      // Obtener fingerprint para identificación única
      const fingerprint = await obtenerFingerprint();

      // Preparar datos para enviar
      const fechaActual = new Date().toISOString().split("T")[0];
      const data: DatosEnvio = {
        test_id: formularioSeleccionado!,
        respuestas: respuestasPorDimension,
        caracterizacion_datos: caracterizacionCompleta,
        fecha: fechaActual,
        fingerprint,
      };

      // Enviar respuestas
      toast.promise(
        enviarRespuestas(data),
        {
          loading: 'Enviando respuestas...',
          success: () => {
            // Reiniciar formulario después de enviar
            setCaracterizacion({});
            setRespuestas({});
            setFormularioSeleccionado(null);
            setTipoParticipante(null);
            return '¡Respuestas enviadas correctamente!';
          },
          error: (err) => {
            console.error("Error al enviar respuestas:", err);
            return `Error al enviar respuestas: ${err.message || "Error desconocido"}`;
          },
        }
      );
    } catch (err: any) {
      toast.error(`Error: ${err.message || "Error desconocido"}`);
      console.error("Error al procesar el formulario:", err);
    }
  };

  // Renderizado condicional para estados de carga y error
  if (cargando) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-pulse text-center">
          <p className="text-lg font-medium text-gray-700">Cargando cuestionarios...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 text-red-700 p-6 rounded-lg shadow-md max-w-3xl mx-auto my-8">
        <h2 className="text-xl font-bold mb-2">Error</h2>
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Intentar nuevamente
        </button>
      </div>
    );
  }

  if (formularios.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <p className="text-lg font-medium text-gray-700">No hay cuestionarios disponibles en este momento.</p>
      </div>
    );
  }

  // Formulario actual seleccionado
  const formularioActual = formularioSeleccionado
    ? formularios.find(f => f.id === formularioSeleccionado)
    : null;

  return (
    <div className="max-w-6xl mx-auto space-y-12 px-4 md:px-10 py-8">
      <Toaster position="top-center" />

      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        Sistema de Encuestas
      </h1>

      {/* Selector de formularios */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
          Selecciona un tipo de cuestionario
        </h2>
        <div className="flex flex-wrap justify-center gap-4">
          {formularios.map((formulario) => (
            <button
              key={formulario.id}
              onClick={() => handleSeleccionFormulario(formulario)}
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

      {/* Formulario de encuesta (solo se muestra si hay uno seleccionado) */}
      {formularioActual && (
        <form onSubmit={handleSubmit} className="space-y-8 border rounded-lg shadow-md p-6 bg-white">
          {/* Caracterización */}
          <div className="bg-gray-50 p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              Información de Caracterización
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {formularioActual.caracterizacion_template.campos_requeridos.map((campo: string, index: number) => {
                const campoKey = campo.toLowerCase();
                return (
                  <div key={index} className="flex flex-col">
                    <label className="font-semibold text-gray-700 mb-2 text-sm uppercase tracking-wide">
                      {campo.replace(/_/g, " ")}
                    </label>
                    {campoKey === "¿qué se va a monitorear?" ? (
                      <select
                        name={campo}
                        value={caracterizacion[campo] || ""}
                        onChange={(e) => handleCaracterizacionChange(campo, e.target.value)}
                        className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="" disabled>Seleccione una opción</option>
                        <option value="poblacion">Censo Poblacional</option>
                        <option value="fenologico">Monitore Fenológico</option>
                        <option value="artropodos">Artropodos</option>
                        <option value="enfermedades">Enfermedades</option>
                        <option value="arvenses">Arvenses</option>
                        <option value="biologicos">Controladores Biologicos</option>
                        <option value="polinizadores">Polinizadores</option>
                      </select>
                    ) : campoKey === "condiciones del día" ? (
                      <select
                        name={campo}
                        value={caracterizacion[campo] || ""}
                        onChange={(e) => handleCaracterizacionChange(campo, e.target.value)}
                        className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="" disabled>Seleccione una opción</option>
                        <option value="soleado">Soleado</option>
                        <option value="nublado">Nublado</option>
                        <option value="lluvia">Lluvia</option>
                      </select>
                    ) : (
                      <input
                        type="text"
                        name={campo}
                        value={caracterizacion[campo] || ""}
                        onChange={(e) => handleCaracterizacionChange(campo, e.target.value)}
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

          <div className="bg-gray-50 p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              Censo Poblacional
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {formularioActual.censo.campos_requeridos.map((campo: string, index: number) => {
                const campoKey = campo.toLowerCase();
                return (
                  <div key={index} className="flex flex-col">
                    <label className="font-semibold text-gray-700 mb-2 text-sm uppercase tracking-wide">
                      {campo.replace(/_/g, " ")}
                    </label>
                    {campoKey === "lote a monitorear" ? (
                      <select
                        name={campo}
                        value={caracterizacion[campo] || ""}
                        onChange={(e) => handleCaracterizacionChange(campo, e.target.value)}
                        className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="" disabled>Seleccione una opción</option>
                        <option value="l1">Lote 1. Naranja - Bodega - 45 Plantas</option>
                        <option value="l2">Lote 2. Naranja- Guadual - 108 Plantas</option>
                        <option value="l3">Lote 3. Naranja pequeña - 124 Plantas</option>
                        <option value="l4">Lote 4. Mandarina - Paneles - 53 Plantas</option>
                        <option value="l5">Lote 5. Naranja - Oficina -  127 Plantas</option>
                        <option value="l6">Lote 6. Mandarina Adulta - 114 Plantas</option>
                        <option value="l7">Lote 7. Naranja Swingle - 114 Plantas</option>
                        <option value="l8">Lote 8. Naranja Swingle - 164 Plantas</option>
                        <option value="l9">Lote 9. Naranja Adulta - 216 Plantas</option>
                        <option value="l10">Lote 10. Naranja Swingle - 216 Plantas</option>
                        <option value="l11">Lote 11. Limón Joven - 125 Plantas</option>
                        <option value="l12">Lote 12. Limón Adulto - 64 Plantas</option>
                      </select>
                    ) : campoKey === "condiciones del día" ? (
                      <select
                        name={campo}
                        value={caracterizacion[campo] || ""}
                        onChange={(e) => handleCaracterizacionChange(campo, e.target.value)}
                        className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="" disabled>Seleccione una opción</option>
                        <option value="soleado">Soleado</option>
                        <option value="nublado">Nublado</option>
                        <option value="lluvia">Lluvia</option>
                      </select>
                    ) : (
                      <input
                        type="text"
                        name={campo}
                        value={caracterizacion[campo] || ""}
                        onChange={(e) => handleCaracterizacionChange(campo, e.target.value)}
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

          {/* Dimensiones y preguntas */}
          {formularioActual.dimensiones.map((dimension: Dimension, dimIndex: number) => {
            const preguntasInicioIndex =
              formularioActual.dimensiones
                .slice(0, dimIndex)
                .reduce((sum, dim) => sum + dim.preguntas.length, 0) + 1;

            return (
              <div key={dimIndex} className="mb-10 border rounded-xl p-6 bg-gray-50 shadow-lg">
                <h3 className="text-2xl font-semibold text-gray-800 mb-6 text-center uppercase tracking-wide">
                  {dimension.nombre}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {dimension.preguntas.map((pregunta: string, pregIndex: number) => {
                    const numeroPregunta = preguntasInicioIndex + pregIndex;
                    const preguntaId = `pregunta-${numeroPregunta}`;
                    return (
                      <div key={preguntaId} className="border rounded-lg shadow-sm p-4 bg-white">
                        <p className="font-medium mb-4">
                          {numeroPregunta}. {pregunta}
                        </p>
                        <div className="space-y-2">
                          {[1, 2, 3, 4, 5].map((valor) => (
                            <label
                              key={valor}
                              className="flex items-center text-sm text-gray-700 cursor-pointer hover:bg-gray-50 p-2 rounded"
                            >
                              <input
                                type="radio"
                                name={preguntaId}
                                value={valor}
                                className="mr-2 accent-red-700"
                                onChange={(e) => handleRespuestaChange(preguntaId, e.target.value)}
                                required
                              />
                              {[
                                "Totalmente en desacuerdo",
                                "En desacuerdo",
                                "Neutral",
                                "De acuerdo",
                                "Totalmente de acuerdo",
                              ][valor - 1]}
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Botón de envío */}
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