-- Corrigir o trigger de notificação de mensagens para não notificar o próprio remetente
CREATE OR REPLACE FUNCTION public.notificar_mensagem_grupo()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Se for mensagem em grupo
  IF NEW.grupo_id IS NOT NULL THEN
    -- Inserir notificação para todos os membros do grupo, EXCETO o remetente
    INSERT INTO public.notificacoes_sistema (
      usuario_id,
      tipo,
      titulo,
      mensagem,
      grupo_id,
      mensagem_id,
      metadados
    )
    SELECT 
      mg.usuario_id,
      'mensagem_grupo',
      'Nova mensagem no grupo',
      COALESCE(gc.nome, 'Grupo') || ': ' || LEFT(NEW.conteudo, 50) || CASE WHEN LENGTH(NEW.conteudo) > 50 THEN '...' ELSE '' END,
      NEW.grupo_id,
      NEW.id,
      jsonb_build_object(
        'remetente_id', NEW.remetente_id,
        'grupo_nome', gc.nome,
        'tipo_mensagem', NEW.tipo_mensagem
      )
    FROM public.membros_grupo mg
    JOIN public.grupos_chat gc ON gc.id = mg.grupo_id
    WHERE mg.grupo_id = NEW.grupo_id 
    AND mg.usuario_id != NEW.remetente_id; -- IMPORTANTE: Excluir o remetente
    
  -- Se for mensagem individual
  ELSIF NEW.destinatario_id IS NOT NULL THEN
    -- Inserir notificação APENAS para o destinatário, NÃO para o remetente
    INSERT INTO public.notificacoes_sistema (
      usuario_id,
      tipo,
      titulo,
      mensagem,
      mensagem_id,
      metadados
    ) VALUES (
      NEW.destinatario_id, -- APENAS o destinatário recebe a notificação
      'mensagem_individual',
      'Nova mensagem',
      LEFT(NEW.conteudo, 100) || CASE WHEN LENGTH(NEW.conteudo) > 100 THEN '...' ELSE '' END,
      NEW.id,
      jsonb_build_object(
        'remetente_id', NEW.remetente_id,
        'tipo_mensagem', NEW.tipo_mensagem
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;