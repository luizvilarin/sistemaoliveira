# Guia de Deploy na Vercel - Sistema Oliveira

Este projeto está pronto para ser hospedado na Vercel. Siga os passos abaixo para garantir que tudo funcione corretamente.

## Passo 1: Vincular o Repositório
1. Acesse o [Dashboard da Vercel](https://vercel.com/dashboard).
2. Clique em **"Add New..."** -> **"Project"**.
3. Importe o seu repositório do GitHub (`sistemaoliveira`).

## Passo 2: Configurar Variáveis de Ambiente
Durante a etapa de importação ou nas configurações do projeto após o deploy, adicione as seguintes chaves na seção **Environment Variables**:

| Chave | Valor |
| :--- | :--- |
| `VITE_SUPABASE_URL` | `https://ijpamnmaldqumunjzfsz.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (Copie do seu arquivo .env local) |

> [!IMPORTANT]
> Certifique-se de que as chaves comecem com `VITE_`, caso contrário o Vite não as tornará acessíveis no seu código frontend.

## Passo 3: Configuração de Build
A Vercel deve detectar automaticamente que este é um projeto Vite. Se necessário, confirme as configurações:
- **Framework Preset**: `Vite`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

## Por que o arquivo `vercel.json` foi adicionado?
Adicionamos um arquivo `vercel.json` que contém uma regra de redirecionamento. Isso é essencial para que, quando você acessar uma rota como `/clientes` ou `/tarefas` e atualizar a página (F5), a Vercel saiba que deve carregar o `index.html` e deixar o React Router cuidar do restante, evitando o erro de "Página não encontrada (404)".

---
Boas vendas e bom gerenciamento! 🚀
