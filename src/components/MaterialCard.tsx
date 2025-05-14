interface MaterialCardProps {
    imagen: string; // URL de la miniatura
    titulo: string;
    descripcion: string;
    onVer: () => void;
  }
  
  const MaterialCard = ({ imagen, titulo, descripcion, onVer }: MaterialCardProps) => {
    return (
      <div className="flex items-center border rounded-lg overflow-hidden shadow-sm max-w-[600px] min-h-[100px] mx-auto">
        <div className="w-24 h-24 flex-shrink-0">
          <img
            src={imagen}
            alt={titulo}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 px-4 py-4">
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
  
  export default MaterialCard;
  