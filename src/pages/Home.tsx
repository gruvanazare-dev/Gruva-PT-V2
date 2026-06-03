import { Link } from 'react-router-dom';
import { PawPrint, Shield, Heart, Home as HomeIcon, GraduationCap } from 'lucide-react';
import SobreNos from '../components/SobreNos';

export default function Home() {
  const features = [
    {
      icon: <PawPrint size={28} className="text-primary-500" />,
      title: "Resgate",
      desc: "Acolhemos animais em situação de risco ou abandono.",
      bg: "bg-blue-50"
    },
    {
      icon: <Shield size={28} className="text-primary-500" />,
      title: "Proteção",
      desc: "Garantimos tratamentos médicos, comida e muito amor.",
      bg: "bg-slate-50"
    },
    {
      icon: <HomeIcon size={28} className="text-primary-500" />,
      title: "Adoção",
      desc: "Encontramos famílias responsáveis e carinhosas.",
      bg: "bg-blue-50"
    },
    {
      icon: <GraduationCap size={28} className="text-primary-500" />,
      title: "Educação",
      desc: "Promovemos o bem-estar e a posse responsável.",
      bg: "bg-slate-50"
    }
  ];

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary-50 to-white pt-16 pb-24 lg:pt-24 lg:pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Texto Hero */}
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 text-primary-800 font-medium text-sm mb-6">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent-500"></span>
                </span>
                Associação de Proteção Animal da Nazaré
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-900 leading-[1.15] mb-6">
                Cada vida merece uma <span className="text-primary-500 inline-block">segunda chance.</span>
              </h1>
              <p className="text-lg md:text-xl text-slate-600 mb-8 leading-relaxed">
                A GRUVA resgata, protege e encontra lares cheios de amor para animais abandonados ou em risco na Nazaré e região. Junta-te a nós nesta missão.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/adocao"
                  className="bg-primary-500 text-white px-8 py-3.5 rounded-full font-semibold text-lg hover:bg-primary-600 hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2"
                >
                  Adotar um Amigo <PawPrint size={20} className="fill-current opacity-80" />
                </Link>
                <Link
                  to="/como-ajudar"
                  className="bg-white text-primary-600 border-2 border-primary-100 px-8 py-3.5 rounded-full font-semibold text-lg hover:border-primary-300 hover:bg-primary-50 transition-all"
                >
                  Como Ajudar
                </Link>
              </div>
            </div>

            {/* Imagem Hero */}
            <div className="relative lg:ml-10">
              {/* Decorative shapes behind image */}
              <div className="absolute -inset-4 bg-gradient-to-tr from-primary-200 to-accent-100 rounded-[3rem] transform rotate-3 scale-105 opacity-50 blur-lg"></div>
              
              <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-white bg-white">
                <div className="absolute inset-0 bg-gradient-to-t from-primary-900/40 to-transparent mix-blend-multiply z-10 rounded-[2rem]"></div>
                <img 
                  src="https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=1200&auto=format&fit=crop" 
                  alt="Cão feliz resgatado pela GRUVA" 
                  className="w-full h-[400px] lg:h-[550px] object-cover"
                />
              </div>
              

            </div>

          </div>
        </div>
      </section>

      {/* Sobre Nós Section */}
      <SobreNos />

      {/* Features Section */}
      <section className="py-20 bg-slate-50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-900 mb-4">Os Nossos Pilares</h2>
            <p className="text-lg text-slate-600">
              Trabalhamos diariamente com um único objetivo: o bem-estar animal. Conhece as nossas áreas de atuação.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => (
              <div 
                key={idx} 
                className={`${feature.bg} p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col items-start`}
              >
                <div className="bg-white p-4 rounded-2xl shadow-sm mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-primary-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>
    </div>
  );
}
