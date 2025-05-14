import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { obtenerComparacionTipoParticipante } from "../services/Estadisticas";

const ComparacionPorTipoParticipante: React.FC = () => {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    obtenerComparacionTipoParticipante()
      .then((res) => {
        const raw = res.data;
        const dimensiones = Object.keys(raw.universitario);

        const formatted = dimensiones.map((dimension) => ({
          dimension,
          universitario: raw.universitario[dimension],
          habitante: raw.habitante[dimension],
        }));

        setData(formatted);
      })
      .catch((err) =>
        console.error("Error cargando comparación por tipo de participante:", err)
      );
  }, []);

  return (
    <div style={{ width: "100%", height: 300 }}>
      <ResponsiveContainer>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 10, right: 30, left: 50, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" domain={[0, 5]} />
          <YAxis dataKey="dimension" type="category" width={200} />
          <Tooltip />
          <Legend />
          <Bar dataKey="universitario" fill="#059669" />
          <Bar dataKey="habitante" fill="#e7911c" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ComparacionPorTipoParticipante;
