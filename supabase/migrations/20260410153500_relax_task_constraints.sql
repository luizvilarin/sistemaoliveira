-- Relaxar restrições da tabela de tarefas
ALTER TABLE public.tarefas 
ALTER COLUMN cliente_id DROP NOT NULL,
ALTER COLUMN cuidador_id DROP NOT NULL;

-- Adicionar campo de responsável
ALTER TABLE public.tarefas 
ADD COLUMN IF NOT EXISTS responsavel_id UUID REFERENCES public.profiles(id) DEFAULT NULL;

-- Adicionar índice para performance
CREATE INDEX IF NOT EXISTS idx_tarefas_responsavel_id ON public.tarefas(responsavel_id);

-- Atualizar metadados ou comentários se necessário
COMMENT ON COLUMN public.tarefas.responsavel_id IS 'ID do perfil responsável pela execução da tarefa (opcional)';
