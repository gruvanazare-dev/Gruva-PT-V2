import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { 
  Heart, PawPrint, User, MapPin, 
  FileText, CheckCircle2, ArrowLeft, Check, ShieldAlert
} from 'lucide-react';
import { motion } from 'motion/react';
import { dataService, Animal } from '../lib/dataService';

export default function FormularioAdocao() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const animalIdFromUrl = searchParams.get('animal_id');
  const animalNameFromUrl = searchParams.get('animal');

  const [animais, setAnimais] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    animal_id: '',
    nome: '',
    sobrenome: '',
    email: '',
    telefone: '',
    idade: '',
    localidade: '',
    motivos_adocao: '',
    outros_animais: '',
    experiencia_anterior: '',
    motivo_escolha_animal: '',
    opiniao_esterilizacao: '',
    tem_filhos: '',
    onde_vai_viver: '',
    consciente_necessidades: '',
    disponibilidade_financeira: '',
    preparado_longevidade: '',
    habitacao_propria: '',
    plano_ferias: '',
    acordo_familiar: '',
    consciente_adaptacao: '',
    outras_informacoes: '',
    aceitou_termos: false
  });

  useEffect(() => {
    async function fetchPets() {
      try {
        const pets = await dataService.getAnimais();
        setAnimais(pets);
        
        if (animalIdFromUrl) {
          setForm(f => ({ ...f, animal_id: animalIdFromUrl }));
        } else if (animalNameFromUrl) {
          const matched = pets.find(p => p.nome.toLowerCase() === animalNameFromUrl.toLowerCase());
          if (matched) {
            setForm(f => ({ ...f, animal_id: matched.id }));
          }
        }
      } catch (err) {
        console.error('Erro ao pesquisar animais:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchPets();
  }, [animalIdFromUrl, animalNameFromUrl]);

  // Prevent accidental navigation
  useEffect(() => {
    if (isSubmitted) return;
    
    const isEditing = 
      form.nome.trim() !== '' || 
      form.email.trim() !== '' || 
      form.telefone.trim() !== '';

    if (!isEditing) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [form, isSubmitted]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!form.animal_id) {
      setFormError('Por favor, seleciona um patudo da lista para adotar.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    if (!form.aceitou_termos) {
      setFormError('Para prosseguir, precisa de aceitar os termos do questionário.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setSubmitting(true);
    try {
      const selectedAnimalObj = animais.find(a => a.id === form.animal_id);
      
      const animalName = selectedAnimalObj?.nome || 'um animal';
      
      // Construir mensagem para enviar como Candidatura
      const mensagemCorpo = `
Candidatura a Adoção: ${animalName}

1. Motivos para adoção: ${form.motivos_adocao}
2. Outros animais: ${form.outros_animais}
3. Experiência anterior: ${form.experiencia_anterior}
4. Motivo escolha deste animal: ${form.motivo_escolha_animal}
5. Opinião esterilização: ${form.opiniao_esterilizacao}
6. Filhos: ${form.tem_filhos}
7. Habitação/Onde viverá: ${form.onde_vai_viver}
8. Consciente necessidades: ${form.consciente_necessidades}
9. Disponibilidade financeira: ${form.disponibilidade_financeira}
10. Preparado longevidade: ${form.preparado_longevidade}
11. Habitação própria/autorização: ${form.habitacao_propria}
12. Férias/mudanças: ${form.plano_ferias}
13. Acordo familiar: ${form.acordo_familiar}
14. Consciente adaptação: ${form.consciente_adaptacao}
15. Outras informações: ${form.outras_informacoes}
      `;

      await dataService.addMensagem({
        nome: `${form.nome} ${form.sobrenome}`.trim(),
        email: form.email,
        telefone: form.telefone,
        assunto: `Candidatura Adoção - ${animalName}`,
        mensagem: mensagemCorpo.trim()
      });

      setIsSubmitted(true);
      window.scrollTo(0, 0);
    } catch (err) {
      console.error(err);
      setFormError('Ocorreu um erro ao submeter o questionário. Por favor, tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedAnimalObj = animais.find(a => a.id === form.animal_id);

  if (isSubmitted) {
    return (
      <div className="w-full bg-slate-50 py-16 lg:py-24 min-h-screen flex items-center justify-center">
        <div className="max-w-xl w-full mx-auto px-4 sm:px-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[2.5rem] border border-slate-100 p-8 sm:p-12 text-center shadow-lg"
          >
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-500 border border-emerald-100">
              <Check className="w-10 h-10 stroke-[3]" />
            </div>
            
            <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-3">Questionário Submetido!</h1>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">
              Obrigado por nos teres enviado o teu questionário de pré-adoção para o(a) <strong className="text-pink-600 font-bold">{selectedAnimalObj?.nome || 'nosso patudo'}</strong>. Iremos analisar a candidatura e entrar em contacto com a maior brevidade possível.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/como-ajudar" className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-6 py-3 rounded-full text-xs transition-colors">
                Como Ajudar
              </Link>
              <Link to="/adocao" className="bg-primary-500 hover:bg-primary-600 shadow-md text-white font-bold px-6 py-3 rounded-full text-xs transition-all">
                Ver Outros Patudos
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-slate-50/60 py-10 lg:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        <div className="mb-6">
          <Link to="/adocao" className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-primary-950 transition-colors uppercase tracking-wider">
            <ArrowLeft size={14} /> Voltar para Adoção
          </Link>
        </div>

        <div className="bg-gradient-to-r from-primary-800 to-primary-600 rounded-[2rem] p-8 sm:p-10 text-white relative overflow-hidden mb-8 shadow-md border border-slate-950/20">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 bg-white/5 w-64 h-64 rounded-full blur-2xl"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-white/10 p-2 rounded-xl text-primary-200">
                <Heart size={20} className="fill-primary-200 text-primary-200" />
              </div>
              <span className="text-[10px] font-black tracking-widest uppercase text-slate-200">Adoção Responsável</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight mb-2">Questionário de Pré-Adoção</h1>
            <p className="text-slate-100 text-xs sm:text-sm max-w-2xl leading-relaxed opacity-90">
              Obrigado pelo seu interesse em dar um lar a um dos nossos animais. Este questionário permite-nos conhecer a futura família para garantirmos a adoção certa.
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="space-y-6">

            <div className="bg-[#fbfcff] rounded-2xl border border-blue-100 p-6 sm:p-8 shadow-sm">
              <h2 className="text-xl font-black text-[#0a4d68] mb-4">Informação sobre o Questionário</h2>
              <div className="space-y-4 text-sm text-slate-700 leading-relaxed font-medium">
                <p>
                  Antes de mais, agradecemos o seu interesse em proporcionar um lar a um dos nossos animais. O objetivo deste questionário é conhecer melhor a futura família e garantir uma adoção responsável.
                </p>
                <p>
                  A adoção é um compromisso para toda a vida e estas informações ajudam-nos a encontrar a melhor família para cada animal.
                </p>
              </div>
            </div>
            
            {formError && (
              <div className="bg-rose-50 border border-rose-100 text-rose-700 p-4 rounded-xl text-xs font-bold flex gap-3 shadow-sm">
                <ShieldAlert size={16} className="shrink-0 text-rose-500 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl text-[11.5px] font-medium flex gap-3 shadow-sm">
              <ShieldAlert size={18} className="shrink-0 text-amber-500" />
              <span>Aviso: Ao sair da página do formulário, os dados já inseridos serão apagados. Conclua o preenchimento antes de sair.</span>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-100 p-6 sm:p-8 shadow-sm space-y-8">
              
              {/* SECTION: ANIMAL */}
              <div className="space-y-5 pb-6 border-b border-slate-100">
                <div>
                  <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-2 mb-1.5">
                    <PawPrint size={18} className="text-pink-500" />
                    <span>Animal Candidato</span>
                  </h2>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 pl-1">Selecione o Patudo *</label>
                  <select
                    value={form.animal_id}
                    onChange={e => setForm({ ...form, animal_id: e.target.value })}
                    className={`w-full bg-[#f8fafc] text-xs text-slate-800 px-4 py-3 rounded-xl focus:bg-white focus:outline-none focus:ring-2 font-medium cursor-pointer ${!form.animal_id ? 'border-2 border-rose-400 focus:border-rose-400 focus:ring-rose-100' : 'border border-slate-200 focus:border-blue-500 focus:ring-blue-105'}`}
                    required
                  >
                    <option value="">-- Escolhe um patudo --</option>
                    {animais.map(a => (
                      <option key={a.id} value={a.id}>{a.nome} ({a.especie})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* SECTION: PESSOAL */}
              <div className="space-y-5 pb-6 border-b border-slate-100">
                <div>
                  <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-2 mb-1.5">
                    <User size={18} className="text-blue-500" />
                    <span>Dados Pessoais</span>
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 pl-1">Primeiro Nome *</label>
                    <input
                      type="text"
                      value={form.nome}
                      onChange={e => setForm({ ...form, nome: e.target.value })}
                      className={`w-full bg-[#f8fafc] text-xs px-4 py-3 rounded-xl focus:outline-none focus:ring-2 ${!form.nome.trim() ? 'border-2 border-rose-400 focus:border-rose-400 focus:ring-rose-100' : 'border border-slate-200 focus:ring-blue-100'}`}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 pl-1">Sobrenome *</label>
                    <input
                      type="text"
                      value={form.sobrenome}
                      onChange={e => setForm({ ...form, sobrenome: e.target.value })}
                      className={`w-full bg-[#f8fafc] text-xs px-4 py-3 rounded-xl focus:outline-none focus:ring-2 ${!form.sobrenome.trim() ? 'border-2 border-rose-400 focus:border-rose-400 focus:ring-rose-100' : 'border border-slate-200 focus:ring-blue-100'}`}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 pl-1">Idade *</label>
                    <input
                      type="number"
                      value={form.idade}
                      onChange={e => setForm({ ...form, idade: e.target.value })}
                      className={`w-full bg-[#f8fafc] text-xs px-4 py-3 rounded-xl focus:outline-none focus:ring-2 ${!form.idade.toString().trim() ? 'border-2 border-rose-400 focus:border-rose-400 focus:ring-rose-100' : 'border border-slate-200 focus:ring-blue-100'}`}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 pl-1">Localidade *</label>
                    <input
                      type="text"
                      value={form.localidade}
                      onChange={e => setForm({ ...form, localidade: e.target.value })}
                      className={`w-full bg-[#f8fafc] text-xs px-4 py-3 rounded-xl focus:outline-none focus:ring-2 ${!form.localidade.trim() ? 'border-2 border-rose-400 focus:border-rose-400 focus:ring-rose-100' : 'border border-slate-200 focus:ring-blue-100'}`}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 pl-1">E-mail *</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      className={`w-full bg-[#f8fafc] text-xs px-4 py-3 rounded-xl focus:outline-none focus:ring-2 ${!form.email.trim() ? 'border-2 border-rose-400 focus:border-rose-400 focus:ring-rose-100' : 'border border-slate-200 focus:ring-blue-100'}`}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 pl-1">Telemóvel *</label>
                    <input
                      type="tel"
                      value={form.telefone}
                      onChange={e => setForm({ ...form, telefone: e.target.value })}
                      className={`w-full bg-[#f8fafc] text-xs px-4 py-3 rounded-xl focus:outline-none focus:ring-2 ${!form.telefone.trim() ? 'border-2 border-rose-400 focus:border-rose-400 focus:ring-rose-100' : 'border border-slate-200 focus:ring-blue-100'}`}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* SECTION: QUESTIONÁRIO */}
              <div className="space-y-6 pb-6">
                <div>
                  <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-2 mb-1.5">
                    <FileText size={18} className="text-amber-500" />
                    <span>Questionário de Pré-Adoção</span>
                  </h2>
                </div>

                {[
                  { label: "Quais são os seus motivos para querer adotar?", key: 'motivos_adocao' },
                  { label: "Tem atualmente outros animais? Se sim, quais e quantos?", key: 'outros_animais' },
                  { label: "Já teve cães e/ou gatos anteriormente? Pode contar-nos um pouco dessa experiência?", key: 'experiencia_anterior' },
                  { label: `O que o(a) levou a escolher ${selectedAnimalObj?.nome ? ('o/a ' + selectedAnimalObj.nome) : 'este animal em particular'}? Há alguma preferência por idade ou sexo? Porquê?`, key: 'motivo_escolha_animal' },
                  { label: "O que pensa sobre a esterilização/castração? Concorda com esta prática? Estaria disposto(a) a assumir o compromisso de esterilizar/castrar o animal na idade recomendada (caso ainda não o esteja)?", key: 'opiniao_esterilizacao' },
                  { label: "Tem filhos? Se sim, qual a idade deles e como é a relação que têm com os animais?", key: 'tem_filhos' },
                  { label: "Onde o animal irá viver? Terá acesso ao exterior ou à via pública? Existem perigos próximos, como estradas movimentadas?", key: 'onde_vai_viver' },
                  { label: `Está consciente das necessidades específicas ${selectedAnimalObj?.nome ? ('do/a ' + selectedAnimalObj.nome) : 'deste animal'}, nomeadamente em termos de tempo, educação, socialização, cuidados veterinários e bem-estar?`, key: 'consciente_necessidades' },
                  { label: "Tem disponibilidade financeira para suportar as despesas com alimentação, vacinação, desparasitação, esterilização (quando aplicável) e eventuais cuidados veterinários inesperados?", key: 'disponibilidade_financeira' },
                  { label: "Está preparado(a) para assumir a responsabilidade de um companheiro que poderá viver, em média, entre 10 e 15 anos (ou mais, dependendo da espécie e porte)?", key: 'preparado_longevidade' },
                  { label: "Tem habitação própria? Caso seja arrendada, o senhorio autoriza a permanência de animais de companhia?", key: 'habitacao_propria' },
                  { label: "Em caso de férias, viagens, mudança de residência ou até de cidade ou país, que solução prevê para garantir o bem-estar do animal?", key: 'plano_ferias' },
                  { label: "Todos os membros do agregado familiar estão de acordo com esta adoção?", key: 'acordo_familiar' },
                  { label: "Está consciente de que a adaptação pode exigir tempo, paciência e dedicação, e compromete-se a não abandonar o animal caso surjam dificuldades?", key: 'consciente_adaptacao' },
                  { label: "Há mais alguma informação que considere importante partilhar e que possa ajudar-nos a conhecer melhor a futura família do animal?", key: 'outras_informacoes', required: false },
                ].map((q) => (
                  <div key={q.key}>
                    <label className="block text-[11.5px] font-bold text-slate-700 mb-2 pl-1 leading-relaxed">
                      {q.label} {q.required !== false && <span className="text-rose-500">*</span>}
                    </label>
                    <textarea
                      value={(form as any)[q.key]}
                      onChange={e => setForm({ ...form, [q.key]: e.target.value })}
                      rows={3}
                      className={`w-full bg-[#f8fafc] text-sm px-4 py-3 rounded-xl focus:outline-none focus:ring-2 resize-none font-medium text-slate-700 ${q.required !== false && !(form as any)[q.key]?.trim() ? 'border-2 border-rose-400 focus:border-rose-400 focus:ring-rose-100' : 'border border-slate-200 focus:ring-blue-100'}`}
                      required={q.required !== false}
                    />
                  </div>
                ))}
                
              </div>

              <div className="pt-6 border-t border-slate-100 flex items-start gap-3">
                <input
                  type="checkbox"
                  id="aceitou_termos"
                  checked={form.aceitou_termos}
                  onChange={e => setForm({ ...form, aceitou_termos: e.target.checked })}
                  className="w-5 h-5 mt-0.5 text-blue-600 rounded border-slate-300 focus:ring-blue-500 shrink-0 cursor-pointer"
                />
                <label htmlFor="aceitou_termos" className="text-sm text-slate-600 cursor-pointer leading-relaxed">
                  Declaro sob compromisso de honra que respondi a este questionário com toda a verdade e de total livre vontade, pretendendo iniciar o processo de adoção.
                </label>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 rounded-xl transition-colors shadow-sm text-sm"
                >
                  {submitting ? 'A submeter...' : 'Submeter Questionário de Adoção'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
