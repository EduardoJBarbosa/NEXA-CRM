# CRM Clínica - Sistema Completo

Sistema CRM profissional para gestão de clínicas de estética e odontologia.

## 🚀 Como Executar

### 1. **Backend**

```bash
cd backend
npm run dev
```

O servidor estará rodando em `http://localhost:3001`

### 2. **Frontend** (em outro terminal)

```bash
cd frontend
npm run dev
```

Acesse em `http://localhost:5173`

## 📋 Credenciais de Teste

- **Email**: admin@clinic.com
- **Senha**: qualquer valor (sem validação de hash ainda)

## 🎯 Módulos Implementados

### ✅ Concluído

- **FASE 1**: Infraestrutura, Prisma, Seed ✓
- **FASE 2**: Backend API REST completa ✓
- **FASE 3**: Frontend autenticação e layout ✓
- **FASE 4**: Dashboard com gráficos Recharts ✓
- **FASE 5**: Kanban de Leads com drag & drop ✓
- **FASE 6**: CRUD de Pacientes ✓

### 🔄 Em Progresso

- **FASE 7**: Agenda (Calendário)
- **FASE 8**: Financeiro (Vendas)
- **FASE 9**: Configurações
- **FASE 10**: Validações e testes

## 📦 Stack

- **Frontend**: React 18 + Vite + TypeScript + TailwindCSS + Recharts
- **Backend**: Node.js + Express + Prisma + SQLite
- **Drag & Drop**: @dnd-kit/core
- **Validação**: Zod + React Hook Form
- **Estado**: Zustand

## 🧪 Testando Funcionalidades

### Login
1. Acesse `http://localhost:5173`
2. Email: `admin@clinic.com`
3. Senha: qualquer valor

### Dashboard
- Métricas de leads do mês
- Taxa de conversão
- Gráfico de funil de vendas
- Gráfico pizza de origem dos leads

### Leads (Kanban)
- Arrastar cards entre colunas para mover de etapa
- 7 colunas: NOVO → CONTATO_REALIZADO → AVALIACAO_AGENDADA → ORCAMENTO_ENVIADO → NEGOCIACAO → VENDA_REALIZADA / PERDIDO
- Cards em vermelho = leads "parados" há >5 dias
- Deletar leads com botão X

### Pacientes
- Tabela com busca, paginação
- Criar novo paciente
- Editar paciente
- Deletar paciente
- Campos: nome, telefone, email, origem

## 🗄️ Banco de Dados

**SQLite** em `backend/prisma/dev.db`

### Modelos principais

- **Patient**: 5 pacientes de teste
- **Procedure**: 8 procedimentos (estética + odonto)
- **Lead**: 10 leads em diferentes etapas
- **User**: 3 profissionais + 1 admin
- **Appointment**, **Sale**, **Interaction**: relacionados

## 🔗 API Endpoints

```
POST /api/auth/login
GET /api/patients
POST /api/patients
GET /api/leads
POST /api/leads/:id/move
GET /api/dashboard/metrics
GET /api/appointments
POST /api/appointments
GET /api/sales
```

## ⚙️ Próximos Passos

1. **Agenda**: Implementar calendário com react-big-calendar
2. **Financeiro**: Tabela de vendas + gráfico de faturamento
3. **Configurações**: CRUD de procedimentos e profissionais
4. **Validações**: Conflito de agendamento, campos obrigatórios
5. **Melhorias**: Toast notifications, loading states, error handling

## 📝 Notas

- Autenticação: JWT simples (sem hash de senha por enquanto)
- Database: SQLite em dev (ótimo para prototipagem)
- Drag & Drop: @dnd-kit com otimistic updates
- Gráficos: Recharts com dados em tempo real da API

---

**Desenvolvido com ❤️ para clínicas**
