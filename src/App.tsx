// src/App.tsx
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Páginas
import Material from "./pages/Material";
import Encuesta from "./pages/Encuesta";
import  Estadisticas from "./pages/Estadisticas";

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow p-8 bg-gray-50">
        <Routes>
          {/* Página de inicio */}
          <Route
            path="/"
            element={
              <div className="text-center mt-12">
                <h1 className="text-3xl font-bold">Bienvenido al Observatorio de Diversidad</h1>
                <p className="mt-4 text-lg">Selecciona una sección desde el menú superior.</p>
              </div>
            }
          />

          {/* Otras páginas */}
          <Route path="/material" element={<Material />} />
          <Route path="/encuesta" element={<Encuesta />} />
          <Route path="/estadisticas" element={<Estadisticas />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;
