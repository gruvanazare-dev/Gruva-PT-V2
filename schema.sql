-- Phase 1: Database Schema

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: animais
CREATE TABLE IF NOT EXISTS animais (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(255) NOT NULL,
  especie VARCHAR(100) NOT NULL, -- e.g., 'Cão', 'Gato'
  raca VARCHAR(100),
  idade_aprox VARCHAR(100), -- e.g., '2 anos', '3 meses'
  sexo VARCHAR(50), -- e.g., 'Macho', 'Fêmea'
  porte VARCHAR(50), -- e.g., 'Pequeno', 'Médio', 'Grande'
  estado VARCHAR(50) NOT NULL, -- 'Disponível', 'Em FAT', 'Adotado'
  foto_url TEXT,
  descricao TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: mensagens
CREATE TABLE IF NOT EXISTS mensagens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  telefone VARCHAR(50),
  assunto VARCHAR(100) NOT NULL, 
  -- Allowed states for assunto:
  -- 'Pedidos de ajuda externo'
  -- 'Candidatos a adoção'
  -- 'Visita ao canil para conhecer'
  -- 'Candidatos a FAT'
  -- 'Voluntariado'
  -- 'Outro assunto'
  mensagem TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert dummy data for animais to help with UI testing in Phase 2
INSERT INTO animais (nome, especie, raca, idade_aprox, sexo, porte, estado, foto_url, descricao) VALUES 
('Kika', 'Cão', 'Rafeiro', '3 anos', 'Fêmea', 'Médio', 'Disponível', 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=600&auto=format&fit=crop', 'A Kika é muito meiga e adora brincar.'),
('Bolinha', 'Gato', 'Europeu Comum', '2 meses', 'Macho', 'Pequeno', 'Em FAT', 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=600&auto=format&fit=crop', 'O Bolinha é muito brincalhão e curioso.')
ON CONFLICT DO NOTHING;

-- Table: padrinhos
CREATE TABLE IF NOT EXISTS padrinhos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  animal_id UUID REFERENCES animais(id) ON DELETE SET NULL,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  telefone VARCHAR(50),
  valor_mensal DECIMAL(10, 2) NOT NULL DEFAULT 10.00,
  data_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
  estado VARCHAR(50) NOT NULL DEFAULT 'Pendente', -- 'Pendente', 'Ativo', 'Inativo'
  periodicidade VARCHAR(50) NOT NULL DEFAULT 'Mensal', -- 'Mensal', 'Trimestral', 'Anual'
  observacoes TEXT,
  periodo VARCHAR(100), -- período contratado: '3 meses', '6 meses', 'Indeterminado' etc.
  data_fim DATE, -- data de término do apadrinhamento
  
  -- Campos detalhados da Ficha de Apadrinhamento Individual
  endereco TEXT,
  endereco_cont TEXT,
  localidade VARCHAR(255),
  codigo_postal VARCHAR(50),
  pais VARCHAR(105) DEFAULT 'Portugal',
  cartao_cidadao VARCHAR(100),
  nif VARCHAR(50),
  data_nascimento DATE,
  autoriza_email BOOLEAN DEFAULT TRUE,
  
  -- Outras contribuições
  contrib_vacinas BOOLEAN DEFAULT FALSE,
  contrib_tosquia_banho BOOLEAN DEFAULT FALSE,
  contrib_racao_especial BOOLEAN DEFAULT FALSE,
  contrib_medicacao BOOLEAN DEFAULT FALSE,
  contrib_acessorios BOOLEAN DEFAULT FALSE,
  
  -- Contribuição pessoal
  contrib_pessoal_divulgacao BOOLEAN DEFAULT FALSE,
  contrib_pessoal_passeios BOOLEAN DEFAULT FALSE,
  
  assinatura_digital TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
