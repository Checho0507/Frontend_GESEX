import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { obtenerFormularios } from "../services/Cuestionarios";
import { Formulario } from "../types";

export const useFormularios = () => {
  const [formularios, setFormularios] = useState<Formulario[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);

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

  return { formularios, error, cargando };
};