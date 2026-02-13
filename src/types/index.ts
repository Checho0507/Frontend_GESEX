// ---------- INTERFACES GLOBALES ----------

export interface CaracterizacionTemplate {
  campos_requeridos: string[];
  tipo_participante: string;
}

export interface Censo {
  campos_requeridos: string[];
}

export interface Fenologico {
  campos_requeridos: string[];
}

export interface Formulario {
  id: string;
  caracterizacion_template: CaracterizacionTemplate;
  censo: Censo;
  fenologico: Fenologico;
}

export interface PlantaBase {
  codigo: string;
  label: string;
}

export interface PlantaFenologico extends PlantaBase {
  fase: "vegetativa" | "floracion" | "fructificacion" | "";
}

export interface CensoDatosEnvio {
  lote: string;
  plantas: Array<{
    codigo: string;
    observacion: string;
    altura: number;
    diametro: number;
  }>;
}

export interface FenologicoDatosEnvio {
  lote: string;
  plantas: Array<{
    codigo: string;
    fase: string;
    totalHojas?: number;
    brotesActivos?: number;
    bbchVegetativo?: string;
    totalFlores?: number;
    botonesFlorales?: number;
    bbchFloracion?: string;
    totalFrutos?: number;
    frutosCanica?: number;
    frutosPinpon?: number;
    frutosBolaTenis?: number;
    frutosCuartoMaduracion?: number;
    bbchFructificacion?: string;
  }>;
}

export interface DatosEnvio {
  test_id: string;
  caracterizacion_datos: Record<string, string>;
  censo_datos?: CensoDatosEnvio;
  fenologico_datos?: FenologicoDatosEnvio;
  fecha: string;
  fingerprint: string;
}

// Utilidad para opciones de lote
export interface LoteOption {
  value: string;
  label: string;
}

export const LOTES: LoteOption[] = [
  { value: "l1", label: "Lote 1. Naranja - Bodega - 45 Plantas" },
  { value: "l2", label: "Lote 2. Naranja- Guadual - 108 Plantas" },
  { value: "l3", label: "Lote 3. Naranja pequeña - 124 Plantas" },
  { value: "l4", label: "Lote 4. Mandarina - Paneles - 53 Plantas" },
  { value: "l5", label: "Lote 5. Naranja - Oficina - 127 Plantas" },
  { value: "l6", label: "Lote 6. Mandarina Adulta - 114 Plantas" },
  { value: "l7", label: "Lote 7. Naranja Swingle - 114 Plantas" },
  { value: "l8", label: "Lote 8. Naranja Swingle - 164 Plantas" },
  { value: "l9", label: "Lote 9. Naranja Adulta - 216 Plantas" },
  { value: "l10", label: "Lote 10. Naranja Swingle - 216 Plantas" },
  { value: "l11", label: "Lote 11. Limón Joven - 125 Plantas" },
  { value: "l12", label: "Lote 12. Limón Adulto - 64 Plantas" },
];