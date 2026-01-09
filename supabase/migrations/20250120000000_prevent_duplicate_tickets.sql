/*
  # Prevenção de Chamados Duplicados
  
  Adiciona uma função e trigger para prevenir inserção de chamados duplicados
  baseados em email + description dentro de um intervalo de 10 segundos.
*/

-- Função para verificar e prevenir duplicados
CREATE OR REPLACE FUNCTION prevent_duplicate_tickets()
RETURNS TRIGGER AS $$
DECLARE
  duplicate_count INTEGER;
BEGIN
  -- Verificar se existe um chamado idêntico criado nos últimos 10 segundos
  SELECT COUNT(*) INTO duplicate_count
  FROM tickets
  WHERE email = LOWER(NEW.email)
    AND description = NEW.description
    AND status = 'aberto'
    AND created_at > NOW() - INTERVAL '10 seconds';
  
  -- Se encontrar duplicado, abortar a inserção
  IF duplicate_count > 0 THEN
    RAISE EXCEPTION 'Um chamado idêntico foi criado recentemente. Aguarde alguns segundos antes de tentar novamente.';
  END IF;
  
  -- Normalizar email para lowercase
  NEW.email := LOWER(NEW.email);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger antes da inserção
DROP TRIGGER IF EXISTS check_duplicate_tickets ON tickets;
CREATE TRIGGER check_duplicate_tickets
  BEFORE INSERT ON tickets
  FOR EACH ROW
  EXECUTE FUNCTION prevent_duplicate_tickets();

-- Comentário explicativo
COMMENT ON FUNCTION prevent_duplicate_tickets() IS 
  'Previne inserção de chamados duplicados baseados em email + description dentro de 10 segundos';

