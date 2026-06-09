import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Lock, Mail, User, LogOut, PawPrint, AlertTriangle, 
  ShieldCheck, RefreshCw, ChevronRight, X, Menu, Award, Heart, Database
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { dataService, Animal, Mensagem, Padrinho } from '../lib/dataService';
import { supabase } from '../lib/supabase';

// Subcomponents
import AdminPatudosTab from '../components/AdminPatudosTab';
import AdminMensagensTab from '../components/AdminMensagensTab';
import AdminPadrinhosTab from '../components/AdminPadrinhosTab';

export default function Admin() {
  const navigate = useNavigate();

  // Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Dashboard Data State
  const [animais, setAnimais] = useState<Animal[]>([]);
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [padrinhos, setPadrinhos] = useState<Padrinho[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [activeTab, setActiveTab] = useState<'patudos' | 'mensagens' | 'padrinhos'>('patudos');

  // Mobile navigation drawer toggle
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Load session from localStorage on mount
  useEffect(() => {
    const adminSession = localStorage.getItem('gruva_admin_logged_in');
    if (adminSession === 'true') {
      setIsLoggedIn(true);
      fetchDashboardData();
    }
  }, []);

  const fetchDashboardData = async () => {
    setLoadingData(true);
    try {
      // 1. Carregar dados locais de imediato (rápido e não bloqueia a interface)
      const [pets, msgs, pads] = await Promise.all([
        dataService.getAnimais(),
        dataService.getMensagens(),
        dataService.getPadrinhos()
      ]);
      setAnimais(pets);
      setMensagens(msgs);
      setPadrinhos(pads);

      // 2. Disparar sincronização em segundo plano de forma automática e transparente
      dataService.syncLocalToSupabase().then((res) => {
        if (res && res.errors.length === 0 && (res.animaisInserted > 0 || res.padrinhosInserted > 0 || res.mensagensInserted > 0)) {
          console.log('Sincronização automática com o Supabase efetuada com sucesso:', res);
          // Se existirem atualizações, atualizamos o estado local
          Promise.all([
            dataService.getAnimais(),
            dataService.getMensagens(),
            dataService.getPadrinhos()
          ]).then(([updatedPets, updatedMsgs, updatedPads]) => {
            setAnimais(updatedPets);
            setMensagens(updatedMsgs);
            setPadrinhos(updatedPads);
          });
        }
      }).catch(err => {
        console.warn('Processo automático de sync local-Supabase em background ignorado:', err);
      });

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoadingData(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    try {
      // 1. Tentar fazer login via Supabase Autenticação (Users)
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (!error && data?.user) {
        localStorage.setItem('gruva_admin_logged_in', 'true');
        setIsLoggedIn(true);
        fetchDashboardData();
        return;
      }

      // 2. Se falhar ou não existir o utilizador no Supabase Auth, temos o fallback local de testes
      if (email.trim() === 'a@a.pt' && password === '123456') {
        localStorage.setItem('gruva_admin_logged_in', 'true');
        setIsLoggedIn(true);
        fetchDashboardData();
      } else {
        const errMsg = error ? error.message : 'Credenciais inválidas no Supabase Auth.';
        setLoginError(`Erro: ${errMsg} (Caso precises, podes usar a conta de testes: a@a.pt / 123456).`);
      }
    } catch (err: any) {
      console.error('Supabase authentication error:', err);
      if (email.trim() === 'a@a.pt' && password === '123456') {
        localStorage.setItem('gruva_admin_logged_in', 'true');
        setIsLoggedIn(true);
        fetchDashboardData();
      } else {
        setLoginError('Ligar ao Supabase falhou. Conta teste disponível: a@a.pt / 123456.');
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('gruva_admin_logged_in');
    setIsLoggedIn(false);
  };

  const fillQuickCredentials = () => {
    setEmail('a@a.pt');
    setPassword('123456');
    setLoginError('');
  };

  // Menu items config - only keeping "Gerir Patudos", "Mensagens", and "Gestão de Padrinhos"
  const menuItems = [
    { id: 'patudos', label: 'Gerir Patudos', icon: <PawPrint size={18} />, badge: animais.length },
    { id: 'mensagens', label: 'Mensagens', icon: <Mail size={18} />, badge: mensagens.filter(m => !m.lida).length },
    { id: 'padrinhos', label: 'Gestão de Padrinhos', icon: <Heart size={18} />, badge: padrinhos.length },
  ] as const;

  if (!isLoggedIn) {
    return (
      <div className="w-full min-h-[90vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50/50">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden"
          id="admin-login-card"
        >
          <div className="bg-gradient-to-r from-primary-800 to-primary-900 px-8 py-10 text-white text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 bg-white/10 w-48 h-48 rounded-full blur-2xl"></div>
            <div className="mx-auto bg-white/15 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
              <Lock size={32} className="text-accent-300" />
            </div>
            <h1 className="text-2xl font-bold ">GRUVA Admin</h1>
            <p className="text-primary-100 text-sm mt-1">Insere as tuas credenciais de acesso para gerir os patudos e os contactos.</p>
          </div>

          <div className="p-8">
            {loginError && (
              <div className="bg-red-50 text-red-700 p-4 rounded-2xl mb-6 text-sm flex gap-3 border border-red-100 font-medium">
                <AlertTriangle size={20} className="shrink-0 text-red-500" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-primary-900 mb-2">Endereço de Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <User size={18} />
                  </div>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="exemplo@gruva.pt"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 pl-11 pr-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-primary-900 mb-2">Senha Secreta</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Lock size={18} />
                  </div>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 pl-11 pr-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full bg-primary-500 text-white font-semibold py-3.5 rounded-full hover:bg-primary-600 shadow-md hover:shadow-lg transition-all"
              >
                Iniciar Sessão
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-500 mb-3">Está apenas a testar o website administrador?</p>
              <button 
                onClick={fillQuickCredentials}
                className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-accent-600 bg-accent-50 hover:bg-accent-100 px-3 py-2 rounded-full transition-all"
              >
                <ShieldCheck size={14} /> Ativar sessão de teste (a@a.pt)
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col md:flex-row font-sans" id="admin-workspace-grid">
      
      {/* MOBILE HEADER CONSOLE BAR */}
      <div className="md:hidden bg-[#0a1826] text-white px-6 py-4 flex items-center justify-between border-b border-[#142e47] shrink-0 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-extrabold ">G</div>
          <span className="font-black tracking-tight text-sm text-slate-100">Painel GRUVA</span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-slate-350 hover:text-white"
        >
          {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* MOBILE NAVIGATION DRAWER OVERLAY */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: -280 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -280 }}
            className="md:hidden fixed inset-y-0 left-0 bg-[#0a1826] text-slate-300 w-72 z-50 p-6 flex flex-col justify-between shadow-2xl overflow-y-auto border-r border-[#142e47]"
          >
            <div>
              <div className="flex items-center justify-between mb-8 pb-3 border-b border-[#142e47]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-black">G</div>
                  <span className="font-black text-sm text-slate-100">GRUVA Nazaré</span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="text-slate-400 hover:text-white p-1">
                  <X size={18} />
                </button>
              </div>

              <nav className="space-y-1.5">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id as any);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold text-xs transition-colors ${
                      activeTab === item.id 
                        ? 'bg-blue-500 text-white' 
                        : 'text-slate-350 hover:bg-slate-800/50 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {item.icon}
                      <span>{item.label}</span>
                    </div>
                    {'badge' in item && typeof item.badge === 'number' && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${activeTab === item.id ? 'bg-white text-blue-600' : 'bg-[#152e4a] text-slate-400'}`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>

            <div className="pt-6 border-t border-[#142e47] mt-8">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 bg-red-400/10 hover:bg-red-400/20 text-red-400 font-bold p-3 rounded-xl text-xs transition-colors"
              >
                <LogOut size={16} />
                <span>Sair da Conta</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DESKTOP SIDEBAR - PERSISTENT MIDNIGHT BLUE */}
      <div className="hidden md:flex w-72 bg-[#0c1f36] text-slate-300 h-screen sticky top-0 flex-col justify-between py-8 px-6 text-slate-350 border-r border-[#152e4a] shrink-0 overflow-y-auto">
        <div>
          {/* Brand header */}
          <div className="flex items-center gap-3.5 mb-10 pb-5 border-b border-slate-700/30">
            <div className="w-10 h-10 rounded-2xl bg-blue-500 flex items-center justify-center text-white shadow-md shadow-blue-500/10">
              <PawPrint size={22} className="fill-blue-100" />
            </div>
            <div>
              <h2 className="font-black text-slate-100 text-sm tracking-tight leading-none">GRUVA</h2>
              <span className="text-[10px] text-slate-450 uppercase tracking-widest font-bold font-mono block mt-1">Nazaré Recinto</span>
            </div>
          </div>

          {/* Nav container */}
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl font-bold text-xs transition-all ${
                  activeTab === item.id 
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/15' 
                    : 'text-slate-350 hover:bg-slate-800/40 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {'badge' in item && typeof item.badge === 'number' && (
                  <span className={`text-[9.5px] px-2 py-0.5 rounded-full font-bold ${
                    activeTab === item.id ? 'bg-[#ffffff]/25 text-white' : 'bg-[#152e4a] text-slate-400'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Administrator profile badge and Logout */}
        <div className="mt-8 pt-6 border-t border-slate-700/30 font-sans">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-slate-700 flex items-center justify-center font-bold text-white text-xs uppercase font-mono">
                AD
              </div>
              <div className="min-w-0">
                <p className="text-xs font-black text-slate-200 leading-tight">Administrador</p>
                <p className="text-[10px] text-slate-500 truncate mt-0.5">a@a.pt</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-slate-450 hover:text-red-400 hover:bg-slate-800/40 rounded-xl transition-all"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* MAIN VIEWPORT WORKSPACE AREA */}
      <div className="flex-grow min-w-0 flex flex-col md:h-screen md:overflow-y-auto min-h-[calc(100vh-56px)]">
        
        {/* TOP COMPACT STATUS & QUICK REFRESH ROW */}
        <div className="bg-white border-b border-slate-100 py-4 px-4 sm:px-6 lg:px-10 flex items-center justify-between shrink-0 sticky top-0 md:relative z-20 shadow-sm md:shadow-none">
          <div className="flex items-center gap-1.5 text-[10.5px] font-extrabold text-slate-400 tracking-wider">
            <Award size={14} className="text-emerald-500 animate-pulse" />
            <span className="uppercase hidden xs:inline">CONSOLA ADMINISTRATIVA</span>
            <span className="uppercase xs:hidden">CONSOLA</span>
            <ChevronRight size={12} className="text-slate-300" />
            <span className="text-slate-500 uppercase truncate max-w-[120px]">
              {menuItems.find(i => i.id === activeTab)?.label}
            </span>
          </div>
        </div>

        {/* WORKSPACE CONTENT BODY */}
        <div className="flex-grow p-4 sm:p-6 lg:p-10">
          
          {loadingData ? (
            <div className="bg-white rounded-[2.5rem] border border-slate-100 p-28 flex flex-col items-center justify-center text-slate-500 shadow-md">
              <RefreshCw size={44} className="animate-spin mb-4 text-blue-500" />
              <p className="text-xs font-extrabold uppercase tracking-widest text-slate-400">GRUVA Recinto</p>
              <p className="text-xs text-slate-450 mt-1">A carregar registos da base de dados local...</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                {activeTab === 'patudos' && (
                  <AdminPatudosTab
                    animais={animais}
                    onRefresh={fetchDashboardData}
                  />
                )}

                {activeTab === 'mensagens' && (
                  <AdminMensagensTab
                    mensagens={mensagens}
                    onRefresh={fetchDashboardData}
                  />
                )}

                {activeTab === 'padrinhos' && (
                  <AdminPadrinhosTab
                    padrinhos={padrinhos}
                    animais={animais}
                    onRefresh={fetchDashboardData}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          )}

        </div>

      </div>

    </div>
  );
}
