import axios from "axios";

const API_BASE_URL = "https://backendgesex-production.up.railway.app/"; // Cambia si el backend está en otro host o puerto

// Obtener todos los formularios (cuestionarios)
export const obtenerFormularios = () => {
  return axios.get(`${API_BASE_URL}/cuestionarios/`);
};

// Obtener un formulario específico por ID
export const obtenerFormularioPorId = (id: string) => {
  return axios.get(`${API_BASE_URL}/cuestionarios/${id}`);
};

// Crear un nuevo formulario
export const crearFormulario = (data: any) => {
  return axios.post(`${API_BASE_URL}/cuestionarios/`, data);
};

// Actualizar un formulario existente
export const actualizarFormulario = (id: string, data: any) => {
  return axios.put(`${API_BASE_URL}/cuestionarios/${id}`, data);
};

// Eliminar un formulario por ID
export const eliminarFormulario = (id: string) => {
  return axios.delete(`${API_BASE_URL}/cuestionarios/${id}`);
};


// Enviar respuestas al backend
export const enviarRespuestas = (data: any) => {
  return axios.post(`${API_BASE_URL}/Respuestas/`, data);
};