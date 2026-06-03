import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { 
  Heart, PawPrint, Calendar, User, MapPin, 
  CreditCard, Phone, Mail, FileText, CheckCircle2, 
  ArrowLeft, Check, Compass, ShieldAlert, Sparkles, LogIn
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { dataService, Animal } from '../lib/dataService';

export default function Apadrinhar() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const animalIdFromUrl = searchParams.get('animal_id');
  const animalNameFromUrl = searchParams.get('animal');

  // App Data
  const [animais, setAnimais] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [form, setForm] = useState({
    animal_id: '',
    nome: '',
    nome_meio: '',
    sobrenome: '',
    email: '',
    telefone: '',
    data_inicio: new Date().toISOString().split('T')[0],
    periodo: 'Até ser adotado', // '3 Meses', '6 Meses', '12 Meses', 'Até ser adotado'
    periodicidade: 'Mensal',
    
    // Adresse
    endereco: '',
    endereco_cont: '',
    localidade: '',
    codigo_postal: '',
    pais: 'Portugal',
    
    // Doc
    cartao_cidadao: '',
    nif: '',
    data_nascimento: '',
    autoriza_email: true,

    // Valores
    valor_opcao: '10', // '10', '15', '20', '25', 'outro'
    valor_outro: '',
    
    // Contribuições adicionais (Checkboxes)
    contrib_vacinas: false,
    contrib_tosquia_banho: false,
    contrib_racao_especial: false,
    contrib_medicacao: false,
    contrib_acessorios: false,
    
    // Contribuição pessoal
    contrib_pessoal_divulgacao: false,
    contrib_pessoal_passeios: false,
    
    // Assinatura
    assinatura_digital: '',
    aceitou_termos: false
  });

  // Fetch pets list
  useEffect(() => {
    async function fetchPets() {
      try {
        const pets = await dataService.getAnimais();
        setAnimais(pets);
        
        // Try pre-selecting pet
        if (animalIdFromUrl) {
          setForm(f => ({ ...f, animal_id: animalIdFromUrl }));
        } else if (animalNameFromUrl) {
          const matched = pets.find(p => p.nome.toLowerCase() === animalNameFromUrl.toLowerCase());
          if (matched) {
            setForm(f => ({ ...f, animal_id: matched.id }));
          }
        } else if (pets.length > 0) {
          setForm(f => ({ ...f, animal_id: pets[0].id }));
        }
      } catch (err) {
        console.error('Erro ao pesquisar animais:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchPets();
  }, [animalIdFromUrl, animalNameFromUrl]);

  // Handle Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Pre-validations
    if (!form.animal_id) {
      setFormError('Por favor, seleciona um patudo para apadrinhar.');
      return;
    }
    if (!form.nome || !form.sobrenome) {
      setFormError('Por favor, preenche o teu Nome e Sobrenome.');
      return;
    }
    if (!form.email || !form.telefone) {
      setFormError('Por favor, indica um email e contacto telefónico válidos.');
      return;
    }
    if (!form.nif || !form.cartao_cidadao) {
      setFormError('É necessário informar o NIF e o Cartão de Cidadão para validar a ficha oficial.');
      return;
    }
    if (!form.data_nascimento) {
      setFormError('Por favor, insere a tua data de nascimento.');
      return;
    }
    
    // Check age (Optional guidance: must be 18, if under responsibility is parent's)
    const birthDate = new Date(form.data_nascimento);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    if (age < 18) {
      setFormError('O padrinho ou madrinha deve ter mais de 18 anos. Caso sejas menor, por favor, preenche os dados em nome de um encarregado de educação ou progenitor.');
      return;
    }

    if (!form.assinatura_digital) {
      setFormError('Deves introduzir a tua assinatura digital (escrever o teu nome) para validar a ficha.');
      return;
    }
    if (!form.aceitou_termos) {
      setFormError('É necessário aceitar os termos e responsabilidades do apadrinhamento.');
      return;
    }

    setSubmitting(true);
    try {
      const finalValor = form.valor_opcao === 'outro' ? parseFloat(form.valor_outro) : parseFloat(form.valor_opcao);
      if (isNaN(finalValor) || finalValor < 10) {
        setFormError('O valor mensal mínimo de contribuição do apadrinhamento é de 10,00 €.');
        setSubmitting(false);
        return;
      }

      // Calculate final target end-date if not indefinite
      let finalEndDate = '';
      if (form.periodo === '3 Meses') {
        const d = new Date(form.data_inicio);
        d.setMonth(d.getMonth() + 3);
        finalEndDate = d.toISOString().split('T')[0];
      } else if (form.periodo === '6 Meses') {
        const d = new Date(form.data_inicio);
        d.setMonth(d.getMonth() + 6);
        finalEndDate = d.toISOString().split('T')[0];
      } else if (form.periodo === '12 Meses') {
        const d = new Date(form.data_inicio);
        d.setFullYear(d.getFullYear() + 1);
        finalEndDate = d.toISOString().split('T')[0];
      }

      // Record database insertion
      const fullName = `${form.nome} ${form.nome_meio ? form.nome_meio + ' ' : ''}${form.sobrenome}`.trim();
      
      await dataService.addPadrinho({
        animal_id: form.animal_id,
        nome: fullName,
        email: form.email,
        telefone: form.telefone,
        valor_mensal: finalValor,
        data_inicio: form.data_inicio,
        estado: 'Pendente', // Inicia Pendente para o Administrador validar conforme PDF
        periodicidade: form.periodicidade,
        observacoes: `Endereço: ${form.endereco}, ${form.endereco_cont} - ${form.codigo_postal} ${form.localidade}, ${form.pais}. NIF: ${form.nif}, CC: ${form.cartao_cidadao}. Data Nasc: ${form.data_nascimento}`,
        periodo: form.periodo,
        data_fim: finalEndDate,
        
        // Extended fields saved in the local DB record
        endereco: form.endereco,
        endereco_cont: form.endereco_cont,
        localidade: form.localidade,
        codigo_postal: form.codigo_postal,
        pais: form.pais,
        cartao_cidadao: form.cartao_cidadao,
        nif: form.nif,
        data_nascimento: form.data_nascimento,
        autoriza_email: form.autoriza_email,
        contrib_vacinas: form.contrib_vacinas,
        contrib_tosquia_banho: form.contrib_tosquia_banho,
        contrib_racao_especial: form.contrib_racao_especial,
        contrib_medicacao: form.contrib_medicacao,
        contrib_acessorios: form.contrib_acessorios,
        contrib_pessoal_divulgacao: form.contrib_pessoal_divulgacao,
        contrib_pessoal_passeios: form.contrib_pessoal_passeios,
        assinatura_digital: form.assinatura_digital
      });

      setIsSubmitted(true);
      window.scrollTo(0, 0);
    } catch (err) {
      console.error(err);
      setFormError('Ocorreu um erro ao submeter a tua ficha de apadrinhamento. Por favor, tenta novamente.');
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
            
            <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-3">Ficha Submetida!</h1>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">
              Muito obrigado pelo teu carinho e nobreza em apadrinhar o(a) <strong className="text-pink-600 font-bold">{selectedAnimalObj?.nome || 'nosso patudo'}</strong>. O teu pedido foi recebido com sucesso na nossa consola administrativa na Nazaré.
            </p>

            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 text-left text-xs text-amber-900 space-y-3.5 mb-8">
              <p className="font-bold flex items-center gap-1.5 text-amber-800 uppercase tracking-wide">
                <ShieldAlert size={14} /> Próximos Passos Obrigatórios:
              </p>
              <p className="leading-relaxed">
                1. <strong>Pagamento da primeira mensalidade ({form.valor_opcao === 'outro' ? form.valor_outro : form.valor_opcao}€)</strong>: Efetua o envio através de:
              </p>
              <div className="bg-white/80 rounded-xl p-3.5 space-y-1 text-slate-700 font-mono text-[11px] border border-amber-200/40">
                <p>🚀 <strong>MBWay</strong>: <span className="font-bold">968 537 272</span></p>
                <p>🏦 <strong>IBAN</strong>: <span className="font-bold select-all">PT50 0045 5020 4034 5236 0979 4</span></p>
              </div>
              <p className="leading-relaxed">
                2. <strong>Envia comprovativo</strong> de pagamento para o nosso e-mail <a href="mailto:geral@gruva.pt" className="underline font-bold hover:text-blue-500">geral@gruva.pt</a> contendo o teu nome de padrinho.
              </p>
              <p className="leading-relaxed text-[11px] text-slate-500 italic">
                * Conforme regulamento da GRUVA, a inscrição de apadrinhamento será aprovada pelo administrador após a validação do primeiro pagamento. Em caso de não receção num prazo de 10 dias, a ficha de registo será anulada.
              </p>
            </div>

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
    <div className="w-full bg-slate-50 py-16 lg:py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Return Button */}
        <div className="mb-6">
          <Link to="/como-ajudar" className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-primary-950 transition-colors uppercase tracking-wider">
            <ArrowLeft size={14} /> Voltar para Como Ajudar
          </Link>
        </div>

        {/* Banner Card Header */}
        <div className="bg-gradient-to-r from-primary-800 to-primary-900 rounded-[2.5rem] p-8 sm:p-12 text-white relative overflow-hidden mb-10 shadow-lg border border-primary-950/20">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 bg-white/10 w-64 h-64 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 bg-pink-500/10 w-64 h-64 rounded-full blur-2xl animate-pulse"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-white/15 p-2 rounded-2xl text-accent-300">
                <Heart size={28} className="fill-accent-300/20" />
              </div>
              <span className="text-xs font-black tracking-widest uppercase text-primary-205 font-mono">Nazaré Recinto</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight mb-3">Ficha de Apadrinhamento Individual</h1>
            <p className="text-primary-100 text-sm max-w-2xl leading-relaxed">
              Apadrinhar um animal residente na Nazaré é dar-lhe uma oportunidade estável de sobrevivência, cuidados médicos continuados e mimos na ausência de uma adoção imediata. 
            </p>
          </div>
        </div>

        {/* Layout Container */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Form Fields (2 cols) */}
          <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-8">
            
            {formError && (
              <div className="bg-rose-50 border border-rose-100 text-rose-700 p-5 rounded-2xl text-xs font-bold flex gap-3 shadow-sm">
                <ShieldAlert size={18} className="shrink-0 text-rose-500" />
                <span>{formError}</span>
              </div>
            )}

            {/* SEÇÃO 1: Escolha do Afilhado */}
            <div className="bg-white rounded-[2rem] border border-slate-100 p-6 sm:p-8 shadow-sm">
              <h2 className="text-lg font-black text-slate-800 flex items-center gap-2.5 mb-6 border-b border-slate-100 pb-3">
                <PawPrint size={18} className="text-pink-500" />
                <span>1. Escolha do Afilhado</span>
              </h2>

              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Selecione o Animal *</label>
                  {loading ? (
                    <div className="py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-400">A carregar patudos...</div>
                  ) : (
                    <select
                      value={form.animal_id}
                      onChange={e => setForm({ ...form, animal_id: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-205 text-xs text-slate-808 px-4 py-3.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium cursor-pointer"
                      required
                    >
                      <option value="">-- Escolhe um patudo da GRUVA --</option>
                      {animais.map(a => (
                        <option key={a.id} value={a.id}>{a.nome} ({a.especie} - {a.idade_aprox})</option>
                      ))}
                    </select>
                  )}
                  <span className="text-[10px] text-slate-400 block mt-1.5 pl-1">Se não encontrares o animal pretendido, por favor indica-nos.</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Início do Apadrinhamento</label>
                    <div className="relative">
                      <Calendar size={14} className="absolute left-4 top-3.5 text-slate-400" />
                      <input
                        type="date"
                        value={form.data_inicio}
                        onChange={e => setForm({ ...form, data_inicio: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-205 text-xs text-slate-808 pl-11 pr-4 py-3 rounded-2xl focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Período Contratado</label>
                    <select
                      value={form.periodo}
                      onChange={e => setForm({ ...form, periodo: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-205 text-xs text-slate-808 px-4 py-3 rounded-2xl focus:outline-none"
                    >
                      <option value="3 Meses">3 Meses</option>
                      <option value="6 Meses">6 Meses</option>
                      <option value="12 Meses">12 Meses</option>
                      <option value="Até ser adotado">Até ser adotado (Indeterminado)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* SEÇÃO 2: Dados Pessoais */}
            <div className="bg-white rounded-[2rem] border border-slate-100 p-6 sm:p-8 shadow-sm">
              <h2 className="text-lg font-black text-slate-800 flex items-center gap-2.5 mb-6 border-b border-slate-100 pb-3">
                <User size={18} className="text-blue-500" />
                <span>2. Dados Pessoais do Padrinho / Madrinha</span>
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Nome *</label>
                    <input
                      type="text"
                      value={form.nome}
                      onChange={e => setForm({ ...form, nome: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-205 text-xs text-slate-808 px-4 py-3 rounded-2xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Primeiro"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Nome do Meio</label>
                    <input
                      type="text"
                      value={form.nome_meio}
                      onChange={e => setForm({ ...form, nome_meio: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-205 text-xs text-slate-808 px-4 py-3 rounded-2xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Se aplicável"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Sobrenome *</label>
                    <input
                      type="text"
                      value={form.sobrenome}
                      onChange={e => setForm({ ...form, sobrenome: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-205 text-xs text-slate-808 px-4 py-3 rounded-2xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Apelidos"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Data de Nascimento *</label>
                    <input
                      type="date"
                      value={form.data_nascimento}
                      onChange={e => setForm({ ...form, data_nascimento: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-205 text-xs text-slate-808 px-4 py-3 rounded-2xl focus:outline-none"
                      required
                    />
                    <span className="text-[9px] text-slate-400 block mt-1 pl-1">Exigido ser maior de 18 anos.</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">NIF (Contribuinte) *</label>
                      <input
                        type="text"
                        value={form.nif}
                        onChange={e => setForm({ ...form, nif: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-205 text-xs text-slate-808 px-4 py-3 rounded-2xl focus:outline-none"
                        placeholder="9 algarismos"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Cartão Cidadão *</label>
                      <input
                        type="text"
                        value={form.cartao_cidadao}
                        onChange={e => setForm({ ...form, cartao_cidadao: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-205 text-xs text-slate-808 px-4 py-3 rounded-2xl focus:outline-none"
                        placeholder="N.º documento"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100/60">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Endereço de Residência *</label>
                  <input
                    type="text"
                    value={form.endereco}
                    onChange={e => setForm({ ...form, endereco: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-205 text-xs text-slate-808 px-4 py-3 rounded-2xl focus:outline-none mb-3"
                    placeholder="Rua, Avenida, Praça, Lote, Andar..."
                    required
                  />
                  <input
                    type="text"
                    value={form.endereco_cont}
                    onChange={e => setForm({ ...form, endereco_cont: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-205 text-xs text-slate-808 px-4 py-3 rounded-2xl focus:outline-none mb-3"
                    placeholder="Complemento / Bloco / Apartamento"
                  />
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Localidade *</label>
                      <input
                        type="text"
                        value={form.localidade}
                        onChange={e => setForm({ ...form, localidade: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-205 text-xs text-slate-808 px-4 py-3 rounded-2xl focus:outline-none"
                        placeholder="Nazaré, Alcobaça, etc."
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Código Postal *</label>
                      <input
                        type="text"
                        value={form.codigo_postal}
                        onChange={e => setForm({ ...form, codigo_postal: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-205 text-xs text-slate-808 px-4 py-3 rounded-2xl focus:outline-none"
                        placeholder="0000-000"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">País</label>
                      <input
                        type="text"
                        value={form.pais}
                        onChange={e => setForm({ ...form, pais: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-205 text-xs text-slate-808 px-4 py-3 rounded-2xl focus:outline-none"
                        placeholder="Portugal"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <Phone size={12} className="text-slate-400" /> Telemóvel *
                    </label>
                    <input
                      type="tel"
                      value={form.telefone}
                      onChange={e => setForm({ ...form, telefone: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-205 text-xs text-slate-808 px-4 py-3 rounded-2xl focus:outline-none"
                      placeholder="9xxxxxxxx"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <Mail size={12} className="text-slate-400" /> E-mail de Contacto *
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-205 text-xs text-slate-808 px-4 py-3 rounded-2xl focus:outline-none"
                      placeholder="exemplo@gmail.com"
                      required
                    />
                  </div>
                </div>

                <div className="pt-3 flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="autoriza_email"
                    checked={form.autoriza_email}
                    onChange={e => setForm({ ...form, autoriza_email: e.target.checked })}
                    className="w-4 h-4 text-blue-500 rounded border-slate-300 focus:ring-blue-500"
                  />
                  <label htmlFor="autoriza_email" className="text-slate-600 text-xs font-semibold select-none leading-normal">
                    Autorizo expressamente a GRUVA a contactar-me por e-mail para receber novidades do abrigo e do meu afilhado.
                  </label>
                </div>
              </div>
            </div>

            {/* SEÇÃO 3: Contribuição Financeira e Outros */}
            <div className="bg-white rounded-[2rem] border border-slate-100 p-6 sm:p-8 shadow-sm">
              <h2 className="text-lg font-black text-slate-800 flex items-center gap-2.5 mb-6 border-b border-slate-100 pb-3">
                <CreditCard size={18} className="text-emerald-500" />
                <span>3. Valores e Contribuição Desejada</span>
              </h2>

              {/* Informações de pagamento */}
              <div className="bg-slate-50/70 p-4 border border-slate-100 rounded-2xl mb-6">
                <p className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-2">Canais de Contribuição Disponíveis:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-605">
                  <div className="flex items-start gap-2.5">
                    <span className="bg-pink-100 text-pink-600 p-1.5 rounded-lg text-[10px] font-bold font-mono">MBWay</span>
                    <div>
                      <p className="font-bold text-slate-800">968 537 272</p>
                      <p className="text-[10px] text-slate-405">GRUVA Nazaré</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="bg-blue-100 text-blue-600 p-1.5 rounded-lg text-[10px] font-bold font-mono">IBAN</span>
                    <div>
                      <p className="font-bold text-slate-805 select-all">PT50 0045 5020 4034 5236 0979 4</p>
                      <p className="text-[10px] text-slate-405">Enviar comprovativo por e-mail</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-404 uppercase tracking-wider mb-2.5">Valor Mensal (Trata-se de uma contribuição mensal obrigatória de valor mínimo de 10,00 €) *</label>
                
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5 mb-4">
                  {[
                    { val: '10', lbl: '10,00 €' },
                    { val: '15', lbl: '15,00 €' },
                    { val: '20', lbl: '20,00 €' },
                    { val: '25', lbl: '25,00 €' }
                  ].map(opt => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => setForm({ ...form, valor_opcao: opt.val, valor_outro: '' })}
                      className={`py-3.5 px-4 font-bold border transition-all text-xs rounded-2xl ${
                        form.valor_opcao === opt.val
                          ? 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/15'
                          : 'bg-white border-slate-205 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {opt.lbl}
                    </button>
                  ))}
                  
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, valor_opcao: 'outro' })}
                    className={`col-span-2 sm:col-span-1 py-3.5 px-4 font-bold border transition-all text-xs rounded-2xl ${
                      form.valor_opcao === 'outro'
                        ? 'bg-emerald-500 text-white border-emerald-500'
                        : 'bg-white border-slate-205 text-slate-705 hover:bg-slate-50'
                    }`}
                  >
                    Outro Valor
                  </button>
                </div>

                {form.valor_opcao === 'outro' && (
                  <div className="mb-4">
                    <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Inserir valor personalizado (€) *</label>
                    <input
                      type="number"
                      min="10"
                      value={form.valor_outro}
                      onChange={e => setForm({ ...form, valor_outro: e.target.value })}
                      placeholder="Exemplo: 50.00"
                      className="bg-slate-50 border border-slate-205 text-xs text-slate-808 px-4 py-3 rounded-2xl focus:outline-none w-full sm:max-w-xs focus:ring-1 focus:ring-emerald-500"
                      required={form.valor_opcao === 'outro'}
                    />
                  </div>
                )}
              </div>

              {/* Outras contribuições */}
              <div className="pt-4 border-t border-slate-100 space-y-4">
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2.5">Desejas assumir outras despesas? (Opcional)</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { id: 'contrib_vacinas', lbl: 'Vacinas (Suportar despesa vacinal anual)' },
                      { id: 'contrib_tosquia_banho', lbl: 'Tosquia / Banho do afilhado' },
                      { id: 'contrib_racao_especial', lbl: 'Ração especial (Caso necessite de gastrite/hipoalergénica)' },
                      { id: 'contrib_medicacao', lbl: 'Medicação (Custos de anti-inflamatórios ou tratamentos)' },
                      { id: 'contrib_acessorios', lbl: 'Acessórios (Trela, coleira, peitoral, brinquedos...)' }
                    ].map(cb => (
                      <div key={cb.id} className="flex items-center gap-2.5 bg-[#f8fafc] border border-slate-100 p-2.5 rounded-xl">
                        <input
                          type="checkbox"
                          id={cb.id}
                          checked={(form as any)[cb.id]}
                          onChange={e => setForm({ ...form, [cb.id]: e.target.checked })}
                          className="w-4 h-4 text-emerald-500 rounded border-slate-300 focus:ring-emerald-500 shrink-0"
                        />
                        <label htmlFor={cb.id} className="text-slate-600 text-[11px] font-medium leading-none select-none cursor-pointer">
                          {cb.lbl}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2.5">Desejas contribuir de forma presencial / pessoal?</h3>
                  <div className="grid grid-cols-1 gap-2.5">
                    <div className="flex items-center gap-2.5 bg-pink-50/20 border border-pink-100/10 p-2.5 rounded-xl">
                      <input
                        type="checkbox"
                        id="contrib_pessoal_divulgacao"
                        checked={form.contrib_pessoal_divulgacao}
                        onChange={e => setForm({ ...form, contrib_pessoal_divulgacao: e.target.checked })}
                        className="w-4 h-4 text-pink-500 rounded border-slate-300 focus:ring-pink-500 shrink-0"
                      />
                      <label htmlFor="contrib_pessoal_divulgacao" className="text-slate-600 text-[11px] font-semibold leading-none cursor-pointer">
                        Divulgação ativa do meu afilhado para adoção responsável (redes sociais, fotos, panfletos)
                      </label>
                    </div>

                    <div className="flex items-center gap-2.5 bg-pink-50/20 border border-pink-100/10 p-2.5 rounded-xl">
                      <input
                        type="checkbox"
                        id="contrib_pessoal_passeios"
                        checked={form.contrib_pessoal_passeios}
                        onChange={e => setForm({ ...form, contrib_pessoal_passeios: e.target.checked })}
                        className="w-4 h-4 text-pink-500 rounded border-slate-300 focus:ring-pink-500 shrink-0"
                      />
                      <label htmlFor="contrib_pessoal_passeios" className="text-slate-600 text-[11px] font-semibold cursor-pointer">
                        Vir passeá-lo temporariamente, escová-lo, mimá-lo ou estar com ele na zona controlada do canil
                      </label>
                    </div>
                    <span className="text-[10px] text-pink-600 font-medium pl-1 block">
                      ** Nota de Segurança: Por razões psicológicas, não é permitido levar o animal para passar o fim-de-semana fora da zona do canil, pois o regresso ao abrigo é altamente doloroso para o animal.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* SEÇÃO 4: Confirmação de Escolhas & Assinatura Digital */}
            <div className="bg-white rounded-[2rem] border border-slate-100 p-6 sm:p-8 shadow-sm">
              <h2 className="text-lg font-black text-slate-800 flex items-center gap-2.5 mb-6 border-b border-slate-100 pb-3">
                <FileText size={18} className="text-blue-500" />
                <span>4. Declaração de Assinatura</span>
              </h2>

              <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-xl text-[11px] text-slate-500 leading-relaxed font-sans space-y-2 border border-slate-150">
                  <p>
                    <strong>Declaração de Consentimento:</strong> Ao preencher esta ficha e introduzir o meu nome abaixo, declaro expressamente que fui informado, antes de assinar eletronicamente este documento, de que os meus dados pessoais são confidenciais e serão usados exclusivamente para a gestão interna da minha relação com a GRUVA e emissão de avisos ou para me parabenizar.
                  </p>
                  <p>
                    Compreendo e aceito que o compromisso assenta na responsabilidade civil voluntária de apoiar a subsistência do patudo mencionado, sob quota mensal a partir do dia 10 de cada mês subsequente.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Escreve o teu Nome Completo (Assinatura Eletrónica) *</label>
                  <input
                    type="text"
                    value={form.assinatura_digital}
                    onChange={e => setForm({ ...form, assinatura_digital: e.target.value })}
                    className="w-full bg-[#fcfdff] border border-blue-200/80 text-lg text-blue-900 px-4 py-3.5 rounded-2xl italic font-serif tracking-wide focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Assinar eletronicamente..."
                    required
                  />
                  <span className="text-[10px] text-slate-400 block mt-1.5 pl-1">Escreve exatamente o teu nome de forma a constar na Ficha do Livro de Ouro da GRUVA.</span>
                </div>

                <div className="flex items-start gap-2.5 pt-3">
                  <input
                    type="checkbox"
                    id="aceitou_termos"
                    checked={form.aceitou_termos}
                    onChange={e => setForm({ ...form, aceitou_termos: e.target.checked })}
                    className="w-4 h-4 text-blue-500 rounded border-slate-302 focus:ring-blue-500 mt-0.5 shrink-0"
                    required
                  />
                  <label htmlFor="aceitou_termos" className="text-slate-600 text-xs font-black select-none cursor-pointer leading-tight">
                    Declaro sob compromisso de honra que preenchi os dados em plena verdade, tenho mais de 18 anos e autorizo o envio eletrónico do apadrinhamento para aprovação administrativa da associação.
                  </label>
                </div>
              </div>
            </div>

            {/* BOTÃO DE SUBMISSAO */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={submitting}
                className={`w-full bg-primary-500 hover:bg-primary-600 text-white font-extrabold py-4 px-6 rounded-full text-sm block tracking-widest text-center uppercase shadow-md hover:shadow-lg transition-all ${
                  submitting ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {submitting ? 'A Enviar Ficha...' : 'Submeter Ficha de Apadrinhamento'}
              </button>
            </div>

          </form>

          {/* Sidebar Guidelines Summary / Info Cards (1 col) */}
          <div className="space-y-6">
            
            {/* Animal Card Spotlight if preselected */}
            {selectedAnimalObj && (
              <div className="bg-white rounded-[2rem] border border-slate-100 p-5 shadow-sm overflow-hidden flex flex-col">
                <span className="text-[9.5px] font-black uppercase text-pink-600 tracking-wider mb-2.5 font-mono block">Afilhado Escolhido:</span>
                <div className="relative aspect-[3/2] rounded-2xl overflow-hidden mb-4 bg-slate-50">
                  {selectedAnimalObj.foto_url ? (
                    <img 
                      src={selectedAnimalObj.foto_url} 
                      alt={selectedAnimalObj.nome}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <PawPrint size={32} />
                    </div>
                  )}
                  <span className="absolute bottom-3 left-3 bg-white/95 text-slate-800 font-extrabold text-[10px] px-2.5 py-0.5 rounded-full border border-slate-100 capitalize">
                    {selectedAnimalObj.idade_aprox}
                  </span>
                </div>
                <h3 className="font-extrabold text-lg text-primary-950 mb-1.5">{selectedAnimalObj.nome}</h3>
                <p className="text-slate-500 text-[11.5px] line-clamp-3 leading-relaxed mb-1.5">{selectedAnimalObj.descricao}</p>
                <div className="h-px bg-slate-100 my-2"></div>
                <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono mt-1">
                  <span>Espécie: {selectedAnimalObj.especie}</span>
                  <span>Porte: {selectedAnimalObj.porte}</span>
                </div>
              </div>
            )}

            {/* O que significa Apadrinhar (PDF Page 1 OCR summary) */}
            <div className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm space-y-4">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2 border-b border-slate-100 pb-2">
                <Compass size={14} className="text-blue-500" />
                <span>O que significa Apadrinhar?</span>
              </h3>
              <p className="text-slate-500 text-xs leading-relaxed">
                Apadrinhar é um ato de solidariedade ao alcance de todos os que querem apoiar os "animais de ninguém". Ao ser padrinho ou madrinha, crias um vínculo especial com o animal, garantindo que ele tenha cuidados dedicados durante a estadia no abrigo.
              </p>
              <ul className="text-[11px] text-slate-500 leading-normal space-y-2 list-disc pl-4 font-medium">
                <li>O animal continua disponível para adoção responsável.</li>
                <li>Caso ele seja adotado, podes transferir o teu apadrinhamento para outro amigo.</li>
                <li>Qualquer pessoa pode apadrinhar um ou mais patudos!</li>
              </ul>
            </div>

            {/* Como funciona a cessão (regulamento) */}
            <div className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm space-y-4">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2 border-b border-slate-100 pb-2">
                <ShieldAlert size={14} className="text-amber-500" />
                <span>Extinção do Vínculo</span>
              </h3>
              <p className="text-slate-500 text-xs leading-relaxed">
                O estatuto de padrinho ou madrinha é flexível. Podes cessar ou alterar a inscrição a qualquer momento:
              </p>
              <div className="space-y-2 text-[11px] text-slate-500 leading-relaxed font-semibold">
                <p className="flex gap-2 text-rose-700 bg-rose-50/40 p-2 rounded-xl">
                  <span>🛑</span>
                  <span>Caso o padrinho não efetue qualquer contribuição financeira por período consecutivo de 3 meses, o vínculo será extinto unilateralmente.</span>
                </p>
                <p className="flex gap-2 text-slate-650 bg-slate-50 p-2 rounded-xl">
                  <span>✉️</span>
                  <span>Basta enviar um e-mail ou carta escrita comunicando a vontade de deixar de ter esse estatuto. Sem burocracias.</span>
                </p>
              </div>
            </div>

            {/* Informação sobre fins de semana */}
            <div className="bg-[#fffdfa] rounded-[2rem] border border-amber-100/50 p-6 shadow-sm space-y-3">
              <h3 className="text-xs font-black text-amber-800 uppercase tracking-widest flex items-center gap-2">
                <Sparkles size={14} className="text-amber-500" />
                <span>Nota Psicológica Importante</span>
              </h3>
              <p className="text-amber-900/80 text-[11px] leading-relaxed">
                De salientar que não é permitido levar o animal para passar o fim-de-semana fora da zona do canil. Estudo comportamentais da associação provam que o retorno ao espaço habitual do abrigo é extremamente doloroso e confuso para o cão. Apoia-nos com passeios frequentes na região autorizada!
              </p>
            </div>

            {/* Quick Access Admin link */}
            <div className="bg-slate-100 rounded-3xl p-4 text-center border border-slate-200/50">
              <p className="text-[10px] text-slate-400 font-bold mb-2 uppercase">Já és administrador do abrigo?</p>
              <Link to="/admin" className="inline-flex items-center gap-1 text-[11px] font-black text-blue-600 bg-white hover:bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200 transition-colors">
                <LogIn size={11} /> Conconsola Administrativa
              </Link>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
