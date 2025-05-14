import React, { useEffect, useState } from "react";
import { obtenerEstadisticasPorPronombre } from "../services/Estadisticas";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";

// Registrar los componentes necesarios de Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface PromedioPorPronombreProps {
  testId: string;
  data:any;
}

interface PromedioData {
  [pronombre: string]: {
    [dimension: string]: number;
  };
}

const pronombres = ["el", "ella", "elle", "prefiero_no_decirlo"];

const PromedioPorPronombre: React.FC<PromedioPorPronombreProps> = ({ testId }) => {
  const [data, setData] = useState<PromedioData>({});
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!testId) return;

    const fetchData = async () => {
      try {
        const res = await obtenerEstadisticasPorPronombre(testId);
        if (res?.data) {
          setData(res.data);
        } else {
          console.warn("Respuesta vacía o malformada:", res);
        }
      } catch (err) {
        console.error("Error obteniendo estadísticas por pronombre", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [testId]);

  if (loading) {
    return <div>Cargando datos...</div>;
  }

  const generateChartData = (pronombre: string) => {
    const dimensiones = Object.keys(data[pronombre] || {});
    const valores = dimensiones.map((dim) => data[pronombre][dim]);

    return {
      labels: dimensiones,
      datasets: [
        {
          label: `Promedios por Dimensión (${pronombre})`,
          data: valores,
          backgroundColor: "#059669",
          borderWidth: 1,
        },
      ],
    };
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pronombres.map((pronombre) => (
          <div key={pronombre} className="bg-white shadow-md rounded-xl p-4 h-80">
            <h4 className="font-semibold text-md mb-2">{pronombre}</h4>
            {data[pronombre] ? (
              <Bar
                data={generateChartData(pronombre)}
                options={{ responsive: true, maintainAspectRatio: false }}
              />
            ) : (
              <p className="text-sm text-gray-500">Sin datos para este pronombre.</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PromedioPorPronombre;
