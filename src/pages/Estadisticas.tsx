import { useEffect, useState } from "react";
import {
  obtenerPromediosPorDimension,
  obtenerDistribucionPorDimension,
  obtenerComparacionTipoParticipante,
  obtenerEstadisticasPorEdad,
  obtenerEstadisticasPorPronombre,
  obtenerEstadisticasPorComuna,
} from "../services/Estadisticas";
import { obtenerFormularios } from "../services/Cuestionarios";

import PromediosPorDimension from "../components/PromediosPorDimension";
import DistribucionDimension from "../components/DistribucionPorDimension";
import ComparacionPorTipoParticipante from "../components/ComparacionPorTipo";
import PromedioPorEdad from "../components/PromedioPorEdad";
import PromedioPorPronombre from "../components/PromedioPorPronombre";
import ConteoPorComuna from "../components/ConteoPorComuna";

interface Cuestionario {
  id: string;
  titulo: string;
  caracterizacion_template: {
    tipo_participante: "universitario" | "habitante";
  };
}

const Estadisticas = () => {
  const [cuestionarios, setCuestionarios] = useState<Cuestionario[]>([]);
  const [testId, setTestId] = useState<string>("");
  const [tipoParticipante, setTipoParticipante] = useState<"universitario" | "habitante" | "">("");

  const [promedios, setPromedios] = useState<any>(null);
  const [distribucion, setDistribucion] = useState<any>(null);
  const [comparacion, setComparacion] = useState<any>(null);
  const [porEdad, setPorEdad] = useState<any>(null);
  const [porPronombre, setPorPronombre] = useState<any>(null);
  const [porComuna, setPorComuna] = useState<any>(null);

  useEffect(() => {
    obtenerFormularios()
      .then((res) => setCuestionarios(res.data))
      .catch((err) => console.error("Error obteniendo cuestionarios", err));
  }, []);

  useEffect(() => {
    if (!testId) return;

    const seleccionado = cuestionarios.find((q) => q.id === testId);
    if (seleccionado) {
      setTipoParticipante(seleccionado.caracterizacion_template?.tipo_participante || "");
    }

    obtenerPromediosPorDimension(testId).then((res) => setPromedios(res.data));
    obtenerDistribucionPorDimension(testId).then((res) => setDistribucion(res.data));
    obtenerComparacionTipoParticipante().then((res) => setComparacion(res.data));
    obtenerEstadisticasPorEdad(testId).then((res) => setPorEdad(res.data));
    obtenerEstadisticasPorPronombre(testId).then((res) => setPorPronombre(res.data));
    obtenerEstadisticasPorComuna(testId).then((res) => setPorComuna(res.data));
  }, [testId]);

  const handleChange = (id: string) => {
    setTestId(id);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Estadísticas del Test</h1>

      <div className="mb-6">
        <label htmlFor="tipoTest" className="block text-lg font-medium mb-1">
          Selecciona el test:
        </label>
        <select
          id="tipoTest"
          value={testId}
          onChange={(e) => handleChange(e.target.value)}
          className="bg-gray-100 rounded-xl p-3 text-base border border-gray-300 mt-2 transition duration-300 ease-in-out hover:bg-gray-200 cursor-pointer"
        >
          <option value="" disabled>
            -- Selecciona un test --
          </option>
          {cuestionarios.map((q) => (
            <option key={q.id} value={q.id}>
              {q.titulo}
            </option>
          ))}
        </select>
      </div>

      {tipoParticipante && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white shadow-md rounded-xl p-4">
            <h2 className="text-xl font-semibold">Promedios por Dimensión</h2>
            {promedios && <PromediosPorDimension data={promedios} testId={testId} />}
          </div>

          <div className="bg-white shadow-md rounded-xl p-4">
            <h2 className="text-xl font-semibold">Distribución por Dimensión</h2>
            {distribucion && <DistribucionDimension data={distribucion} testId={testId} />}
          </div>

          <div className="bg-white shadow-md rounded-xl p-4">
            <h2 className="text-xl font-semibold">Comparación por Tipo de Participante</h2>
            {comparacion && <ComparacionPorTipoParticipante data={comparacion} />}
          </div>

          <div className="bg-white shadow-md rounded-xl p-4">
            <h2 className="text-xl font-semibold">Promedio por Edad</h2>
            {porEdad && <PromedioPorEdad data={porEdad} testId={testId} />}
          </div>

          
        </div>
        
      )}
      <div className="bg-white shadow-md rounded-xl p-4">
            <h2 className="text-xl font-semibold">Promedio por Pronombre</h2>
            {porPronombre && <PromedioPorPronombre data={porPronombre} testId={testId} />}
          </div>

      {tipoParticipante === "habitante" && porComuna && (
            <div className="bg-white shadow-md rounded-xl p-4">
              <h2 className="text-xl font-semibold">Conteo por Comuna</h2>
              <ConteoPorComuna data={porComuna} testId={testId} />
            </div>
          )}
    </div>
  );
};

export default Estadisticas;
