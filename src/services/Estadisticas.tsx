import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000"; // Ajusta si cambias de entorno

// 1. Crear estadística

export const crearEstadistica = (data: any) => {
  return axios.post(`${API_BASE_URL}/estadisticas/`, data);
};

// 2. Promedios por dimensión
export const obtenerPromediosPorDimension = (testId: string) => {
  return axios.get(`${API_BASE_URL}/estadisticas/${testId}/dimensiones/promedios`);
};

// 3. Distribución por dimensión
export const obtenerDistribucionPorDimension = (testId: string) => {
  return axios.get(`${API_BASE_URL}/estadisticas/${testId}/dimensiones/distribucion`);
};

// 4. Comparación por tipo de participante
export const obtenerComparacionTipoParticipante = () => {
  return axios.get(`${API_BASE_URL}/estadisticas/comparacion/tipo_participante`);
};

// 5. Promedio por edad
export const obtenerEstadisticasPorEdad = (testId: string) => {
  return axios.get(`${API_BASE_URL}/estadisticas/${testId}/por-edad`);
};

// 6. Promedio por pronombre
export const obtenerEstadisticasPorPronombre = (testId: string) => {
  return axios.get(`${API_BASE_URL}/estadisticas/${testId}/por-pronombre`);
};

// 7. Promedio por género
export const obtenerEstadisticasPorGenero = (testId: string) => {
  return axios.get(`${API_BASE_URL}/estadisticas/${testId}/por-genero`);
};

// 8. Conteo por comuna
export const obtenerEstadisticasPorComuna = (testId: string) => {
  return axios.get(`${API_BASE_URL}/estadisticas/${testId}/habitantes/comuna`);
};
