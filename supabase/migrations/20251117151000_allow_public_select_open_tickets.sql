/*
  Permite que usuários públicos (anon) consultem apenas chamados em aberto
  para possibilitar a verificação da posição na fila através do formulário
  público, mantendo RLS ativo.
*/

-- Remove a política se já existir
DROP POLICY IF EXISTS "Allow public select open tickets" ON tickets;

-- Cria a política para permitir SELECT público apenas de chamados abertos
CREATE POLICY "Allow public select open tickets"
  ON tickets
  FOR SELECT
  TO anon
  USING (status = 'aberto');


