-- Update function to include admin_plus in admin check
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND perfil = ANY(ARRAY['admin', 'admin_plus'])
  );
$function$;

-- Update the role function to properly handle admin_plus
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
AS $function$
  SELECT perfil FROM public.profiles WHERE id = auth.uid();
$function$;

-- Create separate function for admin_plus checks
CREATE OR REPLACE FUNCTION public.is_current_user_admin_plus()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND perfil = 'admin_plus'
  );
$function$;