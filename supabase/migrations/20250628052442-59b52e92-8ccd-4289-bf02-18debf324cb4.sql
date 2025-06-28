
-- Remover todas as políticas existentes das tabelas principais
DROP POLICY IF EXISTS "Users can view relevant profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view groups they are members of" ON public.grupos_chat;
DROP POLICY IF EXISTS "Authenticated users can create groups" ON public.grupos_chat;
DROP POLICY IF EXISTS "Group admins can update groups" ON public.grupos_chat;
DROP POLICY IF EXISTS "Members can view group members" ON public.membros_grupo;
DROP POLICY IF EXISTS "Group creators and admins can manage members" ON public.membros_grupo;
DROP POLICY IF EXISTS "Users can view relevant messages" ON public.mensagens;
DROP POLICY IF EXISTS "Users can send messages" ON public.mensagens;
DROP POLICY IF EXISTS "Users can update their own messages" ON public.mensagens;
DROP POLICY IF EXISTS "Users can delete their own messages" ON public.mensagens;
DROP POLICY IF EXISTS "Users can manage message files" ON public.arquivos_mensagem;

-- Recriar políticas para profiles
CREATE POLICY "Users can view relevant profiles" ON public.profiles
  FOR SELECT USING (
    id = auth.uid() OR
    public.is_current_user_admin() OR
    (public.get_current_user_role() = 'gestor' AND perfil IN ('admin', 'gestor', 'cuidador')) OR
    (public.get_current_user_role() = 'cuidador' AND perfil IN ('gestor', 'cuidador'))
  );

-- Recriar políticas para grupos_chat
CREATE POLICY "Users can view groups they are members of" ON public.grupos_chat
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.membros_grupo 
      WHERE grupo_id = grupos_chat.id AND usuario_id = auth.uid()
    ) OR
    criado_por = auth.uid()
  );

CREATE POLICY "Authenticated users can create groups" ON public.grupos_chat
  FOR INSERT WITH CHECK (auth.uid() = criado_por);

CREATE POLICY "Group admins can update groups" ON public.grupos_chat
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.membros_grupo 
      WHERE grupo_id = grupos_chat.id 
      AND usuario_id = auth.uid() 
      AND papel = 'admin'
    ) OR criado_por = auth.uid()
  );

-- Recriar políticas para membros_grupo
CREATE POLICY "Members can view group members" ON public.membros_grupo
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.membros_grupo mg2 
      WHERE mg2.grupo_id = membros_grupo.grupo_id 
      AND mg2.usuario_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.grupos_chat gc
      WHERE gc.id = membros_grupo.grupo_id AND gc.criado_por = auth.uid()
    )
  );

CREATE POLICY "Group creators and admins can manage members" ON public.membros_grupo
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.grupos_chat gc
      WHERE gc.id = membros_grupo.grupo_id AND gc.criado_por = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.membros_grupo mg2 
      WHERE mg2.grupo_id = membros_grupo.grupo_id 
      AND mg2.usuario_id = auth.uid() 
      AND mg2.papel = 'admin'
    )
  );

-- Recriar políticas para mensagens
CREATE POLICY "Users can view relevant messages" ON public.mensagens
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
  );

CREATE POLICY "Users can send messages" ON public.mensagens
  FOR INSERT WITH CHECK (
    remetente_id = auth.uid()
    AND (
      destinatario_id IS NOT NULL 
      OR (
        grupo_id IS NOT NULL 
        AND (
          EXISTS (
            SELECT 1 FROM public.membros_grupo 
            WHERE grupo_id = mensagens.grupo_id 
            AND usuario_id = auth.uid()
          ) OR
          EXISTS (
            SELECT 1 FROM public.grupos_chat gc
            WHERE gc.id = mensagens.grupo_id AND gc.criado_por = auth.uid()
          )
        )
      )
    )
  );

CREATE POLICY "Users can update their own messages" ON public.mensagens
  FOR UPDATE USING (remetente_id = auth.uid());

CREATE POLICY "Users can delete their own messages" ON public.mensagens
  FOR DELETE USING (remetente_id = auth.uid());

-- Recriar política para arquivos_mensagem
CREATE POLICY "Users can manage message files" ON public.arquivos_mensagem
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.mensagens m
      LEFT JOIN public.membros_grupo mg ON m.grupo_id = mg.grupo_id
      WHERE m.id = arquivos_mensagem.mensagem_id
      AND (
        m.remetente_id = auth.uid() 
        OR m.destinatario_id = auth.uid()
        OR (m.grupo_id IS NOT NULL AND mg.usuario_id = auth.uid())
        OR (m.grupo_id IS NOT NULL AND EXISTS (
          SELECT 1 FROM public.grupos_chat gc 
          WHERE gc.id = m.grupo_id AND gc.criado_por = auth.uid()
        ))
      )
    )
  );

-- Habilitar realtime para melhor sincronização
ALTER TABLE public.grupos_chat REPLICA IDENTITY FULL;
ALTER TABLE public.membros_grupo REPLICA IDENTITY FULL;
ALTER TABLE public.mensagens REPLICA IDENTITY FULL;
