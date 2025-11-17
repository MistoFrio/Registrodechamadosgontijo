# Sistema de Chamados - PWA

Sistema completo de abertura de chamados desenvolvido em Next.js, configurado como PWA (Progressive Web App).

## Arquitetura do Projeto

### Estrutura de Arquivos

```
project/
├── app/
│   ├── page.tsx              # Página pública de abertura de chamados
│   ├── admin/
│   │   └── page.tsx          # Dashboard administrativo
│   ├── layout.tsx            # Layout principal com meta tags PWA
│   └── globals.css           # Estilos globais
├── lib/
│   ├── supabase.ts           # Export principal do cliente Supabase
│   ├── service-worker.ts     # Registro do Service Worker
│   └── utils/
│       └── supabase-client.ts # Cliente Supabase com validação
├── public/
│   ├── manifest.json         # Manifest da PWA
│   └── sw.js                 # Service Worker principal
├── .env.local                # Variáveis de ambiente
└── next.config.js            # Configuração do Next.js
```

## Configuração Inicial

### 1. Configurar Variáveis de Ambiente

#### Desenvolvimento Local

Crie um arquivo `.env.local` na raiz do projeto e adicione suas credenciais:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key_aqui
```

#### Produção (Vercel, Netlify, etc)

**IMPORTANTE:** Configure as variáveis de ambiente na plataforma de hospedagem:

**Vercel:**
1. Acesse o projeto no [Vercel Dashboard](https://vercel.com/dashboard)
2. Vá em **Settings** > **Environment Variables**
3. Adicione as variáveis do Supabase com o prefixo `NEXT_PUBLIC_`
4. Faça um novo deploy após adicionar as variáveis

**Netlify:**
1. Acesse o projeto no [Netlify Dashboard](https://app.netlify.com)
2. Vá em **Site settings** > **Environment variables**
3. Adicione as variáveis do Supabase
4. Faça um novo deploy após adicionar as variáveis

**Outras plataformas:**
Configure as variáveis de ambiente através do painel administrativo da plataforma de hospedagem.

⚠️ **ATENÇÃO:** Sem essas variáveis configuradas, o sistema não conseguirá conectar ao Supabase e você verá erros como `placeholder.supabase.co`.

### 2. Banco de Dados Supabase

O banco de dados já foi criado automaticamente com as seguintes tabelas:

#### Tabela `tickets`
- `id` (uuid) - Identificador único
- `email` (text) - Email do solicitante
- `description` (text) - Descrição do problema
- `status` (text) - Status: 'aberto', 'em_andamento', 'resolvido'
- `created_at` (timestamptz) - Data de criação
- `updated_at` (timestamptz) - Data de atualização

### 3. Ícones da PWA

Crie os seguintes ícones e coloque na pasta `public/`:

- `icon-192.png` (192x192 pixels)
- `icon-512.png` (512x512 pixels)
- `favicon.ico` (opcional)

## Como Usar

### Página Pública (/)

Formulário simples para abertura de chamados:
- Campo de email corporativo
- Campo de descrição do problema
- Validação em tempo real
- Feedback visual de sucesso/erro
- Envio direto para o Supabase

### Página Administrativa (/admin)

Dashboard completo com:
- Lista de todos os chamados
- Status visual com badges coloridos
- Atualização manual da lista
- Instruções de instalação da PWA
- Estatísticas e gráficos
- Base de conhecimento para IA

## Funcionalidades da PWA

### Instalação

**Chrome/Edge (Desktop/Android):**
- Clique no ícone de instalação na barra de endereço
- Ou vá em Menu > Instalar aplicativo

**Safari (iOS):**
- Toque no botão de compartilhar
- Selecione "Adicionar à Tela de Início"

**Firefox:**
- Clique no menu (três linhas)
- Selecione "Instalar"

## Integração de Backend

Este frontend está preparado para integração com Edge Functions do Supabase para funcionalidades adicionais.

## Desenvolvimento

### Instalar Dependências
```bash
npm install
```

### Modo de Desenvolvimento
```bash
npm run dev
```

### Build de Produção
```bash
npm run build
```

### Iniciar Servidor de Produção
```bash
npm start
```

## Recursos Técnicos

### Tecnologias Utilizadas
- **Next.js 13** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Shadcn/UI** - Componentes de UI
- **Supabase** - Backend e banco de dados
- **Service Workers** - Funcionalidade offline e background

### Segurança
- RLS (Row Level Security) habilitado no Supabase
- Validação de formulários no frontend
- Autenticação de administrador

### Performance
- Static site generation
- Lazy loading de componentes
- Service Worker para cache
- Otimização de imagens

## Tema Visual

- **Cores principais:** Vermelho (#dc2626) e Branco
- **Design:** Limpo, moderno e responsivo
- **Acessibilidade:** Alto contraste e feedback visual

## Suporte a Navegadores

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Opera 76+

## Próximos Passos

Para melhorar o sistema:

1. Adicionar sistema de autenticação mais robusto para a página admin
2. Implementar filtros e busca avançada na lista de tickets
3. Configurar rate limiting para o formulário público
4. Implementar logs e analytics
5. Adicionar exportação de relatórios em PDF

## Suporte

Para questões técnicas:
- Documentação Supabase: https://supabase.com/docs
- Documentação Next.js: https://nextjs.org/docs
