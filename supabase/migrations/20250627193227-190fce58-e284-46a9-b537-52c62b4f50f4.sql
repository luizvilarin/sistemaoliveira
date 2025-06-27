
-- Criar tabela para convites de usuários
CREATE TABLE public.user_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  nome TEXT NOT NULL,
  perfil TEXT NOT NULL CHECK (perfil IN ('admin', 'gestor', 'cuidador')),
  invited_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '7 days'),
  accepted BOOLEAN DEFAULT false
);

-- Habilitar RLS na tabela de convites
ALTER TABLE public.user_invites ENABLE ROW LEVEL SECURITY;

-- Política para admins verem todos os convites
CREATE POLICY "Admins can view all invites" ON public.user_invites
  FOR SELECT USING (public.is_current_user_admin());

-- Política para admins criarem convites
CREATE POLICY "Admins can create invites" ON public.user_invites
  FOR INSERT WITH CHECK (public.is_current_user_admin());

-- Política para admins atualizarem convites
CREATE POLICY "Admins can update invites" ON public.user_invites
  FOR UPDATE USING (public.is_current_user_admin());

-- Política para admins deletarem convites
CREATE POLICY "Admins can delete invites" ON public.user_invites
  FOR DELETE USING (public.is_current_user_admin());

-- Função para processar convite aceito
CREATE OR REPLACE FUNCTION public.process_user_invite()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verificar se existe convite para este email
  IF EXISTS (
    SELECT 1 FROM public.user_invites 
    WHERE email = NEW.email 
    AND NOT accepted 
    AND expires_at > now()
  ) THEN
    -- Atualizar perfil do usuário com dados do convite
    UPDATE public.profiles 
    SET 
      nome = (SELECT nome FROM public.user_invites WHERE email = NEW.email AND NOT accepted),
      perfil = (SELECT perfil FROM public.user_invites WHERE email = NEW.email AND NOT accepted)
    WHERE id = NEW.id;
    
    -- Marcar convite como aceito
    UPDATE public.user_invites 
    SET accepted = true 
    WHERE email = NEW.email AND NOT accepted;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger para processar convites quando usuário se registra
CREATE TRIGGER on_user_invite_accepted
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.process_user_invite();

-- Função para admins deleterem usuários (exceto o proprietário)
CREATE OR REPLACE FUNCTION public.admin_delete_user(user_id_to_delete UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  target_email TEXT;
BEGIN
  -- Verificar se o usuário atual é admin
  IF NOT public.is_current_user_admin() THEN
    RAISE EXCEPTION 'Apenas administradores podem deletar usuários';
  END IF;
  
  -- Buscar email do usuário a ser deletado
  SELECT email INTO target_email
  FROM public.profiles
  WHERE id = user_id_to_delete;
  
  -- Proteger o usuário proprietário
  IF target_email = 'luizvilarinho.nave@gmail.com' THEN
    RAISE EXCEPTION 'O usuário proprietário não pode ser deletado';
  END IF;
  
  -- Deletar usuário (cascade vai deletar o profile)
  DELETE FROM auth.users WHERE id = user_id_to_delete;
  
  RETURN TRUE;
END;
$$;

-- Bucket para avatars se não existir
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas para o bucket de avatars
CREATE POLICY "Anyone can view avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own avatar" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own avatar" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
