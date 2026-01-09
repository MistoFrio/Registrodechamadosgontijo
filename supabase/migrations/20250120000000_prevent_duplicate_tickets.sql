/*
  # Prevenção de Chamados Duplicados
  
  Adiciona uma função e trigger para prevenir inserção de chamados duplicados
  baseados em email + description dentro de um intervalo de 15 segundos.
  Usa lock de transação para prevenir race conditions em inserções simultâneas.
*/

-- Função para verificar e prevenir duplicados com lock de transação
CREATE OR REPLACE FUNCTION prevent_duplicate_tickets()
RETURNS TRIGGER AS $$
DECLARE
  duplicate_count INTEGER;
  lock_key BIGINT;
BEGIN
  -- Normalizar email para lowercase PRIMEIRO
  NEW.email := LOWER(TRIM(NEW.email));
  NEW.description := TRIM(NEW.description);
  
  -- Criar uma chave de lock único baseada no conteúdo usando hash
  -- Usar hashtext para criar um número inteiro único para o lock
  lock_key := hashtext(NEW.email || '|' || NEW.description);
  
  -- Tentar adquirir lock exclusivo para este email+description
  -- Isso previne race conditions em inserções simultâneas
  -- O lock é liberado automaticamente quando a transação termina
  PERFORM pg_advisory_xact_lock(lock_key);
  
  -- Verificar se existe um chamado idêntico criado nos últimos 15 segundos
  -- Usar NOW() - INTERVAL para garantir consistência temporal
  SELECT COUNT(*) INTO duplicate_count
  FROM tickets
  WHERE LOWER(TRIM(email)) = NEW.email
    AND TRIM(description) = NEW.description
    AND status = 'aberto'
    AND created_at > NOW() - INTERVAL '15 seconds';
  
  -- Se encontrar duplicado, abortar a inserção
  IF duplicate_count > 0 THEN
    RAISE EXCEPTION 'Um chamado idêntico foi criado recentemente. Aguarde alguns segundos antes de tentar novamente.'
      USING ERRCODE = '23505';
  END IF;
  
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
  'Previne inserção de chamados duplicados baseados em email + description dentro de 15 segundos usando lock de transação';

