# Configuração do Supabase

Este projeto usa Supabase como banco de dados PostgreSQL. Siga estas instruções para configurar:

## 1. Criar projeto no Supabase

1. Acesse [https://supabase.com](https://supabase.com) e crie uma conta
2. Clique em "New Project"
3. Preencha:
   - **Name**: finance-tracker (ou nome de sua preferência)
   - **Database Password**: guarde esta senha
   - **Region**: selecione a mais próxima
4. Aguarde a criação do projeto (2-3 minutos)

## 2. Criar tabela `transactions`

Vá no seu projeto → Table Editor → Create a new table → "Run SQL" e execute:

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

-- Índices para melhorar performance das consultas
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_category ON transactions(category);
```

Clique em "Run" para executar.

## 3. Obter credenciais

1. No dashboard do Supabase, vá em **Settings** (engrenagem) → **API**
2. Copie:
   - **Project URL**: `https://xxx.supabase.co`
   - **anon/public key**: uma string longa começando com `eyJ...`
3. Anote ambos

## 4. Configurar variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto com:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anon_aqui
```

⚠️ **Importante**: As variáveis devem começar com `VITE_` para serem acessadas no frontend com Vite.

## 5. Testar localmente

```bash
npm run dev
```

Acesse `http://localhost:3000` e comece a adicionar transações. Os dados serão salvos no Supabase.

## 6. Deploy na Vercel

1. Faça push do código para GitHub
2. Na Vercel, importe o repositório
3. Nas configurações do projeto (Settings → Environment Variables), adicione:
   - `SUPABASE_URL` (sem o prefixo VITE_)
   - `SUPABASE_ANON_KEY`
4. Deploy!

Nota: No ambiente Vercel (serverless), usamos `SUPABASE_URL` e `SUPABASE_ANON_KEY` (sem `VITE_`) pois o código serverless não expõe essas variáveis ao cliente. O frontend usa as variáveis VITE durante o build.

## 7. Row Level Security (RLS)

Por padrão, o Supabase habilita Row Level Security. Para este projeto, você pode desabilitar RLS na tabela `transactions` ou criar policies:

```sql
-- Desabilitar RLS (mais simples para projeto pessoal)
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;

-- Ou criar policy que permite todas as operações
CREATE POLICY "Enable all operations" ON transactions
  FOR ALL USING (true) WITH CHECK (true);
```

## Troubleshooting

**Erro: "Supabase URL and ANON_KEY must be set"**
- Verifique se o arquivo `.env` existe e tem as variáveis corretas
- Reinicie o servidor de desenvolvimento após criar/modificar `.env`

**Erro de conexão com Supabase**
- Verifique se o projeto Supabase está ativo
- Confirme que as credenciais estão corretas
- Verifique se há restrições de IP no Supabase

**Tabela não existe**
- Execute o SQL de criação da tabela exatamente como fornecido
- O nome da tabela deve ser `transactions` (minúsculo)
