# Controle Financeiro Pessoal

Sistema de gerenciamento financeiro pessoal com foco no controle mensal de receitas e despesas. Disponível em versão **web** (React + Vite) e **mobile** (React Native + Expo).

## Funcionalidades

- **Dashboard**: Visão geral com totais de receitas, despesas e saldo do mês
- **Transações**: CRUD completo com formulário validado
- **Filtros**: Busca em tempo real, filtros por tipo/categoria e ordenação
- **Gráficos**: Evolução diária, tendência de receitas e distribuição por categoria
- **Design**: Tema escuro, responsivo, animações suaves
- **Mobile**: App nativo para iOS/Android via Expo Go

## Tech Stack

### Web
- React + TypeScript + Vite
- Framer Motion (animações)
- Recharts (gráficos)
- React Hook Form + Zod (formulários)
- Context API + useReducer (estado)
- Supabase (banco de dados)

### Mobile
- React Native + Expo
- Expo Router (navegação)
- React Native Reanimated (animações)
- React Native Gifted Charts (gráficos)
- React Hook Form + Zod (formulários)
- Supabase (mesmo banco de dados)

## Visualizações da aplicação

### Desktop
- Dashboard <br> <img align="center" width="1920" height="1231" alt="Image" src="https://github.com/user-attachments/assets/1835ac2e-ed00-4360-a035-35a66a517473" />
- Transações <br> <img align="center" width="1919" height="906" alt="Image" src="https://github.com/user-attachments/assets/59857424-c6c9-4f45-9d61-1a3276469fa9" />
<br>

### Mobile
- Dashboard <br>
  <table><tr><td><img width="300" alt="Image" src="https://github.com/user-attachments/assets/f32b6ff7-68a1-475c-ba25-ddb0b681c9cb" /></td><td>&nbsp;&nbsp;&nbsp;</td><td><img width="300" alt="Image" src="https://github.com/user-attachments/assets/53a261d2-1eb5-4a64-864f-b5f7851e4a58" /></td></tr></table>
- Transações <br> <img width="300" alt="Image" src="https://github.com/user-attachments/assets/0fcc464b-9c80-47e6-880d-3a05812d617d" />

## Estrutura do Projeto

```
/
├── src/                        # Aplicação web (Vite)
│   ├── components/             # Componentes reutilizáveis
│   ├── hooks/                  # Custom hooks
│   ├── pages/                  # Dashboard e Transações
│   ├── services/               # Supabase client
│   ├── store/                  # Context de estado global
│   ├── styles/                 # CSS global
│   ├── types/                  # Tipos TypeScript
│   ├── utils/                  # Utilitários
│   └── App.tsx                 # Entry point com routing
├── finance-tracker-mobile/     # Aplicação mobile (Expo)
│   ├── app/                    # Rotas (Expo Router)
│   │   └── (tabs)/             # Dashboard e Transações
│   └── src/                    # Lógica compartilhável
│       ├── components/         # Componentes nativos
│       ├── hooks/              # Custom hooks
│       ├── services/           # Supabase client
│       ├── store/              # Context de estado
│       ├── theme/              # Design tokens
│       ├── types/              # Tipos TypeScript
│       └── utils/              # Utilitários
├── .env.example                # Template de variáveis (web)
└── finance-tracker-mobile/.env.example  # Template de variáveis (mobile)
```

## Configuração

### Pré-requisitos

- Node.js
- Conta no [Supabase](https://supabase.com)

### Banco de Dados (Supabase)

1. Crie um projeto no Supabase
2. Execute o SQL abaixo no **SQL Editor**:

```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  value DECIMAL(10,2) NOT NULL CHECK (value > 0),
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_category ON transactions(category);
```

3. Em **Project Settings → API**, copie a **Project URL** e a **anon/public key**

### Web

```bash
# Instalar dependências
npm install

# Criar arquivo de variáveis de ambiente
cp .env.example .env
# Edite o .env com sua URL e chave do Supabase

# Iniciar servidor de desenvolvimento
npm run dev
```

Acesse `http://localhost:3000`

### Mobile

```bash
cd finance-tracker-mobile

# Instalar dependências
npm install

# Criar arquivo de variáveis de ambiente
cp .env.example .env
# Edite o .env com sua URL e chave do Supabase

# Iniciar o servidor Expo
npx expo start
```

Escaneie o QR code com o app **Expo Go** no celular.

## Variáveis de Ambiente

As variáveis **nunca** devem ser commitadas. Use os arquivos `.env.example` como referência.

| Variável | Onde usar | Descrição |
|---|---|---|
| `VITE_SUPABASE_URL` | Web | URL do projeto Supabase |
| `VITE_SUPABASE_ANON_KEY` | Web | Chave pública anon do Supabase |
| `EXPO_PUBLIC_SUPABASE_URL` | Mobile | URL do projeto Supabase |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Mobile | Chave pública anon do Supabase |

## Deploy

### Web

1. Faça push do repositório para o GitHub
2. Importe o projeto na [Vercel](https://vercel.com) (Exemplo)
3. Adicione as variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` em **Settings → Environment Variables**
4. Deploy automático a cada push

### Mobile (Expo)

Para distribuição via Expo Go, basta rodar `npx expo start`.  
Para build de produção, use [EAS Build](https://docs.expo.dev/build/introduction/).

## Modelo de Dados

```typescript
interface Transaction {
  id: string;          // UUID
  title: string;
  description?: string;
  value: number;       // sempre positivo
  type: 'income' | 'expense';
  category: string;
  date: string;        // ISO 8601
  created_at: string;
  updated_at: string;
}
```

### Categorias

**Receitas**: Salário, Freelance, Investimento, Presente, Outro  
**Despesas**: Moradia, Alimentação, Transporte, Saúde, Educação, Entretenimento, Compras, Outro
