import React, { useEffect, useState } from "react";
import { obtenerFormularios, enviarRespuestas } from "../services/Cuestionarios";
import { obtenerFingerprint } from "../Utils/fingerprint";

const comunasManizales = [
  { numero: 1, nombre: "Atardeceres" },
  { numero: 2, nombre: "Universitaria" },
  { numero: 3, nombre: "San José" },
  { numero: 4, nombre: "La Fuente" },
  { numero: 5, nombre: "Ciudadela del Norte" },
  { numero: 6, nombre: "Ecoturística Cerro de Oro" },
  { numero: 7, nombre: "Tesorito" },
  { numero: 8, nombre: "Palogrande" },
  { numero: 9, nombre: "Estación" },
  { numero: 10, nombre: "Del Río" },
  { numero: 11, nombre: "La Macarena" },
];

const Encuesta = () => {
  const [formularios, setFormularios] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [formularioSeleccionado, setFormularioSeleccionado] = useState<string | null>(null);
  const [tipoParticipante, setTipoParticipante] = useState<string | null>(null);
  const [caracterizacion, setCaracterizacion] = useState<{ [key: string]: string }>({});
  const [respuestas, setRespuestas] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    obtenerFormularios()
      .then((response) => {
        if (!response.data || response.data.length === 0) {
          throw new Error("No se encontraron formularios.");
        }
        setFormularios(response.data);
      })
      .catch((err) => {
        setError(`Error al cargar los formularios: ${err.message}`);
        console.error("Detalles del error:", err);
      });
  }, []);

  const handleCaracterizacionChange = (campo: string, valor: string) => {
    setCaracterizacion((prev) => ({ ...prev, [campo]: valor }));
  };

  const handleRespuestaChange = (preguntaId: string, valor: string) => {
    setRespuestas((prev) => ({ ...prev, [preguntaId]: valor }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formularioSeleccionado) {
      alert("Por favor selecciona un formulario.");
      return;
    }

    const formulario = formularios.find((f: any) => f.id === formularioSeleccionado);
    if (!formulario) {
      alert("Formulario no encontrado.");
      return;
    }

    let contadorPregunta = 1;
    const respuestasPorDimension = formulario.dimensiones.map((dimension: any) => {
      const respuestasDimension = dimension.preguntas.map(() => {
        const preguntaId = `pregunta-${contadorPregunta++}`;
        return parseInt(respuestas[preguntaId] || "0", 10);
      });
      return {
        dimension: dimension.nombre,
        respuestas: respuestasDimension,
      };
    });

    if (tipoParticipante) {
      caracterizacion["tipo_participante"] = tipoParticipante;
    }

    const fingerprint = await obtenerFingerprint();

    const data = {
      test_id: formularioSeleccionado,
      respuestas: respuestasPorDimension,
      caracterizacion_datos: caracterizacion,
      fecha: new Date().toISOString().split("T")[0],
      fingerprint,
    };

    try {
      const response = await enviarRespuestas(data);
      alert("Respuestas enviadas correctamente.");
      console.log("Respuesta del servidor:", response.data);
      setCaracterizacion({});
      setRespuestas({});
      setFormularioSeleccionado(null);
      setTipoParticipante(null);
    } catch (err: any) {
      alert("Hubo un error al enviar las respuestas.");
      console.error("Detalles del error:", err);
    }
  };

  if (error) {
    return (
      <div className="bg-red-100 text-red-700 p-4 rounded">
        <p>{error}</p>
      </div>
    );
  }

  if (formularios.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Cargando cuestionarios...</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 px-4 md:px-10 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        Selecciona un Cuestionario
      </h1>

      <div className="flex flex-wrap justify-center gap-4 mb-8">
        {formularios.map((formulario) => (
          <button
            key={formulario.id}
            onClick={() => {
              setFormularioSeleccionado(formulario.id);
              setTipoParticipante(formulario.caracterizacion_template.tipo_participante);
            }}
            className={`px-6 py-3 rounded-lg font-semibold text-white ${
              formularioSeleccionado === formulario.id
                ? "bg-red-700 shadow-lg"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {formulario.caracterizacion_template.tipo_participante}
          </button>
        ))}
      </div>

      {formularioSeleccionado && (
        <form onSubmit={handleSubmit} className="space-y-8 border rounded-lg shadow-md p-6 bg-white">
          {formularios
            .filter((formulario) => formulario.id === formularioSeleccionado)
            .map((formulario) => {
              let contadorPregunta = 1;
              return (
                <div key={formulario.id}>
                  {/* Caracterización */}
                  <div className="bg-gray-50 p-6 rounded-lg shadow-md mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                      Información de Caracterización
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {formulario.caracterizacion_template.campos_requeridos.map((campo: string, index: number) => {
                        const campoKey = campo.toLowerCase();
                        return (
                          <div key={index} className="flex flex-col">
                            <label className="font-semibold text-gray-700 mb-2 text-sm uppercase tracking-wide">
                              {campo.replace(/_/g, " ")}
                            </label>
                            {campoKey === "edad" ? (
                              <select
                                name={campo}
                                value={caracterizacion[campo] || ""}
                                onChange={(e) => handleCaracterizacionChange(campo, e.target.value)}
                                className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="" disabled>Seleccione su rango de edad</option>
                                <option value="15-20">Entre 15 y 20</option>
                                <option value="21-30">Entre 21 y 30</option>
                                <option value="31-40">Entre 31 y 40</option>
                                <option value="41-50">Entre 41 y 50</option>
                                <option value="51-60">Entre 51 y 60</option>
                                <option value="60+">Mayor de 60</option>
                              </select>
                            ) : campoKey === "lugar_procedencia" ? (
                              <select
                                name={campo}
                                value={caracterizacion[campo] || ""}
                                onChange={(e) => handleCaracterizacionChange(campo, e.target.value)}
                                className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="" disabled>Seleccione su lugar de procedencia</option>
                                <option value="urbano">Urbano</option>
                                <option value="rural">Rural</option>
                              </select>
                            ) : campoKey === "pronombre" ? (
                              <select
                                name={campo}
                                value={caracterizacion[campo] || ""}
                                onChange={(e) => handleCaracterizacionChange(campo, e.target.value)}
                                className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="" disabled>Seleccione su pronombre</option>
                                <option value="ella">Ella</option>
                                <option value="el">Él</option>
                                <option value="elle">Elle</option>
                                <option value="prefiero_no_decirlo">Prefiero no decirlo</option>
                              </select>
                            ) : campoKey === "estamento" ? (
                              <select
                                name={campo}
                                value={caracterizacion[campo] || ""}
                                onChange={(e) => handleCaracterizacionChange(campo, e.target.value)}
                                className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="" disabled>Seleccione su estamento</option>
                                <option value="estudiante">Estudiante</option>
                                <option value="profesor">Profesor</option>
                                <option value="empleado">Empleado</option>
                                <option value="otro">Otro</option>
                              </select>
                            ) : campoKey === "estrato" ? (
                              <select
                                name={campo}
                                value={caracterizacion[campo] || ""}
                                onChange={(e) => handleCaracterizacionChange(campo, e.target.value)}
                                className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="" disabled>Seleccione su estrato</option>
                                {[1, 2, 3, 4, 5, 6].map((estrato) => (
                                  <option key={estrato} value={estrato}>Estrato {estrato}</option>
                                ))}
                              </select>
                            ) : campoKey === "comuna" ? (
                              <select
                                name={campo}
                                value={caracterizacion[campo] || ""}
                                onChange={(e) => handleCaracterizacionChange(campo, e.target.value)}
                                className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="" disabled>Seleccione su comuna</option>
                                {comunasManizales.map((comuna) => (
                                  <option key={comuna.numero} value={`Comuna ${comuna.numero} - ${comuna.nombre}`}>
                                    Comuna {comuna.numero} - {comuna.nombre}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <input
                                type="text"
                                name={campo}
                                value={caracterizacion[campo] || ""}
                                onChange={(e) => handleCaracterizacionChange(campo, e.target.value)}
                                className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder={`Ingrese ${campo.replace(/_/g, " ")}`}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Preguntas */}
                  {formulario.dimensiones.map((dimension: any, dimIndex: number) => (
                    <div key={dimIndex} className="mb-10 border rounded-xl p-6 bg-gray-50 shadow-lg">
                      <h3 className="text-2xl font-semibold text-gray-800 mb-6 text-center uppercase tracking-wide">
                        {dimension.nombre}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {dimension.preguntas.map((pregunta: string, index: number) => {
                          const preguntaId = `pregunta-${contadorPregunta++}`;
                          return (
                            <div key={preguntaId} className="border rounded-lg shadow-sm p-4 bg-white">
                              <p className="font-medium mb-4">{contadorPregunta - 1}. {pregunta}</p>
                              <div className="space-y-2">
                                {[1, 2, 3, 4, 5].map((valor) => (
                                  <label key={valor} className="block text-sm text-gray-700">
                                    <input
                                      type="radio"
                                      name={preguntaId}
                                      value={valor}
                                      className="mr-2 accent-red-700"
                                      onChange={(e) => handleRespuestaChange(preguntaId, e.target.value)}
                                    />
                                    {[
                                      "Totalmente en desacuerdo",
                                      "En desacuerdo",
                                      "Neutral",
                                      "De acuerdo",
                                      "Totalmente de acuerdo",
                                    ][valor - 1]}
                                  </label>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          <button type="submit" className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 mt-6">
            Enviar Respuestas
          </button>
        </form>
      )}
    </div>
  );
};

export default Encuesta;
