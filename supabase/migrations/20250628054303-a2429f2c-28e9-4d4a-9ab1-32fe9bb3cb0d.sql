
-- Etapa 1: Remover TODAS as políticas existentes primeiro
DROP POLICY IF EXISTS "Users can view their groups" ON public.grupos_chat;
DROP POLICY IF EXISTS "Users can create groups" ON public.grupos_chat;
DROP POLICY IF EXISTS "Group creators can update groups" ON public.grupos_chat;
DROP POLICY IF EXISTS "Users can view group memberships" ON public.membros_grupo;
DROP POLICY IF EXISTS "Group creators can manage members" ON public.membros_grupo;
DROP POLICY IF EXISTS "Users can view their messages" ON public.mensagens;
DROP POLICY IF EXISTS "Users can send messages" ON public.mensagens;
DROP POLICY IF EXISTS "Users can update their messages" ON public.mensagens;
DROP POLICY IF EXISTS "Users can delete their messages" ON public.mensagens;
DROP POLICY IF EXISTS "Users can access message files" ON public.arquivos_mensagem;

-- Remover outras políticas que podem existir
DROP POLICY IF EXISTS "Usuários podem ver grupos que são membros" ON public.grupos_chat;
DROP POLICY IF EXISTS "Usuários podem criar grupos" ON public.grupos_chat;
DROP POLICY IF EXISTS "Admins do grupo podem atualizar" ON public.grupos_chat;
DROP POLICY IF EXISTS "Membros podem ver outros membros do grupo" ON public.membros_grupo;
DROP POLICY IF EXISTS "Admins podem adicionar/remover membros" ON public.membros_grupo;
DROP POLICY IF EXISTS "Usuários podem ver mensagens relevantes" ON public.mensagens;
DROP POLICY IF EXISTS "Usuários podem criar mensagens" ON public.mensagens;
DROP POLICY IF EXISTS "Usuários podem atualizar suas próprias mensagens" ON public.mensagens;
DROP POLICY IF EXISTS "Usuários podem deletar suas próprias mensagens" ON public.mensagens;
DROP POLICY IF EXISTS "Usuários podem ver arquivos de mensagens que têm acesso" ON public.arquivos_mensagem;

-- Agora recriar as políticas corretas
CREATE POLICY "Users can view their groups" ON public.grupos_chat
  FOR SELECT USING (
    criado_por = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.membros_grupo 
      WHERE grupo_id = grupos_chat.id AND usuario_id = auth.uid()
    )
  );

CREATE POLICY "Users can create groups" ON public.grupos_chat
  FOR INSERT WITH CHECK (auth.uid() = criado_por);

CREATE POLICY "Group creators can update groups" ON public.grupos_chat
  FOR UPDATE USING (criado_por = auth.uid());

CREATE POLICY "Users can view group memberships" ON public.membros_grupo
  FOR SELECT USING (
    usuario_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.grupos_chat gc
      WHERE gc.id = membros_grupo.grupo_id AND gc.criado_por = auth.uid()
    )
  );

CREATE POLICY "Group creators can manage members" ON public.membros_grupo
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.grupos_chat gc
      WHERE gc.id = membros_grupo.grupo_id AND gc.criado_por = auth.uid()
    )
  );

CREATE POLICY "Users can view their messages" ON public.mensagens
  FOR SELECT USING (
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
    OR (
      grupo_id IS NOT NULL 
      AND EXISTS (
        SELECT 1 FROM public.grupos_chat gc
        WHERE gc.id = mensagens.grupo_id AND gc.criado_por = auth.uid()
      )
    )
  );

CREATE POLICY "Users can send messages" ON public.mensagens
  FOR INSERT WITH CHECK (
    remetente_id = auth.uid()
    AND (
      (destinatario_id IS NOT NULL AND grupo_id IS NULL)
      OR (
        grupo_id IS NOT NULL 
        AND destinatario_id IS NULL
        AND (
          EXISTS (
            SELECT 1 FROM public.membros_grupo 
            WHERE grupo_id = mensagens.grupo_id 
            AND usuario_id = auth.uid()
          )
          OR EXISTS (
            SELECT 1 FROM public.grupos_chat gc
            WHERE gc.id = mensagens.grupo_id AND gc.criado_por = auth.uid()
          )
        )
      )
    )
  );

CREATE POLICY "Users can update their messages" ON public.mensagens
  FOR UPDATE USING (remetente_id = auth.uid());

CREATE POLICY "Users can delete their messages" ON public.mensagens
  FOR DELETE USING (remetente_id = auth.uid());

CREATE POLICY "Users can access message files" ON public.arquivos_mensagem
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.mensagens m
      WHERE m.id = arquivos_mensagem.mensagem_id
      AND (
        m.remetente_id = auth.uid() 
        OR m.destinatario_id = auth.uid()
        OR (
          m.grupo_id IS NOT NULL 
          AND (
            EXISTS (
              SELECT 1 FROM public.membros_grupo mg
              WHERE mg.grupo_id = m.grupo_id 
              AND mg.usuario_id = auth.uid()
            )
            OR EXISTS (
              SELECT 1 FROM public.grupos_chat gc
              WHERE gc.id = m.grupo_id AND gc.criado_por = auth.uid()
            )
          )
        )
      )
    )
  );

-- Garantir realtime e índices
ALTER TABLE public.grupos_chat REPLICA IDENTITY FULL;
ALTER TABLE public.membros_grupo REPLICA IDENTITY FULL;
ALTER TABLE public.mensagens REPLICA IDENTITY FULL;

CREATE INDEX IF NOT EXISTS idx_membros_grupo_usuario_grupo ON public.membros_grupo(usuario_id, grupo_id);
CREATE INDEX IF NOT EXISTS idx_mensagens_grupo_created ON public.mensagens(grupo_id, created_at);
CREATE INDEX IF NOT EXISTS idx_mensagens_individual ON public.mensagens(remetente_id, destinatario_id, created_at);
