
-- Criar tabela de colunas do kanban
CREATE TABLE IF NOT EXISTS public.kanban_colunas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    cor TEXT DEFAULT 'bg-slate-100',
    ordem INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.kanban_colunas ENABLE ROW LEVEL SECURITY;

-- Políticas para kanban_colunas
CREATE POLICY "Admins podem tudo nas colunas"
ON public.kanban_colunas
FOR ALL
TO public
USING (get_current_user_role() IN ('admin', 'admin_plus', 'gestor', 'financeiro'))
WITH CHECK (get_current_user_role() IN ('admin', 'admin_plus', 'gestor', 'financeiro'));

CREATE POLICY "Cuidadores podem ver colunas"
ON public.kanban_colunas
FOR SELECT
TO public
USING (true);

-- Seed de colunas padrão
INSERT INTO public.kanban_colunas (titulo, slug, cor, ordem)
VALUES 
    ('A Fazer', 'todo', 'bg-slate-50', 0),
    ('Em Progresso', 'inProgress', 'bg-blue-50', 1),
    ('Concluído', 'done', 'bg-emerald-50', 2)
ON CONFLICT (slug) DO NOTHING;

-- Adicionar status 'arquivada' se necessário (já é um campo texto, então basta tratar no app)
-- Mas vamos adicionar uma coluna 'arquivada' para ser mais limpo
ALTER TABLE public.tarefas ADD COLUMN IF NOT EXISTS arquivada BOOLEAN DEFAULT FALSE;
