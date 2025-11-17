# Sistema de Chamados - PWA com Notificações Push

Sistema completo de abertura de chamados desenvolvido em Next.js, configurado como PWA com suporte a notificações push via Firebase Cloud Messaging.

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
│   ├── firebase.ts           # Configuração Firebase e FCM
│   └── utils/
│       └── supabase-client.ts # Cliente Supabase com validação
├── public/
│   ├── manifest.json         # Manifest da PWA
│   ├── sw.js                 # Service Worker principal
│   └── firebase-messaging-sw.js # Service Worker do Firebase
├── .env.local                # Variáveis de ambiente
└── next.config.js            # Configuração do Next.js
```

## Configuração Inicial

### 1. Configurar Variáveis de Ambiente

Edite o arquivo `.env.local` e adicione suas credenciais:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key_aqui

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=sua_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu-projeto-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=seu_app_id
NEXT_PUBLIC_FIREBASE_VAPID_KEY=sua_vapid_key
```

### 2. Configurar Firebase Cloud Messaging

1. Acesse o [Console do Firebase](https://console.firebase.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Navegue até **Project Settings > Cloud Messaging**
4. Copie suas credenciais Web para o `.env.local`
5. Gere um par de chaves Web Push (VAPID) em **Cloud Messaging > Web configuration**
6. Atualize o arquivo `public/firebase-messaging-sw.js` com suas credenciais:

```javascript
const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto-id",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "SEU_SENDER_ID",
  appId: "SEU_APP_ID"
};
```

### 3. Banco de Dados Supabase

O banco de dados já foi criado automaticamente com as seguintes tabelas:

#### Tabela `tickets`
- `id` (uuid) - Identificador único
- `email` (text) - Email do solicitante
- `description` (text) - Descrição do problema
- `status` (text) - Status: 'aberto', 'em_andamento', 'resolvido'
- `created_at` (timestamptz) - Data de criação
- `updated_at` (timestamptz) - Data de atualização

#### Tabela `push_tokens`
- `id` (uuid) - Identificador único
- `token` (text, unique) - Token FCM
- `device_info` (text) - Informações do dispositivo
- `created_at` (timestamptz) - Data de registro
- `updated_at` (timestamptz) - Data de atualização

### 4. Ícones da PWA

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
- Registro de token FCM para notificações push
- Lista de todos os chamados
- Status visual com badges coloridos
- Atualização manual da lista
- Instruções de instalação da PWA

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

### Notificações Push

1. Acesse a página `/admin`
2. Clique em "Ativar Notificações"
3. Permita notificações no navegador
4. O token FCM será registrado automaticamente
5. Agora você receberá notificações de novos chamados

## Integração de Backend

Este frontend está preparado para integração com Edge Functions do Supabase. Para enviar notificações:

### Exemplo de Edge Function (não incluída)

```typescript
// Edge Function para enviar notificação ao criar ticket
import { createClient } from '@supabase/supabase-js'
import * as admin from 'firebase-admin'

// Inicializar Firebase Admin SDK
// Enviar notificação para todos os tokens registrados
// quando um novo ticket for criado
```

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
- **Firebase Cloud Messaging** - Notificações push
- **Service Workers** - Funcionalidade offline e background

### Segurança
- RLS (Row Level Security) habilitado no Supabase
- Validação de formulários no frontend
- Tokens FCM armazenados com segurança
- Permissões de notificação explícitas

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

Para implementar o backend completo:

1. Criar Edge Function para enviar notificações quando um ticket for criado
2. Adicionar sistema de autenticação para a página admin
3. Implementar atualização de status de tickets
4. Adicionar filtros e busca na lista de tickets
5. Configurar rate limiting para o formulário público
6. Implementar logs e analytics

## Suporte

Para questões técnicas:
- Documentação Supabase: https://supabase.com/docs
- Documentação Firebase: https://firebase.google.com/docs
- Documentação Next.js: https://nextjs.org/docs
