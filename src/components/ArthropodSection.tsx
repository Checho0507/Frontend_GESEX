import React from "react";
import { PlantaBase } from "../types";

interface Props {
  plantas: PlantaBase[];
  caracterizacion: Record<string, string>;
  onCampoChange: (campo: string, valor: string) => void;
}

// Lista completa de artrópodos (insectos y ácaros)
const ARTHROPODS = [
  { id: 'compsus', label: 'Compsus sp. - Picudo', tipo: 'insecto' },
  { id: 'diaphorina', label: 'Diaphorina citri - Psílido asiático', tipo: 'insecto' },
  { id: 'phyllocnistis', label: 'Phyllocnistis sp. - Minador de la hoja', tipo: 'insecto' },
  { id: 'toxoptera', label: 'Toxoptera citricidus - Pulgón negro', tipo: 'insecto' },
  { id: 'hormiga', label: 'Hormiga arriera', tipo: 'insecto' },
  { id: 'phyllocoptruta', label: 'Phyllocoptruta sp. - Ácaro blanco', tipo: 'acaro' },
  { id: 'polyphagotarsonemus', label: 'Polyphagotarsonemus sp. - Ácaro tostador', tipo: 'acaro' },
];

// Componente reutilizable para fotos (simulado)
const FotosSection: React.FC<{ campo: string; caracterizacion: Record<string, string>; onCampoChange: (campo: string, valor: string) => void }> = ({ campo, caracterizacion, onCampoChange }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">Fotos tomadas en campo</label>
    <p className="text-xs text-gray-500 mb-2">Sube hasta 5 archivos (máx 10 MB c/u)</p>
    <input
      type="text"
      value={caracterizacion[campo] || ""}
      onChange={(e) => onCampoChange(campo, e.target.value)}
      className="border rounded px-3 py-2 w-full"
      placeholder="Ruta de la foto (simulado)"
    />
  </div>
);

// Campos específicos para Compsus
const CompsusFields: React.FC<{ prefix: string; caracterizacion: Record<string, string>; onCampoChange: (campo: string, valor: string) => void }> = ({ prefix, caracterizacion, onCampoChange }) => (
  <div className="ml-4 mt-2 p-3 bg-gray-50 rounded border">
    <h5 className="font-medium mb-2">Compsus sp. - Picudo</h5>
    <div className="mb-3">
      <label className="block text-sm font-medium text-gray-700 mb-1">Adultos encontrados *</label>
      <input
        type="text"
        value={caracterizacion[`${prefix}adultos`] || ""}
        onChange={(e) => onCampoChange(`${prefix}adultos`, e.target.value)}
        className="border rounded px-3 py-2 w-full"
        placeholder="Ej: 3"
      />
    </div>
    <div className="mb-3">
      <label className="block text-sm font-medium text-gray-700 mb-1">Daño en hojas *</label>
      <select
        value={caracterizacion[`${prefix}dano_hojas`] || ""}
        onChange={(e) => onCampoChange(`${prefix}dano_hojas`, e.target.value)}
        className="border rounded px-3 py-2 w-full"
      >
        <option value="">Seleccione</option>
        <option value="leve">Leve</option>
        <option value="medio">Medio</option>
        <option value="alto">Alto</option>
        <option value="no_dano">No se encontró daño</option>
      </select>
    </div>
    <FotosSection campo={`${prefix}fotos`} caracterizacion={caracterizacion} onCampoChange={onCampoChange} />
  </div>
);

// Diaphorina
const DiaphorinaFields: React.FC<{ prefix: string; caracterizacion: Record<string, string>; onCampoChange: (campo: string, valor: string) => void }> = ({ prefix, caracterizacion, onCampoChange }) => (
  <div className="ml-4 mt-2 p-3 bg-gray-50 rounded border">
    <h5 className="font-medium mb-2">Diaphorina citri - Psílido asiático</h5>
    <div className="mb-3">
      <label className="block text-sm font-medium text-gray-700 mb-1">Brotes con presencia *</label>
      <input
        type="text"
        value={caracterizacion[`${prefix}brotes`] || ""}
        onChange={(e) => onCampoChange(`${prefix}brotes`, e.target.value)}
        className="border rounded px-3 py-2 w-full"
        placeholder="Ej: 5"
      />
    </div>
    <div className="mb-3">
      <label className="block text-sm font-medium text-gray-700 mb-1">Estados observados *</label>
      <div className="flex flex-wrap gap-2">
        {["Huevo", "Ninfa", "Adulto", "No se observaron"].map(estado => {
          const campoEstados = `${prefix}estados`;
          const current = caracterizacion[campoEstados] ? caracterizacion[campoEstados].split(',') : [];
          const checked = current.includes(estado);
          return (
            <label key={estado} className="inline-flex items-center">
              <input
                type="checkbox"
                checked={checked}
                onChange={(e) => {
                  let newVal = [...current];
                  if (e.target.checked) {
                    newVal.push(estado);
                  } else {
                    newVal = newVal.filter(v => v !== estado);
                  }
                  onCampoChange(campoEstados, newVal.join(','));
                }}
                className="mr-1"
              />
              {estado}
            </label>
          );
        })}
      </div>
    </div>
    <FotosSection campo={`${prefix}fotos`} caracterizacion={caracterizacion} onCampoChange={onCampoChange} />
  </div>
);

// Phyllocnistis
const PhyllocnistisFields: React.FC<{ prefix: string; caracterizacion: Record<string, string>; onCampoChange: (campo: string, valor: string) => void }> = ({ prefix, caracterizacion, onCampoChange }) => (
  <div className="ml-4 mt-2 p-3 bg-gray-50 rounded border">
    <h5 className="font-medium mb-2">Phyllocnistis sp. - Minador</h5>
    <div className="mb-3">
      <label className="block text-sm font-medium text-gray-700 mb-1">Número de galerías *</label>
      <input
        type="text"
        value={caracterizacion[`${prefix}galerias`] || ""}
        onChange={(e) => onCampoChange(`${prefix}galerias`, e.target.value)}
        className="border rounded px-3 py-2 w-full"
        placeholder="Ej: 4"
      />
    </div>
    <div className="mb-3">
      <label className="block text-sm font-medium text-gray-700 mb-1">Nivel de daño *</label>
      <select
        value={caracterizacion[`${prefix}nivel_dano`] || ""}
        onChange={(e) => onCampoChange(`${prefix}nivel_dano`, e.target.value)}
        className="border rounded px-3 py-2 w-full"
      >
        <option value="">Seleccione</option>
        <option value="bajo">Bajo</option>
        <option value="medio">Medio</option>
        <option value="alto">Alto</option>
        <option value="sin_dano">Sin daño</option>
      </select>
    </div>
    <FotosSection campo={`${prefix}fotos`} caracterizacion={caracterizacion} onCampoChange={onCampoChange} />
  </div>
);

// Toxoptera
const ToxopteraFields: React.FC<{ prefix: string; caracterizacion: Record<string, string>; onCampoChange: (campo: string, valor: string) => void }> = ({ prefix, caracterizacion, onCampoChange }) => (
  <div className="ml-4 mt-2 p-3 bg-gray-50 rounded border">
    <h5 className="font-medium mb-2">Toxoptera citricidus - Pulgón negro</h5>
    <div className="mb-3">
      <label className="block text-sm font-medium text-gray-700 mb-1">Brotes infestados *</label>
      <input
        type="text"
        value={caracterizacion[`${prefix}brotes`] || ""}
        onChange={(e) => onCampoChange(`${prefix}brotes`, e.target.value)}
        className="border rounded px-3 py-2 w-full"
        placeholder="Ej: 3"
      />
    </div>
    <div className="mb-3">
      <label className="block text-sm font-medium text-gray-700 mb-1">¿Mielecilla y fumagina? *</label>
      <select
        value={caracterizacion[`${prefix}mielecilla`] || ""}
        onChange={(e) => onCampoChange(`${prefix}mielecilla`, e.target.value)}
        className="border rounded px-3 py-2 w-full"
      >
        <option value="">Seleccione</option>
        <option value="si">Sí</option>
        <option value="no">No</option>
      </select>
    </div>
    <FotosSection campo={`${prefix}fotos`} caracterizacion={caracterizacion} onCampoChange={onCampoChange} />
  </div>
);

// Hormiga
const HormigaFields: React.FC<{ prefix: string; caracterizacion: Record<string, string>; onCampoChange: (campo: string, valor: string) => void }> = ({ prefix, caracterizacion, onCampoChange }) => (
  <div className="ml-4 mt-2 p-3 bg-gray-50 rounded border">
    <h5 className="font-medium mb-2">Hormiga arriera</h5>
    <div className="mb-3">
      <label className="block text-sm font-medium text-gray-700 mb-1">¿Hormigueros activos? *</label>
      <select
        value={caracterizacion[`${prefix}activos`] || ""}
        onChange={(e) => onCampoChange(`${prefix}activos`, e.target.value)}
        className="border rounded px-3 py-2 w-full"
      >
        <option value="">Seleccione</option>
        <option value="si">Sí</option>
        <option value="no">No</option>
      </select>
    </div>
    <div className="mb-3">
      <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación (surco - planta - # hormigueros) *</label>
      <input
        type="text"
        value={caracterizacion[`${prefix}ubicacion`] || ""}
        onChange={(e) => onCampoChange(`${prefix}ubicacion`, e.target.value)}
        className="border rounded px-3 py-2 w-full"
        placeholder="Ej: 2 - 4 - 3"
      />
    </div>
    <FotosSection campo={`${prefix}fotos`} caracterizacion={caracterizacion} onCampoChange={onCampoChange} />
  </div>
);

// Phyllocoptruta (ácaro blanco)
const PhyllocoptrutaFields: React.FC<{ prefix: string; caracterizacion: Record<string, string>; onCampoChange: (campo: string, valor: string) => void }> = ({ prefix, caracterizacion, onCampoChange }) => (
  <div className="ml-4 mt-2 p-3 bg-gray-50 rounded border">
    <h5 className="font-medium mb-2">Phyllocoptruta sp. - Ácaro blanco</h5>
    <div className="mb-3">
      <label className="block text-sm font-medium text-gray-700 mb-1">Frutos afectados *</label>
      <input
        type="text"
        value={caracterizacion[`${prefix}frutos`] || ""}
        onChange={(e) => onCampoChange(`${prefix}frutos`, e.target.value)}
        className="border rounded px-3 py-2 w-full"
        placeholder="Ej: 2"
      />
    </div>
    <FotosSection campo={`${prefix}fotos`} caracterizacion={caracterizacion} onCampoChange={onCampoChange} />
  </div>
);

// Polyphagotarsonemus (ácaro tostador)
const PolyphagotarsonemusFields: React.FC<{ prefix: string; caracterizacion: Record<string, string>; onCampoChange: (campo: string, valor: string) => void }> = ({ prefix, caracterizacion, onCampoChange }) => (
  <div className="ml-4 mt-2 p-3 bg-gray-50 rounded border">
    <h5 className="font-medium mb-2">Polyphagotarsonemus sp. - Ácaro tostador</h5>
    <div className="mb-3">
      <label className="block text-sm font-medium text-gray-700 mb-1">Frutos afectados *</label>
      <input
        type="text"
        value={caracterizacion[`${prefix}frutos`] || ""}
        onChange={(e) => onCampoChange(`${prefix}frutos`, e.target.value)}
        className="border rounded px-3 py-2 w-full"
        placeholder="Ej: 3"
      />
    </div>
    <FotosSection campo={`${prefix}fotos`} caracterizacion={caracterizacion} onCampoChange={onCampoChange} />
  </div>
);

// Mapa de componentes por id
const fieldComponents: Record<string, React.FC<{ prefix: string; caracterizacion: Record<string, string>; onCampoChange: (campo: string, valor: string) => void }>> = {
  compsus: CompsusFields,
  diaphorina: DiaphorinaFields,
  phyllocnistis: PhyllocnistisFields,
  toxoptera: ToxopteraFields,
  hormiga: HormigaFields,
  phyllocoptruta: PhyllocoptrutaFields,
  polyphagotarsonemus: PolyphagotarsonemusFields,
};

// Sección para "Otro artrópodo" (global)
const OtroArtropodoSection: React.FC<{ caracterizacion: Record<string, string>; onCampoChange: (campo: string, valor: string) => void }> = ({ caracterizacion, onCampoChange }) => (
  <div className="border-t pt-6 mt-6">
    <h3 className="text-xl font-bold text-gray-800 mb-4">OTRO ARTRÓPODO</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Síntomas observados</label>
        <textarea
          value={caracterizacion["artropodo_otro_sintomas"] || ""}
          onChange={(e) => onCampoChange("artropodo_otro_sintomas", e.target.value)}
          className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
          rows={3}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Clase de artrópodo</label>
        <select
          value={caracterizacion["artropodo_otro_clase"] || ""}
          onChange={(e) => onCampoChange("artropodo_otro_clase", e.target.value)}
          className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
        >
          <option value="" disabled>Seleccione</option>
          <option value="insecto">Insecto</option>
          <option value="acaro">Ácaro</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del artrópodo</label>
        <p className="text-xs text-gray-500 mb-1">Indique mínimo hasta género.</p>
        <input
          type="text"
          value={caracterizacion["artropodo_otro_nombre"] || ""}
          onChange={(e) => onCampoChange("artropodo_otro_nombre", e.target.value)}
          className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
        />
      </div>
      <FotosSection campo="artropodo_otro_fotos" caracterizacion={caracterizacion} onCampoChange={onCampoChange} />
    </div>
  </div>
);

// Componente principal
export const ArthropodSection: React.FC<Props> = ({ plantas, caracterizacion, onCampoChange }) => {
  // Obtiene los tipos seleccionados para una planta específica (índice 1‑based)
  const getSelectedTypes = (idx: number): string[] => {
    const key = `artropodo_planta_${idx}_tipos`;
    return caracterizacion[key] ? caracterizacion[key].split(',').filter(Boolean) : [];
  };

  // Maneja el cambio de checkbox para una planta y tipo
  const handleTipoChange = (idx: number, tipoId: string, checked: boolean) => {
    const key = `artropodo_planta_${idx}_tipos`;
    const current = getSelectedTypes(idx);
    let nuevos;
    if (checked) {
      nuevos = [...current, tipoId];
    } else {
      nuevos = current.filter(id => id !== tipoId);
      // Limpiar campos de ese tipo para esta planta
      const prefix = `artropodo_planta_${idx}_${tipoId}_`;
      Object.keys(caracterizacion).forEach(campo => {
        if (campo.startsWith(prefix)) {
          onCampoChange(campo, '');
        }
      });
    }
    onCampoChange(key, nuevos.join(','));
  };

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

      {plantas.map((planta, idx) => {
        const index = idx + 1;
        const selectedTypes = getSelectedTypes(index);

        return (
          <div key={planta.codigo} className="border rounded-lg p-4 mb-6 bg-white shadow-sm">
            <h4 className="font-semibold text-lg text-gray-800 mb-3">
              {planta.label} (Código: {planta.codigo})
            </h4>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Artrópodos observados en esta planta
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {ARTHROPODS.map(art => (
                  <label key={art.id} className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedTypes.includes(art.id)}
                      onChange={(e) => handleTipoChange(index, art.id, e.target.checked)}
                      className="mr-2"
                    />
                    {art.label}
                  </label>
                ))}
              </div>
            </div>

            {selectedTypes.map(tipoId => {
              const Component = fieldComponents[tipoId];
              if (!Component) return null;
              const prefix = `artropodo_planta_${index}_${tipoId}_`;
              return <Component key={tipoId} prefix={prefix} caracterizacion={caracterizacion} onCampoChange={onCampoChange} />;
            })}
          </div>
        );
      })}

      <OtroArtropodoSection caracterizacion={caracterizacion} onCampoChange={onCampoChange} />
    </div>
  );
};