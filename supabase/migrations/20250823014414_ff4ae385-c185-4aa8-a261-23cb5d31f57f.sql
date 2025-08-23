-- Primeiro vamos atualizar a constraint da tabela user_invites para incluir 'financeiro'
ALTER TABLE public.user_invites 
DROP CONSTRAINT IF EXISTS user_invites_perfil_check;

ALTER TABLE public.user_invites 
ADD CONSTRAINT user_invites_perfil_check 
CHECK (perfil = ANY(ARRAY['admin'::text, 'admin_plus'::text, 'gestor'::text, 'cuidador'::text, 'financeiro'::text]));

-- Agora criar convite para o usuário Elias com perfil financeiro
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
);

-- Como não podemos inserir diretamente na tabela auth.users, vamos usar uma abordagem diferente
-- Vamos criar apenas o perfil e simular que o usuário já foi criado via signup
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