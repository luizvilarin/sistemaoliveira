-- Criar convite para o usuário Elias com perfil financeiro
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

-- Criar o usuário diretamente no sistema auth (simulando aceite do convite)
-- Primeiro vamos inserir na tabela auth.users
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  invited_at,
  confirmation_token,
  confirmation_sent_at,
  recovery_token,
  recovery_sent_at,
  email_change_token_new,
  email_change,
  email_change_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at,
  phone,
  phone_confirmed_at,
  phone_change,
  phone_change_token,
  phone_change_sent_at,
  email_change_token_current,
  email_change_confirm_status,
  banned_until,
  reauthentication_token,
  reauthentication_sent_at,
  is_sso_user,
  deleted_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'eliasfinanceiro.sgc@gmail.com',
  crypt('elias123', gen_salt('bf')),
  now(),
  now(),
  '',
  now(),
  '',
  null,
  '',
  '',
  null,
  null,
  '{"provider": "email", "providers": ["email"]}',
  '{"nome": "Elias", "perfil": "financeiro"}',
  false,
  now(),
  now(),
  null,
  null,
  '',
  '',
  null,
  '',
  0,
  null,
  '',
  null,
  false,
  null
);

-- Criar perfil para o usuário
INSERT INTO public.profiles (
  id,
  nome,
  email,
  perfil,
  ativo,
  created_at,
  updated_at
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'eliasfinanceiro.sgc@gmail.com'),
  'Elias',
  'eliasfinanceiro.sgc@gmail.com',
  'financeiro',
  true,
  now(),
  now()
);

-- Marcar convite como aceito
UPDATE public.user_invites 
SET accepted = true 
WHERE email = 'eliasfinanceiro.sgc@gmail.com';