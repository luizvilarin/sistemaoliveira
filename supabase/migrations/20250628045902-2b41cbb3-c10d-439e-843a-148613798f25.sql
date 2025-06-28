
-- Criar tabela para grupos de chat
CREATE TABLE public.grupos_chat (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  imagem_url TEXT,
  criado_por UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para membros dos grupos
CREATE TABLE public.membros_grupo (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  grupo_id UUID NOT NULL REFERENCES public.grupos_chat(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL,
  papel TEXT NOT NULL DEFAULT 'membro', -- 'admin', 'membro'
  adicionado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(grupo_id, usuario_id)
);

-- Atualizar tabela de mensagens para suportar grupos e mídias
ALTER TABLE public.mensagens ADD COLUMN grupo_id UUID REFERENCES public.grupos_chat(id);
ALTER TABLE public.mensagens ADD COLUMN tipo_mensagem TEXT NOT NULL DEFAULT 'texto'; -- 'texto', 'imagem', 'video', 'audio', 'arquivo'
ALTER TABLE public.mensagens ADD COLUMN arquivo_url TEXT;
ALTER TABLE public.mensagens ADD COLUMN arquivo_nome TEXT;
ALTER TABLE public.mensagens ADD COLUMN duracao_audio INTEGER; -- em segundos, para áudios
ALTER TABLE public.mensagens ADD COLUMN mencoes TEXT[]; -- array de user_ids mencionados
ALTER TABLE public.mensagens ADD COLUMN emoji_reacoes JSONB DEFAULT '{}'; -- reações com emojis

-- Criar tabela para upload de arquivos/mídias
CREATE TABLE public.arquivos_mensagem (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mensagem_id UUID NOT NULL REFERENCES public.mensagens(id) ON DELETE CASCADE,
  nome_arquivo TEXT NOT NULL,
  tipo_arquivo TEXT NOT NULL,
  tamanho INTEGER NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Atualizar tabela de notificações para incluir mais informações
ALTER TABLE public.notificacoes_sistema ADD COLUMN grupo_id UUID REFERENCES public.grupos_chat(id);
ALTER TABLE public.notificacoes_sistema ADD COLUMN mensagem_id UUID REFERENCES public.mensagens(id);

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.grupos_chat ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membros_grupo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.arquivos_mensagem ENABLE ROW LEVEL SECURITY;

-- Políticas para grupos_chat
CREATE POLICY "Usuários podem ver grupos que são membros" 
  ON public.grupos_chat 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.membros_grupo 
      WHERE grupo_id = grupos_chat.id AND usuario_id = auth.uid()
    )
  );

CREATE POLICY "Usuários podem criar grupos" 
  ON public.grupos_chat 
  FOR INSERT 
  WITH CHECK (auth.uid() = criado_por);

CREATE POLICY "Admins do grupo podem atualizar" 
  ON public.grupos_chat 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.membros_grupo 
      WHERE grupo_id = grupos_chat.id 
      AND usuario_id = auth.uid() 
      AND papel = 'admin'
    )
  );

-- Políticas para membros_grupo
CREATE POLICY "Membros podem ver outros membros do grupo" 
  ON public.membros_grupo 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.membros_grupo mg2 
      WHERE mg2.grupo_id = membros_grupo.grupo_id 
      AND mg2.usuario_id = auth.uid()
    )
  );

CREATE POLICY "Admins podem adicionar/remover membros" 
  ON public.membros_grupo 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.membros_grupo mg2 
      WHERE mg2.grupo_id = membros_grupo.grupo_id 
      AND mg2.usuario_id = auth.uid() 
      AND mg2.papel = 'admin'
    )
  );

-- Políticas para arquivos_mensagem
CREATE POLICY "Usuários podem ver arquivos de mensagens que têm acesso" 
  ON public.arquivos_mensagem 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.mensagens m
      LEFT JOIN public.membros_grupo mg ON m.grupo_id = mg.grupo_id
      WHERE m.id = arquivos_mensagem.mensagem_id
      AND (
        m.remetente_id = auth.uid() 
        OR m.destinatario_id = auth.uid()
        OR (m.grupo_id IS NOT NULL AND mg.usuario_id = auth.uid())
      )
    )
  );

-- Atualizar políticas existentes da tabela mensagens para incluir grupos
DROP POLICY IF EXISTS "Users can view their own messages" ON public.mensagens;
DROP POLICY IF EXISTS "Users can create their own messages" ON public.mensagens;
DROP POLICY IF EXISTS "Users can update their own messages" ON public.mensagens;
DROP POLICY IF EXISTS "Users can delete their own messages" ON public.mensagens;

-- Novas políticas para mensagens incluindo grupos
CREATE POLICY "Usuários podem ver mensagens relevantes" 
  ON public.mensagens 
  FOR SELECT 
  USING (
    remetente_id = auth.uid() 
    OR destinatario_id = auth.uid()
    OR (
      grupo_id IS NOT NULL 
      AND EXISTS (
        SELECT 1 FROM public.membros_grupo 
        WHERE grupo_id = mensagens.grupo_id 
        AND usuario_id = auth.uid()
      )
    )
  );

CREATE POLICY "Usuários podem criar mensagens" 
  ON public.mensagens 
  FOR INSERT 
  WITH CHECK (
    remetente_id = auth.uid()
    AND (
      destinatario_id IS NOT NULL 
      OR (
        grupo_id IS NOT NULL 
        AND EXISTS (
          SELECT 1 FROM public.membros_grupo 
          WHERE grupo_id = mensagens.grupo_id 
          AND usuario_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Usuários podem atualizar suas próprias mensagens" 
  ON public.mensagens 
  FOR UPDATE 
  USING (remetente_id = auth.uid());

CREATE POLICY "Usuários podem deletar suas próprias mensagens" 
  ON public.mensagens 
  FOR DELETE 
  USING (remetente_id = auth.uid());

-- Função para notificar membros do grupo sobre nova mensagem
CREATE OR REPLACE FUNCTION public.notificar_mensagem_grupo()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Se for mensagem em grupo
  IF NEW.grupo_id IS NOT NULL THEN
    -- Inserir notificação para todos os membros do grupo, exceto o remetente
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
    AND mg.usuario_id != NEW.remetente_id;
    
  -- Se for mensagem individual
  ELSIF NEW.destinatario_id IS NOT NULL THEN
    -- Inserir notificação apenas para o destinatário
    INSERT INTO public.notificacoes_sistema (
      usuario_id,
      tipo,
      titulo,
      mensagem,
      mensagem_id,
      metadados
    ) VALUES (
      NEW.destinatario_id,
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

-- Criar trigger para notificações
CREATE TRIGGER trigger_notificar_mensagem_grupo
  AFTER INSERT ON public.mensagens
  FOR EACH ROW
  EXECUTE FUNCTION public.notificar_mensagem_grupo();

-- Habilitar realtime para as novas tabelas
ALTER TABLE public.grupos_chat REPLICA IDENTITY FULL;
ALTER TABLE public.membros_grupo REPLICA IDENTITY FULL;
ALTER TABLE public.arquivos_mensagem REPLICA IDENTITY FULL;

-- Adicionar às publicações realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.grupos_chat;
ALTER PUBLICATION supabase_realtime ADD TABLE public.membros_grupo;
ALTER PUBLICATION supabase_realtime ADD TABLE public.arquivos_mensagem;
