import React, { useState } from "react";

interface CaracterizacionFormProps {
  camposRequeridos: string[];
}

const CaracterizacionForm: React.FC<CaracterizacionFormProps> = ({ camposRequeridos }) => {
  const [formData, setFormData] = useState<any>(
    camposRequeridos.reduce((acc, campo) => ({ ...acc, [campo]: "" }), {})
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Datos enviados:", formData);
    // Aquí puedes enviar los datos al backend si es necesario
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="font-bold text-xl mb-4">Caracterización</h2>
      {camposRequeridos.map((campo) => (
        <div key={campo} className="mb-4">
          <label className="block font-medium">{campo}</label>
          <input
            type="text"
            name={campo}
            value={formData[campo]}
            onChange={handleChange}
            className="border rounded px-2 py-1 w-full"
          />
        </div>
      ))}
      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
        Enviar
      </button>
    </form>
  );
};

export default CaracterizacionForm;