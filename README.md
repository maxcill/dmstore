# 🛒 DMStore — E-commerce de Informática

E-commerce completo de informática (celulares, computadores, notebooks e acessórios) com backend NestJS + PostgreSQL e frontend Angular.

---

## 📁 Estrutura do projeto

```
dmstore/
├── backend/     → API NestJS + TypeORM + PostgreSQL
└── frontend/    → App Angular 21
```

---

## ✅ Pré-requisitos

- **Node.js** >= 18
- **npm** >= 9
- **PostgreSQL** >= 14 rodando localmente

---

## 🗄️ 1. Configurar o banco de dados

Crie o banco no PostgreSQL:

```sql
CREATE DATABASE dmstore;
```

Se quiser usar um usuário diferente de `postgres`, ajuste no `.env` do backend.

---

## 🔧 2. Backend (NestJS)

```bash
cd backend

# Copiar e editar as variáveis de ambiente
cp .env.example .env
```

Edite o `.env` com suas credenciais:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=sua_senha_aqui
DB_NAME=dmstore

JWT_SECRET=troque-este-segredo-em-producao

STRIPE_SECRET_KEY=sk_test_sua_chave_stripe
STRIPE_WEBHOOK_SECRET=whsec_seu_segredo

FRONTEND_URL=http://localhost:4200
```

```bash
# Instalar dependências
npm install

# Rodar em modo desenvolvimento (cria as tabelas automaticamente)
npm run start:dev
```

A API estará em: **http://localhost:3000/api**

### 🌱 Popular o banco com dados iniciais (seed)

Com o servidor rodando, abra outro terminal:

```bash
cd backend
npm run seed
```

Isso cria:
- Usuário admin: `admin@dmstore.com.br` / senha: `admin123`
- 5 categorias (Celulares, Computadores, Notebooks, Acessórios, Monitores)
- 10 produtos de exemplo

---

## 🎨 3. Frontend (Angular)

```bash
cd frontend

# Instalar dependências
npm install

# Rodar em modo desenvolvimento
npm start
```

O app estará em: **http://localhost:4200**

---

## 🔑 Credenciais de acesso

| Tipo      | E-mail                    | Senha    |
|-----------|---------------------------|----------|
| Admin     | admin@dmstore.com.br      | admin123 |
| Cliente   | (criar via /registro)     | —        |

---

## 🗺️ Rotas do frontend

| Rota                          | Descrição                        |
|-------------------------------|----------------------------------|
| `/`                           | Home com destaques e categorias  |
| `/catalogo`                   | Catálogo com filtros e busca     |
| `/categoria/:slug`            | Produtos por categoria           |
| `/produto/:slug`              | Detalhe do produto               |
| `/carrinho`                   | Carrinho de compras              |
| `/checkout`                   | Finalizar pedido (requer login)  |
| `/login`                      | Login                            |
| `/registro`                   | Criar conta                      |
| `/minha-conta`                | Perfil do usuário                |
| `/minha-conta/pedidos`        | Lista de pedidos                 |
| `/minha-conta/pedidos/:id`    | Detalhe de um pedido             |
| `/admin`                      | Dashboard admin                  |
| `/admin/produtos`             | Gerenciar produtos               |
| `/admin/categorias`           | Gerenciar categorias             |
| `/admin/pedidos`              | Gerenciar pedidos                |

---

## 🌐 Endpoints da API

| Método | Rota                             | Descrição                    | Auth     |
|--------|----------------------------------|------------------------------|----------|
| POST   | /api/auth/registro               | Criar conta                  | Público  |
| POST   | /api/auth/login                  | Login (retorna JWT)          | Público  |
| GET    | /api/auth/me                     | Dados do usuário logado      | JWT      |
| GET    | /api/categorias                  | Listar categorias            | Público  |
| POST   | /api/categorias                  | Criar categoria              | Admin    |
| PATCH  | /api/categorias/:id              | Editar categoria             | Admin    |
| DELETE | /api/categorias/:id              | Excluir categoria            | Admin    |
| GET    | /api/produtos                    | Listar/filtrar produtos      | Público  |
| GET    | /api/produtos/slug/:slug         | Produto por slug             | Público  |
| GET    | /api/produtos/admin/todos        | Todos os produtos (admin)    | Admin    |
| POST   | /api/produtos                    | Criar produto                | Admin    |
| PATCH  | /api/produtos/:id                | Editar produto               | Admin    |
| DELETE | /api/produtos/:id                | Excluir produto              | Admin    |
| GET    | /api/carrinho                    | Ver carrinho                 | JWT      |
| POST   | /api/carrinho/itens              | Adicionar item               | JWT      |
| PATCH  | /api/carrinho/itens/:itemId      | Atualizar quantidade         | JWT      |
| DELETE | /api/carrinho/itens/:itemId      | Remover item                 | JWT      |
| POST   | /api/pedidos                     | Criar pedido (checkout)      | JWT      |
| GET    | /api/pedidos/meus-pedidos        | Meus pedidos                 | JWT      |
| GET    | /api/pedidos/:id                 | Detalhe de pedido            | JWT      |
| GET    | /api/pedidos                     | Todos os pedidos (admin)     | Admin    |
| PATCH  | /api/pedidos/:id/status          | Atualizar status             | Admin    |
| POST   | /api/pagamento/criar-intent      | Criar Stripe PaymentIntent   | JWT      |
| POST   | /api/pagamento/webhook           | Webhook do Stripe            | Público  |

---

## 💳 Stripe (Pagamento)

O projeto usa o Stripe para pagamentos. Para testar:

1. Crie uma conta gratuita em https://stripe.com
2. Copie a **chave secreta de teste** (`sk_test_...`) para o `.env`
3. Use o cartão de teste: `4242 4242 4242 4242` com qualquer validade futura e CVV

Para webhooks locais, use o [Stripe CLI](https://stripe.com/docs/stripe-cli):

```bash
stripe listen --forward-to localhost:3000/api/pagamento/webhook
```

---

## 🏗️ Tecnologias utilizadas

**Backend:**
- NestJS 11 + TypeScript
- TypeORM 1.0 + PostgreSQL
- JWT (autenticação)
- bcrypt (hash de senhas)
- Stripe (pagamentos)
- class-validator (validação de DTOs)

**Frontend:**
- Angular 21 (Standalone Components)
- Angular Signals (gerenciamento de estado)
- Angular Router (lazy loading)
- HttpClient + Interceptor JWT
- SCSS com variáveis CSS customizadas

---

## 📦 Scripts disponíveis

**Backend:**
```bash
npm run start:dev   # Desenvolvimento com hot reload
npm run build       # Build de produção
npm run start:prod  # Rodar build de produção
npm run seed        # Popular banco com dados iniciais
```

**Frontend:**
```bash
npm start           # Desenvolvimento (ng serve)
npm run build       # Build de produção
```
