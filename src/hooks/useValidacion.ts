import { useCallback } from "react";
import { toast } from "react-hot-toast";
import { Formulario, PlantaBase, PlantaFenologico } from "../types";

interface UseValidacionProps {
  formularioSeleccionado: string | null;
  formularios: Formulario[];
  caracterizacion: Record<string, string>;
  nombreCampoMonitoreo: string | null;
  loteSeleccionado: string | null;
  plantasSeleccionadas: PlantaBase[];
  plantasFenologico: PlantaFenologico[];
}

export const useValidacion = ({
  formularioSeleccionado,
  formularios,
  caracterizacion,
  nombreCampoMonitoreo,
  loteSeleccionado,
  plantasSeleccionadas,
  plantasFenologico,
}: UseValidacionProps) => {
  const validarCamposCondicionales = useCallback(
    (formulario: Formulario): boolean => {
      if (!nombreCampoMonitoreo) return true;

      const seleccion = caracterizacion[nombreCampoMonitoreo];

      // --- Validación de Censo Poblacional ---
      if (seleccion === "poblacion") {
        if (!loteSeleccionado) {
          toast.error("Debe seleccionar un lote para el Censo Poblacional");
          return false;
        }
        if (plantasSeleccionadas.length !== 5) {
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
              `Complete todos los datos de la planta ${i} (${plantasSeleccionadas[i - 1]?.label || ""})`
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
        if (!loteSeleccionado) {
          toast.error("Debe seleccionar un lote para el Monitoreo Fenológico");
          return false;
        }
        if (plantasFenologico.length !== 5) {
          toast.error("Error al cargar las plantas para fenológico");
          return false;
        }

        for (let i = 0; i < plantasFenologico.length; i++) {
          if (!plantasFenologico[i].fase) {
            toast.error(`Seleccione la fase fenológica de la planta ${i + 1}`);
            return false;
          }
        }

        for (let i = 1; i <= 5; i++) {
          const planta = plantasFenologico[i - 1];
          if (!planta) continue;

          const fase = planta.fase;

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

      // Dentro de validarCamposCondicionales, caso "artropodos"
      if (seleccion === "artropodos") {
        // Verificar que existan plantas
        if (!plantasSeleccionadas || plantasSeleccionadas.length === 0) {
          toast.error("No hay plantas seleccionadas para el monitoreo de artrópodos");
          return false;
        }

        // Validar cada planta
        for (let i = 0; i < plantasSeleccionadas.length; i++) {
          const prefix = `artropodo_planta_${i + 1}`;
          const clases = caracterizacion[`${prefix}_clases`] || "";
          const clasesArray = clases ? clases.split(",") : [];

          if (clasesArray.length === 0) {
            // No hay artrópodos en esta planta, está bien (opcional)
            continue;
          }

          // Validar insecto si está presente
          if (clasesArray.includes('insecto')) {
            const insectoTipo = caracterizacion[`${prefix}_insecto_tipo`];
            if (!insectoTipo) {
              toast.error(`Planta ${i + 1}: Debe seleccionar un tipo de insecto`);
              return false;
            }

            // Validar según el tipo
            if (insectoTipo === "compsus") {
              if (!caracterizacion[`${prefix}_insecto_compsus_adultos`] || !caracterizacion[`${prefix}_insecto_compsus_dano_hojas`]) {
                toast.error(`Planta ${i + 1}: Complete todos los datos de Compsus sp.`);
                return false;
              }
            } else if (insectoTipo === "diaphorina") {
              if (!caracterizacion[`${prefix}_insecto_diaphorina_brotes`] || !caracterizacion[`${prefix}_insecto_diaphorina_estados`]) {
                toast.error(`Planta ${i + 1}: Complete todos los datos de Diaphorina citri`);
                return false;
              }
            } else if (insectoTipo === "phyllocnistis") {
              if (!caracterizacion[`${prefix}_insecto_phyllocnistis_galerias`] || !caracterizacion[`${prefix}_insecto_phyllocnistis_nivel_dano`]) {
                toast.error(`Planta ${i + 1}: Complete todos los datos de Phyllocnistis sp.`);
                return false;
              }
            } else if (insectoTipo === "toxoptera") {
              if (!caracterizacion[`${prefix}_insecto_toxoptera_brotes`] || !caracterizacion[`${prefix}_insecto_toxoptera_mielecilla`]) {
                toast.error(`Planta ${i + 1}: Complete todos los datos de Toxoptera citricidus`);
                return false;
              }
            } else if (insectoTipo === "hormiga") {
              if (!caracterizacion[`${prefix}_insecto_hormiga_activos`] || !caracterizacion[`${prefix}_insecto_hormiga_numero`]) {
                toast.error(`Planta ${i + 1}: Complete todos los datos de Hormiga arriera`);
                return false;
              }
            } else if (insectoTipo === "otro_insecto") {
              if (!caracterizacion[`${prefix}_insecto_otro_nombre`]) {
                toast.error(`Planta ${i + 1}: Especifique el nombre del otro insecto`);
                return false;
              }
            }
          }

          // Validar ácaro si está presente
          if (clasesArray.includes('aracnido')) {
            const acaroTipo = caracterizacion[`${prefix}_acaro_tipo`];
            if (!acaroTipo) {
              toast.error(`Planta ${i + 1}: Debe seleccionar un tipo de ácaro`);
              return false;
            }

            if (acaroTipo === "phyllocoptruta") {
              if (!caracterizacion[`${prefix}_acaro_phyllocoptruta_frutos`]) {
                toast.error(`Planta ${i + 1}: Complete los datos de Phyllocoptruta sp.`);
                return false;
              }
            } else if (acaroTipo === "polyphagotarsonemus") {
              if (!caracterizacion[`${prefix}_acaro_polyphagotarsonemus_frutos`]) {
                toast.error(`Planta ${i + 1}: Complete los datos de Polyphagotarsonemus sp.`);
                return false;
              }
            } else if (acaroTipo === "otro_acaro") {
              if (!caracterizacion[`${prefix}_acaro_otro_nombre`]) {
                toast.error(`Planta ${i + 1}: Especifique el nombre del otro ácaro`);
                return false;
              }
            }
          }
        }
        return true;
      }

      return true;
    },
    [caracterizacion, nombreCampoMonitoreo, plantasSeleccionadas, plantasFenologico, loteSeleccionado]
  );

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

    // Validar campos de caracterización principal (EXCLUYENDO lote_a_monitorear)
    const camposRequeridos = formulario.caracterizacion_template.campos_requeridos.filter(
      (campo) => !campo.toLowerCase().includes("lote")
    );
    const camposFaltantes = camposRequeridos.filter(
      (campo) => !caracterizacion[campo] || caracterizacion[campo].trim() === ""
    );
    if (camposFaltantes.length > 0) {
      toast.error(
        `Por favor completa todos los campos de caracterización requeridos: ${camposFaltantes.join(", ")}`
      );
      return false;
    }

    // Validar campos condicionales
    if (!validarCamposCondicionales(formulario)) {
      return false;
    }

    return true;
  }, [formularioSeleccionado, formularios, caracterizacion, validarCamposCondicionales]);

  return { validarFormulario };
};