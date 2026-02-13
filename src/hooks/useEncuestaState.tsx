import { useState, useEffect, useCallback } from "react";
import { PlantaBase, PlantaFenologico, Formulario } from "../types";

// hook usePersistedState mejorado (dentro de useEncuestaState.ts)
function usePersistedState<T>(key: string, defaultValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [state, setState] = useState<T>(() => {
    try {
      const saved = localStorage.getItem(key);
      if (saved === null) return defaultValue;
      return JSON.parse(saved);
    } catch (error) {
      console.error(`Error parsing localStorage key "${key}":`, error, 'Raw value:', localStorage.getItem(key));
      localStorage.removeItem(key); // Limpia la entrada corrupta
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.error(`Error saving to localStorage key "${key}":`, error);
    }
  }, [key, state]);

  return [state, setState];
}

export const useEncuestaState = () => {
  const [formularioSeleccionado, setFormularioSeleccionado] = usePersistedState<string | null>("encuesta_formularioId", null);
  const [tipoParticipante, setTipoParticipante] = usePersistedState<string | null>("encuesta_tipoParticipante", null);
  const [caracterizacion, setCaracterizacion] = usePersistedState<Record<string, string>>("encuesta_caracterizacion", {});
  const [loteSeleccionado, setLoteSeleccionado] = usePersistedState<string | null>("encuesta_loteSeleccionado", null);
  const [plantasSeleccionadas, setPlantasSeleccionadas] = usePersistedState<PlantaBase[]>("encuesta_plantasSeleccionadas", []);
  const [plantasFenologico, setPlantasFenologico] = usePersistedState<PlantaFenologico[]>("encuesta_plantasFenologico", []);

  // Generar 5 plantas aleatorias
  const generarPlantas = useCallback((cantidad: number): PlantaBase[] => {
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

  // Generar plantas fenológicas a partir de base
  const generarPlantasFenologicoDesdeBase = useCallback(
    (base: PlantaBase[]): PlantaFenologico[] => {
      return base.map((p) => ({ ...p, fase: "" }));
    },
    []
  );

  // Cuando se selecciona un lote, generar plantas si no existen
  useEffect(() => {
    if (loteSeleccionado && plantasSeleccionadas.length === 0) {
      const nuevas = generarPlantas(5);
      setPlantasSeleccionadas(nuevas);
      setPlantasFenologico(generarPlantasFenologicoDesdeBase(nuevas));
    }
  }, [loteSeleccionado, generarPlantas, generarPlantasFenologicoDesdeBase, plantasSeleccionadas.length, setPlantasSeleccionadas, setPlantasFenologico]);

  // Limpiar datos al cambiar de formulario
  const resetearFormulario = useCallback(() => {
    setFormularioSeleccionado(null);
    setTipoParticipante(null);
    setCaracterizacion({});
    setLoteSeleccionado(null);
    setPlantasSeleccionadas([]);
    setPlantasFenologico([]);
  }, [setFormularioSeleccionado, setTipoParticipante, setCaracterizacion, setLoteSeleccionado, setPlantasSeleccionadas, setPlantasFenologico]);

  // Manejar cambio de fase en fenológico
  const handleFaseChange = useCallback((indice: number, nuevaFase: PlantaFenologico["fase"]) => {
    setPlantasFenologico((prev) =>
      prev.map((planta, idx) =>
        idx === indice ? { ...planta, fase: nuevaFase } : planta
      )
    );

    // Limpiar campos relacionados con esa planta
    setCaracterizacion((prev) => {
      const nuevas = { ...prev };
      const prefijo = `fenologico_planta_${indice + 1}_`;
      Object.keys(nuevas).forEach((key) => {
        if (key.startsWith(prefijo)) {
          delete nuevas[key];
        }
      });
      return nuevas;
    });
  }, [setPlantasFenologico, setCaracterizacion]);

  // Manejar cambio de lote: limpiar plantas y datos específicos
  const handleLoteChange = useCallback((lote: string) => {
    setLoteSeleccionado(lote);
    setPlantasSeleccionadas([]);
    setPlantasFenologico([]);
    setCaracterizacion((prev) => {
      const nuevas = { ...prev };
      Object.keys(nuevas).forEach((key) => {
        if (key.startsWith("censo_planta_") || key.startsWith("fenologico_planta_")) {
          delete nuevas[key];
        }
      });
      return nuevas;
    });
  }, [setLoteSeleccionado, setPlantasSeleccionadas, setPlantasFenologico, setCaracterizacion]);

  // Seleccionar formulario
  const seleccionarFormulario = useCallback((formulario: Formulario) => {
    setFormularioSeleccionado(formulario.id);
    setTipoParticipante(formulario.caracterizacion_template.tipo_participante);
    setCaracterizacion({});
    setLoteSeleccionado(null);
    setPlantasSeleccionadas([]);
    setPlantasFenologico([]);
  }, [setFormularioSeleccionado, setTipoParticipante, setCaracterizacion, setLoteSeleccionado, setPlantasSeleccionadas, setPlantasFenologico]);

  return {
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
  };
};