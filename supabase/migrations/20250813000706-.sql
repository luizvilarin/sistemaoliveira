-- Fix the last remaining function with search_path
CREATE OR REPLACE FUNCTION public.criar_notificacao_lembrete()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Criar notificação quando um lembrete é criado
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.notificacoes_sistema (
      usuario_id,
      tipo,
      titulo,
      mensagem,
      data_vencimento,
      acao_url,
      metadados
    ) VALUES (
      NEW.responsavel_id,
      'lembrete',
      'Novo lembrete criado',
      'Lembrete "' || NEW.titulo || '" foi criado para ' || NEW.dia::text,
      NEW.dia::timestamp with time zone,
      '/calendario',
      jsonb_build_object('lembrete_id', NEW.id, 'urgente', NEW.urgente)
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;