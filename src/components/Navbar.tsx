import { Link, useLocation } from 'react-router-dom';
import { Heart, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Início', path: '/' },
    { name: 'Como Ajudar', path: '/como-ajudar' },
    { name: 'Patudos', path: '/adocao' },
    { name: 'Contactos', path: '/contactos' },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-primary-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="Logótipo GRUVA" className="h-12 w-12 object-contain" />
            <span className="font-bold text-2xl text-primary-900 tracking-tight">GRUVA</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`font-medium transition-colors relative py-2 ${
                    isActive ? 'text-primary-600' : 'text-slate-600 hover:text-primary-500'
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-500 rounded-full" />
                  )}
                </Link>
              );
            })}
          </div>

          <div className="hidden md:flex">
            <Link
              to="/como-ajudar"
              className="flex items-center gap-2 bg-gradient-to-r from-primary-500 to-primary-400 text-white px-6 py-2.5 rounded-full font-medium hover:shadow-md hover:from-primary-600 hover:to-primary-500 transition-all"
            >
              Apoiar Agora
              <Heart size={18} className="fill-current" />
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-600 hover:text-primary-600 focus:outline-none"
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-primary-50 shadow-lg absolute w-full left-0">
          <div className="px-4 pt-2 pb-6 space-y-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`block px-3 py-3 rounded-xl font-medium ${
                    isActive ? 'bg-primary-50 text-primary-600' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
            <div className="pt-4 px-3">
              <Link
                to="/como-ajudar"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-2 bg-primary-500 text-white w-full px-6 py-3 rounded-full font-medium shadow-sm"
              >
                Apoiar Agora
                <Heart size={18} className="fill-current" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
