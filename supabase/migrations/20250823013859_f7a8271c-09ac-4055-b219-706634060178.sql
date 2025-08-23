-- Adicionar o perfil 'financeiro' que terá acesso a boletos além das funcionalidades de admin
-- Não é necessário alterar tabelas, apenas documentar o novo perfil

-- Comentário sobre o novo perfil
COMMENT ON COLUMN public.profiles.perfil IS 'Perfil do usuário: admin, admin_plus, gestor, cuidador, financeiro. O perfil financeiro tem as mesmas permissões de admin + acesso a boletos.';