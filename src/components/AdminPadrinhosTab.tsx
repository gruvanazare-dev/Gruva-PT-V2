import React, { useState } from 'react';
import { 
  Heart, Plus, Edit, Trash2, PawPrint, Mail, Phone, Calendar, 
  DollarSign, SlidersHorizontal, AlertTriangle, ArrowUpDown, 
  ArrowUp, ArrowDown, X, Check, Info, User, CreditCard
} from 'lucide-react';
import { Animal, Padrinho, dataService } from '../lib/dataService';

interface AdminPadrinhosTabProps {
  padrinhos: Padrinho[];
  animais: Animal[];
  onRefresh: () => void;
}

export default function AdminPadrinhosTab({ padrinhos, animais, onRefresh }: AdminPadrinhosTabProps) {
  // Search and Filter status
  const [searchQuery, setSearchQuery] = useState('');
  const [filterEstado, setFilterEstado] = useState('Todos');
  const [filterPeriodicidade, setFilterPeriodicidade] = useState('Todos');
  const [filterAnimal, setFilterAnimal] = useState('Todos');
  const [showFilters, setShowFilters] = useState(false);

  // Sorting
  const [sortField, setSortField] = useState<'nome' | 'valor_mensal' | 'data_inicio' | 'estado' | 'periodicidade' | 'periodo' | 'data_fim' | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Form Editor State
  const [isEditing, setIsEditing] = useState(false);
  const [selectedFicha, setSelectedFicha] = useState<Padrinho | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    animal_id: '',
    nome: '',
    email: '',
    telefone: '',
    valor_mensal: 10,
    data_inicio: new Date().toISOString().split('T')[0],
    estado: 'Pendente',
    periodicidade: 'Mensal',
    observacoes: '',
    periodo: 'Indeterminado',
    data_fim: ''
  });
  const [formError, setFormError] = useState('');

  const handleOpenNew = () => {
    setForm({
      animal_id: animais.length > 0 ? animais[0].id : '',
      nome: '',
      email: '',
      telefone: '',
      valor_mensal: 10,
      data_inicio: new Date().toISOString().split('T')[0],
      estado: 'Pendente',
      periodicidade: 'Mensal',
      observacoes: '',
      periodo: 'Indeterminado',
      data_fim: ''
    });
    setEditingId(null);
    setIsEditing(true);
    setFormError('');
  };

  const handleOpenEdit = (padrinho: Padrinho) => {
    setForm({
      animal_id: padrinho.animal_id,
      nome: padrinho.nome,
      email: padrinho.email,
      telefone: padrinho.telefone || '',
      valor_mensal: padrinho.valor_mensal,
      data_inicio: padrinho.data_inicio,
      estado: padrinho.estado,
      periodicidade: padrinho.periodicidade,
      observacoes: padrinho.observacoes || '',
      periodo: padrinho.periodo || 'Indeterminado',
      data_fim: padrinho.data_fim || ''
    });
    setEditingId(padrinho.id);
    setIsEditing(true);
    setFormError('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!form.nome.trim()) {
      setFormError('O nome do padrinho/madrinha é obrigatório.');
      return;
    }
    if (!form.email.trim()) {
      setFormError('O email de contacto é obrigatório.');
      return;
    }
    if (!form.animal_id) {
      setFormError('É necessário associar um patudo ao apadrinhamento.');
      return;
    }

    try {
      if (editingId) {
        await dataService.updatePadrinho(editingId, form);
      } else {
        await dataService.addPadrinho(form);
      }
      setIsEditing(false);
      setEditingId(null);
      onRefresh();
    } catch (err: any) {
      setFormError(err.message || 'Erro ao guardar dados do apadrinhamento.');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const confirmed = window.confirm(`Tens a certeza que desejas eliminar permanentemente o padrinho/madrinha "${name}" do sistema?`);
    if (confirmed) {
      try {
        await dataService.deletePadrinho(id);
        onRefresh();
      } catch (err) {
        console.error('Erro ao eliminar padrinho:', err);
        alert('Erro ao eliminar padrinho.');
      }
    }
  };

  // Helper to get animal details
  const getAnimalOfPadrinho = (animalId: string): Animal | undefined => {
    return animais.find(a => a.id === animalId);
  };

  // Filtration logic
  const filteredPadrinhos = padrinhos.filter(p => {
    const matchesSearch = p.nome.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (p.telefone && p.telefone.includes(searchQuery));
    
    const matchesEstado = filterEstado === 'Todos' || p.estado.toLowerCase() === filterEstado.toLowerCase();
    const matchesPeriodicidade = filterPeriodicidade === 'Todos' || p.periodicidade.toLowerCase() === filterPeriodicidade.toLowerCase();
    const matchesAnimal = filterAnimal === 'Todos' || p.animal_id === filterAnimal;

    return matchesSearch && matchesEstado && matchesPeriodicidade && matchesAnimal;
  });

  // Sorting logic
  const handleSort = (field: 'nome' | 'valor_mensal' | 'data_inicio' | 'estado' | 'periodicidade' | 'periodo' | 'data_fim') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedPadrinhos = [...filteredPadrinhos].sort((a, b) => {
    if (!sortField) return 0;

    let valA: any = '';
    let valB: any = '';

    if (sortField === 'nome') {
      valA = a.nome || '';
      valB = b.nome || '';
    } else if (sortField === 'valor_mensal') {
      valA = Number(a.valor_mensal) || 0;
      valB = Number(b.valor_mensal) || 0;
    } else if (sortField === 'data_inicio') {
      valA = a.data_inicio || '';
      valB = b.data_inicio || '';
    } else if (sortField === 'estado') {
      valA = a.estado || '';
      valB = b.estado || '';
    } else if (sortField === 'periodicidade') {
      valA = a.periodicidade || '';
      valB = b.periodicidade || '';
    } else if (sortField === 'periodo') {
      valA = a.periodo || '';
      valB = b.periodo || '';
    } else if (sortField === 'data_fim') {
      valA = a.data_fim || '';
      valB = b.data_fim || '';
    }

    if (typeof valA === 'number' && typeof valB === 'number') {
      return sortDirection === 'asc' ? valA - valB : valB - valA;
    }

    const comparison = String(valA).localeCompare(String(valB), 'pt-PT', { sensitivity: 'base' });
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  return (
    <div className="space-y-6 animate-fade-in" id="padrinhos-workspace-container">
      {!isEditing ? (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-md overflow-hidden">
          {/* Top Filtering Panel */}
          <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col gap-4 bg-slate-50/50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-grow max-w-md">
                <input
                  type="text"
                  placeholder="Pesquisar por nome, email ou telefone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-white text-slate-800 border border-slate-205 text-xs px-4 py-2.5 rounded-full w-full focus:outline-none focus:ring-2 focus:ring-primary-400 font-sans shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-1.5 px-3 py-2.5 rounded-full text-xs font-bold transition-all border shrink-0 ${
                    showFilters || filterEstado !== 'Todos' || filterPeriodicidade !== 'Todos' || filterAnimal !== 'Todos'
                      ? 'bg-blue-50 border-blue-200 text-blue-600'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <SlidersHorizontal size={14} />
                  <span className="hidden xs:inline">Filtros</span>
                </button>
              </div>

              <button
                onClick={handleOpenNew}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2.5 px-6 rounded-full transition-all flex items-center justify-center gap-2 shadow-sm text-xs shrink-0 font-sans w-full sm:w-auto"
              >
                <Plus size={16} />
                <span>Registrar Apadrinhamento</span>
              </button>
            </div>

            {/* Expansible filters */}
            <div className={`${showFilters ? 'grid' : 'hidden md:grid'} grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100/60 transition-all duration-300`}>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 pl-1">Estado</label>
                <select
                  value={filterEstado}
                  onChange={(e) => setFilterEstado(e.target.value)}
                  className="bg-white text-slate-705 border border-slate-200 text-xs px-3.5 py-2.5 rounded-full w-full focus:outline-none shadow-sm"
                >
                  <option value="Todos">Todos os estados</option>
                  <option value="Pendente">Pendente</option>
                  <option value="Ativo">Ativo</option>
                  <option value="Inativo">Inativo</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 pl-1">Periodicidade</label>
                <select
                  value={filterPeriodicidade}
                  onChange={(e) => setFilterPeriodicidade(e.target.value)}
                  className="bg-white text-slate-705 border border-slate-200 text-xs px-3.5 py-2.5 rounded-full w-full focus:outline-none shadow-sm"
                >
                  <option value="Todos">Todas</option>
                  <option value="Mensal">Mensal</option>
                  <option value="Trimestral">Trimestral</option>
                  <option value="Anual">Anual</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 pl-1">Por Patudo</label>
                <select
                  value={filterAnimal}
                  onChange={(e) => setFilterAnimal(e.target.value)}
                  className="bg-white text-slate-705 border border-slate-200 text-xs px-3.5 py-2.5 rounded-full w-full focus:outline-none shadow-sm"
                >
                  <option value="Todos">Todos os patudos</option>
                  {animais.map(pet => (
                    <option key={pet.id} value={pet.id}>{pet.nome}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* List or Table component view */}
          {sortedPadrinhos.length === 0 ? (
            <div className="p-20 text-center text-slate-400 flex flex-col items-center justify-center">
              <Heart size={48} className="text-pink-200 mb-4 animate-pulse animate-duration-1000" />
              <h4 className="text-lg font-bold text-slate-600 font-sans">Nenhum padrinho/madrinha encontrado</h4>
              <p className="text-sm mt-1">Nenhum registo atende aos critérios atuais de filtros ou termos descritos.</p>
            </div>
          ) : (
            <>
              {/* DESKTOP TABLE VIEW */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-[10px] font-bold uppercase tracking-wider select-none">
                      <th 
                        onClick={() => handleSort('nome')} 
                        className="py-4 px-6 cursor-pointer hover:bg-slate-100 hover:text-slate-700 transition-colors"
                      >
                        <div className="flex items-center gap-1.5">
                          <span>Identidade do Padrinho</span>
                          {sortField === 'nome' ? (
                            sortDirection === 'asc' ? <ArrowUp size={12} className="text-blue-500 shrink-0" /> : <ArrowDown size={12} className="text-blue-500 shrink-0" />
                          ) : (
                            <ArrowUpDown size={12} className="opacity-30 shrink-0" />
                          )}
                        </div>
                      </th>
                      <th className="py-4 px-6">Patudo Apadrinhado</th>
                      <th 
                        onClick={() => handleSort('valor_mensal')} 
                        className="py-4 px-6 cursor-pointer hover:bg-slate-100 hover:text-slate-700 transition-colors"
                      >
                        <div className="flex items-center gap-1.5">
                          <span>Contribuição</span>
                          {sortField === 'valor_mensal' ? (
                            sortDirection === 'asc' ? <ArrowUp size={12} className="text-blue-500 shrink-0" /> : <ArrowDown size={12} className="text-blue-500 shrink-0" />
                          ) : (
                            <ArrowUpDown size={12} className="opacity-30 shrink-0" />
                          )}
                        </div>
                      </th>
                      <th 
                        onClick={() => handleSort('data_inicio')} 
                        className="py-4 px-6 cursor-pointer hover:bg-slate-100 hover:text-slate-700 transition-colors"
                      >
                        <div className="flex items-center gap-1.5">
                          <span>Início</span>
                          {sortField === 'data_inicio' ? (
                            sortDirection === 'asc' ? <ArrowUp size={12} className="text-blue-500 shrink-0" /> : <ArrowDown size={12} className="text-blue-500 shrink-0" />
                          ) : (
                            <ArrowUpDown size={12} className="opacity-30 shrink-0" />
                          )}
                        </div>
                      </th>
                      <th 
                        onClick={() => handleSort('periodo')} 
                        className="py-4 px-6 cursor-pointer hover:bg-slate-100 hover:text-slate-700 transition-colors"
                      >
                        <div className="flex items-center gap-1.5">
                          <span>Duração & Fim</span>
                          {sortField === 'periodo' ? (
                            sortDirection === 'asc' ? <ArrowUp size={12} className="text-blue-500 shrink-0" /> : <ArrowDown size={12} className="text-blue-500 shrink-0" />
                          ) : (
                            <ArrowUpDown size={12} className="opacity-30 shrink-0" />
                          )}
                        </div>
                      </th>
                      <th 
                        onClick={() => handleSort('estado')} 
                        className="py-4 px-6 cursor-pointer hover:bg-slate-100 hover:text-slate-700 transition-colors"
                      >
                        <div className="flex items-center gap-1.5">
                          <span>Estado</span>
                          {sortField === 'estado' ? (
                            sortDirection === 'asc' ? <ArrowUp size={12} className="text-blue-500 shrink-0" /> : <ArrowDown size={12} className="text-blue-500 shrink-0" />
                          ) : (
                            <ArrowUpDown size={12} className="opacity-30 shrink-0" />
                          )}
                        </div>
                      </th>
                      <th className="py-4 px-6 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sortedPadrinhos.map(p => {
                      const pet = getAnimalOfPadrinho(p.animal_id);
                      return (
                        <tr key={p.id} className="hover:bg-slate-50/50 transition-colors text-slate-700 text-xs">
                          {/* NameCard */}
                          <td className="py-4 px-6">
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-extrabold text-slate-800 text-sm">{p.nome}</h4>
                                <Heart size={14} className="fill-red-400 text-red-400 shrink-0" />
                              </div>
                              <div className="space-y-0.5 mt-1 font-mono text-[10.5px] text-slate-500">
                                <p className="flex items-center gap-1">
                                  <Mail size={12} className="text-slate-400" />
                                  <span>{p.email}</span>
                                </p>
                                {p.telefone && (
                                  <p className="flex items-center gap-1">
                                    <Phone size={12} className="text-slate-400" />
                                    <span>{p.telefone}</span>
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Associated Pet */}
                          <td className="py-4 px-6">
                            {pet ? (
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-slate-105 overflow-hidden border border-slate-100 shrink-0">
                                  {pet.foto_url ? (
                                    <img src={pet.foto_url} alt={pet.nome} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-350">
                                      <PawPrint size={14} />
                                    </div>
                                  )}
                                </div>
                                <span className="font-bold text-slate-800">{pet.nome}</span>
                              </div>
                            ) : (
                              <span className="text-slate-400 bg-slate-100 py-1 px-2.5 rounded-full text-[10px]">Patudo Removido</span>
                            )}
                          </td>

                          {/* Contribution */}
                          <td className="py-4 px-6 font-medium">
                            <p className="font-bold text-slate-800">{p.valor_mensal.toFixed(2)}€</p>
                            <p className="text-[10px] text-slate-400 font-mono italic">{p.periodicidade}</p>
                          </td>

                          {/* Start Date */}
                          <td className="py-4 px-6 text-slate-500 font-medium whitespace-nowrap">
                            <span>{new Date(p.data_inicio).toLocaleDateString('pt-PT')}</span>
                          </td>

                          {/* Period and End Date */}
                          <td className="py-4 px-6 text-slate-600 font-medium">
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-800">{p.periodo || 'Indeterminado'}</span>
                              {p.data_fim ? (
                                <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1 mt-0.5" title="Data de térmínio contratada">
                                  <Calendar size={10} />
                                  <span>Até {new Date(p.data_fim).toLocaleDateString('pt-PT')}</span>
                                </span>
                              ) : (
                                <span className="text-[9.5px] text-emerald-600 font-semibold italic mt-0.5">Sem limite definitivo</span>
                              )}
                            </div>
                          </td>

                          {/* Status */}
                          <td className="py-4 px-6">
                            <span className={`text-[9.5px] font-black rounded-full px-2.5 py-0.5 border ${
                              p.estado.toLowerCase() === 'ativo'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-100'
                                : p.estado.toLowerCase() === 'pendente'
                                ? 'bg-amber-100 text-amber-805 border-amber-200 animate-pulse'
                                : 'bg-rose-50 text-rose-800 border-rose-100'
                            }`}>
                              {p.estado}
                            </span>
                          </td>

                          {/* Controls */}
                          <td className="py-4 px-6 text-right">
                            <div className="flex justify-end gap-1.5 align-middle items-center">
                              {p.estado.toLowerCase() === 'pendente' && (
                                <button
                                  onClick={async () => {
                                    if (window.confirm(`Tens a certeza que desejas aprovar e ativar o apadrinhamento de "${p.nome}"?`)) {
                                      try {
                                        await dataService.updatePadrinho(p.id, { estado: 'Ativo' });
                                        onRefresh();
                                      } catch (err) {
                                        console.error(err);
                                        alert('Erro ao ativar apadrinhamento.');
                                      }
                                    }
                                  }}
                                  className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 p-2 rounded-xl transition-all"
                                  title="Aprovar e Ativar Apadrinhamento"
                                >
                                  <Check size={14} />
                                </button>
                              )}
                              <button
                                onClick={() => setSelectedFicha(p)}
                                className="bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 p-2 rounded-xl transition-all"
                                title="Ver Ficha de Apadrinhamento Completa"
                              >
                                <Info size={14} />
                              </button>
                              <button
                                onClick={() => handleOpenEdit(p)}
                                className="bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 p-2 rounded-xl transition-all"
                                title="Editar dados"
                              >
                                <Edit size={14} />
                              </button>
                              <button
                                onClick={() => handleDelete(p.id, p.nome)}
                                className="bg-red-50 hover:bg-red-100 text-red-650 border border-red-150 p-2 rounded-xl transition-all"
                                title="Eliminar / Cancelar registo"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* MOBILE CARDS VIEW */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden p-4 bg-slate-50/20">
                {sortedPadrinhos.map(p => {
                  const pet = getAnimalOfPadrinho(p.animal_id);
                  return (
                    <div key={p.id} className="bg-white border border-slate-100 rounded-3xl p-4 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
                      <div>
                        {/* Title Row */}
                        <div className="flex items-start justify-between gap-2 border-b border-slate-150/40 pb-2.5 mb-2.5">
                          <div>
                            <h4 className="font-extrabold text-slate-800 text-xs flex items-center gap-1.5 flex-wrap">
                              <span>{p.nome}</span>
                              <Heart size={12} className="fill-red-400 text-red-400 inline" />
                            </h4>
                            <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate max-w-[180px]">{p.email}</p>
                          </div>
                          <span className={`text-[8.5px] font-black rounded-full px-2 py-0.5 border shrink-0 ${
                            p.estado.toLowerCase() === 'ativo'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-100'
                              : p.estado.toLowerCase() === 'pendente'
                              ? 'bg-amber-50 text-amber-800 border-amber-200 animate-pulse'
                              : 'bg-rose-50 text-rose-805 border-rose-100'
                          }`}>
                            {p.estado}
                          </span>
                        </div>

                        {/* Middle info */}
                        <div className="space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Patudo:</span>
                            {pet ? (
                              <span className="font-semibold text-slate-800 bg-slate-50 px-2.5 py-0.5 rounded-full border border-slate-100">
                                {pet.nome} 🐾
                              </span>
                            ) : (
                              <span className="text-[9.5px] text-slate-400 bg-slate-100 py-0.5 px-2 rounded-full">Removido</span>
                            )}
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Contribuição:</span>
                            <span className="font-bold text-[#1e293b]">
                              {p.valor_mensal.toFixed(2)}€ <span className="text-[9.5px] font-bold text-slate-500">({p.periodicidade})</span>
                            </span>
                          </div>

                          {p.telefone && (
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-slate-400 uppercase">Telefone:</span>
                              <span className="text-slate-600 font-mono text-[11px]">{p.telefone}</span>
                            </div>
                          )}

                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Desde:</span>
                            <span className="text-slate-500 font-semibold">{new Date(p.data_inicio).toLocaleDateString('pt-PT')}</span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Duração:</span>
                            <span className="text-slate-700 font-bold">{p.periodo || 'Indeterminado'}</span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Até:</span>
                            <span className="text-slate-605 font-semibold">
                              {p.data_fim ? new Date(p.data_fim).toLocaleDateString('pt-PT') : 'Sem data limite'}
                            </span>
                          </div>
                        </div>

                        {p.observacoes && (
                          <div className="mt-3 p-2 bg-slate-50 rounded-xl text-[10.5px] text-slate-500 leading-normal border border-slate-150/50">
                            <strong>Nota:</strong> {p.observacoes}
                          </div>
                        )}
                      </div>

                      {/* Controls Row */}
                      <div className="flex items-center justify-end border-t border-slate-150/40 pt-3 mt-4 gap-1.5">
                        {p.estado.toLowerCase() === 'pendente' && (
                          <button
                            onClick={async () => {
                              if (window.confirm(`Tens a certeza que desejas aprovar e ativar o apadrinhamento de "${p.nome}"?`)) {
                                try {
                                  await dataService.updatePadrinho(p.id, { estado: 'Ativo' });
                                  onRefresh();
                                } catch (err) {
                                  console.error(err);
                                  alert('Erro ao ativar apadrinhamento.');
                                }
                              }
                            }}
                            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-xl transition-all font-bold text-xs flex items-center gap-1 shadow-sm"
                            title="Aprovar e Ativar"
                          >
                            <Check size={11} />
                            <span>Aprovar</span>
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedFicha(p)}
                          className="bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 px-3 py-1.5 rounded-xl transition-all font-bold text-xs flex items-center gap-1 shadow-sm"
                          title="Ver Ficha Completa"
                        >
                          <Info size={11} />
                          <span>Ficha</span>
                        </button>
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 px-3 py-1.5 rounded-xl transition-all font-bold text-xs flex items-center gap-1 shadow-sm"
                        >
                          <Edit size={11} />
                          <span>Editar</span>
                        </button>
                        <button
                          onClick={() => handleDelete(p.id, p.nome)}
                          className="bg-red-50 hover:bg-red-100 text-red-650 border border-red-150 p-1.5 rounded-xl transition-all"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      ) : (
        /* Edit Section component view */
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-md p-6 sm:p-8">
          <div className="flex items-center justify-between border-b border-slate-100 pb-5 mb-6">
            <div>
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest block">Painel de Apadrinhamento</span>
              <h3 className="text-xl font-black text-slate-800">
                {editingId ? `Editar Apadrinhamento: ${form.nome}` : 'Registrar Novo Apadrinhamento'}
              </h3>
            </div>
            <button
              onClick={() => setIsEditing(false)}
              className="text-slate-400 hover:text-slate-600 bg-slate-50 p-2.5 rounded-full"
            >
              <X size={18} />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <form onSubmit={handleSave} className="lg:col-span-2 space-y-5">
              {formError && (
                <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-100 text-xs font-semibold flex items-center gap-2">
                  <AlertTriangle size={16} className="text-red-500" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Nome Completo</label>
                  <input
                    type="text"
                    value={form.nome}
                    onChange={e => setForm({ ...form, nome: e.target.value })}
                    required
                    maxLength={100}
                    placeholder="Ex: Carlos Santos Meneses..."
                    className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-800 px-3.5 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    required
                    placeholder="exemplo@contacto.com"
                    className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-800 px-3.5 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Telefone</label>
                  <input
                    type="text"
                    value={form.telefone}
                    onChange={e => setForm({ ...form, telefone: e.target.value })}
                    placeholder="Ex: 912345678"
                    className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-800 px-3.5 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Patudo a Apadrinhhar</label>
                  <select
                    value={form.animal_id}
                    onChange={e => setForm({ ...form, animal_id: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-205 text-xs text-slate-805 px-3.5 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="" disabled>Selecionar um patudo...</option>
                    {animais.map(pet => (
                      <option key={pet.id} value={pet.id}>{pet.nome} ({pet.especie} - {pet.estado})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Contribuição (€)</label>
                  <input
                    type="number"
                    min={5}
                    step={1}
                    value={form.valor_mensal}
                    onChange={e => setForm({ ...form, valor_mensal: Number(e.target.value) })}
                    required
                    className="w-full bg-slate-50 border border-slate-205 text-xs text-slate-808 px-3.5 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Periodicidade</label>
                  <select
                    value={form.periodicidade}
                    onChange={e => setForm({ ...form, periodicidade: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-205 text-xs text-slate-808 px-3.5 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Mensal">Mensal</option>
                    <option value="Trimestral">Trimestral</option>
                    <option value="Anual">Anual</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Data de Início</label>
                  <input
                    type="date"
                    value={form.data_inicio}
                    onChange={e => setForm({ ...form, data_inicio: e.target.value })}
                    required
                    className="w-full bg-slate-50 border border-slate-205 text-xs text-slate-808 px-3.5 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Período de Apadrinhamento</label>
                  <input
                    type="text"
                    value={form.periodo}
                    onChange={e => setForm({ ...form, periodo: e.target.value })}
                    placeholder="Ex: 6 meses, 1 ano, Indeterminado..."
                    className="w-full bg-slate-50 border border-slate-205 text-xs text-slate-808 px-3.5 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block pl-1">Escreve a duração ou seleciona "Indeterminado".</span>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Data Final (Opcional)</label>
                  <input
                    type="date"
                    value={form.data_fim}
                    onChange={e => setForm({ ...form, data_fim: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-205 text-xs text-slate-808 px-3.5 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block pl-1">Deixa em branco se não houver um término previsto.</span>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Estado</label>
                  <select
                    value={form.estado}
                    onChange={e => setForm({ ...form, estado: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-205 text-xs text-slate-808 px-3.5 py-3 rounded-2xl focus:outline-none"
                  >
                    <option value="Pendente">Pendente ⏳</option>
                    <option value="Ativo">Ativo ⭐</option>
                    <option value="Inativo">Inativo 🛑</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Observações do Padrinho / Questões Especiais</label>
                <textarea
                  value={form.observacoes}
                  onChange={e => setForm({ ...form, observacoes: e.target.value })}
                  rows={4}
                  placeholder="Informações adicionais, observações sobre as respostas recolhidas, etc..."
                  className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-800 px-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-sans"
                />
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-white font-extrabold px-6 py-3 rounded-full text-xs transition-shadow shadow-md"
                >
                  Gravar Registo
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-5 py-3 rounded-full text-xs font-semibold"
                >
                  Voltar à Lista
                </button>
              </div>
            </form>

            {/* Quick Summary View Side Card */}
            <div className="hidden lg:block bg-slate-50 p-6 rounded-[2rem] border border-dashed border-slate-200 self-start">
              <label className="text-[10.5px] uppercase font-bold tracking-wider text-slate-400 mb-3 block pl-1">Resumo do Apadrinhamento</label>
              
              <div className="bg-white rounded-3xl p-5 shadow-md border border-slate-100 max-w-[260px] mx-auto space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center text-pink-500">
                    <Heart size={20} className="fill-pink-100" />
                  </div>
                  <div>
                    <h5 className="font-extrabold text-sm text-slate-800 truncate max-w-[150px]">{form.nome || 'Nome do Padrinho'}</h5>
                    <p className="text-[10px] text-slate-400">Padrinho / Madrinha</p>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3 space-y-2 text-xs">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-400">Patudo:</span>
                    <span className="font-bold text-slate-700">
                      {animais.find(a => a.id === form.animal_id)?.nome || 'Não Selecionado'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-400">Contribuição:</span>
                    <span className="font-bold text-slate-800">{form.valor_mensal.toFixed(2)}€</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-400">Periodicidade:</span>
                    <span className="font-semibold text-slate-600">{form.periodicidade}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-400">Período:</span>
                    <span className="font-semibold text-slate-600">{form.periodo || 'Indeterminado'}</span>
                  </div>
                  {form.data_fim && (
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-400">Término:</span>
                      <span className="font-semibold text-rose-600">{new Date(form.data_fim).toLocaleDateString('pt-PT')}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-400">Estado:</span>
                    <span className={`px-2 py-0.5 text-[9.5px] rounded-full font-bold ${
                      form.estado === 'Ativo' 
                        ? 'bg-emerald-50 text-emerald-800' 
                        : form.estado === 'Pendente'
                        ? 'bg-amber-50 text-amber-800 animate-pulse'
                        : 'bg-rose-50 text-rose-800'
                    }`}>
                      {form.estado}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-xl text-[10px] text-slate-500 text-center border font-sans">
                  Suporta registos flexíveis e sincronia com a base de dados.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETALHE DA FICHA COMPLETA (PDF MATCH) */}
      {selectedFicha && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-primary-800 to-primary-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black tracking-widest uppercase text-primary-200 font-mono">GRUVA Nazaré</span>
                <h3 className="text-base font-bold">Ficha de Apadrinhamento Individual</h3>
              </div>
              <button 
                onClick={() => setSelectedFicha(null)}
                className="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-slate-750 text-xs">
              
              {/* Pet & State Box */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150/40 flex flex-col sm:flex-row justify-between gap-3 items-start sm:items-center">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🐾</span>
                  <div>
                    <p className="font-extrabold text-slate-800 text-sm">
                      Afilhado(a): <span className="text-pink-600">{getAnimalOfPadrinho(selectedFicha.animal_id)?.nome || 'Não selecionado'}</span>
                    </p>
                    <p className="text-[10.5px] text-slate-400">
                      Início em {new Date(selectedFicha.data_inicio).toLocaleDateString('pt-PT')} ({selectedFicha.periodo || 'Indeterminado'})
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-400 font-mono uppercase">Estado:</span>
                  <span className={`text-[10px] font-black rounded-full px-3 py-0.5 border ${
                    selectedFicha.estado.toLowerCase() === 'ativo'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-100'
                      : selectedFicha.estado.toLowerCase() === 'pendente'
                      ? 'bg-amber-100 text-amber-900 border-amber-200 animate-pulse'
                      : 'bg-rose-50 text-rose-800 border-rose-100'
                  }`}>
                    {selectedFicha.estado}
                  </span>
                </div>
              </div>

              {/* Grid 2 Column */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* Dados do Padrinho */}
                <div className="space-y-3.5">
                  <h4 className="font-extrabold text-slate-800 border-b border-slate-100 pb-1.5 flex items-center gap-1.5 uppercase tracking-wide text-[11px]">
                    <User size={13} className="text-blue-500" />
                    <span>Dados do Padrinho</span>
                  </h4>
                  
                  <div className="space-y-2">
                    <p className="text-slate-500"><strong className="text-slate-700">Nome:</strong> {selectedFicha.nome}</p>
                    <p className="text-slate-500">
                      <strong className="text-slate-700">Nascimento:</strong> {selectedFicha.data_nascimento ? new Date(selectedFicha.data_nascimento).toLocaleDateString('pt-PT') : 'Não indicado'}
                    </p>
                    <p className="text-slate-500"><strong className="text-slate-700">NIF / Contribuinte:</strong> {selectedFicha.nif || 'Não indicado'}</p>
                    <p className="text-slate-500"><strong className="text-slate-700">Cartão Cidadão:</strong> {selectedFicha.cartao_cidadao || 'Não indicado'}</p>
                    <p className="text-slate-500"><strong className="text-slate-700">Contacto:</strong> {selectedFicha.telefone || 'Não indicado'}</p>
                    <p className="text-slate-500"><strong className="text-slate-700">E-mail:</strong> {selectedFicha.email}</p>
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-105">
                      <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Endereço Residencial:</p>
                      <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                        {selectedFicha.endereco || 'Não indicado'}
                        {selectedFicha.endereco_cont && ` - ${selectedFicha.endereco_cont}`}
                        <br />
                        {selectedFicha.codigo_postal} {selectedFicha.localidade}, {selectedFicha.pais || 'Portugal'}
                      </p>
                    </div>
                    <p className="text-[10px] text-slate-400 italic">
                      Autoriza envio de e-mails: {selectedFicha.autoriza_email ? '✅ Sim' : '❌ Não'}
                    </p>
                  </div>
                </div>

                {/* Contribuição financeira & Apoios */}
                <div className="space-y-4">
                  <div>
                    <h4 className="font-extrabold text-slate-800 border-b border-slate-100 pb-1.5 flex items-center gap-1.5 uppercase tracking-wide text-[11px]">
                      <CreditCard size={13} className="text-emerald-500" />
                      <span>Plano Financeiro</span>
                    </h4>
                    <div className="space-y-2 mt-2">
                      <p className="text-slate-500">
                        <strong className="text-slate-705">Valor Estimado:</strong> <span className="font-bold text-slate-850 text-sm">{selectedFicha.valor_mensal.toFixed(2)}€ / mês</span>
                      </p>
                      <p className="text-slate-500">
                        <strong className="text-slate-705">Periodicidade:</strong> {selectedFicha.periodicidade}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-slate-800 border-b border-slate-100 pb-1.5 flex items-center gap-1.5 uppercase tracking-wide text-[10.5px]">
                      <span>Contribuições Extras Desejadas</span>
                    </h4>
                    <div className="space-y-1 mt-2 text-[10.5px] text-slate-600">
                      <p className="flex items-center gap-1.5">
                        <span>{selectedFicha.contrib_vacinas ? '✅' : '⬜'}</span>
                        <span className={selectedFicha.contrib_vacinas ? 'font-bold' : 'text-slate-400'}>Vacinas</span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <span>{selectedFicha.contrib_tosquia_banho ? '✅' : '⬜'}</span>
                        <span className={selectedFicha.contrib_tosquia_banho ? 'font-bold' : 'text-slate-400'}>Tosquia / Banho</span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <span>{selectedFicha.contrib_racao_especial ? '✅' : '⬜'}</span>
                        <span className={selectedFicha.contrib_racao_especial ? 'font-bold' : 'text-slate-400'}>Ração Especial</span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <span>{selectedFicha.contrib_medicacao ? '✅' : '⬜'}</span>
                        <span className={selectedFicha.contrib_medicacao ? 'font-bold' : 'text-slate-400'}>Medicação</span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <span>{selectedFicha.contrib_acessorios ? '✅' : '⬜'}</span>
                        <span className={selectedFicha.contrib_acessorios ? 'font-bold' : 'text-slate-400'}>Acessórios</span>
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-slate-800 border-b border-slate-100 pb-1.5 flex items-center gap-1.5 uppercase tracking-wide text-[10.5px]">
                      <span>Apoio em Presença / Pessoal</span>
                    </h4>
                    <div className="space-y-1 mt-2 text-[10.5px] text-slate-600">
                      <p className="flex items-center gap-1.5">
                        <span>{selectedFicha.contrib_pessoal_divulgacao ? '💖' : '⬜'}</span>
                        <span className={selectedFicha.contrib_pessoal_divulgacao ? 'font-bold' : 'text-slate-400'}>Divulgação para Adoção</span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <span>{selectedFicha.contrib_pessoal_passeios ? '💖' : '⬜'}</span>
                        <span className={selectedFicha.contrib_pessoal_passeios ? 'font-bold' : 'text-slate-400'}>Visitas e Passeios no Canil</span>
                      </p>
                    </div>
                  </div>
                </div>

              </div>

              {/* Digital signature display */}
              <div className="pt-4 border-t border-slate-100">
                <div className="bg-[#fbfcff] border border-blue-100 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Assinatura Eletrónica:</p>
                    <span className="font-serif italic text-lg text-blue-900 tracking-wide select-all">
                      {selectedFicha.assinatura_digital || selectedFicha.nome}
                    </span>
                  </div>
                  <div className="text-right text-[10px] text-slate-400">
                    <p>Submetida eletronicamente</p>
                    <p className="font-mono mt-0.5">{selectedFicha.created_at ? new Date(selectedFicha.created_at).toLocaleString('pt-PT') : ''}</p>
                  </div>
                </div>
              </div>

              {/* Extra instructions from PDF */}
              {selectedFicha.observacoes && (
                <div className="bg-amber-50/50 border border-amber-100/50 rounded-2xl p-4 text-[11px] text-slate-640">
                  <strong className="text-amber-850">Observações / Meta:</strong>
                  <p className="mt-1 leading-relaxed whitespace-pre-wrap">{selectedFicha.observacoes}</p>
                </div>
              )}

            </div>

            {/* Footer buttons */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
              <button 
                onClick={() => setSelectedFicha(null)}
                className="bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 px-5 py-2.5 rounded-full font-bold text-xs shadow-sm"
              >
                Fechar Ficha
              </button>

              <div className="flex gap-2">
                {selectedFicha.estado.toLowerCase() === 'pendente' && (
                  <button
                    onClick={async () => {
                      if (window.confirm(`Tens a certeza que desejas aprovar e ativar o apadrinhamento de "${selectedFicha.nome}"?`)) {
                        try {
                          await dataService.updatePadrinho(selectedFicha.id, { estado: 'Ativo' });
                          setSelectedFicha(null);
                          onRefresh();
                        } catch (err) {
                          console.error(err);
                          alert('Erro ao ativar apadrinhamento.');
                        }
                      }
                    }}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold px-6 py-2.5 rounded-full text-xs shadow-md flex items-center gap-1.5"
                  >
                    <Check size={14} />
                    <span>Aprovar Inscrição</span>
                  </button>
                )}
                
                <button
                  onClick={() => {
                    const pad = selectedFicha;
                    setSelectedFicha(null);
                    handleOpenEdit(pad);
                  }}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-5 py-2.5 rounded-full text-xs"
                >
                  Editar Registo
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
