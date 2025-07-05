-- Deletar tarefas primeiro (elas referenciam cuidadores)
DELETE FROM public.tarefas;

-- Depois deletar cuidadores (eles podem referenciar clientes)
DELETE FROM public.cuidadores;

-- Por último deletar clientes
DELETE FROM public.clientes;

-- Deletar lembretes que possam referenciar clientes ou cuidadores
DELETE FROM public.lembretes;

-- Deletar pacientes que referenciam clientes
DELETE FROM public.pacientes;