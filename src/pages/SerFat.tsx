import { Link } from 'react-router-dom';
import { Home, Heart, ShieldCheck, Gift, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';

export default function SerFat() {
  const fatBenefits = [
    {
      icon: <ShieldCheck className="text-primary-500" size={24} />,
      title: "Recuperação Pós-Cirúrgica",
      description: "Animais recém-operados ou que necessitam de medicação regular exigem vigilância constante e repouso de qualidade, o que é impossível dentro do ruído de um canil."
    },
    {
      icon: <Home className="text-amber-500" size={24} />,
      title: "Acolhimento de Bebés",
      description: "Cachorros e gatinhos bebés com sistemas imunitários vulneráveis correm risco de contrair infeções graves no canil. Numa FAT, crescem fortes e protegidos."
    },
    {
      icon: <Gift className="text-emerald-500" size={24} />,
      title: "Despesas Totalmente Suportadas",
      description: "A GRUVA assegura toda a ração, tratamentos e despesas veterinárias inerentes ao animal. A família de acolhimento apenas dá a casa e o carinho."
    },
    {
      icon: <Heart className="text-accent-500 fill-accent-100" size={24} />,
      title: "Apoio a Animais Traumatizados",
      description: "Patudos que sofreram violência ou negligência grave redescobrem o significado de família, rotina e confiança passo a passo sob o seu teto."
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
          <div className="absolute top-0 right-0 w-48 h-48 bg-accent-100/30 blur-3xl rounded-full -translate-y-1/2 translate-x-1/3"></div>
          
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-50 text-accent-700 font-semibold text-xs mb-6 uppercase tracking-wider">
               🐾 Família de Acolhimento Temporário
            </div>
            
            <h1 className="text-3xl md:text-5xl font-bold font-sans text-primary-900 leading-tight mb-6">
              Abra a sua porta, <br />
              salve uma vida indefesa.
            </h1>
            
            <p className="text-lg text-slate-600 leading-relaxed max-w-3xl mb-8">
              Ser uma <strong className="text-primary-600 font-semibold">FAMÍLIA DE ACOLHIMENTO TEMPORÁRIO (FAT)</strong> significa acolher em sua casa um dos nossos patudos temporariamente até ele encontrar a sua adoção definitiva. É um pilar extraordinariamente vital na nossa missão de resgate.
            </p>

            <div className="bg-emerald-50/70 border border-emerald-100 p-5 rounded-2xl flex items-start gap-3 text-emerald-900">
              <CheckCircle size={20} className="text-emerald-600 shrink-0 mt-0.5" />
              <p className="text-sm leading-relaxed">
                <strong className="font-semibold">Custo Zero:</strong> Sabia que <strong className="font-semibold text-emerald-950">todas as despesas com ração, medicamentos e clínicas veterinárias</strong> são asseguradas a 100% pela nossa associação? Só precisa de disponibilizar espaço físico e dar muito amor!
              </p>
            </div>
          </div>
        </div>

        {/* Areas of FAT Support */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-primary-900 mb-8 text-center sm:text-left">Porque é que o papel de uma FAT é crucial:</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {fatBenefits.map((item, index) => (
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
            <h2 className="text-2xl md:text-3xl font-bold">Faça parte desta ponte para a felicidade</h2>
            <p className="text-primary-100 text-sm md:text-base leading-relaxed">
              Muitos animais que hoje vivem felizes com as suas famílias definitivas devem a sua vida às famílias de acolhimento que lhes limparam as lágrimas físicas e psicológicas. Quer ajudá-los a restabelecer a esperança?
            </p>
            
            <div className="pt-4">
              <Link
                to="/contactos?assunto=Candidatos a FAT"
                className="inline-flex items-center gap-2 bg-white text-primary-900 hover:bg-slate-100 px-8 py-4 rounded-full font-bold text-base md:text-lg shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all group"
              >
                Quero ser FAT
                <ArrowRight size={18} className="text-primary-500 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
