import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dataService, Animal } from '../lib/dataService';
import { PawPrint, Clock, Activity, Loader2, Heart, Info, X } from 'lucide-react';

export default function Adocao() {
  const [animais, setAnimais] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<'Todos' | 'Dogs' | 'Cats' | 'Em FAT'>('Todos');
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const [activePhotoIndex, setActivePhotoIndex] = useState<number>(0);

  useEffect(() => {
    async function fetchAnimais() {
      setLoading(true);
      try {
        const data = await dataService.getAnimais();
        setAnimais(data);
      } catch (error) {
        console.error("Erro ao buscar animais:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchAnimais();
  }, []);

  const animaisFiltrados = animais.filter(animal => {
    if (filtro === 'Todos') return true;
    if (filtro === 'Dogs' && animal.especie.toLowerCase() === 'cão') return true;
    if (filtro === 'Cats' && animal.especie.toLowerCase() === 'gato') return true;
    if (filtro === 'Em FAT' && animal.estado.toLowerCase() === 'em fat') return true;
    return false;
  });

  const getStatusBadge = (estado: string) => {
    const estadoLower = estado.toLowerCase();
    if (estadoLower === 'em fat') {
      return 'bg-blue-100 text-blue-700 border-blue-200';
    }
    if (estadoLower === 'disponível') {
      return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    }
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  return (
    <div className="w-full bg-slate-50 py-16 lg:py-24 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header e Filtros */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-bold text-primary-900 mb-4  tracking-tight">Nossos Amigos para Adoção</h1>
            <p className="text-lg text-slate-600 max-w-2xl">
              Estes são os patudos que aguardam por uma família. Vem conhecê-los e muda uma vida.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 md:pb-2">
            {(['Todos', 'Dogs', 'Cats', 'Em FAT'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFiltro(f)}
                className={`px-5 py-2 rounded-full font-medium text-sm transition-all border ${
                  filtro === f 
                    ? 'bg-primary-500 text-white border-primary-500 shadow-sm' 
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-primary-300'
                }`}
              >
                {f === 'Dogs' && <PawPrint size={16} className="inline mr-2 -mt-0.5" />}
                {f === 'Cats' && <PawPrint size={16} className="inline mr-2 -mt-0.5" />}
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 text-primary-500">
            <Loader2 size={48} className="animate-spin mb-4" />
            <p className="text-lg font-medium text-slate-500">A carregar os nossos patudos...</p>
          </div>
        ) : animaisFiltrados.length === 0 ? (
          <div className="bg-white p-16 rounded-[2.5rem] text-center border border-slate-100 shadow-sm">
            <Heart size={64} className="mx-auto text-slate-300 mb-6" />
            <h3 className="text-2xl font-bold text-primary-900 mb-2">Nenhum patudo encontrado</h3>
            <p className="text-slate-500 text-lg">Não encontrámos animais com este filtro de momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {animaisFiltrados.map(animal => (
              <div key={animal.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-md transition-shadow group flex flex-col">
                
                <div 
                  onClick={() => {
                    setSelectedAnimal(animal);
                    setActivePhotoIndex(0);
                  }}
                  className="relative aspect-[4/3] overflow-hidden bg-slate-100 cursor-pointer"
                >
                  {animal.foto_url ? (
                     <img 
                      src={animal.foto_url} 
                      alt={`Fotografia de ${animal.nome}`} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <PawPrint size={48} />
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(animal.estado)} backdrop-blur-md bg-opacity-95`}>
                      {animal.estado}
                    </span>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col">
                  <div 
                    onClick={() => {
                      setSelectedAnimal(animal);
                      setActivePhotoIndex(0);
                    }}
                    className="flex items-center justify-between mb-2 cursor-pointer group/title"
                  >
                    <h3 className="font-bold text-xl text-primary-900 truncate pr-2 group-hover/title:text-primary-600 transition-colors">{animal.nome}</h3>
                    <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full shrink-0">
                      {animal.sexo}
                    </span>
                  </div>
                  
                  <div className="space-y-2 mb-4 mt-2">
                    <div className="flex items-center text-sm text-slate-600">
                      <Clock size={16} className="text-primary-400 mr-2 shrink-0" />
                      <span className="truncate">{animal.idade_aprox}</span>
                    </div>
                    {animal.raca && (
                       <div className="flex items-center text-sm text-slate-600">
                         <Activity size={16} className="text-primary-400 mr-2 shrink-0" />
                         <span className="truncate">{animal.raca}</span>
                       </div>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setSelectedAnimal(animal);
                      setActivePhotoIndex(0);
                    }}
                    className="w-full mb-4 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-100 transition-all cursor-pointer"
                  >
                    <Info size={14} />
                    Conhecer Amigo(a)
                  </button>

                  <div className="mt-auto grid grid-cols-2 gap-3">
                    <Link 
                      to={`/apadrinhar?animal_id=${animal.id}`}
                      className="flex items-center justify-center py-2.5 rounded-full text-sm font-semibold text-accent-600 bg-accent-50 hover:bg-accent-100 transition-colors"
                    >
                      Apadrinhar
                    </Link>
                    <Link 
                      to={`/formulario-adocao?animal_id=${animal.id}`}
                      className="flex items-center justify-center py-2.5 rounded-full text-sm font-semibold text-white bg-primary-500 hover:bg-primary-600 shadow-sm hover:shadow transition-all"
                    >
                      Adotar
                    </Link>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>

      {/* Detalhes do Patudo Modal */}
      {selectedAnimal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-slate-900/60 backdrop-blur-sm animate-fade-in animate-[fadeIn_0.2s_ease-out]">
          <div className="relative bg-white rounded-[2.5rem] shadow-2xl max-w-2xl w-full p-6 md:p-8 animate-scale-in my-8 max-h-[90vh] overflow-y-auto">
            {/* Botão Fechar */}
            <button
              onClick={() => setSelectedAnimal(null)}
              className="absolute top-6 right-6 w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-all cursor-pointer z-10"
            >
              <X size={20} />
            </button>

            {/* Cabecalho */}
            <div className="mb-6 pr-12">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(selectedAnimal.estado)} mb-2`}>
                {selectedAnimal.estado}
              </span>
              <h2 className="text-3xl font-black text-slate-900">{selectedAnimal.nome}</h2>
              <p className="text-xs text-slate-400 mt-1 uppercase font-extrabold tracking-widest">{selectedAnimal.especie} • {selectedAnimal.raca || 'Raça Indeterminada'}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Coluna 1: Galeria de Fotos */}
              <div className="space-y-4">
                {/* Visualizador Principal */}
                <div className="relative aspect-[4/3] rounded-3xl bg-slate-50 border overflow-hidden">
                  {(() => {
                    const galeria = selectedAnimal.fotos && selectedAnimal.fotos.length > 0 
                      ? selectedAnimal.fotos 
                      : [selectedAnimal.foto_url];
                    const activePhoto = galeria[activePhotoIndex] || selectedAnimal.foto_url;

                    return activePhoto ? (
                      <img 
                        src={activePhoto} 
                        alt={selectedAnimal.nome} 
                        className="w-full h-full object-cover animate-fade-in"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-350">
                        <PawPrint size={48} />
                      </div>
                    );
                  })()}
                </div>

                {/* Linha das Miniaturas */}
                {(() => {
                  const galeria = selectedAnimal.fotos && selectedAnimal.fotos.length > 0 
                    ? selectedAnimal.fotos 
                    : [selectedAnimal.foto_url];

                  return galeria.length > 1 ? (
                    <div className="flex gap-2 justify-center">
                      {galeria.map((foto, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActivePhotoIndex(idx)}
                          className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                            activePhotoIndex === idx 
                              ? 'border-primary-500 scale-105 shadow-sm' 
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <img src={foto} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  ) : null;
                })()}
              </div>

              {/* Coluna 2: Informações Técnicas e de Temperamento */}
              <div className="flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Idade</span>
                      <strong className="text-slate-800 text-sm">{selectedAnimal.idade_aprox}</strong>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Sexo</span>
                      <strong className="text-slate-800 text-sm">{selectedAnimal.sexo}</strong>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Porte</span>
                      <strong className="text-slate-800 text-sm">{selectedAnimal.porte}</strong>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Espécie</span>
                      <strong className="text-slate-800 text-sm">{selectedAnimal.especie}</strong>
                    </div>
                  </div>

                  <div className="text-xs text-slate-650 leading-relaxed max-h-[160px] overflow-y-auto pr-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">A História de {selectedAnimal.nome}</span>
                    <p className="whitespace-pre-line">{selectedAnimal.descricao || "Este patudo é extremamente amável e está com muita vontade de encontrar um lar definitivo cheio de mimos."}</p>
                  </div>
                </div>

                {/* Call-To-Action correspondente no Modal */}
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <Link 
                    to={`/apadrinhar?animal_id=${selectedAnimal.id}`}
                    className="flex items-center justify-center py-3.5 rounded-full text-xs font-extrabold text-accent-700 bg-accent-50 hover:bg-accent-100 transition-colors uppercase tracking-wider text-center"
                    onClick={() => setSelectedAnimal(null)}
                  >
                    Apadrinhar
                  </Link>
                  <Link 
                    to={`/formulario-adocao?animal_id=${selectedAnimal.id}`}
                    className="flex items-center justify-center py-3.5 rounded-full text-xs font-extrabold text-white bg-primary-500 hover:bg-primary-600 shadow-sm hover:shadow transition-all uppercase tracking-wider text-center"
                    onClick={() => setSelectedAnimal(null)}
                  >
                    Quero Adotar
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
