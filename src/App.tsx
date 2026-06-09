import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import ComoAjudar from './pages/ComoAjudar';
import Adocao from './pages/Adocao';
import Contactos from './pages/Contactos';
import SerVoluntario from './pages/SerVoluntario';
import SerFat from './pages/SerFat';
import Admin from './pages/Admin';
import Apadrinhar from './pages/Apadrinhar';
import FormularioAdocao from './pages/FormularioAdocao';
import ScrollToTop from './components/ScrollToTop';

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow flex flex-col items-center">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/como-ajudar" element={<ComoAjudar />} />
            <Route path="/ser-voluntario" element={<SerVoluntario />} />
            <Route path="/ser-fat" element={<SerFat />} />
            <Route path="/adocao" element={<Adocao />} />
            <Route path="/formulario-adocao" element={<FormularioAdocao />} />
            <Route path="/apadrinhar" element={<Apadrinhar />} />
            <Route path="/contactos" element={<Contactos />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
