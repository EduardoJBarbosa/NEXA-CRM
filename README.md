# Nexa CRM - Sistema Completo

Plataforma profissional de gestão para clínicas de estética e odontologia com agendamentos, leads, pacientes e financeiro.

## 🚀 Início Rápido com Docker

### Com Docker Compose (Recomendado)

```bash
docker-compose up --build
```

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3001
- **Banco**: PostgreSQL em localhost:5432

### Sem Docker

**Backend:**
```bash
cd backend
npm install
cp .env.example .env
npm run prisma:migrate
npm run dev
```

**Frontend (em outro terminal):**
```bash
cd frontend
npm install
npm run dev
```

## 📋 Credenciais de Teste

- **Email**: admin@clinic.com
- **Senha**: Agora com bcrypt seguro (defina ao criar usuário)

## 🎨 Rebranding Nexa CRM

- **Nome**: "Nexa CRM" (ao invés de "CRM Clínica")
- **Tema**: Dark Tech com glassmorphism
- **Cores**:
  - Primary: `#7C3AED` (Violet)
  - Accent: `#06B6D4` (Cyan)
  - Dark BG: `#0A0A0F`
  - Secondary BG: `#1A1A2E`

## 🎯 Funcionalidades Implementadas

### ✅ Concluído - ENTREGA COMPLETA

- **FASE 1**: Infraestrutura, Prisma, Seed ✓
- **FASE 2**: Backend API REST completa ✓
- **FASE 3**: Frontend autenticação e layout ✓
- **FASE 4**: Dashboard com gráficos ✓
- **FASE 5**: Kanban de Leads com drag & drop ✓
- **FASE 6**: CRUD de Pacientes ✓
- **FASE 7**: Agenda com calendário completo ✓
- **FASE 8**: Financeiro com tabela e gráficos ✓
- **FASE 9**: Configurações e CRUD Procedimentos ✓
- **FASE 10**: Autenticação com bcrypt ✓
- **FASE 11**: Webhook WhatsApp ✓
- **FASE 12**: Integração WhatsApp em Leads ✓
- **FASE 13**: Rebranding Nexa CRM ✓
- **FASE 14**: Docker Compose ✓

## 📦 Stack

- **Frontend**: React 18 + Vite + TypeScript + TailwindCSS + Recharts + React Big Calendar
- **Backend**: Node.js + Express + Prisma + PostgreSQL/SQLite + bcrypt + JWT
- **Autenticação**: JWT + bcrypt
- **Validação**: Zod + React Hook Form
- **Estado**: Zustand
- **Drag & Drop**: @dnd-kit/core
- **Deploy**: Docker + Docker Compose

## 🧪 Funcionalidades

### Login
- Autenticação segura com bcrypt
- Validação de credenciais
- JWT para sessões
- Glassmorphism dark theme

### Dashboard
- Métricas de leads do mês
- Taxa de conversão
- Gráficos de funil
- Origem dos leads

### Leads (Kanban)
- Drag & drop entre colunas
- 7 estágios: NOVO → CONTATO_REALIZADO → AVALIACAO_AGENDADA → ORCAMENTO_ENVIADO → NEGOCIACAO → VENDA_REALIZADA / PERDIDO
- **Botão WhatsApp**: Abre wa.me diretamente
- Indicador de leads parados

### Agenda
- Calendário interativo
- Visualização mensal
- CRUD completo de agendamentos
- Status: Agendado, Confirmado, Completado, Cancelado

### Financeiro
- Tabela de vendas com filtros
- Gráficos Recharts:
  - Faturamento últimos 6 meses (barra)
  - Tendência mensal (linha)
- Cards com KPIs:
  - Total do mês
  - Ticket médio
  - A receber

### Configurações
- **CRUD Procedimentos**: Nome, categoria, duração, valor
- **WhatsApp**: Webhook URL e API Token

### Pacientes
- CRUD completo
- Busca e paginação
- Origem do lead

## 📡 API Endpoints

### Auth
- `POST /api/auth/login` - Login com bcrypt

### Procedimentos
- `GET /api/procedures` - Listar
- `POST /api/procedures` - Criar
- `GET /api/procedures/:id` - Obter
- `PUT /api/procedures/:id` - Atualizar
- `DELETE /api/procedures/:id` - Deletar

### Agendamentos
- `GET /api/appointments` - Listar
- `POST /api/appointments` - Criar
- `PUT /api/appointments/:id` - Atualizar
- `DELETE /api/appointments/:id` - Deletar

### Vendas
- `GET /api/sales` - Listar com agregações

### WhatsApp
- `POST /api/webhook/whatsapp` - Receber mensagens
  ```json
  {
    "nome": "João",
    "telefone": "11999999999",
    "mensagem": "Olá",
    "origem": "WHATSAPP"
  }
  ```

## 🗄️ Banco de Dados

**Prisma** com:
- SQLite (dev)
- PostgreSQL (produção/Docker)

**Modelos**:
- User (com whatsappWebhookUrl, whatsappApiToken)
- Patient
- Procedure (com durationMin, valor)
- Lead
- Appointment
- Sale
- Interaction

## 🔐 Segurança

- ✅ Bcrypt para hash de senhas
- ✅ JWT para autenticação
- ✅ Middleware de autenticação em rotas protegidas
- ✅ Validação com Zod

## 📝 Variáveis de Ambiente

### Backend (.env)
```
DATABASE_URL=postgresql://crm:crm123@postgres:5432/crm_nexa
JWT_SECRET=seu-secret-super-seguro
NODE_ENV=development
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:3001
```

## 🐳 Docker

Serviços inclusos em `docker-compose.yml`:
- **postgres**: PostgreSQL 15
- **backend**: Express API (3001)
- **frontend**: React Vite (5173)

Para parar:
```bash
docker-compose down
```

## 📊 Estatísticas

- **Páginas**: 6 (Dashboard, Leads, Pacientes, Agenda, Financeiro, Configurações)
- **Controllers**: 7 (auth, patients, leads, appointments, sales, procedures, whatsapp)
- **Endpoints**: 30+
- **Componentes**: 15+

## ⚙️ Scripts

### Backend
```bash
npm run dev           # Desenvolvimento
npm run build         # Build
npm start             # Produção
npm run prisma:migrate # Migrações
npm run prisma:generate # Gerar cliente
npm run prisma:seed   # Seed
```

### Frontend
```bash
npm run dev      # Desenvolvimento
npm run build    # Build
npm run preview  # Preview
npm run lint     # Type check
```

---

**Nexa CRM - Desenvolvido com ❤️ para clínicas**
