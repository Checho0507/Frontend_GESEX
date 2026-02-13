import React from "react";
import { PlantaBase } from "../types";

interface Props {
  plantas: PlantaBase[];
  caracterizacion: Record<string, string>;
  onCampoChange: (campo: string, valor: string) => void;
}

// Componente para subir fotos (simulado con input de texto)
const FotosSection: React.FC<{ prefix: string; caracterizacion: Record<string, string>; onCampoChange: (campo: string, valor: string) => void }> = ({ prefix, caracterizacion, onCampoChange }) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Fotos tomadas en campo de síntomas o del artrópodo
      </label>
      <p className="text-xs text-gray-500 mb-2">Sube hasta 5 archivos compatibles. Tamaño máximo por archivo: 10 MB.</p>
      <input
        type="text"
        value={caracterizacion[prefix] || ""}
        onChange={(e) => onCampoChange(prefix, e.target.value)}
        className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
        placeholder="Ruta de la foto (simulado)"
      />
    </div>
  );
};

// Subsecciones específicas para cada insecto (ahora reciben el prefijo de planta)
const CompsusSection: React.FC<{ prefix: string; caracterizacion: Record<string, string>; onCampoChange: (campo: string, valor: string) => void }> = ({ prefix, caracterizacion, onCampoChange }) => (
  <div className="mt-4 p-4 bg-gray-100 rounded-lg">
    <h5 className="font-semibold mb-2">Monitoreo de Compsus sp. - Picudo</h5>
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Adultos de Compsus sp. encontrados *
      </label>
      <p className="text-xs text-gray-500 mb-2">Indique el número de adultos encontrados</p>
      <input
        type="number"
        min="0"
        value={caracterizacion[`${prefix}_compsus_adultos`] || ""}
        onChange={(e) => onCampoChange(`${prefix}_compsus_adultos`, e.target.value)}
        className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full max-w-xs"
        placeholder="Ej: 3"
        required
      />
    </div>
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">Daño en hojas *</label>
      <select
        value={caracterizacion[`${prefix}_compsus_dano_hojas`] || ""}
        onChange={(e) => onCampoChange(`${prefix}_compsus_dano_hojas`, e.target.value)}
        className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full max-w-xs"
        required
      >
        <option value="" disabled>Seleccione</option>
        <option value="leve">Leve</option>
        <option value="medio">Medio</option>
        <option value="alto">Alto</option>
        <option value="no_dano">No se encontró daño</option>
      </select>
    </div>
    <FotosSection prefix={`${prefix}_compsus_fotos`} caracterizacion={caracterizacion} onCampoChange={onCampoChange} />
  </div>
);

const DiaphorinaSection: React.FC<{ prefix: string; caracterizacion: Record<string, string>; onCampoChange: (campo: string, valor: string) => void }> = ({ prefix, caracterizacion, onCampoChange }) => (
  <div className="mt-4 p-4 bg-gray-100 rounded-lg">
    <h5 className="font-semibold mb-2">Monitoreo de Diaphorina citri - Psílido asiático</h5>
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Brotes con presencia de Diaphorina citri *
      </label>
      <input
        type="number"
        min="0"
        value={caracterizacion[`${prefix}_diaphorina_brotes`] || ""}
        onChange={(e) => onCampoChange(`${prefix}_diaphorina_brotes`, e.target.value)}
        className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full max-w-xs"
        placeholder="Ej: 5"
        required
      />
    </div>
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">Estados del insecto observados *</label>
      <div className="flex flex-wrap gap-4">
        {["Huevo", "Ninfa", "Adulto", "No se observaron"].map((estado) => (
          <label key={estado} className="inline-flex items-center">
            <input
              type="checkbox"
              value={estado}
              checked={caracterizacion[`${prefix}_diaphorina_estados`]?.includes(estado) || false}
              onChange={(e) => {
                const current = caracterizacion[`${prefix}_diaphorina_estados`] || "";
                const values = current ? current.split(",") : [];
                if (e.target.checked) {
                  values.push(estado);
                } else {
                  const index = values.indexOf(estado);
                  if (index > -1) values.splice(index, 1);
                }
                onCampoChange(`${prefix}_diaphorina_estados`, values.join(","));
              }}
              className="mr-2"
            />
            {estado}
          </label>
        ))}
      </div>
    </div>
    <FotosSection prefix={`${prefix}_diaphorina_fotos`} caracterizacion={caracterizacion} onCampoChange={onCampoChange} />
  </div>
);

const PhyllocnistisSection: React.FC<{ prefix: string; caracterizacion: Record<string, string>; onCampoChange: (campo: string, valor: string) => void }> = ({ prefix, caracterizacion, onCampoChange }) => (
  <div className="mt-4 p-4 bg-gray-100 rounded-lg">
    <h5 className="font-semibold mb-2">Monitoreo de Phyllocnistis sp - Minador de los cítricos</h5>
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Galerías encontradas *
      </label>
      <input
        type="number"
        min="0"
        value={caracterizacion[`${prefix}_phyllocnistis_galerias`] || ""}
        onChange={(e) => onCampoChange(`${prefix}_phyllocnistis_galerias`, e.target.value)}
        className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full max-w-xs"
        placeholder="Ej: 8"
        required
      />
    </div>
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">Nivel de daño *</label>
      <select
        value={caracterizacion[`${prefix}_phyllocnistis_nivel_dano`] || ""}
        onChange={(e) => onCampoChange(`${prefix}_phyllocnistis_nivel_dano`, e.target.value)}
        className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full max-w-xs"
        required
      >
        <option value="" disabled>Seleccione</option>
        <option value="bajo">Bajo</option>
        <option value="medio">Medio</option>
        <option value="alto">Alto</option>
        <option value="sin_dano">Sin daño observado</option>
      </select>
    </div>
    <FotosSection prefix={`${prefix}_phyllocnistis_fotos`} caracterizacion={caracterizacion} onCampoChange={onCampoChange} />
  </div>
);

const ToxopteraSection: React.FC<{ prefix: string; caracterizacion: Record<string, string>; onCampoChange: (campo: string, valor: string) => void }> = ({ prefix, caracterizacion, onCampoChange }) => (
  <div className="mt-4 p-4 bg-gray-100 rounded-lg">
    <h5 className="font-semibold mb-2">Monitoreo de Toxoptera citricidus - Pulgón negro</h5>
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Brotes infestados *
      </label>
      <input
        type="number"
        min="0"
        value={caracterizacion[`${prefix}_toxoptera_brotes`] || ""}
        onChange={(e) => onCampoChange(`${prefix}_toxoptera_brotes`, e.target.value)}
        className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full max-w-xs"
        placeholder="Ej: 4"
        required
      />
    </div>
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        ¿Se observó mielecilla y fumagina? *
      </label>
      <select
        value={caracterizacion[`${prefix}_toxoptera_mielecilla`] || ""}
        onChange={(e) => onCampoChange(`${prefix}_toxoptera_mielecilla`, e.target.value)}
        className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full max-w-xs"
        required
      >
        <option value="" disabled>Seleccione</option>
        <option value="si">Sí</option>
        <option value="no">No</option>
      </select>
    </div>
    <FotosSection prefix={`${prefix}_toxoptera_fotos`} caracterizacion={caracterizacion} onCampoChange={onCampoChange} />
  </div>
);

const HormigaSection: React.FC<{ prefix: string; caracterizacion: Record<string, string>; onCampoChange: (campo: string, valor: string) => void }> = ({ prefix, caracterizacion, onCampoChange }) => (
  <div className="mt-4 p-4 bg-gray-100 rounded-lg">
    <h5 className="font-semibold mb-2">Monitoreo de Hormiga Arriera</h5>
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">¿Hay hormigueros activos? *</label>
      <select
        value={caracterizacion[`${prefix}_hormiga_activos`] || ""}
        onChange={(e) => onCampoChange(`${prefix}_hormiga_activos`, e.target.value)}
        className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full max-w-xs"
        required
      >
        <option value="" disabled>Seleccione</option>
        <option value="si">Sí</option>
        <option value="no">No</option>
      </select>
    </div>
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Número de hormigueros encontrados *
      </label>
      <input
        type="number"
        min="0"
        value={caracterizacion[`${prefix}_hormiga_numero`] || ""}
        onChange={(e) => onCampoChange(`${prefix}_hormiga_numero`, e.target.value)}
        className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full max-w-xs"
        placeholder="Ej: 2"
        required
      />
    </div>
    <FotosSection prefix={`${prefix}_hormiga_fotos`} caracterizacion={caracterizacion} onCampoChange={onCampoChange} />
  </div>
);

// Subsecciones para ácaros
const PhyllocoptrutaSection: React.FC<{ prefix: string; caracterizacion: Record<string, string>; onCampoChange: (campo: string, valor: string) => void }> = ({ prefix, caracterizacion, onCampoChange }) => (
  <div className="mt-4 p-4 bg-gray-100 rounded-lg">
    <h5 className="font-semibold mb-2">Phyllocoptruta sp. - Ácaro blanco</h5>
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Frutos afectados *
      </label>
      <input
        type="number"
        min="0"
        value={caracterizacion[`${prefix}_phyllocoptruta_frutos`] || ""}
        onChange={(e) => onCampoChange(`${prefix}_phyllocoptruta_frutos`, e.target.value)}
        className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full max-w-xs"
        placeholder="Ej: 3"
        required
      />
    </div>
    <FotosSection prefix={`${prefix}_phyllocoptruta_fotos`} caracterizacion={caracterizacion} onCampoChange={onCampoChange} />
  </div>
);

const PolyphagotarsonemusSection: React.FC<{ prefix: string; caracterizacion: Record<string, string>; onCampoChange: (campo: string, valor: string) => void }> = ({ prefix, caracterizacion, onCampoChange }) => (
  <div className="mt-4 p-4 bg-gray-100 rounded-lg">
    <h5 className="font-semibold mb-2">Monitoreo de Polyphagotarsonemus sp. - Ácaro tostador</h5>
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Frutos afectados *
      </label>
      <input
        type="number"
        min="0"
        value={caracterizacion[`${prefix}_polyphagotarsonemus_frutos`] || ""}
        onChange={(e) => onCampoChange(`${prefix}_polyphagotarsonemus_frutos`, e.target.value)}
        className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full max-w-xs"
        placeholder="Ej: 2"
        required
      />
    </div>
    <FotosSection prefix={`${prefix}_polyphagotarsonemus_fotos`} caracterizacion={caracterizacion} onCampoChange={onCampoChange} />
  </div>
);

// Componente para una planta individual
const PlantaArthropod: React.FC<{ index: number; planta: PlantaBase; caracterizacion: Record<string, string>; onCampoChange: (campo: string, valor: string) => void }> = ({ index, planta, caracterizacion, onCampoChange }) => {
  const prefix = `artropodo_planta_${index + 1}`;
  
  // Obtener las clases seleccionadas para esta planta (insecto/aracnido)
  const clasesSeleccionadas = caracterizacion[`${prefix}_clases`] || "";
  const clasesArray = clasesSeleccionadas ? clasesSeleccionadas.split(",") : [];

  // Manejar checkboxes de clases
  const handleClaseChange = (clase: string, checked: boolean) => {
    let nuevasClases = [...clasesArray];
    if (checked) {
      if (!nuevasClases.includes(clase)) nuevasClases.push(clase);
    } else {
      nuevasClases = nuevasClases.filter(c => c !== clase);
    }
    onCampoChange(`${prefix}_clases`, nuevasClases.join(","));
    
    // Si se deselecciona una clase, limpiar todos los campos relacionados
    if (!checked) {
      // Eliminar todos los campos que comiencen con ese prefijo y la clase
      const keysToRemove = Object.keys(caracterizacion).filter(key => 
        key.startsWith(`${prefix}_${clase === 'insecto' ? 'insecto' : 'acaro'}`)
      );
      keysToRemove.forEach(key => {
        onCampoChange(key, "");
      });
    }
  };

  // Manejar cambio de tipo de insecto
  const handleInsectoTipoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nuevoTipo = e.target.value;
    const tipoAnterior = caracterizacion[`${prefix}_insecto_tipo`] || "";
    
    onCampoChange(`${prefix}_insecto_tipo`, nuevoTipo);
    
    // Si cambia el tipo, limpiar los subcampos del tipo anterior
    if (tipoAnterior && tipoAnterior !== nuevoTipo) {
      const keysToRemove = Object.keys(caracterizacion).filter(key => 
        key.startsWith(`${prefix}_insecto_`) && key !== `${prefix}_insecto_tipo`
      );
      keysToRemove.forEach(key => {
        onCampoChange(key, "");
      });
    }
  };

  // Manejar cambio de tipo de ácaro
  const handleAcaroTipoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nuevoTipo = e.target.value;
    const tipoAnterior = caracterizacion[`${prefix}_acaro_tipo`] || "";
    
    onCampoChange(`${prefix}_acaro_tipo`, nuevoTipo);
    
    if (tipoAnterior && tipoAnterior !== nuevoTipo) {
      const keysToRemove = Object.keys(caracterizacion).filter(key => 
        key.startsWith(`${prefix}_acaro_`) && key !== `${prefix}_acaro_tipo`
      );
      keysToRemove.forEach(key => {
        onCampoChange(key, "");
      });
    }
  };

  const insectoTipo = caracterizacion[`${prefix}_insecto_tipo`] || "";
  const acaroTipo = caracterizacion[`${prefix}_acaro_tipo`] || "";

  return (
    <div className="border rounded-lg p-4 mb-6 bg-white shadow-sm">
      <h4 className="font-semibold text-lg text-gray-800 mb-3">
        {planta.label} (Código: {planta.codigo})
      </h4>

      {/* Selector de clases (múltiple) */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Clase de artrópodo observado en esta planta (puede seleccionar más de una)
        </label>
        <div className="flex gap-6">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={clasesArray.includes('insecto')}
              onChange={(e) => handleClaseChange('insecto', e.target.checked)}
              className="mr-2"
            />
            Insecto
          </label>
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={clasesArray.includes('aracnido')}
              onChange={(e) => handleClaseChange('aracnido', e.target.checked)}
              className="mr-2"
            />
            Arácnido
          </label>
        </div>
        {clasesArray.length === 0 && (
          <p className="text-sm text-gray-500 mt-1">No se detectaron artrópodos en esta planta.</p>
        )}
      </div>

      {/* Sección de insecto si está seleccionado */}
      {clasesArray.includes('insecto') && (
        <div className="mb-6 border-l-4 border-blue-300 pl-4">
          <h5 className="font-semibold text-md mb-2">Insecto</h5>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Seleccione el insecto observado *
            </label>
            <select
              value={insectoTipo}
              onChange={handleInsectoTipoChange}
              className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full max-w-md"
              required
            >
              <option value="" disabled>Seleccione</option>
              <option value="compsus">Compsus sp. - Picudo</option>
              <option value="diaphorina">Diaphorina citri - Psílido asiático</option>
              <option value="phyllocnistis">Phyllocnistis sp. - Minador de la hoja</option>
              <option value="toxoptera">Toxoptera citricidus - Pulgón negro</option>
              <option value="hormiga">Hormiga arriera</option>
              <option value="otro_insecto">Otro:</option>
            </select>
          </div>

          {insectoTipo === "compsus" && <CompsusSection prefix={`${prefix}_insecto`} caracterizacion={caracterizacion} onCampoChange={onCampoChange} />}
          {insectoTipo === "diaphorina" && <DiaphorinaSection prefix={`${prefix}_insecto`} caracterizacion={caracterizacion} onCampoChange={onCampoChange} />}
          {insectoTipo === "phyllocnistis" && <PhyllocnistisSection prefix={`${prefix}_insecto`} caracterizacion={caracterizacion} onCampoChange={onCampoChange} />}
          {insectoTipo === "toxoptera" && <ToxopteraSection prefix={`${prefix}_insecto`} caracterizacion={caracterizacion} onCampoChange={onCampoChange} />}
          {insectoTipo === "hormiga" && <HormigaSection prefix={`${prefix}_insecto`} caracterizacion={caracterizacion} onCampoChange={onCampoChange} />}
          {insectoTipo === "otro_insecto" && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Especifique el insecto observado
              </label>
              <input
                type="text"
                value={caracterizacion[`${prefix}_insecto_otro_nombre`] || ""}
                onChange={(e) => onCampoChange(`${prefix}_insecto_otro_nombre`, e.target.value)}
                className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full max-w-md"
                placeholder="Nombre del insecto"
              />
            </div>
          )}
        </div>
      )}

      {/* Sección de arácnido si está seleccionado */}
      {clasesArray.includes('aracnido') && (
        <div className="mb-6 border-l-4 border-green-300 pl-4">
          <h5 className="font-semibold text-md mb-2">Ácaro</h5>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Seleccione el ácaro que ocasionó el daño *
            </label>
            <select
              value={acaroTipo}
              onChange={handleAcaroTipoChange}
              className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full max-w-md"
              required
            >
              <option value="" disabled>Seleccione</option>
              <option value="phyllocoptruta">Phyllocoptruta sp. - Ácaro blanco</option>
              <option value="polyphagotarsonemus">Polyphagotarsonemus sp. - Ácaro tostador</option>
              <option value="otro_acaro">Otro:</option>
            </select>
          </div>

          {acaroTipo === "phyllocoptruta" && <PhyllocoptrutaSection prefix={`${prefix}_acaro`} caracterizacion={caracterizacion} onCampoChange={onCampoChange} />}
          {acaroTipo === "polyphagotarsonemus" && <PolyphagotarsonemusSection prefix={`${prefix}_acaro`} caracterizacion={caracterizacion} onCampoChange={onCampoChange} />}
          {acaroTipo === "otro_acaro" && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Especifique el ácaro observado
              </label>
              <input
                type="text"
                value={caracterizacion[`${prefix}_acaro_otro_nombre`] || ""}
                onChange={(e) => onCampoChange(`${prefix}_acaro_otro_nombre`, e.target.value)}
                className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full max-w-md"
                placeholder="Nombre del ácaro"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Componente principal
export const ArthropodSection: React.FC<Props> = ({ plantas, caracterizacion, onCampoChange }) => {
  return (
    <div className="bg-gray-50 p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Monitoreo de Artrópodos por Planta
      </h2>

      <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border">
        <p className="text-sm text-gray-700">
          El monitoreo de plagas en cítricos permite conocer oportunamente la presencia y el nivel de infestación que pueden afectar la producción, favoreciendo el manejo integrado del cultivo y la toma de decisiones técnicas basadas en información real; además, contribuye a la protección de organismos benéficos.
        </p>
      </div>

      <h3 className="text-xl font-bold text-gray-800 mb-4">
        Plantas seleccionadas para monitoreo
      </h3>
      <p className="text-sm text-gray-600 mb-6">
        Para cada planta, seleccione los artrópodos observados y complete los datos correspondientes. Si no se detectaron artrópodos, deje las casillas sin marcar.
      </p>

      {plantas.map((planta, idx) => (
        <PlantaArthropod
          key={planta.codigo}
          index={idx}
          planta={planta}
          caracterizacion={caracterizacion}
          onCampoChange={onCampoChange}
        />
      ))}
    </div>
  );
};