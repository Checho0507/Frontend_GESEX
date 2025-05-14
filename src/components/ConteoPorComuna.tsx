import React, { useEffect, useState } from "react";
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

// Simula el servicio que harías (puedes reemplazarlo por Axios o fetch real)
const obtenerConteoPorComuna = async (testId: string) => {
  const response = await fetch(`http://127.0.0.1:8000/estadisticas/${testId}/habitantes/comuna`);
  if (!response.ok) throw new Error("Error al obtener conteo por comuna");
  return response.json();
};

interface ConteoPorComunaProps {
  testId: string;
  data: any;
}

const ConteoPorComuna: React.FC<ConteoPorComunaProps> = ({ testId }) => {
  const [data, setData] = useState<{ [comuna: string]: number }>({});
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!testId) return;

    const fetchData = async () => {
      try {
        const res = await obtenerConteoPorComuna(testId);
        setData(res);
      } catch (err) {
        console.error("Error al obtener conteo por comuna:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [testId]);

  if (loading) {
    return <div>Cargando conteo por comuna...</div>;
  }

  const labels = Object.keys(data);
  const values = labels.map((label) => data[label]);

  const chartData = {
    labels,
    datasets: [
      {
        label: "Cantidad de respuestas por comuna",
        data: values,
        backgroundColor: "#ef9f32"
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
  };

  return (
    <div className="bg-white shadow-md rounded-xl p-4 h-80">
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default ConteoPorComuna;
