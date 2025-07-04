-- Limpar referências dos usuários que serão removidos
DELETE FROM public.user_invites WHERE invited_by IN ('912e0c9c-8a4e-4ac0-a15e-0ae3b810db35', '4d544928-186e-43d1-a3b0-faad7f3b30a6');

-- Remover lembretes criados por estes usuários
DELETE FROM public.lembretes WHERE responsavel_id IN ('912e0c9c-8a4e-4ac0-a15e-0ae3b810db35', '4d544928-186e-43d1-a3b0-faad7f3b30a6');

-- Remover notificações destes usuários
DELETE FROM public.notificacoes_sistema WHERE usuario_id IN ('912e0c9c-8a4e-4ac0-a15e-0ae3b810db35', '4d544928-186e-43d1-a3b0-faad7f3b30a6');

-- Remover mensagens onde estes usuários são remetentes
DELETE FROM public.mensagens WHERE remetente_id IN ('912e0c9c-8a4e-4ac0-a15e-0ae3b810db35', '4d544928-186e-43d1-a3b0-faad7f3b30a6');

-- Atualizar mensagens onde estes usuários são destinatários
UPDATE public.mensagens SET destinatario_id = NULL WHERE destinatario_id IN ('912e0c9c-8a4e-4ac0-a15e-0ae3b810db35', '4d544928-186e-43d1-a3b0-faad7f3b30a6');

-- Remover membros de grupos
DELETE FROM public.membros_grupo WHERE usuario_id IN ('912e0c9c-8a4e-4ac0-a15e-0ae3b810db35', '4d544928-186e-43d1-a3b0-faad7f3b30a6');

-- Remover grupos criados por estes usuários
DELETE FROM public.grupos_chat WHERE criado_por IN ('912e0c9c-8a4e-4ac0-a15e-0ae3b810db35', '4d544928-186e-43d1-a3b0-faad7f3b30a6');

-- Agora remover os profiles
DELETE FROM public.profiles WHERE id IN ('912e0c9c-8a4e-4ac0-a15e-0ae3b810db35', '4d544928-186e-43d1-a3b0-faad7f3b30a6');

-- Por último, remover os usuários do auth
DELETE FROM auth.users WHERE id IN ('912e0c9c-8a4e-4ac0-a15e-0ae3b810db35', '4d544928-186e-43d1-a3b0-faad7f3b30a6');