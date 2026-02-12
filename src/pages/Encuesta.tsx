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

interface PlantaFenologico {
  codigo: string;
  label: string;
  fase: "vegetativa" | "floracion" | "fructificacion"; // asignado aleatoriamente
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

// Estructura para enviar los datos de fenológico
interface FenologicoDatosEnvio {
  lote: string;
  plantas: Array<{
    codigo: string;
    fase: string;
    // Vegetativa
    totalHojas?: number;
    brotesActivos?: number;
    bbchVegetativo?: string;
    // Floración
    totalFlores?: number;
    botonesFlorales?: number;
    bbchFloracion?: string;
    // Fructificación
    totalFrutos?: number;
    frutosCanica?: number;
    frutosPinpon?: number;
    frutosBolaTenis?: number;
    frutosCuartoMaduracion?: number;
    bbchFructificacion?: string;
  }>;
}

interface DatosEnvio {
  test_id: string;
  caracterizacion_datos: Record<string, string>;
  censo_datos?: CensoDatosEnvio;
  fenologico_datos?: FenologicoDatosEnvio;
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

  // Plantas para Censo
  const [plantasCenso, setPlantasCenso] = useState<PlantaCenso[]>(() => {
    const saved = localStorage.getItem("encuesta_plantasCenso");
    return saved ? JSON.parse(saved) : [];
  });

  // Plantas para Fenológico (con fase asignada)
  const [plantasFenologico, setPlantasFenologico] = useState<PlantaFenologico[]>(() => {
    const saved = localStorage.getItem("encuesta_plantasFenologico");
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

  // --- Generar 5 plantas aleatorias ---
  const generarPlantas = useCallback((cantidad: number): { codigo: string; label: string }[] => {
    const pares = new Set<string>();
    while (pares.size < cantidad) {
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

  // --- Generar plantas para fenológico con fase aleatoria ---
  const generarPlantasFenologico = useCallback((): PlantaFenologico[] => {
    const bases = generarPlantas(5);
    const fases: PlantaFenologico["fase"][] = ["vegetativa", "floracion", "fructificacion"];
    return bases.map((base) => ({
      ...base,
      fase: fases[Math.floor(Math.random() * fases.length)],
    }));
  }, [generarPlantas]);

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

  useEffect(() => {
    localStorage.setItem("encuesta_plantasFenologico", JSON.stringify(plantasFenologico));
  }, [plantasFenologico]);

  // --- Generar plantas automáticamente al seleccionar Censo ---
  useEffect(() => {
    if (valorMonitoreo === "poblacion" && plantasCenso.length === 0) {
      const nuevas = generarPlantas(5);
      setPlantasCenso(nuevas);
    }
  }, [valorMonitoreo, plantasCenso.length, generarPlantas]);

  // --- Generar plantas automáticamente al seleccionar Fenológico ---
  useEffect(() => {
    if (valorMonitoreo === "fenologico" && plantasFenologico.length === 0) {
      const nuevas = generarPlantasFenologico();
      setPlantasFenologico(nuevas);
    }
  }, [valorMonitoreo, plantasFenologico.length, generarPlantasFenologico]);

  // ---------- HANDLERS ----------
  const handleCaracterizacionChange = (campo: string, valor: string) => {
    setCaracterizacion((prev) => ({ ...prev, [campo]: valor }));
  };

  const handleSeleccionFormulario = useCallback((formulario: Formulario) => {
    setFormularioSeleccionado(formulario.id);
    setTipoParticipante(formulario.caracterizacion_template.tipo_participante);
    setCaracterizacion({});
    setPlantasCenso([]);
    setPlantasFenologico([]);
  }, []);

  // ---------- VALIDACIÓN DE CAMPOS CONDICIONALES ----------
  const validarCamposCondicionales = useCallback(
    (formulario: Formulario): boolean => {
      if (!nombreCampoMonitoreo) return true;

      const seleccion = caracterizacion[nombreCampoMonitoreo];

      // --- Validación de Censo Poblacional ---
      if (seleccion === "poblacion") {
        if (!caracterizacion["lote_a_monitorear"]?.trim()) {
          toast.error("Debe seleccionar un lote para el Censo Poblacional");
          return false;
        }
        if (plantasCenso.length !== 5) {
          toast.error("Error al cargar las plantas de censo");
          return false;
        }
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

      // --- Validación de Monitoreo Fenológico ---
      if (seleccion === "fenologico") {
        if (!caracterizacion["lote_a_monitorear"]?.trim()) {
          toast.error("Debe seleccionar un lote para el Monitoreo Fenológico");
          return false;
        }
        if (plantasFenologico.length !== 5) {
          toast.error("Error al cargar las plantas para fenológico");
          return false;
        }

        // Validar datos específicos según la fase de cada planta
        for (let i = 1; i <= 5; i++) {
          const planta = plantasFenologico[i - 1];
          if (!planta) continue;

          const fase = planta.fase;

          // Validar campos comunes? No hay comunes, todos son específicos por fase.

          if (fase === "vegetativa") {
            const hojasKey = `fenologico_planta_${i}_total_hojas`;
            const brotesKey = `fenologico_planta_${i}_brotes_activos`;
            const bbchKey = `fenologico_planta_${i}_bbch_vegetativo`;

            if (
              !caracterizacion[hojasKey]?.trim() ||
              !caracterizacion[brotesKey]?.trim() ||
              !caracterizacion[bbchKey]?.trim()
            ) {
              toast.error(`Complete todos los datos de la planta ${i} (Fase Vegetativa)`);
              return false;
            }

            const hojas = parseFloat(caracterizacion[hojasKey]);
            const brotes = parseFloat(caracterizacion[brotesKey]);
            if (isNaN(hojas) || hojas < 0) {
              toast.error(`El número de hojas de la planta ${i} debe ser un número válido`);
              return false;
            }
            if (isNaN(brotes) || brotes < 0) {
              toast.error(`El número de brotes de la planta ${i} debe ser un número válido`);
              return false;
            }
          }

          if (fase === "floracion") {
            const totalFloresKey = `fenologico_planta_${i}_total_flores`;
            const botonesKey = `fenologico_planta_${i}_botones_florales`;
            const bbchKey = `fenologico_planta_${i}_bbch_floracion`;

            if (
              !caracterizacion[totalFloresKey]?.trim() ||
              !caracterizacion[botonesKey]?.trim() ||
              !caracterizacion[bbchKey]?.trim()
            ) {
              toast.error(`Complete todos los datos de la planta ${i} (Fase Floración)`);
              return false;
            }

            const flores = parseFloat(caracterizacion[totalFloresKey]);
            const botones = parseFloat(caracterizacion[botonesKey]);
            if (isNaN(flores) || flores < 0) {
              toast.error(`El total de flores de la planta ${i} debe ser un número válido`);
              return false;
            }
            if (isNaN(botones) || botones < 0) {
              toast.error(`El número de botones florales de la planta ${i} debe ser un número válido`);
              return false;
            }
          }

          if (fase === "fructificacion") {
            const totalFrutosKey = `fenologico_planta_${i}_total_frutos`;
            const canicaKey = `fenologico_planta_${i}_frutos_canica`;
            const pinponKey = `fenologico_planta_${i}_frutos_pinpon`;
            const bolaTenisKey = `fenologico_planta_${i}_frutos_bola_tenis`;
            const cuartoKey = `fenologico_planta_${i}_frutos_cuarto`;
            const bbchKey = `fenologico_planta_${i}_bbch_fructificacion`;

            if (
              !caracterizacion[totalFrutosKey]?.trim() ||
              !caracterizacion[canicaKey]?.trim() ||
              !caracterizacion[pinponKey]?.trim() ||
              !caracterizacion[bolaTenisKey]?.trim() ||
              !caracterizacion[cuartoKey]?.trim() ||
              !caracterizacion[bbchKey]?.trim()
            ) {
              toast.error(`Complete todos los datos de la planta ${i} (Fase Fructificación)`);
              return false;
            }

            const total = parseFloat(caracterizacion[totalFrutosKey]);
            const canica = parseFloat(caracterizacion[canicaKey]);
            const pinpon = parseFloat(caracterizacion[pinponKey]);
            const bola = parseFloat(caracterizacion[bolaTenisKey]);
            const cuarto = parseFloat(caracterizacion[cuartoKey]);
            if (
              isNaN(total) || total < 0 ||
              isNaN(canica) || canica < 0 ||
              isNaN(pinpon) || pinpon < 0 ||
              isNaN(bola) || bola < 0 ||
              isNaN(cuarto) || cuarto < 0
            ) {
              toast.error(`Los valores numéricos de la planta ${i} deben ser válidos`);
              return false;
            }
          }
        }
        return true;
      }

      return true; // otros casos
    },
    [caracterizacion, nombreCampoMonitoreo, plantasCenso, plantasFenologico]
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

    // Validar campos condicionales
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
      let fenologico_datos: FenologicoDatosEnvio | undefined = undefined;

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
        fenologico_datos = {
          lote: caracterizacion["lote_a_monitorear"] || "",
          plantas: plantasFenologico.map((planta, idx) => {
            const i = idx + 1;
            const base: any = {
              codigo: planta.codigo,
              fase: planta.fase,
            };

            if (planta.fase === "vegetativa") {
              base.totalHojas = parseFloat(caracterizacion[`fenologico_planta_${i}_total_hojas`] || "0");
              base.brotesActivos = parseFloat(caracterizacion[`fenologico_planta_${i}_brotes_activos`] || "0");
              base.bbchVegetativo = caracterizacion[`fenologico_planta_${i}_bbch_vegetativo`] || "";
            }

            if (planta.fase === "floracion") {
              base.totalFlores = parseFloat(caracterizacion[`fenologico_planta_${i}_total_flores`] || "0");
              base.botonesFlorales = parseFloat(caracterizacion[`fenologico_planta_${i}_botones_florales`] || "0");
              base.bbchFloracion = caracterizacion[`fenologico_planta_${i}_bbch_floracion`] || "";
            }

            if (planta.fase === "fructificacion") {
              base.totalFrutos = parseFloat(caracterizacion[`fenologico_planta_${i}_total_frutos`] || "0");
              base.frutosCanica = parseFloat(caracterizacion[`fenologico_planta_${i}_frutos_canica`] || "0");
              base.frutosPinpon = parseFloat(caracterizacion[`fenologico_planta_${i}_frutos_pinpon`] || "0");
              base.frutosBolaTenis = parseFloat(caracterizacion[`fenologico_planta_${i}_frutos_bola_tenis`] || "0");
              base.frutosCuartoMaduracion = parseFloat(caracterizacion[`fenologico_planta_${i}_frutos_cuarto`] || "0");
              base.bbchFructificacion = caracterizacion[`fenologico_planta_${i}_bbch_fructificacion`] || "";
            }

            return base;
          }),
        };
      }

      // 3. Fingerprint y fecha
      const fingerprint = await obtenerFingerprint();
      const fechaActual = new Date().toISOString().split("T")[0];

      // 4. Construir payload
      const data: DatosEnvio = {
        test_id: formularioSeleccionado!,
        caracterizacion_datos: caracterizacionCompleta,
        censo_datos,
        fenologico_datos,
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
          setPlantasFenologico([]);
          localStorage.removeItem("encuesta_formularioId");
          localStorage.removeItem("encuesta_tipoParticipante");
          localStorage.removeItem("encuesta_caracterizacion");
          localStorage.removeItem("encuesta_plantasCenso");
          localStorage.removeItem("encuesta_plantasFenologico");
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

  // ---------- RENDERIZADO CONDICIONAL ----------
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

      {/* ---------- FORMULARIO DE ENCUESTA ---------- */}
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

          {/* ---------- SECCIÓN CENSO POBLACIONAL ---------- */}
          {valorMonitoreo === "poblacion" && (
            <div className="bg-gray-50 p-6 rounded-lg shadow-md mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                Censo Poblacional
              </h2>
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
                  <div key={planta.codigo} className="border rounded-lg p-4 mb-6 bg-white shadow-sm">
                    <h4 className="font-semibold text-lg text-gray-800 mb-3">
                      {planta.label} (Código: {planta.codigo})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

          {/* ---------- SECCIÓN MONITOREO FENOLÓGICO ---------- */}
          {valorMonitoreo === "fenologico" && (
            <div className="bg-gray-50 p-6 rounded-lg shadow-md mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                Monitoreo Fenológico
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

              {/* Instrucciones generales */}
              <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border">
                <p className="text-sm text-gray-700">
                  <span className="font-bold">Metodología:</span> Para cada planta se ha asignado aleatoriamente una fase fenológica.
                  Complete los campos correspondientes a la fase indicada.
                </p>
              </div>

              {/* Plantas generadas */}
              <h3 className="text-xl font-bold text-gray-800 mb-4 mt-8">
                Plantas seleccionadas para monitoreo fenológico
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Las siguientes 5 plantas han sido generadas automáticamente con una fase fenológica asignada.
              </p>

              {plantasFenologico.map((planta, idx) => {
                const i = idx + 1;
                const fase = planta.fase;

                // Claves para inputs
                const hojasKey = `fenologico_planta_${i}_total_hojas`;
                const brotesKey = `fenologico_planta_${i}_brotes_activos`;
                const bbchVegKey = `fenologico_planta_${i}_bbch_vegetativo`;

                const totalFloresKey = `fenologico_planta_${i}_total_flores`;
                const botonesKey = `fenologico_planta_${i}_botones_florales`;
                const bbchFlorKey = `fenologico_planta_${i}_bbch_floracion`;

                const totalFrutosKey = `fenologico_planta_${i}_total_frutos`;
                const canicaKey = `fenologico_planta_${i}_frutos_canica`;
                const pinponKey = `fenologico_planta_${i}_frutos_pinpon`;
                const bolaTenisKey = `fenologico_planta_${i}_frutos_bola_tenis`;
                const cuartoKey = `fenologico_planta_${i}_frutos_cuarto`;
                const bbchFrucKey = `fenologico_planta_${i}_bbch_fructificacion`;

                return (
                  <div key={planta.codigo} className="border rounded-lg p-4 mb-6 bg-white shadow-sm">
                    <h4 className="font-semibold text-lg text-gray-800 mb-2">
                      {planta.label} (Código: {planta.codigo})
                    </h4>
                    <div className="mb-3">
                      <span className="inline-block px-3 py-1 text-sm font-semibold rounded-full 
                        ${fase === 'vegetativa' ? 'bg-green-100 text-green-800' : 
                          fase === 'floracion' ? 'bg-pink-100 text-pink-800' : 
                          'bg-orange-100 text-orange-800'}">
                        Fase: {fase === 'vegetativa' ? 'Vegetativa' : fase === 'floracion' ? 'Floración' : 'Fructificación'}
                      </span>
                    </div>

                    {/* Formulario según fase */}
                    {fase === "vegetativa" && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div className="flex flex-col">
                          <label className="text-sm font-medium text-gray-700 mb-1">
                            Número total de hojas evaluadas
                          </label>
                          <input
                            type="number"
                            step="1"
                            min="0"
                            name={hojasKey}
                            value={caracterizacion[hojasKey] || ""}
                            onChange={(e) => handleCaracterizacionChange(hojasKey, e.target.value)}
                            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Ej: 45"
                            required
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="text-sm font-medium text-gray-700 mb-1">
                            Número de brotes vegetativos activos
                          </label>
                          <input
                            type="number"
                            step="1"
                            min="0"
                            name={brotesKey}
                            value={caracterizacion[brotesKey] || ""}
                            onChange={(e) => handleCaracterizacionChange(brotesKey, e.target.value)}
                            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Ej: 8"
                            required
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="text-sm font-medium text-gray-700 mb-1">
                            Estado BBCH predominante
                          </label>
                          <select
                            name={bbchVegKey}
                            value={caracterizacion[bbchVegKey] || ""}
                            onChange={(e) => handleCaracterizacionChange(bbchVegKey, e.target.value)}
                            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          >
                            <option value="" disabled>Seleccione</option>
                            <option value="10-11">10–11: Primeras hojas visibles</option>
                            <option value="15">15: Hojas en expansión</option>
                            <option value="19">19: Hojas alcanzan tamaño final</option>
                          </select>
                        </div>
                      </div>
                    )}

                    {fase === "floracion" && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div className="flex flex-col">
                          <label className="text-sm font-medium text-gray-700 mb-1">
                            Número total de flores observadas
                          </label>
                          <input
                            type="number"
                            step="1"
                            min="0"
                            name={totalFloresKey}
                            value={caracterizacion[totalFloresKey] || ""}
                            onChange={(e) => handleCaracterizacionChange(totalFloresKey, e.target.value)}
                            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Ej: 30"
                            required
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="text-sm font-medium text-gray-700 mb-1">
                            Número de botones florales
                          </label>
                          <input
                            type="number"
                            step="1"
                            min="0"
                            name={botonesKey}
                            value={caracterizacion[botonesKey] || ""}
                            onChange={(e) => handleCaracterizacionChange(botonesKey, e.target.value)}
                            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Ej: 12"
                            required
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="text-sm font-medium text-gray-700 mb-1">
                            Estado BBCH predominante
                          </label>
                          <select
                            name={bbchFlorKey}
                            value={caracterizacion[bbchFlorKey] || ""}
                            onChange={(e) => handleCaracterizacionChange(bbchFlorKey, e.target.value)}
                            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          >
                            <option value="" disabled>Seleccione</option>
                            <option value="60">60: primeras flores abiertas</option>
                            <option value="65">65: Plena floración (≈50% abiertas)</option>
                            <option value="67">67: Inicio caída de pétalos</option>
                            <option value="69">69: Fin de floración</option>
                          </select>
                        </div>
                      </div>
                    )}

                    {fase === "fructificacion" && (
                      <div className="space-y-4 mt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex flex-col">
                            <label className="text-sm font-medium text-gray-700 mb-1">
                              Número total de frutos observados
                            </label>
                            <input
                              type="number"
                              step="1"
                              min="0"
                              name={totalFrutosKey}
                              value={caracterizacion[totalFrutosKey] || ""}
                              onChange={(e) => handleCaracterizacionChange(totalFrutosKey, e.target.value)}
                              className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Ej: 50"
                              required
                            />
                          </div>
                          <div className="flex flex-col">
                            <label className="text-sm font-medium text-gray-700 mb-1">
                              Frutos tipo canica
                            </label>
                            <input
                              type="number"
                              step="1"
                              min="0"
                              name={canicaKey}
                              value={caracterizacion[canicaKey] || ""}
                              onChange={(e) => handleCaracterizacionChange(canicaKey, e.target.value)}
                              className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Ej: 10"
                              required
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="flex flex-col">
                            <label className="text-sm font-medium text-gray-700 mb-1">
                              Frutos tipo pin-pon
                            </label>
                            <input
                              type="number"
                              step="1"
                              min="0"
                              name={pinponKey}
                              value={caracterizacion[pinponKey] || ""}
                              onChange={(e) => handleCaracterizacionChange(pinponKey, e.target.value)}
                              className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Ej: 15"
                              required
                            />
                          </div>
                          <div className="flex flex-col">
                            <label className="text-sm font-medium text-gray-700 mb-1">
                              Frutos tipo bola de tenis
                            </label>
                            <input
                              type="number"
                              step="1"
                              min="0"
                              name={bolaTenisKey}
                              value={caracterizacion[bolaTenisKey] || ""}
                              onChange={(e) => handleCaracterizacionChange(bolaTenisKey, e.target.value)}
                              className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Ej: 12"
                              required
                            />
                          </div>
                          <div className="flex flex-col">
                            <label className="text-sm font-medium text-gray-700 mb-1">
                              Frutos 1/4 de maduración
                            </label>
                            <input
                              type="number"
                              step="1"
                              min="0"
                              name={cuartoKey}
                              value={caracterizacion[cuartoKey] || ""}
                              onChange={(e) => handleCaracterizacionChange(cuartoKey, e.target.value)}
                              className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Ej: 8"
                              required
                            />
                          </div>
                        </div>
                        <div className="flex flex-col md:flex-row md:items-center gap-4 mt-2">
                          <div className="flex flex-col md:w-1/3">
                            <label className="text-sm font-medium text-gray-700 mb-1">
                              Estado BBCH predominante
                            </label>
                            <select
                              name={bbchFrucKey}
                              value={caracterizacion[bbchFrucKey] || ""}
                              onChange={(e) => handleCaracterizacionChange(bbchFrucKey, e.target.value)}
                              className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              required
                            >
                              <option value="" disabled>Seleccione</option>
                              <option value="71">71: Cuajado inicial</option>
                              <option value="72">72: Fruto verde con sépalos</option>
                              <option value="74">74: Crecimiento del fruto</option>
                              <option value="79">79: ≈90% Tamaño final</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
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