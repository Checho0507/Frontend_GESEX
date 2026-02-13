import React from "react";

interface Props {
  caracterizacion: Record<string, string>;
  onCampoChange: (campo: string, valor: string) => void;
}

// Componente para subir fotos (simulado con input de texto, reemplazar por input file en producción)
const FotosSection: React.FC<{ prefix: string; caracterizacion: Record<string, string>; onCampoChange: (campo: string, valor: string) => void }> = ({ prefix, caracterizacion, onCampoChange }) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Fotos tomadas en campo de síntomas o del insecto
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

// Subsecciones específicas para cada insecto
const CompsusSection: React.FC<Props> = ({ caracterizacion, onCampoChange }) => (
  <div className="mt-4 p-4 bg-white rounded-lg border">
    <h4 className="font-semibold text-lg mb-2">Monitoreo de Compsus sp. - Picudo</h4>
    <p className="text-sm text-gray-600 mb-4">
      - Seleccione preferiblemente árboles de los linderos, de los bordes de carretera o los que están cerca de los centros de acopio de frutas.<br />
      - Sacuda de forma suave las ramas de arriba hacia abajo, dándole la vuelta al árbol.<br />
      - Observe en el suelo la presencia de adultos, registre el número de picudos por árbol y saque un promedio.
    </p>
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Adultos de Compsus sp. encontrados en cada árbol *
      </label>
      <p className="text-xs text-gray-500 mb-1">Indique el número de adultos encontrados por surco/árbol monitoreado</p>
      <p className="text-xs text-gray-500 mb-2">Formato: SURCO - PLANTA - # ADULTOS (separados por coma). Ej.: 1 - 6 - 3 Adultos, 2 - 4 - 5 Adultos</p>
      <textarea
        value={caracterizacion["artropodo_compsus_adultos"] || ""}
        onChange={(e) => onCampoChange("artropodo_compsus_adultos", e.target.value)}
        className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
        rows={3}
        placeholder="Ej: 1 - 6 - 3 Adultos, 2 - 4 - 5 Adultos"
        required
      />
    </div>
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">Daño en hojas *</label>
      <select
        value={caracterizacion["artropodo_compsus_dano_hojas"] || ""}
        onChange={(e) => onCampoChange("artropodo_compsus_dano_hojas", e.target.value)}
        className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full max-w-md"
        required
      >
        <option value="" disabled>Seleccione</option>
        <option value="leve">Leve</option>
        <option value="medio">Medio</option>
        <option value="alto">Alto</option>
        <option value="no_dano">No se encontró daño</option>
      </select>
    </div>
    <FotosSection prefix="artropodo_compsus_fotos" caracterizacion={caracterizacion} onCampoChange={onCampoChange} />
  </div>
);

const DiaphorinaSection: React.FC<Props> = ({ caracterizacion, onCampoChange }) => (
  <div className="mt-4 p-4 bg-white rounded-lg border">
    <h4 className="font-semibold text-lg mb-2">Monitoreo de Diaphorina citri - Psílido asiático</h4>
    <p className="text-sm text-gray-600 mb-4">
      - Revisar brotes nuevos, que son los preferidos por el insecto<br />
      - En cada árbol, revisar presencia de huevos, ninfas, adultos: 4 brotes por punto cardinal (16 brotes/árbol).<br />
      - NOTA: Si se está realizando el monitoreo en un lote que tenga o linde con plantas de la variedad Swingle deberá monitorear mínimo 2 de estos árboles; estos árboles serán adicionales a los que ya se estaban monitoreando.<br />
      - Lotes con Swingle: 5, 6, 8 y 9
    </p>
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Brotes con presencia de Diaphorina citri encontrados en cada árbol *
      </label>
      <p className="text-xs text-gray-500 mb-2">Formato: SURCO - PLANTA - # BROTES CON PRESENCIA (separados por coma). Ej.: 1 - 6 - 3 Brotes con presencia, 2 - 4 - 5 Brotes con presencia</p>
      <textarea
        value={caracterizacion["artropodo_diaphorina_brotes"] || ""}
        onChange={(e) => onCampoChange("artropodo_diaphorina_brotes", e.target.value)}
        className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
        rows={3}
        placeholder="Ej: 1 - 6 - 3 Brotes con presencia"
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
              checked={caracterizacion["artropodo_diaphorina_estados"]?.includes(estado) || false}
              onChange={(e) => {
                const current = caracterizacion["artropodo_diaphorina_estados"] || "";
                const values = current ? current.split(",") : [];
                if (e.target.checked) {
                  values.push(estado);
                } else {
                  const index = values.indexOf(estado);
                  if (index > -1) values.splice(index, 1);
                }
                onCampoChange("artropodo_diaphorina_estados", values.join(","));
              }}
              className="mr-2"
            />
            {estado}
          </label>
        ))}
      </div>
    </div>
    <FotosSection prefix="artropodo_diaphorina_fotos" caracterizacion={caracterizacion} onCampoChange={onCampoChange} />
  </div>
);

const PhyllocnistisSection: React.FC<Props> = ({ caracterizacion, onCampoChange }) => (
  <div className="mt-4 p-4 bg-white rounded-lg border">
    <h4 className="font-semibold text-lg mb-2">Monitoreo de Phyllocnistis sp - Minador de los cítricos</h4>
    <p className="text-sm text-gray-600 mb-4">
      - Revisar brotes nuevos, que son los preferidos por el insecto<br />
      - Observar: * Galerías serpenteantes plateadas en el envés de la hoja. * Enrollamiento del borde foliar. * Presencia de larvas o pupa al final de la galería.<br />
      - En cada árbol, revisar: 4 brotes por punto cardinal (16 brotes/árbol).
    </p>
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Árboles con presencia de galerías hechas por Phyllocnistis sp *
      </label>
      <p className="text-xs text-gray-500 mb-2">Formato: SURCO - PLANTA - # GALERÍAS (separados por coma). Ej.: 1 - 6 - 3 Galerías</p>
      <textarea
        value={caracterizacion["artropodo_phyllocnistis_galerias"] || ""}
        onChange={(e) => onCampoChange("artropodo_phyllocnistis_galerias", e.target.value)}
        className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
        rows={3}
        placeholder="Ej: 1 - 6 - 3 Galerías"
        required
      />
    </div>
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">Nivel de daño *</label>
      <select
        value={caracterizacion["artropodo_phyllocnistis_nivel_dano"] || ""}
        onChange={(e) => onCampoChange("artropodo_phyllocnistis_nivel_dano", e.target.value)}
        className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full max-w-md"
        required
      >
        <option value="" disabled>Seleccione</option>
        <option value="bajo">Bajo</option>
        <option value="medio">Medio</option>
        <option value="alto">Alto</option>
        <option value="sin_dano">Sin daño observado</option>
      </select>
    </div>
    <FotosSection prefix="artropodo_phyllocnistis_fotos" caracterizacion={caracterizacion} onCampoChange={onCampoChange} />
  </div>
);

const ToxopteraSection: React.FC<Props> = ({ caracterizacion, onCampoChange }) => (
  <div className="mt-4 p-4 bg-white rounded-lg border">
    <h4 className="font-semibold text-lg mb-2">Monitoreo de Toxoptera citricidus - Pulgón negro</h4>
    <p className="text-sm text-gray-600 mb-4">
      - Revisar brotes nuevos, que son los preferidos por el insecto<br />
      - En cada árbol, revisar: 4 brotes por punto cardinal (16 brotes/árbol).
    </p>
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Brotes infestados de Toxoptera citricidus por árbol *
      </label>
      <p className="text-xs text-gray-500 mb-2">Formato: SURCO - PLANTA - # BROTES INFESTADOS (separados por coma). Ej.: 1 - 6 - 3 Brotes infestados, 2 - 4 - 1 Brotes infestados</p>
      <textarea
        value={caracterizacion["artropodo_toxoptera_brotes"] || ""}
        onChange={(e) => onCampoChange("artropodo_toxoptera_brotes", e.target.value)}
        className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
        rows={3}
        placeholder="Ej: 1 - 6 - 3 Brotes infestados"
        required
      />
    </div>
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        En las plantas monitoreadas se observó presencia de mielecilla y fumagina. *
      </label>
      <select
        value={caracterizacion["artropodo_toxoptera_mielecilla"] || ""}
        onChange={(e) => onCampoChange("artropodo_toxoptera_mielecilla", e.target.value)}
        className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full max-w-md"
        required
      >
        <option value="" disabled>Seleccione</option>
        <option value="si">Sí</option>
        <option value="no">No</option>
      </select>
    </div>
    <FotosSection prefix="artropodo_toxoptera_fotos" caracterizacion={caracterizacion} onCampoChange={onCampoChange} />
  </div>
);

const HormigaSection: React.FC<Props> = ({ caracterizacion, onCampoChange }) => (
  <div className="mt-4 p-4 bg-white rounded-lg border">
    <h4 className="font-semibold text-lg mb-2">Monitoreo de Hormiga Arriera</h4>
    <p className="text-sm text-gray-600 mb-4">
      - Identificar: *Bocas activas de hormiguero. *Caminos o “carreteras” de corte.<br />
      - Evaluar grado de defoliación reciente:<br />
      Nivel 0: Sin daño, 1: &lt;10%, 2: 10–25%, 3: 25–50%, 4: &gt;50%
    </p>
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">¿Hay hormigueros activos? *</label>
      <select
        value={caracterizacion["artropodo_hormiga_activos"] || ""}
        onChange={(e) => onCampoChange("artropodo_hormiga_activos", e.target.value)}
        className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full max-w-md"
        required
      >
        <option value="" disabled>Seleccione</option>
        <option value="si">Sí</option>
        <option value="no">No</option>
      </select>
    </div>
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Ubicación de los hormigueros encontrados *
      </label>
      <p className="text-xs text-gray-500 mb-2">Formato: SURCO - PLANTA - # HORMIGUEROS (separados por coma). Ej.: 2 - 4 - 6 Hormigueros, 3 - 6 - 1 Hormiguero</p>
      <textarea
        value={caracterizacion["artropodo_hormiga_ubicacion"] || ""}
        onChange={(e) => onCampoChange("artropodo_hormiga_ubicacion", e.target.value)}
        className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
        rows={3}
        placeholder="Ej: 2 - 4 - 6 Hormigueros"
        required
      />
    </div>
    <FotosSection prefix="artropodo_hormiga_fotos" caracterizacion={caracterizacion} onCampoChange={onCampoChange} />
  </div>
);

// Subsecciones para ácaros
const PhyllocoptrutaSection: React.FC<Props> = ({ caracterizacion, onCampoChange }) => (
  <div className="mt-4 p-4 bg-white rounded-lg border">
    <h4 className="font-semibold text-lg mb-2">Phyllocoptruta sp. - Ácaro blanco</h4>
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Número de hojas y frutos afectados *
      </label>
      <p className="text-xs text-gray-500 mb-2">Formato: SURCO - PLANTA - # FRUTOS AFECTADOS (separados por coma). Ej.: 4 - 6 - 2 Frutos afectados, 10 - 4 - 5 Frutos afectados</p>
      <textarea
        value={caracterizacion["artropodo_phyllocoptruta_frutos"] || ""}
        onChange={(e) => onCampoChange("artropodo_phyllocoptruta_frutos", e.target.value)}
        className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
        rows={3}
        placeholder="Ej: 4 - 6 - 2 Frutos afectados"
        required
      />
    </div>
    <FotosSection prefix="artropodo_phyllocoptruta_fotos" caracterizacion={caracterizacion} onCampoChange={onCampoChange} />
  </div>
);

const PolyphagotarsonemusSection: React.FC<Props> = ({ caracterizacion, onCampoChange }) => (
  <div className="mt-4 p-4 bg-white rounded-lg border">
    <h4 className="font-semibold text-lg mb-2">Monitoreo de Polyphagotarsonemus sp. - Ácaro tostador</h4>
    <p className="text-sm text-gray-600 mb-4">
      - Revisar brotes tiernos y frutos en formación<br />
      - En cada árbol, revisar: 4 brotes por punto cardinal (16 brotes/árbol) y 4 frutos en formación.<br />
      - Observar: *Bronceado café oscuro *Enrollamiento de hojas jóvenes. *Rugosidad y corchosidad en frutos
    </p>
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Número de frutos afectados *
      </label>
      <p className="text-xs text-gray-500 mb-2">Formato: SURCO - PLANTA - # FRUTOS AFECTADOS (separados por coma). Ej.: 4 - 6 - 2 Frutos afectados, 6 - 10 - 3 Frutos afectados</p>
      <textarea
        value={caracterizacion["artropodo_polyphagotarsonemus_frutos"] || ""}
        onChange={(e) => onCampoChange("artropodo_polyphagotarsonemus_frutos", e.target.value)}
        className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
        rows={3}
        placeholder="Ej: 4 - 6 - 2 Frutos afectados"
        required
      />
    </div>
    <FotosSection prefix="artropodo_polyphagotarsonemus_fotos" caracterizacion={caracterizacion} onCampoChange={onCampoChange} />
  </div>
);

// Sección para "Otro artrópodo" (independiente)
const OtroArtropodoSection: React.FC<Props> = ({ caracterizacion, onCampoChange }) => (
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
      <FotosSection prefix="artropodo_otro_fotos" caracterizacion={caracterizacion} onCampoChange={onCampoChange} />
    </div>
  </div>
);

// Subcomponente para insectos
const InsectoSection: React.FC<Props> = ({ caracterizacion, onCampoChange }) => {
  const tipoInsecto = caracterizacion["artropodo_tipo_insecto"] || "";

  const handleTipoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onCampoChange("artropodo_tipo_insecto", e.target.value);
  };

  return (
    <div className="border-t pt-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Insecto</h3>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Seleccione el insecto observado en campo *
        </label>
        <select
          value={tipoInsecto}
          onChange={handleTipoChange}
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

      {tipoInsecto === "compsus" && <CompsusSection caracterizacion={caracterizacion} onCampoChange={onCampoChange} />}
      {tipoInsecto === "diaphorina" && <DiaphorinaSection caracterizacion={caracterizacion} onCampoChange={onCampoChange} />}
      {tipoInsecto === "phyllocnistis" && <PhyllocnistisSection caracterizacion={caracterizacion} onCampoChange={onCampoChange} />}
      {tipoInsecto === "toxoptera" && <ToxopteraSection caracterizacion={caracterizacion} onCampoChange={onCampoChange} />}
      {tipoInsecto === "hormiga" && <HormigaSection caracterizacion={caracterizacion} onCampoChange={onCampoChange} />}
      {tipoInsecto === "otro_insecto" && (
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Especifique el insecto observado
          </label>
          <input
            type="text"
            value={caracterizacion["artropodo_otro_insecto_nombre"] || ""}
            onChange={(e) => onCampoChange("artropodo_otro_insecto_nombre", e.target.value)}
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full max-w-md"
            placeholder="Nombre del insecto"
          />
        </div>
      )}
    </div>
  );
};

// Subcomponente para ácaros
const AracnidoSection: React.FC<Props> = ({ caracterizacion, onCampoChange }) => {
  const tipoAcaro = caracterizacion["artropodo_tipo_acaro"] || "";

  const handleTipoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onCampoChange("artropodo_tipo_acaro", e.target.value);
  };

  return (
    <div className="border-t pt-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Ácaros</h3>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Seleccione el ácaro que ocasionó el daño observado en campo *
        </label>
        <select
          value={tipoAcaro}
          onChange={handleTipoChange}
          className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full max-w-md"
          required
        >
          <option value="" disabled>Seleccione</option>
          <option value="phyllocoptruta">Phyllocoptruta sp. - Ácaro blanco</option>
          <option value="polyphagotarsonemus">Polyphagotarsonemus sp. - Ácaro tostador</option>
          <option value="otro_acaro">Otro:</option>
        </select>
      </div>

      {tipoAcaro === "phyllocoptruta" && <PhyllocoptrutaSection caracterizacion={caracterizacion} onCampoChange={onCampoChange} />}
      {tipoAcaro === "polyphagotarsonemus" && <PolyphagotarsonemusSection caracterizacion={caracterizacion} onCampoChange={onCampoChange} />}
      {tipoAcaro === "otro_acaro" && (
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Especifique el ácaro observado
          </label>
          <input
            type="text"
            value={caracterizacion["artropodo_otro_acaro_nombre"] || ""}
            onChange={(e) => onCampoChange("artropodo_otro_acaro_nombre", e.target.value)}
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full max-w-md"
            placeholder="Nombre del ácaro"
          />
        </div>
      )}
    </div>
  );
};

// Componente principal
export const ArthropodSection: React.FC<Props> = ({ caracterizacion, onCampoChange }) => {
  const clase = caracterizacion["artropodo_clase"] || "";

  const handleClaseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onCampoChange("artropodo_clase", e.target.value);
  };

  return (
    <div className="bg-gray-50 p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Monitoreo de Artrópodos
      </h2>

      <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border">
        <p className="text-sm text-gray-700">
          El monitoreo de plagas en cítricos permite conocer oportunamente la presencia y el nivel de infestación que pueden afectar la producción, favoreciendo el manejo integrado del cultivo y la toma de decisiones técnicas basadas en información real; además, contribuye a la protección de organismos benéficos.
        </p>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          ¿Clase de artrópodo observado? *
        </label>
        <select
          value={clase}
          onChange={handleClaseChange}
          className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full max-w-md"
          required
        >
          <option value="" disabled>Seleccione</option>
          <option value="insecto">Insecto</option>
          <option value="aracnido">Arácnido</option>
        </select>
      </div>

      {clase === "insecto" && <InsectoSection caracterizacion={caracterizacion} onCampoChange={onCampoChange} />}
      {clase === "aracnido" && <AracnidoSection caracterizacion={caracterizacion} onCampoChange={onCampoChange} />}

      <OtroArtropodoSection caracterizacion={caracterizacion} onCampoChange={onCampoChange} />
    </div>
  );
};