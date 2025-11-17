/*
  Permite que usuários públicos (anon) atualizem o status dos tickets
  para permitir que o painel administrativo (que usa autenticação própria)
  possa marcar chamados como resolvidos.
*/

-- Remove a política se já existir
DROP POLICY IF EXISTS "Allow public update on tickets" ON tickets;

-- Cria a política para permitir UPDATE público nos tickets
CREATE POLICY "Allow public update on tickets"
  ON tickets
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

