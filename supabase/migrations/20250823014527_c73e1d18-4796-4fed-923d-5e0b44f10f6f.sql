-- Verificar e corrigir as constraints de perfil
-- Primeiro, vamos ver as constraints atuais e removê-las
ALTER TABLE public.user_invites DROP CONSTRAINT IF EXISTS user_invites_perfil_check;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_perfil_check;

-- Recriar as constraints incluindo 'financeiro'
ALTER TABLE public.user_invites 
ADD CONSTRAINT user_invites_perfil_check 
CHECK (perfil IN ('admin', 'admin_plus', 'gestor', 'cuidador', 'financeiro'));

ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_perfil_check 
CHECK (perfil IN ('admin', 'admin_plus', 'gestor', 'cuidador', 'financeiro'));

-- Agora tentar criar o convite novamente
INSERT INTO public.user_invites (
  email,
  nome,
  perfil,
  invited_by,
  expires_at
) VALUES (
  'eliasfinanceiro.sgc@gmail.com',
  'Elias',
  'financeiro',
  (SELECT id FROM public.profiles WHERE email = 'luizvilarinho.nave@gmail.com' LIMIT 1),
  now() + interval '30 days'
) ON CONFLICT (email) DO NOTHING;