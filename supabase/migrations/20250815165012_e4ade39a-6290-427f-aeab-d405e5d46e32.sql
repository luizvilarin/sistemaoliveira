-- Add triggers for boletos table if they don't exist
DO $$
BEGIN
  -- Check if trigger exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'update_boletos_updated_at' 
    AND event_object_table = 'boletos'
  ) THEN
    -- Create trigger for updating updated_at column
    CREATE TRIGGER update_boletos_updated_at
      BEFORE UPDATE ON public.boletos
      FOR EACH ROW
      EXECUTE FUNCTION public.handle_updated_at();
  END IF;

  -- Check if trigger for status dates exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'atualizar_datas_boleto_trigger' 
    AND event_object_table = 'boletos'
  ) THEN
    -- Create trigger for updating status dates
    CREATE TRIGGER atualizar_datas_boleto_trigger
      BEFORE INSERT OR UPDATE ON public.boletos
      FOR EACH ROW
      EXECUTE FUNCTION public.atualizar_datas_status_boleto();
  END IF;

  -- Check if audit trigger exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'audit_boletos' 
    AND event_object_table = 'boletos'
  ) THEN
    -- Create audit trigger
    CREATE TRIGGER audit_boletos
      AFTER INSERT OR UPDATE OR DELETE ON public.boletos
      FOR EACH ROW
      EXECUTE FUNCTION public.log_sensitive_access();
  END IF;
END $$;