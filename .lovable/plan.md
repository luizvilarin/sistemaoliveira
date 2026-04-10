

## Plano de Correção

### Problema 1: Descrição das tarefas não aparece

A tabela de tarefas em `TarefasPage.tsx` simplesmente não tem uma coluna para exibir a descrição. O campo é salvo corretamente no banco de dados, mas a interface nunca o mostra.

**Solução:** Adicionar a coluna "Descrição" na tabela e também exibir a descrição no formulário de edição. Vou adicionar a descrição como uma coluna na tabela, com texto truncado para não quebrar o layout, e um tooltip ou expansão para ver o texto completo.

**Arquivo:** `src/pages/TarefasPage.tsx`
- Adicionar `<TableHead>Descrição</TableHead>` após o título
- Adicionar `<TableCell>` com o texto da descrição (truncado com `max-w` e `truncate`)
- Opcionalmente, mostrar descrição completa ao passar o mouse (tooltip)

### Problema 2: Criação de tarefas limitada a admin

Analisando as políticas RLS atuais:
- "Admins can insert tarefas" → apenas admin/admin_plus
- "Gestores podem criar tarefas" → admin, admin_plus, gestor, financeiro

As políticas já permitem gestor e financeiro criarem tarefas. Porém, a primeira política é redundante e pode causar confusão. Vou consolidar em uma única política clara que permite todos os cargos exceto `cuidador`.

**Migração SQL:**
```sql
DROP POLICY IF EXISTS "Admins can insert tarefas" ON public.tarefas;
DROP POLICY IF EXISTS "Gestores podem criar tarefas" ON public.tarefas;

CREATE POLICY "Usuarios podem criar tarefas"
ON public.tarefas
FOR INSERT
TO public
WITH CHECK (
  get_current_user_role() IN ('admin', 'admin_plus', 'gestor', 'financeiro')
);
```

Também vou garantir que UPDATE e DELETE estejam acessíveis para gestor e financeiro:

```sql
DROP POLICY IF EXISTS "Admins can update tarefas" ON public.tarefas;
CREATE POLICY "Usuarios podem atualizar tarefas"
ON public.tarefas
FOR UPDATE
TO public
USING (
  get_current_user_role() IN ('admin', 'admin_plus', 'gestor', 'financeiro')
  OR (cuidador_id IN (
    SELECT c.id FROM cuidadores c
    WHERE c.email = (SELECT p.email FROM profiles p WHERE p.id = auth.uid())
  ))
);

DROP POLICY IF EXISTS "Admins can delete tarefas" ON public.tarefas;
CREATE POLICY "Usuarios podem deletar tarefas"
ON public.tarefas
FOR DELETE
TO public
USING (
  get_current_user_role() IN ('admin', 'admin_plus', 'gestor', 'financeiro')
);
```

### Resumo das alterações

| Componente | Alteração |
|---|---|
| `TarefasPage.tsx` | Adicionar coluna "Descrição" na tabela de tarefas |
| Migração SQL | Consolidar políticas RLS de INSERT/UPDATE/DELETE para permitir todos exceto cuidador |

