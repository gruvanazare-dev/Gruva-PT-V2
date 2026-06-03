-- Phase 4: Supabase Row Level Security (RLS) Policies

-- Ativação da RLS (Row Level Security) para as tabelas
ALTER TABLE animais ENABLE ROW LEVEL SECURITY;
ALTER TABLE mensagens ENABLE ROW LEVEL SECURITY;

-- Políticas para a Tabela "animais":
-- Permite leitura pública (Qualquer um pode ver os animais disponíveis)
CREATE POLICY "Permitir leitura publica de animais" ON animais
FOR SELECT USING (true);

-- Nota: Inserções, Atualizações e Remoções (INSERT, UPDATE, DELETE) em "animais" 
-- ficam bloqueadas por padrão para requisições anónimas. Apenas Administradores
-- (ou papéis com privilégios adequados) através de Service Role poderão modificar.

-- Políticas para a Tabela "mensagens":
-- Permite inserção pública (Qualquer um pode enviar uma mensagem pelo formulário)
CREATE POLICY "Permitir insercao publica de mensagens" ON mensagens
FOR INSERT WITH CHECK (true);

-- Nota: A leitura (SELECT) em "mensagens" fica bloqueada por padrão para
-- utilizadores do site. Assim, a privacidade das mensagens é garantida. Apenas
-- os Administradores pela dashboard do Supabase poderão ler as mensagens.

-- Ativação da RLS para a Tabela "padrinhos"
ALTER TABLE padrinhos ENABLE ROW LEVEL SECURITY;

