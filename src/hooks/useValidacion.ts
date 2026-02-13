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

      // Dentro de validarCamposCondicionales, después de los casos de fenologico
      if (seleccion === "artropodos") {
        const clase = caracterizacion["artropodo_clase"];
        if (!clase) {
          toast.error("Debe seleccionar la clase de artrópodo");
          return false;
        }

        if (clase === "insecto") {
          const tipo = caracterizacion["artropodo_tipo_insecto"];
          if (!tipo) {
            toast.error("Debe seleccionar el insecto observado");
            return false;
          }

          // Validar según el tipo de insecto
          if (tipo === "compsus") {
            if (!caracterizacion["artropodo_compsus_adultos"]?.trim() || !caracterizacion["artropodo_compsus_dano_hojas"]?.trim()) {
              toast.error("Complete todos los campos de Compsus sp.");
              return false;
            }
          } else if (tipo === "diaphorina") {
            if (!caracterizacion["artropodo_diaphorina_brotes"]?.trim() || !caracterizacion["artropodo_diaphorina_estados"]?.trim()) {
              toast.error("Complete todos los campos de Diaphorina citri");
              return false;
            }
          } else if (tipo === "phyllocnistis") {
            if (!caracterizacion["artropodo_phyllocnistis_galerias"]?.trim() || !caracterizacion["artropodo_phyllocnistis_nivel_dano"]?.trim()) {
              toast.error("Complete todos los campos de Phyllocnistis sp.");
              return false;
            }
          } else if (tipo === "toxoptera") {
            if (!caracterizacion["artropodo_toxoptera_brotes"]?.trim() || !caracterizacion["artropodo_toxoptera_mielecilla"]?.trim()) {
              toast.error("Complete todos los campos de Toxoptera citricidus");
              return false;
            }
          } else if (tipo === "hormiga") {
            if (!caracterizacion["artropodo_hormiga_activos"]?.trim() || !caracterizacion["artropodo_hormiga_ubicacion"]?.trim()) {
              toast.error("Complete todos los campos de Hormiga arriera");
              return false;
            }
          } else if (tipo === "otro_insecto") {
            if (!caracterizacion["artropodo_otro_insecto_nombre"]?.trim()) {
              toast.error("Especifique el nombre del otro insecto");
              return false;
            }
          }
        } else if (clase === "aracnido") {
          const tipo = caracterizacion["artropodo_tipo_acaro"];
          if (!tipo) {
            toast.error("Debe seleccionar el ácaro observado");
            return false;
          }

          if (tipo === "phyllocoptruta") {
            if (!caracterizacion["artropodo_phyllocoptruta_frutos"]?.trim()) {
              toast.error("Complete los campos de Phyllocoptruta sp.");
              return false;
            }
          } else if (tipo === "polyphagotarsonemus") {
            if (!caracterizacion["artropodo_polyphagotarsonemus_frutos"]?.trim()) {
              toast.error("Complete los campos de Polyphagotarsonemus sp.");
              return false;
            }
          } else if (tipo === "otro_acaro") {
            if (!caracterizacion["artropodo_otro_acaro_nombre"]?.trim()) {
              toast.error("Especifique el nombre del otro ácaro");
              return false;
            }
          }
        }

        // La sección "OTRO ARTRÓPODO" es opcional, no la validamos a menos que haya datos
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