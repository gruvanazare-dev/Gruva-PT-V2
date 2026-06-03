import { supabase } from './supabase';

export interface Animal {
  id: string;
  nome: string;
  especie: string;
  raca: string;
  idade_aprox: string;
  sexo: string;
  porte: string;
  estado: string; // 'Disponível', 'Em FAT', 'Adotado'
  foto_url: string;
  descricao: string;
  created_at?: string;
}

export interface Mensagem {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  assunto: string;
  mensagem: string;
  created_at?: string;
  lida?: boolean;
  tratada?: boolean;
  fotos?: string[] | null;
}

export interface Padrinho {
  id: string;
  animal_id: string;
  nome: string;
  email: string;
  telefone: string;
  valor_mensal: number;
  data_inicio: string;
  estado: string; // 'Pendente', 'Ativo', 'Inativo'
  periodicidade: string; // 'Mensal', 'Trimestral', 'Anual'
  observacoes?: string;
  periodo?: string; // Ex: '3 meses', '6 meses', '12 meses', 'Indeterminado'
  data_fim?: string; // Data final do apadrinhamento
  
  // Campos detalhados da Ficha de Apadrinhamento Individual
  endereco?: string;
  endereco_cont?: string;
  localidade?: string;
  codigo_postal?: string;
  pais?: string;
  cartao_cidadao?: string;
  nif?: string;
  data_nascimento?: string;
  autoriza_email?: boolean;
  
  // Outras contribuições
  contrib_vacinas?: boolean;
  contrib_tosquia_banho?: boolean;
  contrib_racao_especial?: boolean;
  contrib_medicacao?: boolean;
  contrib_acessorios?: boolean;
  
  // Contribuição pessoal
  contrib_pessoal_divulgacao?: boolean;
  contrib_pessoal_passeios?: boolean;
  
  assinatura_digital?: string;
  created_at?: string;
}

const DEFAULT_ANIMAIS: Animal[] = [
  {
    id: 'f32ce78c-09ae-4c62-8414-b63304c4f9bc',
    nome: 'Kika',
    especie: 'Cão',
    raca: 'Rafeiro',
    idade_aprox: '3 anos',
    sexo: 'Fêmea',
    porte: 'Médio',
    estado: 'Disponível',
    foto_url: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=600&auto=format&fit=crop',
    descricao: 'A Kika é meiga, muito inteligente e adora dar passeios na praia da Nazaré. Dá-se bem com outros cães.',
    created_at: new Date('2026-05-15').toISOString()
  },
  {
    id: 'b78a9c2d-96cf-448f-8c31-7e8c3104c8f5',
    nome: 'Bolinha',
    especie: 'Gato',
    raca: 'Europeu Comum',
    idade_aprox: '2 meses',
    sexo: 'Macho',
    porte: 'Pequeno',
    estado: 'Em FAT',
    foto_url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=600&auto=format&fit=crop',
    descricao: 'O Bolinha é puro divertimento! Muito brincalhão, ativo e curioso. Atualmente está numa Família de Acolhimento Temporário (FAT).',
    created_at: new Date('2026-05-20').toISOString()
  },
  {
    id: 'c1b2f4c3-adfa-43ef-b32c-7b83f0a091cf',
    nome: 'Rex',
    especie: 'Cão',
    raca: 'Pastor Alemão',
    idade_aprox: '5 anos',
    sexo: 'Macho',
    porte: 'Grande',
    estado: 'Disponível',
    foto_url: 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?q=80&w=600&auto=format&fit=crop',
    descricao: 'O Rex é um excelente companheiro, protetor e muito educado. Obedece a comandos básicos e gosta de espaço exterior.',
    created_at: new Date('2026-05-10').toISOString()
  },
  {
    id: 'e69a081a-5bf3-4f2b-8a8b-4a5cbb291a1a',
    nome: 'Luna',
    especie: 'Gato',
    raca: 'Siamês',
    idade_aprox: '1 ano',
    sexo: 'Fêmea',
    porte: 'Médio',
    estado: 'Disponível',
    foto_url: 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?q=80&w=600&auto=format&fit=crop',
    descricao: 'A Luna é uma gatinha doce, tímida no início, mas depois de ganhar confiança adora pedir carinho e aninhar-se.',
    created_at: new Date('2026-05-18').toISOString()
  },
  {
    id: 'a38fa727-463e-43f1-b92c-6ed39ccbe100',
    nome: 'Tobias',
    especie: 'Cão',
    raca: 'Golden Retriever Mistura',
    idade_aprox: '1 ano',
    sexo: 'Macho',
    porte: 'Grande',
    estado: 'Em FAT',
    foto_url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?q=80&w=600&auto=format&fit=crop',
    descricao: 'O Tobias é o cão mais dócil do mundo. Ama brincar com bolas de ténis, correr ao ar livre e dar beijinhos nas crianças.',
    created_at: new Date('2026-05-25').toISOString()
  }
];

const DEFAULT_MENSAGENS: Mensagem[] = [
  {
    id: 'm1',
    nome: 'João Rodrigues Silva',
    email: 'joao.rodrigues@gmail.com',
    telefone: '912345678',
    assunto: 'Voluntariado',
    mensagem: 'Olá! Sou morador da Nazaré e gostaria de saber de que formas posso colaborar aos fins de semana. Tenho interesse em passear os cães ou ajudar na manutenção das instalações.',
    created_at: new Date('2026-05-28T14:30:00Z').toISOString()
  },
  {
    id: 'm2',
    nome: 'Maria Francisca Santos',
    email: 'maria.santos@sapo.pt',
    telefone: '934567890',
    assunto: 'Candidatos a adoção',
    mensagem: 'Boa tarde! Fiquei apaixonada pela Kika. Tenho uma moradia com quintal totalmente vedado na Vila da Nazaré e gostava muito de agendar uma visita ao canil para podermos interagir com ela pela primeira vez.',
    created_at: new Date('2026-05-30T09:15:00Z').toISOString()
  },
  {
    id: 'm3',
    nome: 'António Ferreira',
    email: 'antonio.ferreira@outlook.pt',
    telefone: '967890123',
    assunto: 'Candidatos a FAT',
    mensagem: 'Olá, gostaria de saber quais as vossas diretrizes para acolher temporariamente um patudo em caso de cirurgias ou recuperação. Tenho experiência com cães idosos.',
    created_at: new Date('2026-06-01T11:05:00Z').toISOString()
  }
];

// Helper to load current local DB state
const getStoredAnimais = (): Animal[] => {
  const local = localStorage.getItem('gruva_animais_db');
  if (local) {
    try {
      return JSON.parse(local);
    } catch (e) {
      console.error(e);
    }
  }
  return [];
};

const storeAnimaisLocal = (data: Animal[]) => {
  localStorage.setItem('gruva_animais_db', JSON.stringify(data));
};

const getStoredMensagens = (): Mensagem[] => {
  const local = localStorage.getItem('gruva_mensagens_db');
  if (local) {
    try {
      return JSON.parse(local);
    } catch (e) {
      console.error(e);
    }
  }
  return [];
};

const storeMensagensLocal = (data: Mensagem[]) => {
  localStorage.setItem('gruva_mensagens_db', JSON.stringify(data));
};

const DEFAULT_PADRINHOS: Padrinho[] = [
  {
    id: 'p1',
    animal_id: 'f32ce78c-09ae-4c62-8414-b63304c4f9bc', // Kika
    nome: 'Carlos Meneses',
    email: 'carlos.meneses@gmail.com',
    telefone: '912312312',
    valor_mensal: 15,
    data_inicio: '2026-01-10',
    estado: 'Ativo',
    periodicidade: 'Mensal',
    observacoes: 'Gosta de receber fotografias mensais por email da Kika.',
    periodo: 'Indeterminado',
    data_fim: ''
  },
  {
    id: 'p2',
    animal_id: 'b78a9c2d-96cf-448f-8c31-7e8c3104c8f5', // Bolinha
    nome: 'Ana Sofia Ramos',
    email: 'ana.ramos@sapo.pt',
    telefone: '934555666',
    valor_mensal: 30,
    data_inicio: '2026-05-22',
    estado: 'Ativo',
    periodicidade: 'Trimestral',
    observacoes: 'Apadrinhou para ajudar na FAT.',
    periodo: '6 meses',
    data_fim: '2026-11-22'
  }
];

const getStoredPadrinhos = (): Padrinho[] => {
  const local = localStorage.getItem('gruva_padrinhos_db');
  if (local) {
    try {
      return JSON.parse(local);
    } catch (e) {
      console.error(e);
    }
  }
  return [];
};

const storePadrinhosLocal = (data: Padrinho[]) => {
  localStorage.setItem('gruva_padrinhos_db', JSON.stringify(data));
};

export const dataService = {
  // --- ANIMAIS METHODS ---
  async getAnimais(): Promise<Animal[]> {
    try {
      // 1. Check if we already have populated memory in localStorage
      const local = getStoredAnimais();
      if (local.length > 0) {
        return local;
      }

      // 2. Otherwise try loading from Supabase
      const { data, error } = await supabase
        .from('animais')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        // Sync to localStorage
        storeAnimaisLocal(data as Animal[]);
        return data as Animal[];
      }
    } catch (err) {
      console.warn('Failing over to default animals data on search/error:', err);
    }

    // Fallback: If Supabase returns nothing or errors, initialize with defaults
    const local = getStoredAnimais();
    if (local.length === 0) {
      storeAnimaisLocal(DEFAULT_ANIMAIS);
      return DEFAULT_ANIMAIS;
    }
    return local;
  },

  async addAnimal(animal: Omit<Animal, 'id' | 'created_at'>): Promise<Animal> {
    const newAnimal: Animal = {
      ...animal,
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11) + '-' + Date.now(),
      created_at: new Date().toISOString()
    };

    // 1. Save locally (Always succeeds)
    const current = await this.getAnimais();
    const updated = [newAnimal, ...current];
    storeAnimaisLocal(updated);

    // 2. Attempt to save in Supabase as well
    try {
      const { error } = await supabase
        .from('animais')
        .insert([{
          id: newAnimal.id,
          nome: newAnimal.nome,
          especie: newAnimal.especie,
          raca: newAnimal.raca,
          idade_aprox: newAnimal.idade_aprox,
          sexo: newAnimal.sexo,
          porte: newAnimal.porte,
          estado: newAnimal.estado,
          foto_url: newAnimal.foto_url,
          descricao: newAnimal.descricao
        }]);
      if (error) console.log('Supabase RLS or insert restriction caught:', error.message);
    } catch (e) {
      console.warn('Could not insert to Supabase, but saved locally:', e);
    }

    return newAnimal;
  },

  async updateAnimal(id: string, updatedFields: Partial<Omit<Animal, 'id'>>): Promise<Animal> {
    const current = await this.getAnimais();
    let updatedAnimal: Animal | null = null;

    const newList = current.map(animal => {
      if (animal.id === id) {
        updatedAnimal = { ...animal, ...updatedFields };
        return updatedAnimal;
      }
      return animal;
    });

    if (!updatedAnimal) {
      throw new Error(`Animal com o ID ${id} não foi encontrado.`);
    }

    // Save locally
    storeAnimaisLocal(newList);

    // Try in Supabase
    try {
      const { error } = await supabase
        .from('animais')
        .update({
          nome: updatedFields.nome,
          especie: updatedFields.especie,
          raca: updatedFields.raca,
          idade_aprox: updatedFields.idade_aprox,
          sexo: updatedFields.sexo,
          porte: updatedFields.porte,
          estado: updatedFields.estado,
          foto_url: updatedFields.foto_url,
          descricao: updatedFields.descricao
        })
        .eq('id', id);
      if (error) console.log('Supabase update rejected by RLS:', error.message);
    } catch (e) {
      console.warn('Could not update in Supabase, but saved locally:', e);
    }

    return updatedAnimal;
  },

  async deleteAnimal(id: string): Promise<boolean> {
    const current = await this.getAnimais();
    const newList = current.filter(animal => animal.id !== id);
    storeAnimaisLocal(newList);

    // Try in Supabase
    try {
      const { error } = await supabase
        .from('animais')
        .delete()
        .eq('id', id);
      if (error) console.log('Supabase delete rejected by RLS:', error.message);
    } catch (e) {
      console.warn('Could not delete in Supabase, but deleted locally:', e);
    }

    return true;
  },

  // --- MENSAGENS METHODS ---
  async getMensagens(): Promise<Mensagem[]> {
    const local = getStoredMensagens();
    if (local.length > 0) {
      return local;
    }

    // If local messages are completely empty, pre-fill with dummy mock entries so page isn't blank
    storeMensagensLocal(DEFAULT_MENSAGENS);
    return DEFAULT_MENSAGENS;
  },

  async addMensagem(mensagem: Omit<Mensagem, 'id' | 'created_at'>): Promise<Mensagem> {
    const newMsg: Mensagem = {
      ...mensagem,
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11) + '-' + Date.now(),
      created_at: new Date().toISOString(),
      lida: false,
      tratada: false
    };

    // Store in localStorage
    const current = await this.getMensagens();
    const updated = [newMsg, ...current];
    storeMensagensLocal(updated);

    return newMsg;
  },

  async updateMensagem(id: string, updatedFields: Partial<Omit<Mensagem, 'id'>>): Promise<Mensagem> {
    const current = await this.getMensagens();
    let updatedMsg: Mensagem | null = null;

    const newList = current.map(msg => {
      if (msg.id === id) {
        updatedMsg = { ...msg, ...updatedFields };
        return updatedMsg;
      }
      return msg;
    });

    if (!updatedMsg) {
      throw new Error(`Mensagem com o ID ${id} não foi encontrada.`);
    }

    // Save locally
    storeMensagensLocal(newList);

    // Try in Supabase
    try {
      const { error } = await supabase
        .from('mensagens')
        .update({
          lida: updatedFields.lida,
          tratada: updatedFields.tratada
        })
        .eq('id', id);
      if (error) console.log('Supabase messages status update caught by RLS:', error.message);
    } catch (e) {
      console.warn('Could not update message status on Supabase:', e);
    }

    return updatedMsg;
  },

  async deleteMensagem(id: string): Promise<boolean> {
    const current = await this.getMensagens();
    const newList = current.filter(msg => msg.id !== id);
    storeMensagensLocal(newList);

    // Try in Supabase (though usually restricted)
    try {
      const { error } = await supabase
        .from('mensagens')
        .delete()
        .eq('id', id);
      if (error) console.log('Supabase message deletion caught by RLS:', error.message);
    } catch (e) {
      console.warn('Could not delete message on Supabase:', e);
    }

    return true;
  },

  // --- PADRINHOS METHODS ---
  async getPadrinhos(): Promise<Padrinho[]> {
    try {
      // 1. Check if we already have populated memory in localStorage
      const local = getStoredPadrinhos();
      if (local.length > 0) {
        return local;
      }

      // 2. Otherwise try loading from Supabase
      const { data, error } = await supabase
        .from('padrinhos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        // Sync to localStorage
        storePadrinhosLocal(data as Padrinho[]);
        return data as Padrinho[];
      }
    } catch (err) {
      console.warn('Failing over to default padrinhos data on search/error:', err);
    }

    // Fallback: If Supabase returns nothing or errors, initialize with defaults
    const local = getStoredPadrinhos();
    if (local.length === 0) {
      storePadrinhosLocal(DEFAULT_PADRINHOS);
      return DEFAULT_PADRINHOS;
    }
    return local;
  },

  async addPadrinho(padrinho: Omit<Padrinho, 'id' | 'created_at'>): Promise<Padrinho> {
    const newPadrinho: Padrinho = {
      ...padrinho,
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11) + '-' + Date.now(),
      created_at: new Date().toISOString()
    };

    // 1. Save locally (Always succeeds)
    const current = await this.getPadrinhos();
    const updated = [newPadrinho, ...current];
    storePadrinhosLocal(updated);

    // 2. Attempt to save in Supabase as well
    try {
      const { error } = await supabase
        .from('padrinhos')
        .insert([{
          id: newPadrinho.id,
          animal_id: newPadrinho.animal_id,
          nome: newPadrinho.nome,
          email: newPadrinho.email,
          telefone: newPadrinho.telefone,
          valor_mensal: newPadrinho.valor_mensal,
          data_inicio: newPadrinho.data_inicio,
          estado: newPadrinho.estado,
          periodicidade: newPadrinho.periodicidade,
          observacoes: newPadrinho.observacoes,
          periodo: newPadrinho.periodo,
          data_fim: newPadrinho.data_fim,
          endereco: newPadrinho.endereco,
          endereco_cont: newPadrinho.endereco_cont,
          localidade: newPadrinho.localidade,
          codigo_postal: newPadrinho.codigo_postal,
          pais: newPadrinho.pais,
          cartao_cidadao: newPadrinho.cartao_cidadao,
          nif: newPadrinho.nif,
          data_nascimento: newPadrinho.data_nascimento,
          autoriza_email: newPadrinho.autoriza_email,
          contrib_vacinas: newPadrinho.contrib_vacinas,
          contrib_tosquia_banho: newPadrinho.contrib_tosquia_banho,
          contrib_racao_especial: newPadrinho.contrib_racao_especial,
          contrib_medicacao: newPadrinho.contrib_medicacao,
          contrib_acessorios: newPadrinho.contrib_acessorios,
          contrib_pessoal_divulgacao: newPadrinho.contrib_pessoal_divulgacao,
          contrib_pessoal_passeios: newPadrinho.contrib_pessoal_passeios,
          assinatura_digital: newPadrinho.assinatura_digital
        }]);
      if (error) console.log('Supabase RLS or insert restriction caught:', error.message);
    } catch (e) {
      console.warn('Could not insert to Supabase, but saved locally:', e);
    }

    return newPadrinho;
  },

  async updatePadrinho(id: string, updatedFields: Partial<Omit<Padrinho, 'id'>>): Promise<Padrinho> {
    const current = await this.getPadrinhos();
    let updatedPadrinho: Padrinho | null = null;

    const newList = current.map(p => {
      if (p.id === id) {
        updatedPadrinho = { ...p, ...updatedFields };
        return updatedPadrinho;
      }
      return p;
    });

    if (!updatedPadrinho) {
      throw new Error(`Padrinho com o ID ${id} não foi encontrado.`);
    }

    // Save locally
    storePadrinhosLocal(newList);

    // Try in Supabase
    try {
      const { error } = await supabase
        .from('padrinhos')
        .update({
          animal_id: updatedFields.animal_id,
          nome: updatedFields.nome,
          email: updatedFields.email,
          telefone: updatedFields.telefone,
          valor_mensal: updatedFields.valor_mensal,
          data_inicio: updatedFields.data_inicio,
          estado: updatedFields.estado,
          periodicidade: updatedFields.periodicidade,
          observacoes: updatedFields.observacoes,
          periodo: updatedFields.periodo,
          data_fim: updatedFields.data_fim,
          endereco: updatedFields.endereco,
          endereco_cont: updatedFields.endereco_cont,
          localidade: updatedFields.localidade,
          codigo_postal: updatedFields.codigo_postal,
          pais: updatedFields.pais,
          cartao_cidadao: updatedFields.cartao_cidadao,
          nif: updatedFields.nif,
          data_nascimento: updatedFields.data_nascimento,
          autoriza_email: updatedFields.autoriza_email,
          contrib_vacinas: updatedFields.contrib_vacinas,
          contrib_tosquia_banho: updatedFields.contrib_tosquia_banho,
          contrib_racao_especial: updatedFields.contrib_racao_especial,
          contrib_medicacao: updatedFields.contrib_medicacao,
          contrib_acessorios: updatedFields.contrib_acessorios,
          contrib_pessoal_divulgacao: updatedFields.contrib_pessoal_divulgacao,
          contrib_pessoal_passeios: updatedFields.contrib_pessoal_passeios,
          assinatura_digital: updatedFields.assinatura_digital
        })
        .eq('id', id);
      if (error) console.log('Supabase update rejected by RLS:', error.message);
    } catch (e) {
      console.warn('Could not update in Supabase, but saved locally:', e);
    }

    return updatedPadrinho;
  },

  async deletePadrinho(id: string): Promise<boolean> {
    const current = await this.getPadrinhos();
    const newList = current.filter(p => p.id !== id);
    storePadrinhosLocal(newList);

    // Try in Supabase
    try {
      const { error } = await supabase
        .from('padrinhos')
        .delete()
        .eq('id', id);
      if (error) console.log('Supabase delete rejected by RLS:', error.message);
    } catch (e) {
      console.warn('Could not delete in Supabase, but deleted locally:', e);
    }

    return true;
  }
};
