import { Link } from 'react-router-dom';
import { Heart, Calendar, Compass, ShieldAlert, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';

export default function SerVoluntario() {
  const impacts = [
    {
      icon: <Compass className="text-primary-500" size={24} />,
      title: "Passeios e Exercício",
      description: "Muitos animais passam grande parte do tempo em boxes. A sua presença garante que possam correr, brincar, explorar novos cheiros e queimar energia."
    },
    {
      icon: <Heart className="text-accent-500 fill-accent-100" size={24} />,
      title: "Socialização e Carinho",
      description: "Ajudar animais assustados ou traumatizados a confiar novamente nos humanos com paciência e carinho, aumentando drasticamente as suas chances de adoção."
    },
    {
      icon: <CheckCircle className="text-emerald-500" size={24} />,
      title: "Apoio Logístico e CED",
      description: "Auxiliar na higiene dos espaços, escovagem dos patudos e na alimentação de colónias de gatos de rua vigiadas através do programa CED (Capturar-Esterilizar-Devolver)."
    },
    {
      icon: <Calendar className="text-secondary-500" size={24} />,
      title: "Campanhas e Divulgação",
      description: "Representar a GRUVA em campanhas de recolha de alimentos em supermercados ou ajudar ativamente na partilha de apelos nas redes sociais."
    }
  ];

  return (
    <div className="w-full bg-slate-50 min-h-screen py-12 md:py-20 lg:py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Back Link */}
        <Link 
          to="/como-ajudar" 
          className="inline-flex items-center gap-2 text-slate-500 hover:text-primary-600 font-semibold mb-8 transition-colors group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span>Voltar a Como Ajudar</span>
        </Link>

        {/* Hero Card */}
        <div className="bg-white p-8 md:p-12 rounded-[2rem] shadow-sm border border-slate-100 mb-10 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary-100/30 blur-3xl rounded-full -translate-y-1/2 translate-x-1/3"></div>
          
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50 text-primary-700 font-semibold text-xs mb-6 uppercase tracking-wider">
              ❤️ Voluntariado
            </div>
            
            <h1 className="text-3xl md:text-5xl font-bold  text-primary-900 leading-tight mb-6">
              Ser herói por um dia. <br />
              Ser voluntário para a vida.
            </h1>
            
            <p className="text-lg text-slate-600 leading-relaxed max-w-3xl mb-8">
              A GRUVA é movida <strong className="text-primary-600 font-semibold">exclusivamente pelo amor de voluntários</strong>. Não existem salários, cargos executivos ou privilégios estatais: apenas cidadãos comuns da Nazaré que se recusam a ignorar o abandono animal e dão o seu recurso mais valioso: o <strong className="text-slate-800">tempo</strong>.
            </p>

            <div className="bg-amber-50/70 border border-amber-100 p-5 rounded-2xl flex items-start gap-3 text-amber-900">
              <ShieldAlert size={20} className="text-amber-600 shrink-0 mt-0.5" />
              <p className="text-sm leading-relaxed">
                <strong className="font-semibold">Importante:</strong> Não exigimos compromisso diário! Qualquer hora livre que possa disponibilizar aos sábados, domingos ou durante a semana fará uma diferença gigantesca na vida destes animais que anseiam por companhia.
              </p>
            </div>
          </div>
        </div>

        {/* Areas of Impact */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-primary-900 mb-8 text-center sm:text-left">Como pode ajudar no terreno:</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {impacts.map((item, index) => (
              <div 
                key={index} 
                className="bg-white p-6 rounded-3xl border border-slate-150/80 shadow-xs flex gap-4 hover:shadow-md hover:border-primary-100 transition-all duration-300"
              >
                <div className="bg-slate-50 p-3 h-12 w-12 rounded-2xl flex items-center justify-center shrink-0">
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-bold text-primary-900 mb-1.5">{item.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Empathetic Bottom Card & Call To Action */}
        <div className="bg-gradient-to-br from-primary-800 to-primary-900 p-8 md:p-12 rounded-[2.5rem] text-white text-center shadow-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-primary-900/55 to-transparent z-0"></div>
          <div className="absolute -bottom-8 -left-8 bg-white/5 w-64 h-64 rounded-full blur-3xl z-0"></div>
          
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold">A sua empatia pode transformar vidas</h2>
            <p className="text-primary-100 text-sm md:text-base leading-relaxed">
              O canil pode ser um lugar frio e solitário. Mas quando um voluntário entra e põe a trela a um patudo, o mundo dele muda por completo. Junte-se a nós nesta missão de amor e respeito pelos animais.
            </p>
            
            <div className="pt-4">
              <Link
                to="/contactos?assunto=Voluntariado"
                className="inline-flex items-center gap-2 bg-white text-primary-900 hover:bg-slate-100 px-8 py-4 rounded-full font-bold text-base md:text-lg shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all group"
              >
                Quero ser Voluntário
                <ArrowRight size={18} className="text-primary-500 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
