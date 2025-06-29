
-- Adicionar coluna de status para usuários
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS status_online TEXT DEFAULT 'offline' CHECK (status_online IN ('online', 'offline', 'ausente', 'ocupado'));

-- Adicionar coluna de última atividade
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS ultima_atividade TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Adicionar colunas de status de mensagem
ALTER TABLE public.mensagens 
ADD COLUMN IF NOT EXISTS entregue BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS visualizada BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS data_entrega TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS data_visualizacao TIMESTAMP WITH TIME ZONE;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_profiles_status_online ON public.profiles(status_online);
CREATE INDEX IF NOT EXISTS idx_profiles_ultima_atividade ON public.profiles(ultima_atividade);
CREATE INDEX IF NOT EXISTS idx_mensagens_status ON public.mensagens(entregue, visualizada);

-- Habilitar realtime para a tabela profiles
ALTER TABLE public.profiles REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;

-- Função para atualizar última atividade automaticamente
CREATE OR REPLACE FUNCTION public.atualizar_ultima_atividade()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  NEW.ultima_atividade = now();
  RETURN NEW;
END;
$$;

-- Trigger para atualizar última atividade quando o status online muda
DROP TRIGGER IF EXISTS trigger_atualizar_ultima_atividade ON public.profiles;
CREATE TRIGGER trigger_atualizar_ultima_atividade
  BEFORE UPDATE OF status_online ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.atualizar_ultima_atividade();

-- Função para marcar mensagens como entregues automaticamente
CREATE OR REPLACE FUNCTION public.marcar_mensagem_entregue()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  NEW.entregue = true;
  NEW.data_entrega = now();
  RETURN NEW;
END;
$$;

-- Trigger para marcar mensagens como entregues ao inserir
DROP TRIGGER IF EXISTS trigger_marcar_entregue ON public.mensagens;
CREATE TRIGGER trigger_marcar_entregue
  BEFORE INSERT ON public.mensagens
  FOR EACH ROW
  EXECUTE FUNCTION public.marcar_mensagem_entregue();
