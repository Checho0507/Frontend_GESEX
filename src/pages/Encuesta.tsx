import React, { useEffect, useState, useCallback, useMemo } from "react";
import { toast, Toaster } from "react-hot-toast";

import { obtenerFormularios, enviarRespuestas } from "../services/Cuestionarios";
import { obtenerFingerprint } from "../Utils/fingerprint";

// ---------- INTERFACES ----------
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
  caracterizacion_template: CaracterizacionTemplate;
  censo: Censo;
  fenologico: Fenologico;
}

interface PlantaCenso {
  codigo: string;
  label: string;
}

// Estructura para enviar los datos de censo
interface CensoDatosEnvio {
  lote: string;
  plantas: Array<{
    codigo: string;
    observacion: string;
    altura: number;
    diametro: number;
  }>;
}

interface DatosEnvio {
  test_id: string;
  caracterizacion_datos: Record<string, string>;
  censo_datos?: CensoDatosEnvio;
  fenologico?: Record<string, string>;
  fecha: string;
  fingerprint: string;
}

// ---------- COMPONENTE PRINCIPAL ----------
const Encuesta: React.FC = () => {
  const [formularios, setFormularios] = useState<Formulario[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);

  // --- Estados persistentes ---
  const [formularioSeleccionado, setFormularioSeleccionado] = useState<string | null>(() => {
    return localStorage.getItem("encuesta_formularioId") || null;
  });
  const [tipoParticipante, setTipoParticipante] = useState<string | null>(() => {
    return localStorage.getItem("encuesta_tipoParticipante") || null;
  });
  const [caracterizacion, setCaracterizacion] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem("encuesta_caracterizacion");
    return saved ? JSON.parse(saved) : {};
  });
  const [plantasCenso, setPlantasCenso] = useState<PlantaCenso[]>(() => {
    const saved = localStorage.getItem("encuesta_plantasCenso");
    return saved ? JSON.parse(saved) : [];
  });

  // --- Determinar formulario actual ---
  const formularioActual = formularioSeleccionado
    ? formularios.find((f) => f.id === formularioSeleccionado)
    : null;

  // --- Detectar el nombre exacto del campo "¿Qué se va a monitorear?" ---
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

  // --- Generar 5 plantas aleatorias (solo cuando se necesita) ---
  const generarPlantasCenso = useCallback((): PlantaCenso[] => {
    const pares = new Set<string>();
    while (pares.size < 5) {
      const surco = Math.floor(Math.random() * 20) + 1;
      const planta = Math.floor(Math.random() * 20) + 1;
      pares.add(`${surco}-${planta}`);
    }
    return Array.from(pares).map((par) => {
      const [surco, planta] = par.split("-");
      return {
        codigo: par,
        label: `Surco ${surco}, Planta ${planta}`,
      };
    });
  }, []);

  // --- Efecto: cargar formularios desde API ---
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

  // --- Efectos de persistencia en localStorage ---
  useEffect(() => {
    if (formularioSeleccionado) {
      localStorage.setItem("encuesta_formularioId", formularioSeleccionado);
    } else {
      localStorage.removeItem("encuesta_formularioId");
    }
  }, [formularioSeleccionado]);

  useEffect(() => {
    if (tipoParticipante) {
      localStorage.setItem("encuesta_tipoParticipante", tipoParticipante);
    } else {
      localStorage.removeItem("encuesta_tipoParticipante");
    }
  }, [tipoParticipante]);

  useEffect(() => {
    localStorage.setItem("encuesta_caracterizacion", JSON.stringify(caracterizacion));
  }, [caracterizacion]);

  useEffect(() => {
    localStorage.setItem("encuesta_plantasCenso", JSON.stringify(plantasCenso));
  }, [plantasCenso]);

  // --- Generar plantas automáticamente al seleccionar Censo ---
  useEffect(() => {
    if (valorMonitoreo === "poblacion" && plantasCenso.length === 0) {
      const nuevasPlantas = generarPlantasCenso();
      setPlantasCenso(nuevasPlantas);
    }
  }, [valorMonitoreo, plantasCenso.length, generarPlantasCenso]);

  // ---------- HANDLERS ----------
  const handleCaracterizacionChange = (campo: string, valor: string) => {
    setCaracterizacion((prev) => ({ ...prev, [campo]: valor }));
  };

  const handleSeleccionFormulario = useCallback((formulario: Formulario) => {
    setFormularioSeleccionado(formulario.id);
    setTipoParticipante(formulario.caracterizacion_template.tipo_participante);
    setCaracterizacion({});
    setPlantasCenso([]); // Limpiar plantas al cambiar de formulario
  }, []);

  // ---------- VALIDACIÓN DE CAMPOS CONDICIONALES (CENSO / FENOLÓGICO) ----------
  const validarCamposCondicionales = useCallback(
    (formulario: Formulario): boolean => {
      if (!nombreCampoMonitoreo) return true;

      const seleccion = caracterizacion[nombreCampoMonitoreo];

      // --- Validación de Censo Poblacional ---
      if (seleccion === "poblacion") {
        // 1. Validar que se haya seleccionado un lote
        if (!caracterizacion["lote_a_monitorear"]?.trim()) {
          toast.error("Debe seleccionar un lote para el Censo Poblacional");
          return false;
        }

        // 2. Validar que existan las 5 plantas
        if (plantasCenso.length !== 5) {
          toast.error("Error al cargar las plantas de censo");
          return false;
        }

        // 3. Validar datos de cada planta
        for (let i = 1; i <= 5; i++) {
          const obsKey = `censo_planta_${i}_observacion`;
          const alturaKey = `censo_planta_${i}_altura`;
          const diametroKey = `censo_planta_${i}_diametro`;

          if (
            !caracterizacion[obsKey]?.trim() ||
            !caracterizacion[alturaKey]?.trim() ||
            !caracterizacion[diametroKey]?.trim()
          ) {
            toast.error(
              `Complete todos los datos de la planta ${i} (${plantasCenso[i - 1]?.label || ""})`
            );
            return false;
          }

          const altura = parseFloat(caracterizacion[alturaKey]);
          const diametro = parseFloat(caracterizacion[diametroKey]);
          if (isNaN(altura) || altura <= 0) {
            toast.error(`La altura de la planta ${i} debe ser un número mayor a 0`);
            return false;
          }
          if (isNaN(diametro) || diametro <= 0) {
            toast.error(`El diámetro de la planta ${i} debe ser un número mayor a 0`);
            return false;
          }
        }
        return true;
      }

      // --- Validación de Monitoreo Fenológico (sin cambios) ---
      if (seleccion === "fenologico") {
        const camposFeno = formulario.fenologico?.campos_requeridos || [];
        const faltantes = camposFeno.filter(
          (campo) => !caracterizacion[campo]?.trim()
        );
        if (faltantes.length > 0) {
          toast.error(
            `Complete todos los campos del Monitoreo Fenológico: ${faltantes.join(", ")}`
          );
          return false;
        }
        return true;
      }

      return true; // otros casos no requieren validación extra
    },
    [caracterizacion, nombreCampoMonitoreo, plantasCenso]
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

    return true;
  }, [formularioSeleccionado, formularios, caracterizacion, validarCamposCondicionales]);

  // ---------- ENVÍO DE RESPUESTAS ----------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validarFormulario()) return;

    try {
      const formulario = formularios.find((f) => f.id === formularioSeleccionado);
      if (!formulario) throw new Error("Formulario no encontrado");

      // 1. Datos de caracterización general
      const caracterizacionCompleta = { ...caracterizacion };
      if (tipoParticipante) {
        caracterizacionCompleta["tipo_participante"] = tipoParticipante;
      }

      // 2. Datos específicos según la selección
      let censo_datos: CensoDatosEnvio | undefined = undefined;
      let fenologico_datos: Record<string, string> | undefined = undefined;

      if (valorMonitoreo === "poblacion") {
        censo_datos = {
          lote: caracterizacion["lote_a_monitorear"] || "",
          plantas: plantasCenso.map((planta, idx) => {
            const i = idx + 1;
            return {
              codigo: planta.codigo,
              observacion: caracterizacion[`censo_planta_${i}_observacion`] || "",
              altura: parseFloat(caracterizacion[`censo_planta_${i}_altura`] || "0"),
              diametro: parseFloat(caracterizacion[`censo_planta_${i}_diametro`] || "0"),
            };
          }),
        };
      }

      if (valorMonitoreo === "fenologico") {
        fenologico_datos = {};
        formulario.fenologico.campos_requeridos.forEach((campo) => {
          fenologico_datos![campo] = caracterizacion[campo] || "";
        });
      }

      // 3. Fingerprint y fecha
      const fingerprint = await obtenerFingerprint();
      const fechaActual = new Date().toISOString().split("T")[0];

      // 4. Construir payload
      const data: DatosEnvio = {
        test_id: formularioSeleccionado!,
        caracterizacion_datos: caracterizacionCompleta,
        censo_datos,
        fenologico: fenologico_datos,
        fecha: fechaActual,
        fingerprint,
      };

      // 5. Enviar
      toast.promise(enviarRespuestas(data), {
        loading: "Enviando respuestas...",
        success: () => {
          // Limpiar todo después del envío exitoso
          setCaracterizacion({});
          setFormularioSeleccionado(null);
          setTipoParticipante(null);
          setPlantasCenso([]);
          localStorage.removeItem("encuesta_formularioId");
          localStorage.removeItem("encuesta_tipoParticipante");
          localStorage.removeItem("encuesta_caracterizacion");
          localStorage.removeItem("encuesta_plantasCenso");
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
          {/* ---------- TEXTO INTRODUCTORIO ---------- */}
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

          {/* ---------- CARACTERIZACIÓN PRINCIPAL ---------- */}
          <div className="bg-gray-50 p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              Información de Caracterización
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {formularioActual.caracterizacion_template.campos_requeridos.map((campo, index) => {
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
                    ) : esCondicionesDia ? (
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
          {valorMonitoreo === "poblacion" && (
            <div className="bg-gray-50 p-6 rounded-lg shadow-md mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                Censo Poblacional
              </h2>

              {/* Campo LOTE (único) */}
              <div className="mb-6 max-w-md">
                <label className="font-semibold text-gray-700 mb-2 text-sm uppercase tracking-wide block">
                  Lote a monitorear
                </label>
                <select
                  name="lote_a_monitorear"
                  value={caracterizacion["lote_a_monitorear"] || ""}
                  onChange={(e) => handleCaracterizacionChange("lote_a_monitorear", e.target.value)}
                  className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                  required
                >
                  <option value="" disabled>Seleccione una opción</option>
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
              </div>

              {/* Plantas fijas generadas automáticamente */}
              <h3 className="text-xl font-bold text-gray-800 mb-4 mt-8">
                Plantas seleccionadas para monitoreo
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Las siguientes 5 plantas han sido generadas automáticamente. Complete los datos para cada una.
              </p>

              {plantasCenso.map((planta, idx) => {
                const index = idx + 1;
                const obsKey = `censo_planta_${index}_observacion`;
                const alturaKey = `censo_planta_${index}_altura`;
                const diametroKey = `censo_planta_${index}_diametro`;

                return (
                  <div
                    key={planta.codigo}
                    className="border rounded-lg p-4 mb-6 bg-white shadow-sm"
                  >
                    <h4 className="font-semibold text-lg text-gray-800 mb-3">
                      {planta.label} (Código: {planta.codigo})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Observaciones */}
                      <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700 mb-1">
                          Observaciones de la planta
                        </label>
                        <select
                          name={obsKey}
                          value={caracterizacion[obsKey] || ""}
                          onChange={(e) => handleCaracterizacionChange(obsKey, e.target.value)}
                          className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        >
                          <option value="" disabled>Seleccione</option>
                          <option value="Buena">Buena</option>
                          <option value="Regular">Regular</option>
                          <option value="Mala">Mala</option>
                          <option value="Resiembra">Resiembra</option>
                          <option value="Punto Vacío">Punto Vacío</option>
                        </select>
                      </div>

                      {/* Altura */}
                      <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700 mb-1">
                          Altura de la planta (m)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          name={alturaKey}
                          value={caracterizacion[alturaKey] || ""}
                          onChange={(e) => handleCaracterizacionChange(alturaKey, e.target.value)}
                          className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Ej: 1.50"
                          required
                        />
                      </div>

                      {/* Diámetro */}
                      <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700 mb-1">
                          Diámetro de la copa (m)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          name={diametroKey}
                          value={caracterizacion[diametroKey] || ""}
                          onChange={(e) => handleCaracterizacionChange(diametroKey, e.target.value)}
                          className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Ej: 2.00"
                          required
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ---------- SECCIÓN MONITOREO FENOLÓGICO (condicional) ---------- */}
          {valorMonitoreo === "fenologico" && (
            <div className="bg-gray-50 p-6 rounded-lg shadow-md mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                Monitoreo Fenológico
              </h2>
              <div className="mb-4 text-gray-800 space-y-2">
                <p className="text-lg font-semibold">
                  El monitoreo fenológico se realiza siguiendo la escala BBCH para cítricos.
                </p>
                <p className="font-medium">
                  - Se debe seleccionar UNA rama terminal por cada cuadrante del árbol.
                </p>
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