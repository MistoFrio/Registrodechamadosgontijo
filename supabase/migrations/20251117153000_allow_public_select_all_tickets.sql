/*
  Permite que usuários públicos (anon) consultem TODOS os tickets
  para o painel administrativo poder visualizar chamados abertos e resolvidos.
  Esta política é mais permissiva que a anterior que só permitia tickets abertos.
*/

-- Remove a política restritiva anterior se existir
DROP POLICY IF EXISTS "Allow public select open tickets" ON tickets;

-- Cria a política para permitir SELECT público de todos os tickets
CREATE POLICY "Allow public select all tickets"
  ON tickets
  FOR SELECT
  TO anon
  USING (true);

