import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Linkedin, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-primary-900 text-primary-50 pt-16 pb-8 border-t-[6px] border-accent-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          
          {/* Logo & About */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="bg-white p-2 rounded-full inline-flex">
                <img src="/logo.png" alt="GRUVA" className="h-10 w-10 object-contain" />
              </div>
              <span className="font-bold text-2xl tracking-tight text-white">GRUVA</span>
            </Link>
            <p className="text-primary-100 max-w-sm mt-4 text-sm leading-relaxed">
              Grupo de Voluntários dos Animais da Nazaré. Dedicados a resgatar, proteger e encontrar lares cheios de amor para animais abandonados.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4 text-white">Links Rápidos</h3>
            <ul className="space-y-3">
              <li><Link to="/" className="text-primary-200 hover:text-white transition-colors">Início</Link></li>
              <li><Link to="/como-ajudar" className="text-primary-200 hover:text-white transition-colors">Como Ajudar</Link></li>
              <li><Link to="/adocao" className="text-primary-200 hover:text-white transition-colors">Animais para Adoção</Link></li>
              <li><Link to="/contactos" className="text-primary-200 hover:text-white transition-colors">Contactos</Link></li>
              <li><Link to="/admin" className="text-primary-100 hover:text-white transition-colors font-medium border-t border-white/10 pt-2 block mt-2">Área Administrativa</Link></li>
            </ul>
          </div>

          {/* Contact & Social */}
          <div>
            <h3 className="font-semibold text-lg mb-4 text-white">Contactos</h3>
            <ul className="space-y-4 mb-6">
              <li className="flex items-start gap-3 text-primary-200">
                <MapPin size={20} className="shrink-0 mt-0.5 text-accent-400" />
                <span>Nazaré, Portugal</span>
              </li>
              <li className="flex items-center gap-3 text-primary-200">
                <Mail size={20} className="shrink-0 text-accent-400" />
                <a href="mailto:gruvanazare@gmail.com" className="hover:text-white transition-colors">
                  gruvanazare@gmail.com
                </a>
              </li>
            </ul>
            
            <div className="flex gap-4 mt-6">
              <a href="#" className="bg-primary-800 p-2.5 rounded-full text-primary-200 hover:bg-primary-700 hover:text-white transition-all">
                <Facebook size={20} />
              </a>
              <a href="#" className="bg-primary-800 p-2.5 rounded-full text-primary-200 hover:bg-primary-700 hover:text-white transition-all">
                <Instagram size={20} />
              </a>
              <a href="#" className="bg-primary-800 p-2.5 rounded-full text-primary-200 hover:bg-primary-700 hover:text-white transition-all">
                <Twitter size={20} />
              </a>
              <a href="#" className="bg-primary-800 p-2.5 rounded-full text-primary-200 hover:bg-primary-700 hover:text-white transition-all">
                <Linkedin size={20} />
              </a>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-primary-800 text-center text-sm text-primary-300">
          <p>&copy; {new Date().getFullYear()} GRUVA Nazaré. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
