import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { obtenerEstadisticasPorEdad } from "../services/Estadisticas";

interface Props {
  testId: string;
  data: any;
}

const PromedioPorEdad: React.FC<Props> = ({ testId }) => {
  const [data, setData] = useState<any[]>([]);
  const [dimensiones, setDimensiones] = useState<string[]>([]);

  const EDAD_RANGOS = [
    "15-20",
    "21-30",
    "31-40",
    "41-50",
    "51-60",
    "Mayor de 60",
  ];

  useEffect(() => {
    if (!testId) return;

    obtenerEstadisticasPorEdad(testId)
      .then((res) => {
        const raw = res.data;

        // Extraer las dimensiones desde el primer rango que tenga datos
        const dimensionesDetectadas =
          Object.values(raw).find((grupo) => grupo && Object.keys(grupo).length > 0);
        const keys = dimensionesDetectadas ? Object.keys(dimensionesDetectadas) : [];
        setDimensiones(keys);

        const datosCompletos = EDAD_RANGOS.map((rango) => {
          const grupo = raw[rango] || {};
          const fila: any = { rango };

          keys.forEach((dim) => {
            fila[dim] = grupo[dim] || 0;
          });

          return fila;
        });

        setData(datosCompletos);
      })
      .catch((err) =>
        console.error("Error obteniendo estadísticas por edad", err)
      );
  }, [testId]);

  return (
    <div style={{ width: "100%", height: 300 + data.length * 15 }}>
      <ResponsiveContainer>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 10, right: 30, left: 100, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" domain={[0, 5]} />
          <YAxis dataKey="rango" type="category" />
          <Tooltip />
          <Legend />
          {dimensiones.map((dim, index) => (
            <Bar
              key={dim}
              dataKey={dim}
              stackId="a"
              fill={["#e7911c", "#059669 ", "#ffc658", "#ff8042", "#a4de6c", "#d0ed57"][index % 6]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PromedioPorEdad;
