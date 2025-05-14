import { Instagram, Facebook } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t mt-8 p-4 flex justify-between items-center text-sm">
      <div className="flex items-center gap-2">
        <img src="/bienestar-logo.png" alt="Logo Bienestar" className="h-16" />
      </div>
      <div className="flex gap-4 text-2xl">
        <a href="#" className="text-pink-500 hover:opacity-75">
          <Instagram className="w-8 h-8" />
        </a>
        <a href="#" className="text-blue-600 hover:opacity-75">
          <Facebook className="w-8 h-8" />
        </a>
      </div>
    </footer>
  );
};

export default Footer;
