# Receively MVP

> A modern, full-stack SaaS platform for freelancers and small businesses to manage clients, issue invoices, and track payments.

---

## 🏗️ Architecture & Project Structure

Receively MVP follows a **Decoupled Client–Server Monolith** inside a single repository:

```text
receively-mvp/
├── client/                     # Frontend Application (React / Vite)
│   ├── src/
│   │   ├── components/         # Shared UI primitives & layouts
│   │   ├── features/           # Feature domains (auth, clients, invoices, payments)
│   │   ├── services/           # Centralized API HTTP client
│   │   └── App.jsx / App.tsx
│   └── package.json
│
├── server/                     # Backend Application (Node.js / Express)
│   ├── src/
│   │   ├── controllers/        # Request orchestration & status codes
│   │   ├── routes/             # REST endpoint definitions
│   │   ├── middlewares/        # Auth guards, error handling, Zod validation
│   │   ├── models/             # Database access & queries (PostgreSQL)
│   │   └── server.js / server.ts
│   └── package.json
│
├── docs/                       # Project architecture & decision records
│   ├── ARCHITECTURE.md
│   └── DECISIONS.md
├── AGENTS.md                   # AI Coding Agent guidelines & rules
├── CONTRIBUTING.md             # Contributor standards & PR checklist
├── .env.example                # Canonical environment template
└── README.md
```

---

## 🛠️ Technology Stack

| Component | Technology | Responsibility |
| :--- | :--- | :--- |
| **Frontend (`client/`)** | React (Vite) + Tailwind CSS | User interface, state management, form inputs, responsive layouts |
| **Backend (`server/`)** | Node.js + Express.js | REST API, business logic, authentication, input validation |
| **Database** | PostgreSQL | Relational data persistence with strict foreign keys |
| **Validation** | Zod | Runtime payload and schema verification |
| **Authentication** | JWT (Access + Refresh tokens) | Stateless, tenant-scoped user authentication |

---

## 📚 Project Documentation & Governance

To maintain consistency and safety across AI coding agents and human contributors:

1. [**AGENTS.md**](file:///c:/all@gAurav/receively-mvp/AGENTS.md) — Mandatory AI agent guidelines, file reading sequence, and safety bounds.
2. [**README.md**](file:///c:/all@gAurav/receively-mvp/README.md) — System overview, structure, ports, and execution instructions.
3. [**docs/ARCHITECTURE.md**](file:///c:/all@gAurav/receively-mvp/docs/ARCHITECTURE.md) — High-level system design, client-server data flow, and domain ER models.
4. [**docs/DECISIONS.md**](file:///c:/all@gAurav/receively-mvp/docs/DECISIONS.md) — Architecture Decision Records (ADRs) with rationale, trade-offs, and alternatives.
5. [**.env.example**](file:///c:/all@gAurav/receively-mvp/.env.example) — Safe environment variable template for client and server.
6. [**CONTRIBUTING.md**](file:///c:/all@gAurav/receively-mvp/CONTRIBUTING.md) — Git conventions, branching model, and PR quality checklist.

---

## 🚀 Getting Started

### 1. Environment Setup
Copy the example environment template into both environments or root as configured:
```bash
cp .env.example .env
```
Ensure database credentials, JWT secrets, and ports are correctly defined.

### 2. Running the Applications

#### Backend (`server/`)
```bash
cd server
npm install
npm run dev
# Server runs at: http://localhost:4000
```

#### Frontend (`client/`)
```bash
cd client
npm install
npm run dev
# Client runs at: http://localhost:5173 (or :3000)
```

---

## 🗺️ Roadmap & Next Steps

1. [x] **Documentation & Architecture Governance:** Established `AGENTS.md`, `ARCHITECTURE.md`, `DECISIONS.md`, and `.env.example`.
2. [ ] **Client & Server Scaffolding:** Initialize `client/` (Vite + React) and `server/` (Node.js + Express).
3. [ ] **Database Schema & Migrations:** Set up PostgreSQL tables for Users, Clients, Invoices, Items, and Payments.
4. [ ] **Auth Pipeline:** Implement registration, login, and JWT middleware with password hashing.
5. [ ] **Client & Invoice CRUD:** Connect React frontend forms and lists to Express API routes.
