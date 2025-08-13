-- Atualizar o usuário financas.grupooliveirahomecare@gmail.com para admin+
UPDATE public.profiles 
SET perfil = 'admin_plus'
WHERE email = 'financas.grupooliveirahomecare@gmail.com';

-- Verificar se a atualização foi realizada
DO $$
DECLARE
    user_count INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO user_count
    FROM public.profiles
    WHERE email = 'financas.grupooliveirahomecare@gmail.com' AND perfil = 'admin_plus';
    
    IF user_count > 0 THEN
        RAISE NOTICE 'Usuário financas.grupooliveirahomecare@gmail.com atualizado para admin+ com sucesso';
    ELSE
        RAISE NOTICE 'Usuário financas.grupooliveirahomecare@gmail.com não encontrado ou não atualizado';
    END IF;
END $$;