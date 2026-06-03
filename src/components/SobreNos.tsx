import { Link } from 'react-router-dom';
import { Heart, Shield, Users, ArrowRight } from 'lucide-react';

export default function SobreNos() {
  return (
    <section className="py-20 lg:py-28 bg-white relative overflow-hidden">
      {/* Decorative background blur */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-primary-200/20 blur-3xl rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Texto (Esquerda) */}
          <div className="space-y-8">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 text-primary-700 font-semibold text-sm mb-6">
                <Heart size={16} className="text-accent-500 fill-current" />
                <span>Sobre Nós</span>
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-900 leading-tight mb-6">
                Unidos por aqueles <br className="hidden md:block"/> que não têm voz.
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed">
                A GRUVA é uma associação sem fins lucrativos que nasceu na Nazaré pela força e bondade de cidadãos que se recusaram a ignorar o abandono animal. Somos movidos <strong className="text-primary-700 font-semibold">exclusivamente por voluntários</strong> unidos por um grande coração.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="bg-primary-50 p-3 rounded-2xl text-primary-500 mt-1 shrink-0">
                  <Shield size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-primary-900 mb-2">O Nosso Trabalho na Prática</h3>
                  <p className="text-slate-600 leading-relaxed">
                    Não possuímos um grande refúgio privado. Concentramos os nossos esforços no <strong className="text-slate-700">apoio direto ao canil municipal</strong>, na gestão de colónias de gatos (CED) na zona costeira e na preciosa rede de <strong className="text-slate-700">Famílias de Acolhimento Temporário (FAT)</strong>.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-accent-50 p-3 rounded-2xl text-accent-500 mt-1 shrink-0">
                  <Users size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-primary-900 mb-2">O Apelo à Comunidade</h3>
                  <p className="text-slate-600 leading-relaxed">
                    A nossa maior batalha é financeira: cuidados veterinários, cirurgias e alimentação. Sem subsídios estatais para cobrir tudo, <strong className="text-slate-700">dependemos inteiramente de padrinhos, doadores e voluntários</strong> para salvar vidas.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Link
                to="/como-ajudar"
                className="inline-flex items-center gap-2 bg-primary-500 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-primary-600 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all group"
              >
                Quero ajudar a escrever o próximo capítulo
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Imagem (Direita) */}
          <div className="relative mt-8 lg:mt-0">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary-200 to-accent-100 rounded-[3rem] transform -rotate-3 scale-105 opacity-50 blur-lg"></div>
            
            <div className="relative rounded-[2.5rem] overflow-hidden shadow-xl border-[6px] border-white bg-slate-100">
              <img 
                src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=1200&auto=format&fit=crop" 
                alt="Voluntários com cães a correr" 
                className="w-full h-[400px] lg:h-[600px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary-900/40 to-transparent"></div>
            </div>


          </div>

        </div>
      </div>
    </section>
  );
}
