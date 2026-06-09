import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { 
  Heart, PawPrint, Calendar, User, MapPin, 
  CreditCard, Phone, Mail, FileText, CheckCircle2, 
  ArrowLeft, Check, Compass, ShieldAlert, Sparkles, LogIn,
  Edit2, Eraser, ChevronLeft, ChevronRight, ShieldCheck, Info
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
    valor_opcao: '', // '', '10', '15', '20', '25', 'outro'
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

  // Signature customization states

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isCanvasDrawingEmpty, setIsCanvasDrawingEmpty] = useState(true);

  // Drawing event coordinate calculator
  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    let clientX = 0;
    let clientY = 0;
    
    if ('touches' in e) {
      if (e.touches.length === 0) return null;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (e.cancelable) e.preventDefault();

    const coords = getCoordinates(e);
    if (!coords) return;

    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (e.cancelable) e.preventDefault();

    const coords = getCoordinates(e);
    if (!coords) return;

    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
    setIsCanvasDrawingEmpty(false);
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    saveCanvasSignature();
  };

  const saveCanvasSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas || isCanvasDrawingEmpty) return;
    const dataUrl = canvas.toDataURL('image/png');
    setForm(f => ({ ...f, assinatura_digital: dataUrl }));
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setIsCanvasDrawingEmpty(true);
    setForm(f => ({ ...f, assinatura_digital: '' }));
  };



  // Adjust canvas size on mount and on orientation shift
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight || 180;

    // Premium styling options for ink drawing
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#005b7f'; // Beautiful teal-blue ink matching GRUVA branding
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, [canvasRef.current]);

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

  // Prevent accidental navigation
  useEffect(() => {
    if (isSubmitted) return;
    
    // Check if form has been partially filled out
    const isEditing = 
      form.nome.trim() !== '' || 
      form.email.trim() !== '' || 
      form.telefone.trim() !== '' || 
      form.nif.trim() !== '';

    if (!isEditing) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = ''; // Standard behavior for modern browsers to show a warning
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [form, isSubmitted]);

  // Handle Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Pre-validations
    if (!form.animal_id) {
      setFormError('Por favor, seleciona um patudo da lista para apadrinhar.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (!form.data_inicio) {
      setFormError('Por favor, indica a data de início do apadrinhamento.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (!form.nome.trim() || !form.sobrenome.trim()) {
      setFormError('Por favor, preenche o teu Primeiro Nome e Sobrenome completo.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (!form.data_nascimento) {
      setFormError('Por favor, preenche a tua Data de Nascimento.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    // Check age (at least 18)
    const birthDate = new Date(form.data_nascimento);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    if (age < 18) {
      setFormError('O padrinho ou madrinha deve ter mais de 18 anos. Caso sejas menor, por favor, preenche os dados em nome de um encarregado de educação ou progenitor.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (!form.nif || form.nif.trim().length !== 9 || !/^\d{9}$/.test(form.nif.trim())) {
      setFormError('O NIF (Número de Identificação Fiscal) é obrigatório e deve ter exatamente 9 algarismos.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (!form.cartao_cidadao.trim()) {
      setFormError('O Número de Cartão de Cidadão é obrigatório para o registo oficial.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (!form.endereco.trim()) {
      setFormError('Por favor, preenche o teu endereço de residência.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (!form.localidade.trim()) {
      setFormError('Por favor, indica a tua localidade.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (!form.codigo_postal.trim()) {
      setFormError('Por favor, indica o teu Código Postal.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (!form.telefone.trim()) {
      setFormError('Indica um contacto telefónico de Telemóvel válido.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) {
      setFormError('Por favor, introduz um formato de E-mail de contacto válido.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const finalValor = form.valor_opcao === 'outro' ? parseFloat(form.valor_outro) : parseFloat(form.valor_opcao);
    if (isNaN(finalValor) || finalValor < 10) {
      setFormError('O valor mensal de contribuição do apadrinhamento tem de ser no mínimo de 10,00 €.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (isCanvasDrawingEmpty || !form.assinatura_digital.startsWith('data:image/')) {
      setFormError('Por favor, desenha e assina a tua assinatura digital no quadro correspondente.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (!form.aceitou_termos) {
      setFormError('É de aceitação obrigatória sob compromisso de honra os termos do apadrinhamento.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setSubmitting(true);
    try {
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
        observacoes: `Morada: ${form.endereco}, ${form.endereco_cont} - ${form.codigo_postal} ${form.localidade}, ${form.pais}. NIF: ${form.nif}, CC: ${form.cartao_cidadao}. Data Nasc: ${form.data_nascimento}`,
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

  // Check completion states for collapsing logic
  const isStep1Done = !!(form.animal_id && form.data_inicio);
  
  // To keep it simple, we ask the user to fill out the most critical fields of step 2 to unlock step 3
  const isStep2Done = isStep1Done && !!(form.nome.trim() && form.sobrenome.trim() && form.nif.trim() && form.cartao_cidadao.trim() && form.endereco.trim() && form.localidade.trim() && form.codigo_postal.trim() && form.telefone.trim() && form.email.trim());

  let isStep3Done = false;
  if (isStep2Done && form.valor_opcao !== '') {
    if (form.valor_opcao === 'outro') {
      const v = parseFloat(form.valor_outro);
      if (!isNaN(v) && v >= 10) isStep3Done = true;
    } else {
      isStep3Done = true;
    }
  }

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
              <div className="bg-white/80 rounded-xl p-3.5 space-y-1 text-slate-700  text-[11px] border border-amber-200/40">
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
    <div className="w-full bg-slate-50/60 py-10 lg:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Return Button */}
        <div className="mb-6">
          <Link to="/como-ajudar" className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-primary-950 transition-colors uppercase tracking-wider">
            <ArrowLeft size={14} /> Voltar para Como Ajudar
          </Link>
        </div>

        {/* Banner Card Header */}
        <div className="bg-gradient-to-r from-[#033649] to-[#0a4d68] rounded-[2rem] p-8 sm:p-10 text-white relative overflow-hidden mb-8 shadow-md border border-slate-950/20">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 bg-white/5 w-64 h-64 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 bg-pink-500/10 w-64 h-64 rounded-full blur-2xl"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-white/10 p-2 rounded-xl text-accent-300">
                <Heart size={20} className="fill-accent-a33 text-pink-400" />
              </div>
              <span className="text-[10px] font-black tracking-widest uppercase text-slate-250 font-mono">Apadrinhamento Individual</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight mb-2">Ficha de Apadrinhamento</h1>
            <p className="text-slate-200 text-xs sm:text-sm max-w-2xl leading-relaxed opacity-90">
              Ao tornares-te padrinho ou madrinha, garantes sustento e assistência médica contínua ao patudo da tua escolha. Completa esta ficha em poucos minutos.
            </p>
          </div>
        </div>

        {/* FORM STATUS OVERVIEW */}
        <div className="bg-white rounded-2xl border border-slate-100 p-4 mb-8 shadow-sm">
          <div className="grid grid-cols-4 gap-2 text-center max-w-3xl mx-auto">
            {[
              { num: 1, label: 'Afilhado', icon: PawPrint, done: !!form.animal_id },
              { num: 2, label: 'Dados Pessoais', icon: User, done: !!(form.nome && form.sobrenome && form.email && form.telefone && form.nif) },
              { num: 3, label: 'Mensalidade', icon: CreditCard, done: true },
              { num: 4, label: 'Assinatura', icon: FileText, done: !!form.assinatura_digital }
            ].map(s => {
              const IconComp = s.icon;
              return (
                <div key={s.num} className="flex flex-col items-center gap-1.5">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                    s.done 
                      ? 'bg-emerald-500 text-white' 
                      : 'bg-[#0a4d68]/10 text-[#0a4d68]'
                  }`}>
                    {s.done ? <Check size={16} className="stroke-[3]" /> : <IconComp size={15} />}
                  </div>
                  <span className={`text-[10px] sm:text-xs font-bold ${
                    s.done ? 'text-emerald-600' : 'text-[#0a4d68]'
                  }`}>
                    {s.num}. {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Layout Container */}
        <div className="max-w-4xl mx-auto">
          
          {/* Main Unified Form Content */}
          <div className="space-y-6">

            {/* INFORMATIVE TEXT */}
            <div className="bg-[#fbfcff] rounded-2xl border border-blue-100 p-6 sm:p-8 shadow-sm">
              <h2 className="text-xl font-black text-[#0a4d68] mb-4">O que significa APADRINHAR?</h2>
              <div className="space-y-4 text-sm text-slate-700 leading-relaxed font-medium">
                <p>
                  Apadrinhar é um ato de solidariedade que está ao alcance de todos os que querem ajudar/apoiar os animais de ninguém. Ao ser padrinho ou madrinha está a criar um vínculo com o animal e a ajudar-nos a melhorar a sua vida. Qualquer pessoa pode apadrinhar um ou mais animais. Mesmo com padrinho ou madrinha, continuarão para adoção responsável e, caso sejam adotados, poderão sempre escolher outro(s) para apadrinhar.
                </p>
                
                <div>
                  <h3 className="font-bold text-slate-900 mb-1">Não pode ser padrinho ou madrinha:</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Caso tenha menos de 18 anos (neste caso um dos progenitores terá que ficar como responsável).</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 mb-1">O cidadão pode deixar de apadrinhar um animal:</h3>
                  <ul className="list-disc pl-5 space-y-1 text-slate-600">
                    <li>Caso o padrinho ou madrinha não exerça qualquer função num prazo de 3 meses o vínculo será extinto (salvo em casos devidamente identificados);</li>
                    <li>Caso o padrinho ou madrinha, através de comunicação por email ou carta escrita, expresse a vontade de deixar de ter esse estatuto.</li>
                  </ul>
                </div>

                <div className="pt-2">
                  <h3 className="font-bold text-slate-900 mb-2 uppercase text-xs tracking-wider">Muito importante:</h3>
                  <ol className="list-decimal pl-5 space-y-2 text-slate-600">
                    <li>O apadrinhamento de um animal assenta na responsabilidade de promover o bem-estar do mesmo com uma contribuição mensal obrigatória de 10€.</li>
                    <li>Todos os animais continuam para adoção mesmo tendo um padrinho ou madrinha.</li>
                    <li>Findo o período de apadrinhamento o padrinho ou madrinha será contatado pela Associação para uma possível renovação do mesmo.</li>
                    <li>A Associação, na qualidade de responsável pelo tratamento dos dados pessoais no âmbito da relação agora estabelecida, procederá à sua conservação apenas durante o período em que durar o apadrinhamento e 2 anos após o fim da relação vigente.</li>
                    <li>O Padrinho ou Madrinha declara expressamente que foi informado, antes de assinar este documento, que os seus dados pessoais só serão usados de forma interna e para o parabenizar e/ou informar de situações que digam única e exclusivamente respeito à relação que tem agora com a Associação.</li>
                  </ol>
                </div>
              </div>
            </div>
            
            {formError && (
              <div className="bg-rose-50 border border-rose-100 text-rose-700 p-4 rounded-xl text-xs font-bold flex gap-3 shadow-sm">
                <ShieldAlert size={16} className="shrink-0 text-rose-500 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            {/* WARNING ABOUT DATA LOSS */}
            <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl text-[11.5px] font-medium flex gap-3 shadow-sm">
              <ShieldAlert size={18} className="shrink-0 text-amber-500" />
              <span>Aviso: Ao sair da página do formulário de apadrinhamento, os dados já inseridos serão apagados. Por favor, conclua o preenchimento antes de navegar para outras secções.</span>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-100 p-6 sm:p-8 shadow-sm space-y-8">
              
              {/* SECTION 1: ESCOLHA DO AFILHADO */}
              <div className="space-y-5 pb-6 border-b border-slate-100">
                <div>
                  <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-2 mb-1.5">
                    <PawPrint size={18} className="text-pink-500" />
                    <span>1. Escolha do Afilhado</span>
                  </h2>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    Selecione o patudo que deseja apadrinhar e a data de início da sua contribuição mensal de suporte.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 pl-1">Selecione o Patudo na lista *</label>
                    {loading ? (
                      <div className="py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-400">A carregar patudos...</div>
                    ) : (
                      <select
                        value={form.animal_id}
                        onChange={e => setForm({ ...form, animal_id: e.target.value })}
                        className={`w-full bg-[#f8fafc] text-xs text-slate-800 px-4 py-3 rounded-xl focus:bg-white focus:outline-none focus:ring-2 font-medium cursor-pointer ${!form.animal_id ? 'border-2 border-rose-400 focus:ring-rose-100 focus:border-rose-400' : 'border border-slate-200 focus:border-blue-500 focus:ring-blue-105'}`}
                        required
                      >
                        <option value="">-- Escolhe um patudo da GRUVA --</option>
                        {animais.map(a => (
                          <option key={a.id} value={a.id}>{a.nome} ({a.especie} - {a.idade_aprox})</option>
                        ))}
                      </select>
                    )}
                    <span className="text-[9.5px] text-slate-400 block mt-1 pl-1 leading-normal">
                      Se o animal pretendido não estiver na lista ou necessitares de ajuda, contacta o nosso abrigo.
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 pl-1">Início do Apadrinhamento *</label>
                      <div className="relative">
                        <Calendar size={13} className="absolute left-4 top-3.5 text-slate-400" />
                        <input
                          type="date"
                          value={form.data_inicio}
                          onChange={e => setForm({ ...form, data_inicio: e.target.value })}
                          className={`w-full bg-[#f8fafc] text-xs text-slate-800 pl-11 pr-4 py-3 rounded-xl focus:bg-white focus:outline-none ${!form.data_inicio ? 'border-2 border-rose-400 focus:ring-rose-100 focus:border-rose-400' : 'border border-slate-200 focus:border-blue-500'}`}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 pl-1 ">Período de Apoio *</label>
                      <select
                        value={form.periodo}
                        onChange={e => setForm({ ...form, periodo: e.target.value })}
                        className="w-full bg-[#f8fafc] border border-slate-200 text-xs text-slate-800 px-4 py-3 rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none font-medium"
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

              {/* SECTION 2: DADOS PESSOAIS */}
              <div className={`space-y-5 pb-6 border-b border-slate-100 transition-opacity duration-300 ${isStep1Done ? '' : 'opacity-40 pointer-events-none'}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-2 mb-1.5">
                      <User size={18} className={isStep1Done ? "text-blue-500" : "text-slate-400"} />
                      <span>2. Dados do Padrinho ou Madrinha</span>
                    </h2>
                    <p className="text-[11px] text-slate-400 leading-normal">
                      Informa os dados necessários para que possamos emitir o respetivo certificado oficial de apadrinhamento.
                    </p>
                  </div>
                  {!isStep1Done && <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md uppercase tracking-widest shrink-0">Complete Passo 1</span>}
                </div>

                {isStep1Done && (
                  <div className="space-y-4">
                  {/* Name fields row */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 pl-1">Nome Próprio *</label>
                      <input
                        type="text"
                        value={form.nome}
                        onChange={e => setForm({ ...form, nome: e.target.value })}
                        className={`w-full bg-[#f8fafc] text-xs text-slate-800 px-4 py-3 rounded-xl focus:bg-white focus:outline-none ${!form.nome.trim() ? 'border-2 border-rose-400 focus:ring-rose-100 focus:border-rose-400' : 'border border-slate-200 focus:border-blue-500'}`}
                        placeholder="Primeiro"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 pl-1">Nomes do Meio</label>
                      <input
                        type="text"
                        value={form.nome_meio}
                        onChange={e => setForm({ ...form, nome_meio: e.target.value })}
                        className="w-full bg-[#f8fafc] border border-slate-200 text-xs text-slate-800 px-4 py-3 rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none"
                        placeholder="Se aplicável"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 pl-1">Apelidos *</label>
                      <input
                        type="text"
                        value={form.sobrenome}
                        onChange={e => setForm({ ...form, sobrenome: e.target.value })}
                        className={`w-full bg-[#f8fafc] text-xs text-slate-800 px-4 py-3 rounded-xl focus:bg-white focus:outline-none ${!form.sobrenome.trim() ? 'border-2 border-rose-400 focus:ring-rose-100 focus:border-rose-400' : 'border border-slate-200 focus:border-blue-500'}`}
                        placeholder="Último"
                        required
                      />
                    </div>
                  </div>

                  {/* Birthday & CC & NIF row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 pl-1">Data de Nascimento *</label>
                      <input
                        type="date"
                        value={form.data_nascimento}
                        onChange={e => setForm({ ...form, data_nascimento: e.target.value })}
                        className={`w-full bg-[#f8fafc] text-xs text-slate-800 px-4 py-3 rounded-xl focus:bg-white focus:outline-none ${!form.data_nascimento ? 'border-2 border-rose-400 focus:ring-rose-100 focus:border-rose-400' : 'border border-slate-200 focus:border-blue-500'}`}
                        required
                      />
                      <span className="text-[9px] text-slate-400 block mt-1 pl-1 leading-none">Obrigatório ser maior de 18 anos.</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 pl-1">NIF (Contribuinte) *</label>
                        <input
                          type="text"
                          value={form.nif}
                          maxLength={9}
                          onChange={e => setForm({ ...form, nif: e.target.value })}
                          className={`w-full bg-[#f8fafc] text-xs text-slate-800 px-4 py-3 rounded-xl focus:bg-white focus:outline-none ${!form.nif.trim() ? 'border-2 border-rose-400 focus:ring-rose-100 focus:border-rose-400' : 'border border-slate-200 focus:border-blue-500'}`}
                          placeholder="9 algarismos"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 pl-1">Cartão Cidadão *</label>
                        <input
                          type="text"
                          value={form.cartao_cidadao}
                          onChange={e => setForm({ ...form, cartao_cidadao: e.target.value })}
                          className={`w-full bg-[#f8fafc] text-xs text-slate-800 px-4 py-3 rounded-xl focus:bg-white focus:outline-none ${!form.cartao_cidadao.trim() ? 'border-2 border-rose-400 focus:ring-rose-100 focus:border-rose-400' : 'border border-slate-200 focus:border-blue-500'}`}
                          placeholder="N.º documento"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Address info */}
                  <div className="pt-2 border-t border-slate-100">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 pl-1">Endereço de Residência Completo *</label>
                    <input
                      type="text"
                      value={form.endereco}
                      onChange={e => setForm({ ...form, endereco: e.target.value })}
                      className={`w-full bg-[#f8fafc] text-xs text-slate-800 px-4 py-3 rounded-xl focus:bg-white focus:outline-none mb-3 ${!form.endereco.trim() ? 'border-2 border-rose-400 focus:ring-rose-100 focus:border-rose-400' : 'border border-slate-200 focus:border-blue-500'}`}
                      placeholder="Rua, Avenida, Praça, Lote, Andar..."
                      required
                    />
                    <input
                      type="text"
                      value={form.endereco_cont}
                      onChange={e => setForm({ ...form, endereco_cont: e.target.value })}
                      className="w-full bg-[#f8fafc] border border-slate-200 text-xs text-slate-800 px-4 py-3 rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none mb-3"
                      placeholder="Complemento / Bloco / Apartamento (Opcional)"
                    />
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 pl-1">Localidade *</label>
                        <input
                          type="text"
                          value={form.localidade}
                          onChange={e => setForm({ ...form, localidade: e.target.value })}
                          className={`w-full bg-[#f8fafc] text-xs text-slate-800 px-4 py-3 rounded-xl focus:bg-white focus:outline-none ${!form.localidade.trim() ? 'border-2 border-rose-400 focus:ring-rose-100 focus:border-rose-400' : 'border border-slate-200 focus:border-blue-500'}`}
                          placeholder="Nazaré, Alcobaça, etc."
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 pl-1">Código Postal *</label>
                        <input
                          type="text"
                          value={form.codigo_postal}
                          placeholder="0000-000"
                          onChange={e => setForm({ ...form, codigo_postal: e.target.value })}
                          className={`w-full bg-[#f8fafc] text-xs text-slate-800 px-4 py-3 rounded-xl focus:bg-white focus:outline-none ${!form.codigo_postal.trim() ? 'border-2 border-rose-400 focus:ring-rose-100 focus:border-rose-400' : 'border border-slate-200 focus:border-blue-500'}`}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 pl-1">País *</label>
                        <input
                          type="text"
                          value={form.pais}
                          onChange={e => setForm({ ...form, pais: e.target.value })}
                          className={`w-full bg-[#f8fafc] text-xs text-slate-800 px-4 py-3 rounded-xl focus:bg-white focus:outline-none ${!form.pais.trim() ? 'border-2 border-rose-400 focus:ring-rose-100 focus:border-rose-400' : 'border border-slate-200 focus:border-blue-500'}`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Contact row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 pl-1 flex items-center gap-1.5">
                        <Phone size={12} className="text-slate-400" /> Telemóvel *
                      </label>
                      <input
                        type="tel"
                        value={form.telefone}
                        onChange={e => setForm({ ...form, telefone: e.target.value })}
                        className={`w-full bg-[#f8fafc] text-xs text-slate-800 px-4 py-3 rounded-xl focus:bg-white focus:outline-none ${!form.telefone.trim() ? 'border-2 border-rose-400 focus:ring-rose-100 focus:border-rose-400' : 'border border-slate-200 focus:border-blue-500'}`}
                        placeholder="ex: 9xxxxxxxx"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 pl-1 flex items-center gap-1.5">
                        <Mail size={12} className="text-slate-400" /> E-mail de Contacto *
                      </label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={e => setForm({ ...form, email: e.target.value })}
                        className={`w-full bg-[#f8fafc] text-xs text-slate-800 px-4 py-3 rounded-xl focus:bg-white focus:outline-none ${!form.email.trim() ? 'border-2 border-rose-400 focus:ring-rose-100 focus:border-rose-400' : 'border border-slate-200 focus:border-blue-500'}`}
                        placeholder="exemplo@gmail.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="autoriza_email"
                      checked={form.autoriza_email}
                      onChange={e => setForm({ ...form, autoriza_email: e.target.checked })}
                      className="w-4 h-4 text-[#0a4d68] rounded border-slate-300 focus:ring-[#0a4d68]"
                    />
                    <label htmlFor="autoriza_email" className="text-slate-600 text-[11px] font-semibold select-none leading-normal">
                      Autorizo expressamente a GRUVA a enviar e-mails relativos ao abrigo e ao meu afilhado.
                    </label>
                  </div>
                </div>
                )}
              </div>

              {/* SECTION 3: VALORES E QUOTA */}
              <div className={`space-y-6 pb-6 border-b border-slate-100 transition-opacity duration-300 ${isStep2Done ? '' : 'opacity-40 pointer-events-none'}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-2 mb-1.5">
                      <CreditCard size={18} className={isStep2Done ? "text-emerald-500" : "text-slate-400"} />
                      <span>3. Valores e Quota de Apadrinhamento</span>
                    </h2>
                    <p className="text-[11px] text-slate-400 leading-normal">
                      Trata-se de uma quota mensal continuada (mínimo de 10,00 €) para garantir a subsistência digna do animal.
                    </p>
                  </div>
                  {!isStep2Done && <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md uppercase tracking-widest shrink-0">Complete Passo 2</span>}
                </div>

                {isStep2Done && (
                  <div className="space-y-4">
                  {/* Valor picker buttons */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase mb-2 pl-1">Selecione a Quota Mensal Pretendida *</label>
                    
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
                          className={`py-3 px-2 font-bold border transition-all text-xs rounded-xl ${
                            form.valor_opcao === opt.val
                              ? 'bg-[#0a4d68] text-white border-[#0a4d68] shadow-sm'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {opt.lbl}
                        </button>
                      ))}
                      
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, valor_opcao: 'outro' })}
                        className={`col-span-2 sm:col-span-1 py-3 px-2 font-bold border transition-all text-xs rounded-xl ${
                          form.valor_opcao === 'outro'
                            ? 'bg-[#0a4d68] text-white border-[#0a4d68] shadow-sm'
                            : 'bg-white border-slate-200 text-slate-750 hover:bg-slate-50'
                        }`}
                      >
                        Outro Valor
                      </button>
                    </div>

                    {form.valor_opcao === 'outro' && (
                      <div className="bg-[#0a4d68]/5 p-4 rounded-2xl border border-[#0a4d68]/15 mb-4">
                        <label className="block text-[10px] font-bold text-[#0a4d68] uppercase mb-1.5 pl-1">Inserir valor personalizado mensal (Mínimo 10 €) *</label>
                        <div className="relative max-w-xs">
                          <input
                            type="number"
                            min="10"
                            value={form.valor_outro}
                            onChange={e => setForm({ ...form, valor_outro: e.target.value })}
                            placeholder="ex: 50.00"
                            className={`bg-white text-xs text-slate-800 px-4 py-2.5 rounded-xl focus:outline-none w-full focus:ring-2 ${!form.valor_outro || parseFloat(form.valor_outro) < 10 ? 'border-2 border-rose-400 focus:ring-rose-100 focus:border-rose-400' : 'border border-slate-200 focus:ring-[#0a4d68]/20 focus:border-[#0a4d68]/40'}`}
                            required={form.valor_opcao === 'outro'}
                          />
                          <div className="absolute right-4 top-2 text-slate-400 font-bold text-xs">EUR</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Outras despesas */}
                  <div className="pt-4 border-t border-slate-100 space-y-4">
                    <div>
                      <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">Suportar outras despesas voluntárias? (Opcional)</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {[
                          { id: 'contrib_vacinas', lbl: 'Vacinas (Suportar despesa vacinal anual)' },
                          { id: 'contrib_tosquia_banho', lbl: 'Tosquias e Banhos' },
                          { id: 'contrib_racao_especial', lbl: 'Ração Especial/Veterinária (se necessária)' },
                          { id: 'contrib_medicacao', lbl: 'Tratamento Medicamentoso ou Suplementação' },
                          { id: 'contrib_acessorios', lbl: 'Acessórios e Brinquedos' }
                        ].map(cb => (
                          <div key={cb.id} className="flex items-center gap-2.5 bg-[#f8fafc] border border-slate-150 p-2.5 rounded-xl hover:bg-slate-100/50 transition-colors">
                            <input
                              type="checkbox"
                              id={cb.id}
                              checked={(form as any)[cb.id]}
                              onChange={e => setForm({ ...form, [cb.id]: e.target.checked })}
                              className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 shrink-0"
                            />
                            <label htmlFor={cb.id} className="text-slate-600 text-[11px] font-semibold leading-normal select-none cursor-pointer">
                              {cb.lbl}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Presencial Help */}
                    <div className="pt-2">
                      <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">Pretende efetuar ajuda presencial? (Opcional)</h3>
                      <div className="space-y-2.5">
                        <div className="flex items-center gap-2.5 bg-pink-50/10 border border-pink-100/10 p-2.5 rounded-xl">
                          <input
                            type="checkbox"
                            id="contrib_pessoal_divulgacao"
                            checked={form.contrib_pessoal_divulgacao}
                            onChange={e => setForm({ ...form, contrib_pessoal_divulgacao: e.target.checked })}
                            className="w-4 h-4 text-pink-500 rounded border-slate-300 focus:ring-pink-500 shrink-0"
                          />
                          <label htmlFor="contrib_pessoal_divulgacao" className="text-slate-650 text-[11px] font-bold leading-normal cursor-pointer">
                            Divulgação ativa do meu afilhado para adoção (partilhas nas redes sociais)
                          </label>
                        </div>

                        <div className="flex items-center gap-2.5 bg-pink-50/10 border border-pink-100/10 p-2.5 rounded-xl">
                          <input
                            type="checkbox"
                            id="contrib_pessoal_passeios"
                            checked={form.contrib_pessoal_passeios}
                            onChange={e => setForm({ ...form, contrib_pessoal_passeios: e.target.checked })}
                            className="w-4 h-4 text-pink-500 rounded border-slate-300 focus:ring-pink-500 shrink-0"
                          />
                          <label htmlFor="contrib_pessoal_passeios" className="text-slate-650 text-[11px] font-bold leading-normal cursor-pointer">
                            Passeios ao cão, escovar ou dar mimos dentro do recinto na Nazaré
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                )}
              </div>

              {/* SECTION 4: ASSINATURA E SUBMISSAO */}
              <div className={`space-y-6 transition-opacity duration-300 ${isStep3Done ? '' : 'opacity-40 pointer-events-none'}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-2 mb-1.5">
                      <FileText size={18} className={isStep3Done ? "text-blue-500" : "text-slate-400"} />
                      <span>4. Assinatura Digital & Autorização</span>
                    </h2>
                    <p className="text-[11px] text-slate-400 leading-normal">
                      Declaração de consentimento e recolha de assinatura eletrónica obrigatória para efeito protocolar.
                    </p>
                  </div>
                  {!isStep3Done && <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md uppercase tracking-widest shrink-0">Complete Passo 3</span>}
                </div>

                {isStep3Done && (
                  <div className="space-y-4">
                  {/* Consent text */}
                  <div className="bg-slate-50 p-4 rounded-xl text-[10.5px] text-slate-500 leading-relaxed font-sans space-y-2 border border-slate-100">
                    <p>
                      <strong>Declaração de Consentimento:</strong> Ao preencher esta ficha e introduzir a minha assinatura abaixo, declaro expressamente que fui informado, antes de assinar eletronicamente este documento, de que os meus dados pessoais são confidenciais e serão usados exclusivamente para a gestão interna da minha relação com a GRUVA e emissão de avisos ou para me parabenizar.
                    </p>
                    <p>
                      Compreendo e aceito que o compromisso assenta na responsabilidade civil voluntária de apoiar a subsistência do patudo mencionado, sob quota mensal a partir do dia 10 de cada mês subsequente.
                    </p>
                  </div>

                  <div className="space-y-3">
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Desenhe a tua Assinatura no Quadro Abaixo *
                      </label>
                      
                      <div className="relative border-2 border-dashed border-blue-200 bg-[#fbfcff] rounded-2xl overflow-hidden p-1 shadow-sm">
                        {/* Signature canvas */}
                        <canvas
                          ref={canvasRef}
                          onMouseDown={startDrawing}
                          onMouseMove={draw}
                          onMouseUp={stopDrawing}
                          onMouseLeave={stopDrawing}
                          onTouchStart={startDrawing}
                          onTouchMove={draw}
                          onTouchEnd={stopDrawing}
                          className="w-full h-40 bg-white rounded-xl cursor-crosshair block touch-none"
                        />
                        
                        {/* Decorative line indicating signature spot */}
                        <div className="absolute bottom-4 left-6 right-6 pointer-events-none flex items-end justify-between border-b border-slate-200 pb-1">
                          <span className="text-slate-300  text-lg italic select-none">X</span>
                          <span className="text-[8px] text-slate-300 font-sans uppercase tracking-wider select-none">Assina sobre a linha</span>
                        </div>

                        {isCanvasDrawingEmpty && (
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-400 text-[10px]">
                            <p className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100 shadow-sm font-semibold">
                              <Sparkles size={12} className="text-blue-500 animate-pulse shrink-0" />
                              <span>Usa o rato ou ecrã tátil para assinar</span>
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <button
                          type="button"
                          onClick={clearCanvas}
                          className="text-xs text-red-600 hover:text-red-700 font-bold bg-red-50 hover:bg-red-100 border border-red-200/60 transition-all py-1.5 px-3 rounded-xl flex items-center gap-1"
                        >
                          <Eraser size={11} />
                          <span>Limpar Quadro</span>
                        </button>

                        {!isCanvasDrawingEmpty && (
                          <span className="text-[10px] text-emerald-650 font-black flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-lg">
                            <CheckCircle2 size={12} className="shrink-0 text-emerald-600" />
                            <span>Capturada</span>
                          </span>
                        )}
                      </div>
                    </div>

                  <div className="flex items-start gap-2.5 pt-3 border-t border-slate-100">
                    <input
                      type="checkbox"
                      id="aceitou_termos"
                      checked={form.aceitou_termos}
                      onChange={e => setForm({ ...form, aceitou_termos: e.target.checked })}
                      className="w-4 h-4 text-blue-500 rounded border-slate-300 focus:ring-blue-500 mt-0.5 shrink-0"
                      required
                    />
                    <label htmlFor="aceitou_termos" className="text-slate-600 text-[11px] font-bold select-none cursor-pointer leading-tight">
                      Declaro sob compromisso de honra que preenchi os dados com total verdade, autorizando o envio digital para aprovação correspondente da GRUVA Nazaré.
                    </label>
                  </div>
                </div>
                )}
              </div>

              {/* SUBMIT BUTTON */}
              <div className={`pt-8 mt-8 border-t border-slate-100 flex justify-end transition-opacity duration-300 ${isStep3Done ? '' : 'hidden'}`}>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white transition-all text-xs font-bold shadow-md shadow-emerald-500/10 ${
                    submitting ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  <ShieldCheck size={14} />
                  <span>{submitting ? 'A submeter...' : 'Submeter Ficha Oficial'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}

// Simple dot spinner placeholder component inside the same file to keep imports standard
function SpinnerDot() {
  return (
    <span className="relative flex h-2 w-2 mr-0.5">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
      <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
    </span>
  );
}
