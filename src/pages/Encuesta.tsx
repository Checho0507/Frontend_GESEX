import React, { useEffect, useState, useCallback, useMemo } from "react";
import { toast, Toaster } from "react-hot-toast";

import { obtenerFormularios, enviarRespuestas } from "../services/Cuestionarios";
import { obtenerFingerprint } from "../Utils/fingerprint";

// ---------- INTERFACES ----------
interface Dimension {
  nombre: string;
  preguntas: string[];
}

interface CaracterizacionTemplate {
  campos_requeridos: string[];
  tipo_participante: string;
}

interface Censo {
  campos_requeridos: string[];
}

interface Fenologico {
  campos_requeridos: string[];
}

interface Formulario {
  id: string;
  dimensiones: Dimension[];
  caracterizacion_template: CaracterizacionTemplate;
  censo: Censo;
  fenologico: Fenologico;
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

// ---------- COMPONENTE PRINCIPAL ----------
const Encuesta: React.FC = () => {
  const [formularios, setFormularios] = useState<Formulario[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);
  const [formularioSeleccionado, setFormularioSeleccionado] = useState<string | null>(null);
  const [tipoParticipante, setTipoParticipante] = useState<string | null>(null);
  const [caracterizacion, setCaracterizacion] = useState<Record<string, string>>({});
  const [respuestas, setRespuestas] = useState<Record<string, string>>({});

  // ---------- CARGAR FORMULARIOS ----------
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
        console.error(err);
        toast.error("Error al cargar los formularios");
      } finally {
        setCargando(false);
      }
    };
    cargarFormularios();
  }, []);

  // ---------- HANDLERS ----------
  const handleCaracterizacionChange = (campo: string, valor: string) => {
    setCaracterizacion((prev) => ({ ...prev, [campo]: valor }));
  };

  const handleRespuestaChange = (preguntaId: string, valor: string) => {
    setRespuestas((prev) => ({ ...prev, [preguntaId]: valor }));
  };

  const handleSeleccionFormulario = useCallback((formulario: Formulario) => {
    setFormularioSeleccionado(formulario.id);
    setTipoParticipante(formulario.caracterizacion_template.tipo_participante);
    setRespuestas({});
    setCaracterizacion({});
  }, []);

  // ---------- GENERAR 5 CÓDIGOS ALEATORIOS (SURCO-PLANTA) ----------
  const opcionesCodigo = useMemo(() => {
    const pares = new Set<string>();
    while (pares.size < 5) {
      const surco = Math.floor(Math.random() * 20) + 1;
      const planta = Math.floor(Math.random() * 20) + 1;
      pares.add(`${surco}-${planta}`);
    }
    return Array.from(pares).map((par) => {
      const [surco, planta] = par.split("-");
      return {
        value: par,
        label: `Surco ${surco}, Planta ${planta}`,
      };
    });
  }, [formularioSeleccionado]); // Se regenera al cambiar de formulario

  // ---------- VALIDACIÓN DE CAMPOS CONDICIONALES (CENSO / FENOLÓGICO) ----------
  const validarCamposCondicionales = useCallback(
    (formulario: Formulario): boolean => {
      const monitoreoSeleccionado = caracterizacion["¿qué se va a monitorear?"];
      
      if (monitoreoSeleccionado === "poblacion") {
        const camposCenso = formulario.censo.campos_requeridos;
        const faltantes = camposCenso.filter(
          (campo) => !caracterizacion[campo]?.trim()
        );
        if (faltantes.length > 0) {
          toast.error(
            `Complete todos los campos del Censo Poblacional: ${faltantes.join(
              ", "
            )}`
          );
          return false;
        }
      }

      if (monitoreoSeleccionado === "fenologico") {
        const camposFeno = formulario.fenologico.campos_requeridos;
        const faltantes = camposFeno.filter(
          (campo) => !caracterizacion[campo]?.trim()
        );
        if (faltantes.length > 0) {
          toast.error(
            `Complete todos los campos del Monitoreo Fenológico: ${faltantes.join(
              ", "
            )}`
          );
          return false;
        }
      }

      return true;
    },
    [caracterizacion]
  );

  // ---------- VALIDACIÓN GENERAL DEL FORMULARIO ----------
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

    // Validar campos de caracterización principal
    const camposRequeridos = formulario.caracterizacion_template.campos_requeridos;
    const camposFaltantes = camposRequeridos.filter(
      (campo) => !caracterizacion[campo] || caracterizacion[campo].trim() === ""
    );
    if (camposFaltantes.length > 0) {
      toast.error(
        `Por favor completa todos los campos de caracterización requeridos: ${camposFaltantes.join(
          ", "
        )}`
      );
      return false;
    }

    // Validar campos condicionales (Censo / Fenológico)
    if (!validarCamposCondicionales(formulario)) {
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
  }, [formularioSeleccionado, formularios, caracterizacion, respuestas, validarCamposCondicionales]);

  // ---------- ENVÍO DE RESPUESTAS ----------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validarFormulario()) return;

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

      const caracterizacionCompleta = { ...caracterizacion };
      if (tipoParticipante) {
        caracterizacionCompleta["tipo_participante"] = tipoParticipante;
      }

      const fingerprint = await obtenerFingerprint();
      const fechaActual = new Date().toISOString().split("T")[0];
      const data: DatosEnvio = {
        test_id: formularioSeleccionado!,
        respuestas: respuestasPorDimension,
        caracterizacion_datos: caracterizacionCompleta,
        fecha: fechaActual,
        fingerprint,
      };

      toast.promise(enviarRespuestas(data), {
        loading: "Enviando respuestas...",
        success: () => {
          setCaracterizacion({});
          setRespuestas({});
          setFormularioSeleccionado(null);
          setTipoParticipante(null);
          return "¡Respuestas enviadas correctamente!";
        },
        error: (err) => {
          console.error("Error al enviar respuestas:", err);
          return `Error al enviar respuestas: ${err.message || "Error desconocido"}`;
        },
      });
    } catch (err: any) {
      toast.error(`Error: ${err.message || "Error desconocido"}`);
      console.error("Error al procesar el formulario:", err);
    }
  };

  // ---------- RENDERIZADO CONDICIONAL (CARGANDO, ERROR, SIN FORMULARIOS) ----------
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
        <p className="text-lg font-medium text-gray-700">
          No hay cuestionarios disponibles en este momento.
        </p>
      </div>
    );
  }

  const formularioActual = formularioSeleccionado
    ? formularios.find((f) => f.id === formularioSeleccionado)
    : null;

  // ---------- JSX PRINCIPAL ----------
  return (
    <div className="max-w-6xl mx-auto space-y-12 px-4 md:px-10 py-8">
      <Toaster position="top-center" />

      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        Sistema de Encuestas
      </h1>

      {/* ---------- SELECTOR DE FORMULARIOS ---------- */}
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

      {/* ---------- FORMULARIO DE ENCUESTA (SOLO SI HAY UNO SELECCIONADO) ---------- */}
      {formularioActual && (
        <form onSubmit={handleSubmit} className="space-y-8 border rounded-lg shadow-md p-6 bg-white">
          {/* ---------- CARACTERIZACIÓN PRINCIPAL ---------- */}
          <p className="text-lg font-semibold">
                  El monitoreo fenológico se realiza siguiendo la escala BBCH para cítricos.
                </p>El presente formulario tiene como finalidad registrar de manera estandarizada la información obtenida en los procesos de monitoreo del cultivo de cítricos, incluyendo plagas, enfermedades, controladores biológicos, polinizadores y arvenses. Estos registros permiten evaluar el estado fitosanitario del sistema productivo, apoyar la toma de decisiones bajo el enfoque de Manejo Integrado.
 Nota importante: este formulario está diseñado para registrar un solo ítem por diligenciamiento. Por favor, seleccione y complete únicamente el módulo que corresponda a la observación realizada:  
          <div className="bg-gray-50 p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              Información de Caracterización
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {formularioActual.caracterizacion_template.campos_requeridos.map((campo, index) => {
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
                    ) : campoKey === "condiciones del día" ? (
                      <select
                        name={campo}
                        value={caracterizacion[campo] || ""}
                        onChange={(e) => handleCaracterizacionChange(campo, e.target.value)}
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

          {/* ---------- SECCIÓN CENSO POBLACIONAL (condicional) ---------- */}
          {caracterizacion["¿qué se va a monitorear?"] === "poblacion" && (
            <div className="bg-gray-50 p-6 rounded-lg shadow-md mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                Censo Poblacional
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {formularioActual.censo.campos_requeridos.map((campo, index) => {
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
                          <option value="" disabled>
                            Seleccione una opción
                          </option>
                          <option value="l1">Lote 1. Naranja - Bodega - 45 Plantas</option>
                          <option value="l2">Lote 2. Naranja- Guadual - 108 Plantas</option>
                          <option value="l3">Lote 3. Naranja pequeña - 124 Plantas</option>
                          <option value="l4">Lote 4. Mandarina - Paneles - 53 Plantas</option>
                          <option value="l5">Lote 5. Naranja - Oficina - 127 Plantas</option>
                          <option value="l6">Lote 6. Mandarina Adulta - 114 Plantas</option>
                          <option value="l7">Lote 7. Naranja Swingle - 114 Plantas</option>
                          <option value="l8">Lote 8. Naranja Swingle - 164 Plantas</option>
                          <option value="l9">Lote 9. Naranja Adulta - 216 Plantas</option>
                          <option value="l10">Lote 10. Naranja Swingle - 216 Plantas</option>
                          <option value="l11">Lote 11. Limón Joven - 125 Plantas</option>
                          <option value="l12">Lote 12. Limón Adulto - 64 Plantas</option>
                        </select>
                      ) : campoKey === "código plantas a monitorear" ? (
                        <select
                          name={campo}
                          value={caracterizacion[campo] || ""}
                          onChange={(e) => handleCaracterizacionChange(campo, e.target.value)}
                          className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        >
                          <option value="" disabled>
                            Seleccione un código
                          </option>
                          {opcionesCodigo.map((opcion) => (
                            <option key={opcion.value} value={opcion.value}>
                              {opcion.label}
                            </option>
                          ))}
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
          )}

          {/* ---------- SECCIÓN MONITOREO FENOLÓGICO (condicional) ---------- */}
          {caracterizacion["¿qué se va a monitorear?"] === "fenologico" && (
            <div className="bg-gray-50 p-6 rounded-lg shadow-md mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                Monitoreo Fenológico
              </h2>
              <div className="mb-4 text-gray-800 space-y-2">
                <p className="text-lg font-semibold">
                  El monitoreo fenológico se realiza siguiendo la escala BBCH para cítricos.
                </p>
                <p className="font-medium">- Se debe seleccionar UNA rama terminal por cada cuadrante del árbol.</p>
                <p className="font-medium">
                  - En esa rama se evalúan TODOS los órganos presentes (hojas, flores o frutos).
                </p>
                <p className="font-medium">
                  - Se registra el estado que MÁS se repite dentro de la rama evaluada.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {formularioActual.fenologico.campos_requeridos.map((campo, index) => {
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
                          <option value="" disabled>
                            Seleccione una opción
                          </option>
                          <option value="l1">Lote 1. Naranja - Bodega - 45 Plantas</option>
                          <option value="l2">Lote 2. Naranja- Guadual - 108 Plantas</option>
                          <option value="l3">Lote 3. Naranja pequeña - 124 Plantas</option>
                          <option value="l4">Lote 4. Mandarina - Paneles - 53 Plantas</option>
                          <option value="l5">Lote 5. Naranja - Oficina - 127 Plantas</option>
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
          )}

          {/* ---------- DIMENSIONES Y PREGUNTAS ---------- */}
          {formularioActual.dimensiones.map((dimension, dimIndex) => {
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
                  {dimension.preguntas.map((pregunta, pregIndex) => {
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

          {/* ---------- BOTÓN DE ENVÍO ---------- */}
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