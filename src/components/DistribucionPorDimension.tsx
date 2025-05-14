import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

type DistribucionDimension = {
  [opcion: string]: number;
};

interface Props {
  testId: string;
  data: any;
}

const DistribucionPorDimension = ({ testId }: Props) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const colores = {
    '1': '#e7911c',
    '2': '#059669',
    '3': '#ffc658',
    '4': '#e7911c',  // verde
    '5': '#059669',  // azul
  };

  useEffect(() => {
    const fetchDistribucion = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `http://127.0.0.1:8000/estadisticas/${testId}/dimensiones/distribucion`
        );
        const json: { [dimension: string]: DistribucionDimension } = await res.json();

        const formatted = Object.entries(json).map(([dimension, distribuciones]) => {
          const completado: { [key: string]: number | string } = { dimension };
          for (let i = 1; i <= 5; i++) {
            completado[i.toString()] = distribuciones[i.toString()] || 0;
          }
          return completado;
        });

        setData(formatted);
      } catch (error) {
        console.error("Error al cargar la distribución por dimensión", error);
      } finally {
        setLoading(false);
      }
    };

    if (testId) {
      fetchDistribucion();
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
          <YAxis />
          <Tooltip />
          {['1', '2', '3', '4', '5'].map((key) => (
            <Bar
              key={key}
              dataKey={key}
              name={`Opción ${key}`}
              fill={colores[key as keyof typeof colores]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DistribucionPorDimension;
