/*
  # Base de Conhecimento para Treinamento da IA
  
  Tabela para armazenar perguntas frequentes, soluções comuns e exemplos
  que serão usados para treinar e melhorar as respostas da IA.
*/

-- Criar tabela de base de conhecimento
CREATE TABLE IF NOT EXISTS ai_knowledge_base (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  category text DEFAULT 'geral',
  keywords text[] DEFAULT ARRAY[]::text[],
  priority integer DEFAULT 0,
  usage_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE ai_knowledge_base ENABLE ROW LEVEL SECURITY;

-- Permitir SELECT público (para a IA consultar)
CREATE POLICY "Allow public select on ai_knowledge_base"
  ON ai_knowledge_base
  FOR SELECT
  TO anon
  USING (true);

-- Permitir INSERT/UPDATE/DELETE apenas autenticado (admin)
-- Como não temos autenticação real, vamos permitir público também
-- mas você pode restringir depois se necessário
CREATE POLICY "Allow public insert on ai_knowledge_base"
  ON ai_knowledge_base
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow public update on ai_knowledge_base"
  ON ai_knowledge_base
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete on ai_knowledge_base"
  ON ai_knowledge_base
  FOR DELETE
  TO anon
  USING (true);

-- Criar índices para busca rápida
CREATE INDEX IF NOT EXISTS idx_ai_kb_category ON ai_knowledge_base(category);
CREATE INDEX IF NOT EXISTS idx_ai_kb_keywords ON ai_knowledge_base USING GIN(keywords);
CREATE INDEX IF NOT EXISTS idx_ai_kb_priority ON ai_knowledge_base(priority DESC);
CREATE INDEX IF NOT EXISTS idx_ai_kb_usage_count ON ai_knowledge_base(usage_count DESC);

-- Inserir alguns exemplos iniciais
INSERT INTO ai_knowledge_base (question, answer, category, keywords, priority) VALUES
('Como resetar minha senha?', 'Para resetar sua senha, pressione Ctrl+Alt+Del e selecione "Alterar senha". Se não funcionar, entre em contato com o suporte técnico para redefinição.', 'senha', ARRAY['senha', 'reset', 'password', 'esqueci'], 10),
('Meu computador está lento', 'Tente: 1) Reiniciar o computador, 2) Fechar programas não utilizados, 3) Verificar espaço em disco (deve ter pelo menos 10% livre), 4) Executar limpeza de disco. Se persistir, pode ser necessário verificação de vírus ou atualização de hardware.', 'performance', ARRAY['lento', 'performance', 'velocidade', 'travando'], 8),
('Não consigo acessar a internet', 'Verifique: 1) Se o cabo de rede está conectado (ou WiFi ativo), 2) Se outros dispositivos conseguem acessar, 3) Tente reiniciar o roteador, 4) Verifique as configurações de rede no Windows. Se nada funcionar, pode ser problema de infraestrutura de rede.', 'rede', ARRAY['internet', 'rede', 'wifi', 'conexão', 'sem acesso'], 9),
('Erro ao imprimir', 'Tente: 1) Verificar se a impressora está ligada e conectada, 2) Verificar se há papel e tinta, 3) Reiniciar o serviço de impressão (services.msc > Print Spooler), 4) Reinstalar o driver da impressora. Se persistir, verifique se outros computadores conseguem imprimir.', 'impressora', ARRAY['imprimir', 'impressora', 'erro impressão', 'driver'], 7),
('Email não está abrindo', 'Tente: 1) Fechar e reabrir o Outlook/email, 2) Verificar conexão com internet, 3) Limpar cache do navegador (se for webmail), 4) Verificar se o servidor de email está online. Se for Outlook, tente reparar o perfil.', 'email', ARRAY['email', 'outlook', 'não abre', 'erro email'], 8);

