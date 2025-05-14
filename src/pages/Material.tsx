interface MaterialCardProps {
  imagen: string;
  titulo: string;
  descripcion: string;
  onVer: () => void;
}

const MaterialCard = ({ imagen, titulo, descripcion, onVer }: MaterialCardProps) => {
  return (
    <div className="flex items-center border rounded-lg overflow-hidden shadow-sm w-full max-w-[500px] min-h-[110px] mx-auto">
      <div className="w-28 h-28 flex-shrink-0">
        <img
          src={imagen}
          alt={titulo}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-1 px-4 py-3">
        <h3 className="font-semibold text-black text-base">{titulo}</h3>
        <p className="text-sm text-gray-700">{descripcion}</p>
      </div>
      <div className="px-4">
        <button
          onClick={onVer}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded-full shadow text-xs"
        >
          Ver
        </button>
      </div>
    </div>
  );
};

const Material = () => {
  const materiales = [
    {
      imagen: "/pdf-preview.jpg",
      titulo: 'Conceptos básicos sobre Diversidad Sexual',
      descripcion: 'Una introducción a la terminología y conceptos fundamentales',
      onVer: () => window.open("https://example.com/archivo.pdf", "_blank"),
    },
    {
      imagen: "/video-preview.jpg",
      titulo: 'Video: ¿Qué es identidad de género?',
      descripcion: 'Explicación visual sobre identidad, expresión y orientación',
      onVer: () => window.open("https://www.youtube.com/watch?v=3QKqWWL-diM", "_blank"),
    },
    {
      imagen: "/infografia-preview.jpg",
      titulo: 'Infografía sobre Diversidad',
      descripcion: 'Resumen visual sobre los tipos de identidad y expresión',
      onVer: () => window.open("https://example.com/infografia.png", "_blank"),
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 py-12">
      <div className="grid md:grid-cols-2 gap-8 items-start">
        {/* Columna 1 */}
        <div className="flex flex-col gap-4">
          <div className="aspect-video w-full">
            <iframe
              className="w-full h-full rounded-lg"
              src="https://www.youtube.com/embed/3QKqWWL-diM?start=50"
              title="Video de apoyo"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
          <div className="flex flex-col gap-2 text-sm text-gray-800 text-justify">
            <h2 className="text-lg font-semibold text-black">
              Términos clave para comprender mejor:
            </h2>
            <p><strong>Identidad de género:</strong> Es cómo una persona se percibe a sí misma (hombre, mujer, ambos o ninguno), independientemente del sexo asignado al nacer.</p>
            <p><strong>Orientación sexual:</strong> Hace referencia a la atracción emocional, romántica o sexual que una persona siente hacia otras.</p>
            <p><strong>Expresión de género:</strong> Es la forma en que una persona presenta su género a través de la ropa, el comportamiento o el estilo personal.</p>
            <p><strong>Personas trans:</strong> Aquellas cuya identidad de género no coincide con el sexo que se les asignó al nacer.</p>
            <p><strong>Intersexualidad:</strong> Variaciones naturales en las características sexuales que no encajan en las definiciones típicas de masculino o femenino.</p>
          </div>
        </div>

        {/* Columna 2 */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 text-sm text-gray-800 text-justify">
            <h2 className="text-lg font-semibold text-black">
              ¿Por qué es importante hablar sobre diversidad?
            </h2>
            <p>
              Hablar sobre diversidad sexual y de género no solo visibiliza a las personas LGBTQ+, sino que también promueve una sociedad más empática, respetuosa e informada.
            </p>
          </div>
          <div className="w-full">
            <img
              src="/homofobia-educacion.jpeg"
              alt="Imagen representativa"
              className="w-full rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* Sección de materiales */}
      <div className="mt-12 space-y-4">
        <h2 className="text-lg font-semibold text-black mb-2">Material educativo recomendado:</h2>
        {materiales.map((item, idx) => (
          <MaterialCard
            key={idx}
            imagen={item.imagen}
            titulo={item.titulo}
            descripcion={item.descripcion}
            onVer={item.onVer}
          />
        ))}
      </div>
    </section>
  );
};

export default Material;
