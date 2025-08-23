-- Atualizar a constraint da tabela profiles para incluir 'financeiro'
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_perfil_check;

ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_perfil_check 
CHECK (perfil = ANY(ARRAY['admin'::text, 'admin_plus'::text, 'gestor'::text, 'cuidador'::text, 'financeiro'::text]));

-- Agora criar convite para o usuário Elias com perfil financeiro (se não existir)
INSERT INTO public.user_invites (
  email,
  nome,
  perfil,
  invited_by,
  expires_at
) 
SELECT 
  'eliasfinanceiro.sgc@gmail.com',
  'Elias',
  'financeiro',
  (SELECT id FROM public.profiles WHERE email = 'luizvilarinho.nave@gmail.com' LIMIT 1),
  now() + interval '30 days'
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_invites WHERE email = 'eliasfinanceiro.sgc@gmail.com'
);

-- Criar perfil para o usuário Elias (se não existir)
INSERT INTO public.profiles (
  id,
  nome,
  email,
  perfil,
  ativo,
  created_at,
  updated_at
) 
SELECT 
  gen_random_uuid(),
  'Elias',
  'eliasfinanceiro.sgc@gmail.com',
  'financeiro',
  true,
  now(),
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles WHERE email = 'eliasfinanceiro.sgc@gmail.com'
);

-- Marcar convite como aceito
UPDATE public.user_invites 
SET accepted = true 
WHERE email = 'eliasfinanceiro.sgc@gmail.com';