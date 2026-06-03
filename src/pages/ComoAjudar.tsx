import { Link } from 'react-router-dom';
import { Copy, Check, CreditCard, Smartphone, Package, Info, UserPlus, HeartHandshake, Home as HomeIcon, Heart, PawPrint } from 'lucide-react';
import { useState } from 'react';

export default function ComoAjudar() {
  const [copiedType, setCopiedType] = useState<string | null>(null);

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  return (
    <div className="w-full bg-slate-50 py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold text-primary-900 mb-4">Como Ajudar</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            A GRUVA vive da generosidade de pessoas como tu. Descobre as várias formas de apoiar a nossa missão e ajudar os nossos amigos de quatro patas.
          </p>
        </div>

        <div className="space-y-8">
          {/* Top Section - Donativos Financeiros Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Transferência Bancária */}
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col justify-between min-h-[250px] hover:shadow-md transition-shadow">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-blue-50 p-3 rounded-full text-blue-600 shrink-0">
                    <CreditCard size={24} />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 font-mono tracking-wider uppercase">IBAN GRUVA</span>
                </div>
                <h3 className="text-xl font-bold text-primary-900 mb-2">Transferência Bancária</h3>
                <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                  Contribui diretamente para a nossa conta bancária doando qualquer valor de forma segura.
                </p>
              </div>
              <div>
                <div className="flex items-center justify-between bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200 min-h-[56px] w-full">
                  <span className="text-slate-800 font-bold text-[11px] sm:text-sm tracking-tight select-all">
                    PT50 0045 5020 4034 5236 0979 4
                  </span>
                  <button 
                    onClick={() => handleCopy('PT50 0045 5020 4034 5236 0979 4', 'iban')}
                    className={`p-2.5 rounded-xl transition-all shrink-0 ml-2 ${
                      copiedType === 'iban' 
                        ? 'bg-emerald-100 text-emerald-600' 
                        : 'text-blue-500 hover:text-blue-700 bg-blue-50/50 hover:bg-blue-100 border border-blue-100/30'
                    }`}
                    title={copiedType === 'iban' ? "Copiado!" : "Copiar IBAN"}
                  >
                    {copiedType === 'iban' ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
                {copiedType === 'iban' && (
                  <p className="text-xs text-green-600 mt-2 font-medium">Copiado para a área de transferência!</p>
                )}
              </div>
            </div>

            {/* MBWay */}
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col justify-between min-h-[250px] hover:shadow-md transition-shadow">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-pink-50 p-3 rounded-full text-pink-600 shrink-0">
                    <Smartphone size={24} />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 font-mono tracking-wider uppercase">MBWAY</span>
                </div>
                <h3 className="text-xl font-bold text-primary-900 mb-2">MBWay</h3>
                <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                  Faz um envio de dinheiro rápido e instantâneo através do telemóvel usando o nosso número.
                </p>
              </div>
              <div>
                <div className="flex items-center justify-between bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200 min-h-[56px] w-full">
                  <span className="text-slate-800 font-bold text-xs sm:text-sm tracking-wide select-all">
                    968 537 272
                  </span>
                  <button 
                    onClick={() => handleCopy('968 537 272', 'mbway')}
                    className={`p-2.5 rounded-xl transition-all shrink-0 ml-2 ${
                      copiedType === 'mbway' 
                        ? 'bg-emerald-100 text-emerald-600' 
                        : 'text-pink-500 hover:text-pink-700 bg-pink-50/50 hover:bg-pink-100 border border-pink-100/30'
                    }`}
                    title={copiedType === 'mbway' ? "Copiado!" : "Copiar Número"}
                  >
                    {copiedType === 'mbway' ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
                {copiedType === 'mbway' && (
                  <p className="text-xs text-green-600 mt-2 font-medium">Copiado para a área de transferência!</p>
                )}
              </div>
            </div>

            {/* PayPal */}
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col justify-between min-h-[250px] hover:shadow-md transition-shadow">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-blue-50 p-3 rounded-full text-[#003087] shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zM13.67 15.688c2.956 0 5.378-1.12 6.13-4.996.084-.424.148-.847.195-1.264.398-3.51-1.066-5.46-4.595-5.46H8.706c-.168 0-.315.123-.342.288l-1.92 12.19.006.035c.02.13.136.223.27.223h3.587c.27 0 .498-.2.538-.466l.738-4.664c.04-.265.267-.466.537-.466h1.55z"></path>
                    </svg>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 font-mono tracking-wider uppercase">PAYPAL</span>
                </div>
                <h3 className="text-xl font-bold text-primary-900 mb-2">PayPal</h3>
                <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                  Efetua os teus donativos online de forma imediata e simplificada usando a tua conta PayPal.
                </p>
              </div>
              <div>
                <div className="flex items-center justify-between bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200 min-h-[56px] w-full">
                  <span className="text-slate-800 font-semibold text-xs sm:text-sm tracking-wide select-all truncate max-w-[120px] sm:max-w-[180px] md:max-w-[100px] lg:max-w-[130px] xl:max-w-[190px]" title="@gruvanazare">
                    @gruvanazare
                  </span>
                  <button 
                    onClick={() => handleCopy('@gruvanazare', 'paypal')}
                    className={`p-2.5 rounded-xl transition-all shrink-0 ml-2 ${
                      copiedType === 'paypal' 
                        ? 'bg-emerald-100 text-emerald-600' 
                        : 'text-blue-500 hover:text-blue-700 bg-blue-50/50 hover:bg-blue-100 border border-blue-100/30'
                    }`}
                    title={copiedType === 'paypal' ? "Copiado!" : "Copiar PayPal"}
                  >
                    {copiedType === 'paypal' ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
                {copiedType === 'paypal' && (
                  <p className="text-xs text-green-600 mt-2 font-medium">Copiado para a área de transferência!</p>
                )}
              </div>
            </div>
          </div>

          {/* Bens Essenciais */}
          <section className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col sm:flex-row items-center gap-6">
            <div className="bg-primary-50 p-5 rounded-full text-primary-500 shrink-0">
              <Package size={32} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-primary-900 mb-2">Bens Essenciais</h3>
              <p className="text-slate-600">
                Aceitamos donativos em espécie: ração húmida ou seca (cães e gatos), mantas, camas, produtos de limpeza e desparasitantes.
              </p>
            </div>
          </section>

          {/* Bottom Section - Outros Apoios */}
          <div className="space-y-8">
            {/* 1ª linha: Adopção e Apadrinhamento */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Adoção Responsável */}
              <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col justify-between min-h-[400px] hover:shadow-md transition-shadow">
                <div>
                  <PawPrint size={32} className="text-[#3b82f6] mb-4" />
                  <h3 className="text-xl font-bold text-primary-900 mb-2">Adopção Responsável</h3>
                  <p className="text-slate-500 text-sm leading-relaxed mb-4">
                    Dá um final feliz e um lar cheio de amor a quem mais precisa. A adopção responsável é um ato sublime de carinho. Conhece os nossos cães disponíveis para mudar o rumo das suas vidas.
                  </p>
                  
                  <div className="pt-4 border-t border-slate-100 space-y-2.5 text-xs text-slate-500">
                    <div>
                      <span className="font-semibold text-primary-900">Como funciona:</span> O processo é acompanhado de perto para garantir que o perfil do animal se adequa ao teu lar. Todos os animais são entregues vacinados, desparasitados e chips registados.
                    </div>
                    <div className="bg-blue-50/40 p-3 rounded-2xl border border-blue-50/50">
                      <span className="font-semibold text-blue-700">🌟 Importância:</span> Liberta espaço físico e recursos vitais na nossa associação, permitindo-nos resgatar novos animais em perigo imediato ou abandono na Nazaré.
                    </div>
                  </div>
                </div>
                <Link to="/adocao" className="inline-block text-center w-full bg-[#3b82f6] hover:bg-blue-600 text-white py-3 rounded-full font-medium transition-colors text-sm mt-6 shadow-sm hover:shadow">
                  Quero Adotar
                </Link>
              </div>

              {/* Apadrinhamento */}
              <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col justify-between min-h-[400px] hover:shadow-md transition-shadow">
                <div>
                  <Heart size={32} className="text-[#ec4899] mb-4 fill-[#ec4899]/10" />
                  <h3 className="text-xl font-bold text-primary-900 mb-2">Apadrinhamento</h3>
                  <p className="text-slate-500 text-sm leading-relaxed mb-4">
                    Não podes adoptar de momento mas queres assegurar o apoio a um patudo? Torna-te padrinho ou madrinha contribuindo mensalmente para os seus cuidados continuados.
                  </p>
                  
                  <div className="pt-4 border-t border-slate-100 space-y-2.5 text-xs text-slate-500">
                    <div>
                      <span className="font-semibold text-primary-900">Como funciona:</span> Escolhes um afilhado e contribuis com um valor mensal fixo. Podes vir visitá-lo para passeios, mimos e recebes novidades frequentes do seu estado de saúde e felicidade.
                    </div>
                    <div className="bg-pink-50/40 p-3 rounded-2xl border border-pink-50/50">
                      <span className="font-semibold text-pink-700">🌟 Importância:</span> É uma fonte de subsistência diária que assegura tratamentos de longa duração, medicação diária e alimentação premium para os animais seniores ou com patologias crónicas.
                    </div>
                  </div>
                </div>
                <Link to="/apadrinhar" className="inline-block text-center w-full bg-pink-50 hover:bg-pink-100 border border-pink-150 text-pink-700 py-3 rounded-full font-medium transition-colors text-sm mt-6">
                  Quero Apadrinhar
                </Link>
              </div>
            </div>

            {/* 2ª linha: Voluntariado, Sócio e FAT */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Voluntariado */}
              <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col justify-between min-h-[380px] hover:shadow-md transition-shadow">
                <div>
                  <HeartHandshake size={32} className="text-accent-500 mb-4" />
                  <h3 className="text-xl font-bold text-primary-900 mb-2">Voluntariado</h3>
                  <p className="text-slate-500 text-sm leading-relaxed mb-4">
                    Dá aos patudos o teu recurso mais valioso: o teu tempo. Ajuda ativamente nas tarefas diárias e faz parte de uma equipa unida pela compaixão.
                  </p>
                  
                  <div className="pt-4 border-t border-slate-100 space-y-2.5 text-xs text-slate-500">
                    <div>
                      <span className="font-semibold text-primary-900">Como funciona:</span> Podes apoiar em tarefas de limpeza física do espaço, passeios de socialização, escovagem, transporte veterinário ou voluntariado em campanhas de recolha locais.
                    </div>
                    <div className="bg-amber-50/40 p-3 rounded-2xl border border-amber-50/50">
                      <span className="font-semibold text-amber-700">🌟 Importância:</span> O contacto humano é crucial para diminuir o stresse do abrigo e reabilitar animais traumatizados, preparando-os positivamente para serem recebidos numa nova família.
                    </div>
                  </div>
                </div>
                <Link to="/ser-voluntario" className="inline-block text-center w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 py-3 rounded-full font-medium transition-colors text-sm mt-6">
                  Quero Ser Voluntário
                </Link>
              </div>

              {/* Ser Sócio */}
              <div className="bg-gradient-to-br from-primary-800 to-primary-900 p-8 rounded-[2rem] text-white shadow-md relative overflow-hidden flex flex-col justify-between min-h-[380px]">
                <div className="absolute top-0 right-0 -mr-8 -mt-8 bg-white/10 w-32 h-32 rounded-full blur-2xl"></div>
                <div>
                  <UserPlus size={32} className="text-primary-200 mb-4 relative z-10" />
                  <h3 className="text-xl font-bold mb-2 relative z-10">Fazer-se Sócio</h3>
                  <p className="text-primary-100 text-sm leading-relaxed mb-4 relative z-10">
                    Sê parte integrante da GRUVA e ajuda-nos a garantir uma base financeira sólida e representativa para o futuro dos animais na região.
                  </p>
                  
                  <div className="pt-4 border-t border-white/10 space-y-2.5 text-xs text-primary-100 relative z-10">
                    <div>
                      <span className="font-semibold text-white">Como funciona:</span> Contribuis simbólica e periodicamente através de quotas de associado fixas, assumindo um papel participativo importante com voto nas nossas decisões em assembleia geral.
                    </div>
                    <div className="bg-white/10 p-3 rounded-2xl border border-white/10">
                      <span className="font-semibold text-primary-200">🌟 Importância:</span> Dá sustentabilidade jurídica, estabilidade orçamental a curto/médio prazo e voz coletiva forte para reivindicarmos melhores políticas públicas de bem-estar animal.
                    </div>
                  </div>
                </div>
                <button disabled className="w-full bg-white/10 text-white/50 py-3 rounded-full font-medium cursor-not-allowed border border-white/10 relative z-10 mt-6">
                  Em breve (Subdomínio Externo)
                </button>
              </div>

              {/* Ser FAT */}
              <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col justify-between min-h-[380px] hover:shadow-md transition-shadow">
                <div>
                  <HomeIcon size={32} className="text-primary-500 mb-4" />
                  <h3 className="text-xl font-bold text-primary-900 mb-2">Ser FAT</h3>
                  <p className="text-slate-500 text-sm leading-relaxed mb-4">
                    Acolhe temporariamente um animal que precisa de cuidados especiais ou recuperação num ambiente familiar aconchegante.
                  </p>
                  
                  <div className="pt-4 border-t border-slate-100 space-y-2.5 text-xs text-slate-500">
                    <div>
                      <span className="font-semibold text-primary-900">Como funciona:</span> Forneces os cuidados diários e abrigo ao animal na tua casa por um período definido. Todas as despesas de alimentação e saúde são cobertas pela GRUVA.
                    </div>
                    <div className="bg-emerald-50/40 p-3 rounded-2xl border border-emerald-50/50">
                      <span className="font-semibold text-emerald-700">🌟 Importância:</span> É vital para salvar cachorros bebés sem imunidade, animais em regime pós-operatório complexo ou animais seniores que não toleram o inverno rigoroso no abrigo.
                    </div>
                  </div>
                </div>
                <Link to="/ser-fat" className="inline-block text-center w-full bg-primary-50 hover:bg-primary-100 text-primary-600 py-3 rounded-full font-medium transition-colors text-sm mt-6">
                  Quero Ser FAT
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
