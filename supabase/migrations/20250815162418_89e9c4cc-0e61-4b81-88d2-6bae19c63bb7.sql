-- Make cuidador_id nullable in pagamentos_funcionarios table
ALTER TABLE public.pagamentos_funcionarios 
ALTER COLUMN cuidador_id DROP NOT NULL;

-- Add comment to clarify the change
COMMENT ON COLUMN public.pagamentos_funcionarios.cuidador_id IS 'Optional - used when payment is linked to a specific caregiver record';