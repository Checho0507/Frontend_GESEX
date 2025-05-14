import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from 'recharts';

type PromediosDimension = {
  [dimension: string]: number;
};

interface Props {
  testId: string;
  data: any;
}

// Colores para cada dimensión (puedes ampliarlos si tienes más dimensiones)
const colores = [
  '#e7911c', // rojo
  '#059669', // naranja
  '#ffc658', // amarillo
];

const PromediosPorDimension = ({ testId }: Props) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPromedios = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `http://127.0.0.1:8000/estadisticas/${testId}/dimensiones/promedios`
        );
        const json: PromediosDimension = await res.json();

        const formatted = Object.entries(json).map(([dimension, promedio]) => ({
          dimension,
          promedio,
        }));

        setData(formatted);
      } catch (error) {
        console.error("Error al cargar los promedios por dimensión", error);
      } finally {
        setLoading(false);
      }
    };

    if (testId) {
      fetchPromedios();
    }
  }, [testId]);

  if (loading) return <p>Cargando...</p>;
  if (!data.length) return <p>No hay datos disponibles.</p>;

  return (
    <div style={{ width: '100%', height: 400 }}>
      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="dimension" tick={{ fontSize: 12 }} />
          <YAxis domain={[1, 5]} />
          <Tooltip />
          <Bar dataKey="promedio">
            {data.map((entry) => (
              <Cell key={`cell-${entry.dimension}`} fill={colores[data.indexOf(entry) % colores.length]} />
            ))}
          </Bar>

        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PromediosPorDimension;
