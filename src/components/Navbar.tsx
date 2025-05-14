import { User } from "lucide-react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="bg-red-700 text-white px-6 py-2 flex justify-between items-center">
      <Link to="/">
        <img src="/logo.png" alt="Logo" className="h-20" />
      </Link>
      <ul className="flex gap-6 text-lg"> {/* text-lg para que no se vea tan grande */}
        <li><Link to="/encuesta" className="hover:underline">Encuesta</Link></li>
        <li><Link to="/estadisticas" className="hover:underline">Estadísticas</Link></li>
        <li><Link to="/material" className="hover:underline">Material de apoyo</Link></li>
      </ul>
      <User className="w-12 h-12" />
    </nav>
  );
};

export default Navbar;
