
-- Adicionar novos campos na tabela lembretes para torná-los mais personalizáveis
ALTER TABLE public.lembretes 
ADD COLUMN urgente boolean DEFAULT false,
ADD COLUMN hora time DEFAULT NULL,
ADD COLUMN tipo text DEFAULT 'geral',
ADD COLUMN tags text[] DEFAULT '{}',
ADD COLUMN status text DEFAULT 'pendente';

-- Criar tabela para notificações do sistema
CREATE TABLE IF NOT EXISTS public.notificacoes_sistema (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID NOT NULL,
  tipo text NOT NULL,
  titulo text NOT NULL,
  mensagem text NOT NULL,
  data_criacao timestamp with time zone DEFAULT now(),
  data_vencimento timestamp with time zone,
  lida boolean DEFAULT false,
  acao_url text,
  metadados jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- Habilitar RLS na tabela de notificações do sistema
ALTER TABLE public.notificacoes_sistema ENABLE ROW LEVEL SECURITY;

-- Política para que usuários vejam apenas suas notificações
CREATE POLICY "Users can view their own system notifications" 
  ON public.notificacoes_sistema 
  FOR ALL 
  USING (usuario_id = auth.uid());

-- Função para criar notificações automáticas baseadas em lembretes
CREATE OR REPLACE FUNCTION public.criar_notificacao_lembrete()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Trigger para criar notificações automáticas
CREATE TRIGGER trigger_notificacao_lembrete
  AFTER INSERT ON public.lembretes
  FOR EACH ROW
  EXECUTE FUNCTION public.criar_notificacao_lembrete();

-- Atualizar a tabela de usuários/profiles para funcionar corretamente
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS senha_hash text,
ADD COLUMN IF NOT EXISTS ativo boolean DEFAULT true;
