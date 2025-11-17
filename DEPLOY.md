# Guia de Deploy e Configuração em Produção

## Problema Comum: Erro "placeholder.supabase.co"

Se você está vendo erros como:
- `Failed to fetch` ao tentar criar chamados
- `placeholder.supabase.co` nas requisições
- Chamados funcionam localmente mas não em produção

**Causa:** As variáveis de ambiente não estão configuradas no ambiente de produção.

## Solução: Configurar Variáveis de Ambiente

### 1. Obter Credenciais do Supabase

1. Acesse o [Dashboard do Supabase](https://app.supabase.com)
2. Selecione seu projeto
3. Vá em **Settings** > **API**
4. Copie:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 2. Configurar na Plataforma de Hospedagem

#### Vercel (Recomendado)

1. Acesse https://vercel.com/dashboard
2. Selecione seu projeto
3. Vá em **Settings** > **Environment Variables**
4. Adicione cada variável:

```
NEXT_PUBLIC_SUPABASE_URL = https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = sua_chave_anon_aqui
```

5. Selecione os ambientes (Production, Preview, Development)
6. Clique em **Save**
7. Vá em **Deployments** e faça um novo deploy ou **Redeploy** do último

#### Netlify

1. Acesse https://app.netlify.com
2. Selecione seu site
3. Vá em **Site settings** > **Environment variables**
4. Clique em **Add a variable**
5. Adicione cada variável (mesmas do Vercel acima)
6. Salve e faça um novo deploy

#### Outras Plataformas

Configure as variáveis de ambiente através do painel administrativo da sua plataforma de hospedagem.

## Verificar se Está Funcionando

Após configurar as variáveis e fazer o deploy:

1. Abra o DevTools (F12) no navegador
2. Vá na aba **Console**
3. Tente criar um chamado
4. Verifique se não há erros relacionados a `placeholder.supabase.co`
5. Na aba **Network**, verifique se as requisições estão indo para a URL correta do Supabase

## Service Worker

O service worker foi configurado para **NÃO** fazer cache de requisições de API. Isso garante que:
- Requisições ao Supabase sempre vão para a rede
- Dados sempre estão atualizados
- Não há conflitos entre cache e requisições de API

Se você atualizou o service worker, pode ser necessário:
1. Desregistrar o service worker antigo no DevTools (Application > Service Workers > Unregister)
2. Recarregar a página com Ctrl+Shift+R (hard refresh)

## Troubleshooting

### Erro persiste após configurar variáveis

1. Verifique se fez um novo deploy após adicionar as variáveis
2. Verifique se as variáveis estão com os nomes corretos (case-sensitive)
3. Verifique se não há espaços extras nos valores
4. Limpe o cache do navegador e do service worker

### Service Worker causando problemas

1. Abra DevTools > Application > Service Workers
2. Clique em **Unregister** para remover o service worker antigo
3. Recarregue a página
4. O novo service worker será registrado automaticamente

### Verificar variáveis de ambiente em produção

No Vercel, você pode verificar se as variáveis estão configuradas corretamente:
1. Vá em **Settings** > **Environment Variables**
2. Verifique se todas as variáveis estão listadas
3. Verifique se estão marcadas para o ambiente correto (Production)

