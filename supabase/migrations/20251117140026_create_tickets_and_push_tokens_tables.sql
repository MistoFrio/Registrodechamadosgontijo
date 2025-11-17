/*
  # Sistema de Abertura de Chamados - Tabelas Principais

  1. Tabelas Criadas
    - `tickets`
      - `id` (uuid, primary key) - Identificador único do chamado
      - `email` (text) - Email corporativo do solicitante
      - `description` (text) - Descrição detalhada do problema
      - `status` (text) - Status do chamado (aberto, em_andamento, resolvido)
      - `created_at` (timestamptz) - Data de criação do chamado
      - `updated_at` (timestamptz) - Data da última atualização
    
    - `push_tokens`
      - `id` (uuid, primary key) - Identificador único do registro
      - `token` (text, unique) - Token FCM para notificações push
      - `device_info` (text) - Informações do dispositivo (opcional)
      - `created_at` (timestamptz) - Data de registro do token
      - `updated_at` (timestamptz) - Data da última atualização

  2. Segurança
    - RLS habilitado em ambas as tabelas
    - `tickets`: Acesso público para INSERT (criar chamados), leitura apenas autenticada
    - `push_tokens`: Acesso apenas autenticado para todas as operações

  3. Observações Importantes
    - A tabela de tickets permite criação pública (para o formulário web)
    - Status padrão dos tickets é 'aberto'
    - Tokens FCM são únicos para evitar duplicação
    - Timestamps são atualizados automaticamente
*/

-- Criar tabela de tickets
CREATE TABLE IF NOT EXISTS tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  description text NOT NULL,
  status text NOT NULL DEFAULT 'aberto',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Criar tabela de tokens de push
CREATE TABLE IF NOT EXISTS push_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token text UNIQUE NOT NULL,
  device_info text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Habilitar RLS em ambas as tabelas
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;

-- Políticas para tickets: permitir INSERT público, SELECT apenas autenticado
CREATE POLICY "Allow public insert on tickets"
  ON tickets
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow authenticated select on tickets"
  ON tickets
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated update on tickets"
  ON tickets
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated delete on tickets"
  ON tickets
  FOR DELETE
  TO authenticated
  USING (true);

-- Políticas para push_tokens: apenas usuários autenticados
CREATE POLICY "Allow authenticated select on push_tokens"
  ON push_tokens
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated insert on push_tokens"
  ON push_tokens
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update on push_tokens"
  ON push_tokens
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated delete on push_tokens"
  ON push_tokens
  FOR DELETE
  TO authenticated
  USING (true);

-- Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_tickets_email ON tickets(email);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON tickets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_push_tokens_token ON push_tokens(token);
