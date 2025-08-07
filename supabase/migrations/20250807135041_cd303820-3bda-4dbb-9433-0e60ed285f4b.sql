-- First, add admin_plus to the allowed perfil values
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_perfil_check;

-- Recreate the constraint with admin_plus included
ALTER TABLE public.profiles ADD CONSTRAINT profiles_perfil_check 
CHECK (perfil IN ('admin', 'gestor', 'cuidador', 'admin_plus'));

-- Now update luizvilarinho.nave@gmail.com to admin+ role
UPDATE public.profiles 
SET perfil = 'admin_plus' 
WHERE email = 'luizvilarinho.nave@gmail.com';