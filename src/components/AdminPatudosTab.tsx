import React, { useState } from 'react';
import { 
  PawPrint, Plus, Edit, Trash2, Heart, Home, Clock, Info, Check, X, Eye, EyeOff, AlertTriangle,
  ArrowUpDown, ArrowUp, ArrowDown, SlidersHorizontal, Upload, RefreshCw
} from 'lucide-react';
import { Animal, dataService } from '../lib/dataService';
import { supabase } from '../lib/supabase';

const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.75);
          resolve(dataUrl);
        } else {
          resolve(event.target?.result as string);
        }
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

interface AdminPatudosTabProps {
  animais: Animal[];
  onRefresh: () => void;
}

export default function AdminPatudosTab({ animais, onRefresh }: AdminPatudosTabProps) {
  // Search & Filter state
  const [petSearch, setPetSearch] = useState('');
  const [petFilterEstado, setPetFilterEstado] = useState('Todos');
  const [petFilterEspecie, setPetFilterEspecie] = useState('Todos');
  const [petFilterSexo, setPetFilterSexo] = useState('Todos');
  const [petFilterPorte, setPetFilterPorte] = useState('Todos');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Sorting state
  const [sortField, setSortField] = useState<'nome' | 'especie' | 'raca' | 'sexo' | 'estado' | 'idade_aprox' | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Form Editor State
  const [isEditingPet, setIsEditingPet] = useState(false);
  const [editingPetId, setEditingPetId] = useState<string | null>(null);
  const [petForm, setPetForm] = useState<{
    nome: string;
    especie: string;
    raca: string;
    idade_aprox: string;
    sexo: string;
    porte: string;
    estado: string;
    foto_url: string;
    fotos: string[];
    descricao: string;
  }>({
    nome: '',
    especie: 'Cão',
    raca: '',
    idade_aprox: '',
    sexo: 'Macho',
    porte: 'Médio',
    estado: 'Disponível',
    foto_url: '',
    fotos: [],
    descricao: ''
  });
  const [petFormError, setPetFormError] = useState('');
  const [uploadingIndexes, setUploadingIndexes] = useState<number[]>([]);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  // Confirmation state for deleting a pet
  const [petToDelete, setPetToDelete] = useState<{ id: string; nome: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processAndUploadImage(file, index);
  };

  const processAndUploadImage = async (file: File, index: number) => {
    setUploadingIndexes(prev => [...prev, index]);
    setPetFormError('');
    try {
      // 1. Compress Image to elegant lightweight Base64 (max 800px width/height, 0.75 quality)
      const compressedBase64 = await compressImage(file);
      
      // We try uploading to Supabase Storage if they have the bucket
      let uploadedUrl = compressedBase64;
      try {
        const fileExt = file.name.split('.').pop() || 'jpg';
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        const filePath = `fotos/${fileName}`;

        // Upload to supabase storage bucket
        const { data, error } = await supabase.storage
          .from('fotos-animais')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true
          });

        if (!error && data) {
          const { data: { publicUrl } } = supabase.storage
            .from('fotos-animais')
            .getPublicUrl(filePath);
          
          if (publicUrl) {
            uploadedUrl = publicUrl;
            console.log('Imagem enviada com sucesso para o Supabase Storage:', publicUrl);
          }
        } else {
          console.warn('Upload para o Supabase Storage falhou (talvez bucket "fotos-animais" não exista). A usar Base64 local/remoto comprimido altamente eficiente.');
        }
      } catch (storageErr) {
        console.warn('Erro a tentar usar o Supabase Storage. A reverter de forma segura para Base64:', storageErr);
      }

      setPetForm(prev => {
        const newFotos = [...prev.fotos];
        newFotos[index] = uploadedUrl;
        return {
          ...prev,
          fotos: newFotos,
          foto_url: index === 0 ? uploadedUrl : (prev.foto_url || uploadedUrl)
        };
      });
      setUploadSuccess(`Fotografia ${index + 1} carregada com sucesso!`);
      setTimeout(() => setUploadSuccess(null), 3000);
    } catch (err: any) {
      console.error(err);
      setPetFormError('Ocorreu um erro a processar o ficheiro de imagem. Tenta outra imagem.');
    } finally {
      setUploadingIndexes(prev => prev.filter(i => i !== index));
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPetForm(prev => {
      const newFotos = [...prev.fotos];
      newFotos.splice(index, 1);
      return {
        ...prev,
        fotos: newFotos,
        foto_url: newFotos[0] || ''
      };
    });
  };

  const handleApplyPreset = (url: string) => {
    setPetForm(prev => {
      const newFotos = [...prev.fotos];
      if (newFotos.length < 3) {
        newFotos.push(url);
      } else {
        newFotos[0] = url;
      }
      return {
        ...prev,
        fotos: newFotos,
        foto_url: newFotos[0] || url
      };
    });
  };

  const imagePresets = [
    { name: 'Cão 1 (Golden)', url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?q=80&w=600&auto=format&fit=crop' },
    { name: 'Cão 2 (Husky)', url: 'https://images.unsplash.com/photo-1531804055935-76f44d7c3621?q=80&w=600&auto=format&fit=crop' },
    { name: 'Cão 3 (Pequeno)', url: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=600&auto=format&fit=crop' },
    { name: 'Gato 1 (Alaranjado)', url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=600&auto=format&fit=crop' },
    { name: 'Gato 2 (Branco)', url: 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?q=80&w=600&auto=format&fit=crop' }
  ];

  const handleOpenNewPet = () => {
    setPetForm({
      nome: '',
      especie: 'Cão',
      raca: '',
      idade_aprox: '',
      sexo: 'Macho',
      porte: 'Médio',
      estado: 'Disponível',
      foto_url: '',
      fotos: [],
      descricao: ''
    });
    setEditingPetId(null);
    setIsEditingPet(true);
    setPetFormError('');
  };

  const handleOpenEditPet = (pet: Animal) => {
    setPetForm({
      nome: pet.nome,
      especie: pet.especie,
      raca: pet.raca || '',
      idade_aprox: pet.idade_aprox || '',
      sexo: pet.sexo || 'Macho',
      porte: pet.porte || 'Médio',
      estado: pet.estado,
      foto_url: pet.foto_url || '',
      fotos: pet.fotos || (pet.foto_url ? [pet.foto_url] : []),
      descricao: pet.descricao || ''
    });
    setEditingPetId(pet.id);
    setIsEditingPet(true);
    setPetFormError('');
  };

  const handleSavePet = async (e: React.FormEvent) => {
    e.preventDefault();
    setPetFormError('');

    if (!petForm.nome.trim()) {
      setPetFormError('O nome do patudo é obrigatório.');
      return;
    }

    const finalForm = {
      ...petForm,
      foto_url: petForm.fotos[0] || petForm.foto_url
    };

    try {
      if (editingPetId) {
        await dataService.updateAnimal(editingPetId, finalForm);
      } else {
        await dataService.addAnimal(finalForm);
      }
      setIsEditingPet(false);
      setEditingPetId(null);
      onRefresh();
    } catch (err: any) {
      setPetFormError(err.message || 'Erro ao guardar dados do patudo.');
    }
  };

  const handleDeletePet = async (id: string, name: string) => {
    setPetToDelete({ id, nome: name });
  };

  // Local filter
  const filteredPets = animais.filter(pet => {
    const matchesSearch = pet.nome.toLowerCase().includes(petSearch.toLowerCase()) || 
                          (pet.raca && pet.raca.toLowerCase().includes(petSearch.toLowerCase()));
    
    const matchesEstado = petFilterEstado === 'Todos' || pet.estado.toLowerCase() === petFilterEstado.toLowerCase();
    const matchesEspecie = petFilterEspecie === 'Todos' || pet.especie.toLowerCase() === petFilterEspecie.toLowerCase();
    const matchesSexo = petFilterSexo === 'Todos' || pet.sexo.toLowerCase() === petFilterSexo.toLowerCase();
    const matchesPorte = petFilterPorte === 'Todos' || pet.porte.toLowerCase() === petFilterPorte.toLowerCase();

    return matchesSearch && matchesEstado && matchesEspecie && matchesSexo && matchesPorte;
  });

  // Reorder/sort logic for all fields
  const handleSort = (field: 'nome' | 'especie' | 'raca' | 'sexo' | 'estado' | 'idade_aprox') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedPets = [...filteredPets].sort((a, b) => {
    if (!sortField) return 0;

    let valA = '';
    let valB = '';

    if (sortField === 'nome') {
      valA = a.nome || '';
      valB = b.nome || '';
    } else if (sortField === 'especie') {
      valA = a.especie || '';
      valB = b.especie || '';
    } else if (sortField === 'raca') {
      valA = a.raca || '';
      valB = b.raca || '';
    } else if (sortField === 'sexo') {
      valA = a.sexo || '';
      valB = b.sexo || '';
    } else if (sortField === 'estado') {
      valA = a.estado || '';
      valB = b.estado || '';
    } else if (sortField === 'idade_aprox') {
      valA = a.idade_aprox || '';
      valB = b.idade_aprox || '';
    }

    const comparison = valA.localeCompare(valB, 'pt-PT', { sensitivity: 'base' });
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  return (
    <div className="space-y-6 animate-fade-in" id="patudos-tab-workspace">
      
      {!isEditingPet ? (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-md overflow-hidden">
          {/* Top filtering controls */}
          <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col gap-4 bg-slate-50/50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-grow max-w-md">
                <input
                  type="text"
                  placeholder="Pesquisar por nome ou raça..."
                  value={petSearch}
                  onChange={(e) => setPetSearch(e.target.value)}
                  className="bg-white text-slate-800 border border-slate-205 text-xs px-4 py-2.5 rounded-full w-full focus:outline-none focus:ring-2 focus:ring-primary-400  shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className={`flex items-center gap-1.5 px-3 py-2.5 rounded-full text-xs font-bold transition-all border shrink-0 ${
                    showAdvancedFilters || petFilterEstado !== 'Todos' || petFilterEspecie !== 'Todos' || petFilterSexo !== 'Todos' || petFilterPorte !== 'Todos'
                      ? 'bg-blue-50 border-blue-200 text-blue-600'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <SlidersHorizontal size={14} />
                  <span className="hidden xs:inline">Filtros</span>
                </button>
              </div>

              <button
                onClick={handleOpenNewPet}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2.5 px-6 rounded-full transition-all flex items-center justify-center gap-2 shadow-sm text-xs shrink-0 font-sans w-full sm:w-auto"
              >
                <Plus size={16} />
                <span>Adicionar Patudo</span>
              </button>
            </div>

            {/* Collapsible advanced filters - visible on desktop by default, or toggled on mobile */}
            <div className={`${showAdvancedFilters ? 'grid' : 'hidden xl:grid'} grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-slate-100/60 transition-all duration-300`}>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 pl-1">Estado de Adoção</label>
                <select
                  value={petFilterEstado}
                  onChange={(e) => setPetFilterEstado(e.target.value)}
                  className="bg-white text-slate-700 border border-slate-200 text-xs px-3.5 py-2.5 rounded-full w-full focus:outline-none shadow-sm"
                >
                  <option value="Todos">Todos os estados</option>
                  <option value="Disponível">Disponível</option>
                  <option value="Em FAT">Em FAT</option>
                  <option value="Adotado">Adotado</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 pl-1">Espécie</label>
                <select
                  value={petFilterEspecie}
                  onChange={(e) => setPetFilterEspecie(e.target.value)}
                  className="bg-white text-slate-700 border border-slate-200 text-xs px-3.5 py-2.5 rounded-full w-full focus:outline-none shadow-sm"
                >
                  <option value="Todos">Todas as espécies</option>
                  <option value="Cão">Cão 🐶</option>
                  <option value="Gato">Gato 🐱</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 pl-1">Género</label>
                <select
                  value={petFilterSexo}
                  onChange={(e) => setPetFilterSexo(e.target.value)}
                  className="bg-white text-slate-707 border border-slate-200 text-xs px-3.5 py-2.5 rounded-full w-full focus:outline-none shadow-sm"
                >
                  <option value="Todos">Todos os géneros</option>
                  <option value="Macho">Macho ♂</option>
                  <option value="Fêmea">Fêmea ♀</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 pl-1">Porte</label>
                <select
                  value={petFilterPorte}
                  onChange={(e) => setPetFilterPorte(e.target.value)}
                  className="bg-white text-slate-707 border border-slate-200 text-xs px-3.5 py-2.5 rounded-full w-full focus:outline-none shadow-sm"
                >
                  <option value="Todos">Todos os portes</option>
                  <option value="Pequeno">Pequeno</option>
                  <option value="Médio">Médio</option>
                  <option value="Grande">Grande</option>
                </select>
              </div>
            </div>
          </div>

          {/* Database table or cards view */}
          {sortedPets.length === 0 ? (
            <div className="p-20 text-center text-slate-400 flex flex-col items-center justify-center">
              <PawPrint size={48} className="text-slate-200 mb-4" />
              <h4 className="text-lg font-bold text-slate-600">Nenhum patudo encontrado</h4>
              <p className="text-sm mt-1">Modifica os teus critérios de pesquisa ou insere um novo registo.</p>
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
                          <span>Identidade do Animal</span>
                          {sortField === 'nome' ? (
                            sortDirection === 'asc' ? <ArrowUp size={12} className="text-blue-500 shrink-0" /> : <ArrowDown size={12} className="text-blue-500 shrink-0" />
                          ) : (
                            <ArrowUpDown size={12} className="opacity-30 shrink-0" />
                          )}
                        </div>
                      </th>
                      <th 
                        onClick={() => handleSort('especie')} 
                        className="py-4 px-6 cursor-pointer hover:bg-slate-100 hover:text-slate-700 transition-colors"
                      >
                        <div className="flex items-center gap-1.5">
                          <span>Espécie</span>
                          {sortField === 'especie' ? (
                            sortDirection === 'asc' ? <ArrowUp size={12} className="text-blue-500 shrink-0" /> : <ArrowDown size={12} className="text-blue-500 shrink-0" />
                          ) : (
                            <ArrowUpDown size={12} className="opacity-30 shrink-0" />
                          )}
                        </div>
                      </th>
                      <th 
                        onClick={() => handleSort('raca')} 
                        className="py-4 px-6 cursor-pointer hover:bg-slate-100 hover:text-slate-700 transition-colors"
                      >
                        <div className="flex items-center gap-1.5">
                          <span>Raça / Porte</span>
                          {sortField === 'raca' ? (
                            sortDirection === 'asc' ? <ArrowUp size={12} className="text-blue-500 shrink-0" /> : <ArrowDown size={12} className="text-blue-500 shrink-0" />
                          ) : (
                            <ArrowUpDown size={12} className="opacity-30 shrink-0" />
                          )}
                        </div>
                      </th>
                      <th 
                        onClick={() => handleSort('idade_aprox')} 
                        className="py-4 px-6 cursor-pointer hover:bg-slate-100 hover:text-slate-700 transition-colors hidden md:table-cell"
                      >
                        <div className="flex items-center gap-1.5">
                          <span>Idade / Género</span>
                          {sortField === 'idade_aprox' ? (
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
                          <span>Historial / Estado</span>
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
                    {sortedPets.map(pet => (
                      <tr key={pet.id} className="hover:bg-slate-50/50 transition-colors text-slate-705 text-xs">
                        
                        {/* Name card */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-slate-100 overflow-hidden relative shrink-0 border border-slate-100 shadow-sm">
                              {pet.foto_url ? (
                                <img src={pet.foto_url} alt={pet.nome} className="w-full h-full object-cover animate-fade-in" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-350">
                                  <PawPrint size={20} />
                                </div>
                              )}
                            </div>
                            <div>
                              <h4 className="font-extrabold text-slate-800 text-sm">{pet.nome}</h4>
                              <p className="text-[10px] text-slate-400 truncate max-w-[150px] ">ID: {pet.id}</p>
                            </div>
                          </div>
                        </td>

                        {/* Species */}
                        <td className="py-4 px-6">
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                            pet.especie.toLowerCase() === 'gato' ? 'bg-amber-100 text-amber-800' : 'bg-blue-105 text-blue-800'
                          }`}>
                            {pet.especie}
                          </span>
                        </td>

                        {/* Bread */}
                        <td className="py-4 px-6">
                          <p className="font-bold text-slate-850">{pet.raca || 'Rafeiro / Sem Raça'}</p>
                          <p className="text-[10px] text-slate-400 font-medium">Porte: {pet.porte || 'Médio'}</p>
                        </td>

                        {/* Age and Sex */}
                        <td className="py-4 px-6 hidden md:table-cell font-medium text-slate-600">
                          <p>{pet.idade_aprox || 'S.I.'}</p>
                          <p className="text-[10px] text-slate-450">{pet.sexo}</p>
                        </td>

                        {/* State */}
                        <td className="py-4 px-6">
                          <span className={`text-[10px] font-extrabold rounded-full px-3 py-1 border ${
                            pet.estado.toLowerCase() === 'disponível'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-100'
                              : pet.estado.toLowerCase() === 'em fat'
                              ? 'bg-blue-50 text-blue-800 border-blue-100'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}>
                            {pet.estado}
                          </span>
                        </td>

                        {/* Item controls */}
                        <td className="py-4 px-6 text-right">
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEditPet(pet)}
                              className="bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 p-2 rounded-xl transition-all"
                              title="Editar patudo"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={() => handleDeletePet(pet.id, pet.nome)}
                              className="bg-red-50 hover:bg-red-100 text-red-650 border border-red-150 p-2 rounded-xl transition-all"
                              title="Remover patudo"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* MOBILE CARDS LIST VIEW */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden p-4 bg-slate-50/20">
                {sortedPets.map(pet => (
                  <div key={pet.id} className="bg-white border border-slate-100 rounded-3xl p-4 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
                    <div className="flex gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-slate-50 overflow-hidden relative shrink-0 border border-slate-100 shadow-sm mt-0.5">
                        {pet.foto_url ? (
                          <img src={pet.foto_url} alt={pet.nome} className="w-full h-full object-cover animate-fade-in" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <PawPrint size={22} />
                          </div>
                        )}
                      </div>
                      
                      <div className="min-w-0 flex-grow">
                        <div className="flex items-center justify-between gap-1.5">
                          <h4 className="font-extrabold text-slate-800 text-sm truncate">{pet.nome}</h4>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                            pet.especie.toLowerCase() === 'gato' ? 'bg-amber-50 text-amber-800 border border-amber-100' : 'bg-blue-50/50 text-blue-800 border border-blue-100/50'
                          }`}>
                            {pet.especie}
                          </span>
                        </div>

                        <p className="text-[10px] text-slate-500 font-medium truncate mt-1">
                          {pet.raca || 'Rafeiro / S.R.'} • {pet.porte || 'Médio'}
                        </p>
                        
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-550 mt-1 font-sans">
                          <span className="bg-slate-100 px-1.5 py-0.5 rounded text-[9.5px] font-medium">{pet.sexo}</span>
                          <span className="bg-slate-100 px-1.5 py-0.5 rounded text-[9.5px] font-medium">{pet.idade_aprox || 'S.I.'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-150/40 pt-3 mt-4">
                      <span className={`text-[9.5px] font-black rounded-full px-2.5 py-0.5 border ${
                        pet.estado.toLowerCase() === 'disponível'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-100'
                          : pet.estado.toLowerCase() === 'em fat'
                          ? 'bg-blue-50 text-blue-800 border-blue-100'
                          : 'bg-slate-50 text-slate-650 border-slate-205'
                      }`}>
                        {pet.estado}
                      </span>

                      <div className="flex gap-1">
                        <button
                          onClick={() => handleOpenEditPet(pet)}
                          className="bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 px-3 py-1.5 rounded-xl transition-all font-bold text-xs flex items-center gap-1 shadow-sm"
                          title="Editar"
                        >
                          <Edit size={11} />
                          <span>Editar</span>
                        </button>
                        <button
                          onClick={() => handleDeletePet(pet.id, pet.nome)}
                          className="bg-red-50 hover:bg-red-100 text-red-650 border border-red-150 p-2 rounded-xl transition-all"
                          title="Remover"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      ) : (
        /* Edit Section component view */
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-md p-6 sm:p-8">
          <div className="flex items-center justify-between border-b border-slate-100 pb-5 mb-6">
            <div>
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest block">Painel Formulário</span>
              <h3 className="text-xl font-black text-slate-800">
                {editingPetId ? `Editar Patudo: ${petForm.nome}` : 'Registrar Novo Patudo'}
              </h3>
            </div>
            <button
              onClick={() => setIsEditingPet(false)}
              className="text-slate-400 hover:text-slate-600 bg-slate-50 p-2.5 rounded-full"
            >
              <X size={18} />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <form onSubmit={handleSavePet} className="lg:col-span-2 space-y-5">
              {petFormError && (
                <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-100 text-xs font-semibold flex items-center gap-2">
                  <AlertTriangle size={16} />
                  <span>{petFormError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Nome do Patudo</label>
                  <input
                    type="text"
                    value={petForm.nome}
                    onChange={e => setPetForm({ ...petForm, nome: e.target.value })}
                    required
                    maxLength={50}
                    placeholder="Ex: Max, Pipoca, Farrusco..."
                    className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-800 px-3.5 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Espécie</label>
                  <select
                    value={petForm.especie}
                    onChange={e => setPetForm({ ...petForm, especie: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-205 text-xs text-slate-800 px-3.5 py-3 rounded-2xl focus:outline-none"
                  >
                    <option value="Cão">Cão 🐶</option>
                    <option value="Gato">Gato 🐱</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Raça</label>
                  <input
                    type="text"
                    value={petForm.raca}
                    onChange={e => setPetForm({ ...petForm, raca: e.target.value })}
                    placeholder="Ex: Golden, Boxer, Rafeiro..."
                    className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-800 px-3.5 py-3 rounded-2xl focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Idade Aproximada</label>
                  <input
                    type="text"
                    value={petForm.idade_aprox}
                    onChange={e => setPetForm({ ...petForm, idade_aprox: e.target.value })}
                    placeholder="Ex: 2 anos, 4 meses"
                    className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-800 px-3.5 py-3 rounded-2xl focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Sexo</label>
                  <select
                    value={petForm.sexo}
                    onChange={e => setPetForm({ ...petForm, sexo: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-205 text-xs text-slate-800 px-3.5 py-3 rounded-2xl focus:outline-none"
                  >
                    <option value="Macho">Macho ♂</option>
                    <option value="Fêmea">Fêmea ♀</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Porte</label>
                  <select
                    value={petForm.porte}
                    onChange={e => setPetForm({ ...petForm, porte: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-205 text-xs text-slate-800 px-3.5 py-3 rounded-2xl focus:outline-none"
                  >
                    <option value="Pequeno">Pequeno</option>
                    <option value="Médio">Médio</option>
                    <option value="Grande">Grande</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Estado de Adoção</label>
                  <select
                    value={petForm.estado}
                    onChange={e => setPetForm({ ...petForm, estado: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-205 text-xs text-slate-800 px-3.5 py-3 rounded-2xl focus:outline-none"
                  >
                    <option value="Disponível">Disponível ⭐</option>
                    <option value="Em FAT">Em FAT 🏡</option>
                    <option value="Adotado">Adotado 🎉</option>
                  </select>
                </div>
              </div>

              {/* Upload de até 3 Fotografias */}
              <div className="bg-slate-50/40 border border-slate-100 p-5 rounded-[2rem] space-y-4">
                <div>
                  <label className="text-xs font-extrabold text-slate-500 uppercase tracking-wider block">Fotografias do Patudo (Até 3 fotos)</label>
                  <p className="text-[10px] text-slate-400 mt-0.5">A primeira fotografia será definida como a imagem principal de capa.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[0, 1, 2].map((index) => {
                    const currentPhoto = petForm.fotos[index];
                    const isUploading = uploadingIndexes.includes(index);
                    const isPrincipal = index === 0;

                    return (
                      <div key={index} className="flex flex-col bg-white border border-slate-100 rounded-3xl p-3 shadow-sm relative group">
                        <div className="absolute top-4 left-4 z-10 flex items-center gap-1">
                          <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                            isPrincipal 
                              ? 'bg-emerald-500 text-white' 
                              : 'bg-slate-500 text-white'
                          }`}>
                            {isPrincipal ? 'Principal' : `Foto ${index + 1}`}
                          </span>
                        </div>

                        {currentPhoto ? (
                          <div className="relative aspect-[4/3] w-full bg-slate-50 rounded-2xl overflow-hidden border">
                            <img 
                              src={currentPhoto} 
                              alt={`Foto ${index + 1}`} 
                              className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300" 
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleRemovePhoto(index)}
                                className="bg-red-500 hover:bg-red-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-xl transition-all"
                              >
                                Remover
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="relative aspect-[4/3] w-full">
                            <input
                              type="file"
                              id={`pet-photo-upload-${index}`}
                              accept="image/*"
                              onChange={(e) => handleImageFileChange(e, index)}
                              className="hidden"
                              disabled={isUploading}
                            />
                            <label
                              htmlFor={`pet-photo-upload-${index}`}
                              className={`w-full h-full border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all text-center ${
                                isUploading 
                                  ? 'bg-slate-50 border-slate-200 cursor-not-allowed animate-pulse'
                                  : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-blue-300'
                              }`}
                            >
                              {isUploading ? (
                                <div className="flex flex-col items-center gap-1.5 p-2">
                                  <RefreshCw className="animate-spin text-blue-500" size={18} />
                                  <span className="text-[9px] font-bold text-slate-500">A processar...</span>
                                </div>
                              ) : (
                                <div className="flex flex-col items-center gap-1.5 p-2">
                                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                                    <Upload size={14} />
                                  </div>
                                  <span className="text-[10px] font-extrabold text-slate-700">Adicionar Foto</span>
                                  <span className="text-[8px] text-slate-400 font-medium">PNG, JPG ou WEBP</span>
                                </div>
                              )}
                            </label>
                          </div>
                        )}

                        {uploadSuccess && uploadSuccess.includes(`${index + 1}`) && (
                          <span className="text-[8px] text-emerald-600 font-medium text-center mt-1 animate-fade-in">
                            {uploadSuccess}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>



              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Apresentação / Descrição do Patudo</label>
                <textarea
                  value={petForm.descricao}
                  onChange={e => setPetForm({ ...petForm, descricao: e.target.value })}
                  rows={4}
                  placeholder="Escreve uma história carinhosa sobre as vacinas, comportamento com crianças e outros detalhes do temperamento..."
                  className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-800 px-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-sans"
                />
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-white font-extrabold px-6 py-3 rounded-full text-xs transition-all shadow-md"
                >
                  Confirmar e Salvar Patudo
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingPet(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-5 py-3 rounded-full text-xs font-semibold"
                >
                  Voltar à Lista
                </button>
              </div>

            </form>

            {/* Live mockup card side preview */}
            <div className="hidden lg:block bg-slate-50 p-6 rounded-[2rem] border border-dashed border-slate-200 self-start">
              <label className="text-[10.5px] uppercase font-bold tracking-wider text-slate-400 mb-3 block pl-1">Mockup em tempo real</label>
              
              <div className="bg-white rounded-3xl overflow-hidden shadow-md border border-slate-100 max-w-[260px] mx-auto">
                <div className="relative aspect-[4/3] bg-slate-100">
                  {petForm.foto_url ? (
                    <img src={petForm.foto_url} alt="live view pre" className="w-full h-full object-cover animate-fade-in" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                      <PawPrint size={24} />
                      <span className="text-[10px]">Sem fotografia</span>
                    </div>
                  )}
                  <div className="absolute top-2 left-2">
                    <span className="bg-blue-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                      {petForm.estado}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-1">
                    <h5 className="font-bold text-slate-800 truncate">{petForm.nome || 'Pipoca'}</h5>
                    <span className="text-[9px] bg-slate-50 text-slate-400 px-2 py-0.5 rounded-full">
                      {petForm.sexo}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold">{petForm.especie} • {petForm.raca || 'S.R.'}</p>
                  <p className="text-[10.5px] text-slate-500 leading-normal line-clamp-3 mt-2 font-sans">
                    {petForm.descricao || 'Insere uma apresentação à esquerda para preencher...' }
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Custom Confirmation Modal for Pet Deletion */}
      {petToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-xl border border-slate-100 flex flex-col items-center text-center space-y-4 animate-scale-in">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
              <AlertTriangle size={24} />
            </div>
            
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-slate-800">Eliminar Patudo?</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Tens a certeza que pretendes eliminar permanentemente o patudo <strong className="text-slate-800">"{petToDelete.nome}"</strong>? Esta ação é irreversível.
              </p>
            </div>

            <div className="flex gap-2.5 w-full pt-1">
              <button
                type="button"
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 px-4 rounded-xl text-xs transition-all"
                onClick={() => setPetToDelete(null)}
                disabled={isDeleting}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                disabled={isDeleting}
                onClick={async () => {
                  setIsDeleting(true);
                  try {
                    await dataService.deleteAnimal(petToDelete.id);
                    onRefresh();
                  } catch (err) {
                    console.error('Erro ao eliminar animal:', err);
                  } finally {
                    setIsDeleting(false);
                    setPetToDelete(null);
                  }
                }}
              >
                {isDeleting ? 'A eliminar...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
