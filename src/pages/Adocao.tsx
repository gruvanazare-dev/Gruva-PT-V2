import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dataService, Animal } from '../lib/dataService';
import { PawPrint, Clock, Activity, Loader2, Heart } from 'lucide-react';

export default function Adocao() {
  const [animais, setAnimais] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<'Todos' | 'Dogs' | 'Cats' | 'Em FAT'>('Todos');

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
            <h1 className="text-4xl font-bold text-primary-900 mb-4">Nossos Amigos para Adoção</h1>
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
                
                <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
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
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-xl text-primary-900 truncate pr-2">{animal.nome}</h3>
                    <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                      {animal.sexo}
                    </span>
                  </div>
                  
                  <div className="space-y-2 mb-6 mt-2">
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

                  <div className="mt-auto grid grid-cols-2 gap-3">
                    <Link 
                      to={`/apadrinhar?animal_id=${animal.id}`}
                      className="flex items-center justify-center py-2.5 rounded-full text-sm font-semibold text-accent-600 bg-accent-50 hover:bg-accent-100 transition-colors"
                    >
                      Apadrinhar
                    </Link>
                    <Link 
                      to={`/contactos?assunto=Candidatos a adoção&acao=adocao&animal=${encodeURIComponent(animal.nome)}`}
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
    </div>
  );
}
