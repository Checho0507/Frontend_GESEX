import { useCallback } from "react";
import { toast } from "react-hot-toast";
import { enviarRespuestas } from "../services/Cuestionarios";
import { obtenerFingerprint } from "../Utils/fingerprint";
import { Formulario, DatosEnvio, CensoDatosEnvio, FenologicoDatosEnvio, PlantaBase, PlantaFenologico } from "../types";

interface UseEnvioProps {
  formularioSeleccionado: string | null;
  formularios: Formulario[];
  caracterizacion: Record<string, string>;
  tipoParticipante: string | null;
  loteSeleccionado: string | null;
  plantasSeleccionadas: PlantaBase[];
  plantasFenologico: PlantaFenologico[];
  valorMonitoreo: string | undefined;
  onExito: () => void;
}

export const useEnvio = ({
  formularioSeleccionado,
  formularios,
  caracterizacion,
  tipoParticipante,
  loteSeleccionado,
  plantasSeleccionadas,
  plantasFenologico,
  valorMonitoreo,
  onExito,
}: UseEnvioProps) => {
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      try {
        const formulario = formularios.find((f) => f.id === formularioSeleccionado);
        if (!formulario) throw new Error("Formulario no encontrado");

        // 1. Datos de caracterización general
        const caracterizacionCompleta = { ...caracterizacion };
        if (tipoParticipante) {
          caracterizacionCompleta["tipo_participante"] = tipoParticipante;
        }
        if (loteSeleccionado) {
          caracterizacionCompleta["lote_a_monitorear"] = loteSeleccionado;
        }

        // 2. Datos específicos según la selección
        let censo_datos: CensoDatosEnvio | undefined = undefined;
        let fenologico_datos: FenologicoDatosEnvio | undefined = undefined;

        if (valorMonitoreo === "poblacion") {
          censo_datos = {
            lote: loteSeleccionado || "",
            plantas: plantasSeleccionadas.map((planta, idx) => {
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
            lote: loteSeleccionado || "",
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
        await toast.promise(enviarRespuestas(data), {
          loading: "Enviando respuestas...",
          success: "¡Respuestas enviadas correctamente!",
          error: (err) => `Error al enviar respuestas: ${err.message || "Error desconocido"}`,
        });

        onExito();
      } catch (err: any) {
        toast.error(`Error: ${err.message || "Error desconocido"}`);
        console.error("Error al procesar el formulario:", err);
      }
    },
    [
      formularioSeleccionado,
      formularios,
      caracterizacion,
      tipoParticipante,
      loteSeleccionado,
      plantasSeleccionadas,
      plantasFenologico,
      valorMonitoreo,
      onExito,
    ]
  );

  return { handleSubmit };
};