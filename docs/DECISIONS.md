# Architecture Decision Records (ADRs) — Receively MVP

This document records key architectural and technical decisions made for Receively MVP. Each entry outlines the context, rationale, trade-offs, and alternatives considered.

---

## ADR-001: Adoption of Client–Server Monolith Architecture

* **Status:** Accepted
* **Date:** 2026-09-13
* **Context:** The team evaluated three architectural styles for Receively MVP: Unified Monolith (Next.js full-stack), Decoupled Client–Server Monolith (`client/` + `server/`), and Microservices.

### Decision
Adopt a **Decoupled Client–Server Monolith** inside a single Git repository:
- `client/`: Dedicated React application (Vite).
- `server/`: Dedicated Node.js REST API server (Express.js).

### Rationale
* **Reason:** Keeping the client and server cleanly separated prevents tight coupling between UI rendering and backend data models, creates a reusable REST API capable of serving mobile clients or external webhooks later, and allows backend and frontend concerns to be developed and tested independently.
* **Purpose:** Establish clean architectural boundaries, straightforward local debugging, and an explicit API contract without introducing the overhead of multiple repositories or microservices.
* **Trade-offs:**
  - *Pro:* Clear separation of concerns; backend can be tested with standard API tools (Postman, curl); frontend is purely client-side; enables future mobile or CLI clients to reuse the same backend without rewrites.
  - *Con:* Requires configuring CORS between client and server ports in development; TypeScript types must be synchronized manually or via shared schema packages unless using a monorepo workspace.
* **Alternatives Considered:**
  1. *Unified Monolith (Next.js App Router):* Bundles frontend and backend into one runtime. While fast to prototype, server actions and API routes can blur the boundary between UI components and backend database logic.
  2. *Microservices:* Rejected due to high operational complexity, distributed deployment overhead, and unnecessary latency for an MVP.

---

## ADR-002: Core Technology Stack (Node.js + React)

* **Status:** Accepted
* **Date:** 2026-09-13
* **Context:** The project requires an accessible, productive, and maintainable technology stack for the client and server.

### Decision
Standardize on **React (via Vite)** for the client application and **Node.js (Express.js)** for the backend REST API.

### Rationale
* **Reason:** JavaScript/TypeScript provides a universal language across both client and server, allowing developers and AI coding agents to move seamlessly across the codebase.
* **Purpose:** Provide a fast, responsive user experience for billing dashboards while ensuring high-throughput REST API request processing.
* **Trade-offs:**
  - *Pro:* Huge ecosystem of mature libraries (Tailwind, Zod, pg, bcrypt), rapid build times with Vite, lightweight Express server.
  - *Con:* CPU-bound tasks (e.g., intensive PDF invoice generation) require offloading to async queues if volume grows.
* **Alternatives Considered:**
  1. *Python / FastAPI backend:* Strong typing and async performance, but introduces a dual-language runtime environment.
  2. *Go backend:* High performance, but slower prototyping speed for an initial SaaS MVP.

---

## ADR-003: Relational Persistence with PostgreSQL

* **Status:** Accepted
* **Date:** 2026-09-13
* **Context:** Invoicing systems require strict transactional consistency, relational joins, and exact decimal calculations for line items, taxes, and payments.

### Decision
Use **PostgreSQL** as the primary relational database.

### Rationale
* **Reason:** Financial and billing domain models have strict foreign key relationships (`users` -> `clients` -> `invoices` -> `invoice_items` and `payments`).
* **Purpose:** Ensure ACID compliance, prevent orphaned line items, and maintain exact calculation integrity.
* **Trade-offs:**
  - *Pro:* Strict relational schemas, foreign key constraints, robust JSON column support, supported across all cloud platforms (Supabase, AWS RDS, Neon, Docker).
  - *Con:* Schema updates require explicit migration scripts compared to schemaless databases.
* **Alternatives Considered:**
  1. *MongoDB (NoSQL):* Rejected due to weak relational constraints and risk of inconsistent payment-to-invoice balance states.

---

## ADR-004: Multi-Tenant Data Isolation via Row-Level Filtering

* **Status:** Accepted
* **Date:** 2026-09-13
* **Context:** Receively is a multi-tenant SaaS where each user's clients, invoices, and payments must be completely isolated from other tenants.

### Decision
Implement multi-tenant data isolation by enforcing mandatory `user_id` foreign keys on all tenant-scoped tables (`clients`, `invoices`, `invoice_items`, `payments`), verified on every backend query.

### Rationale
* **Reason:** Single database with row-level tenant filtering provides the simplest infrastructure model for an MVP without the operational burden of managing separate databases.
* **Purpose:** Prevent cross-tenant data leakage while keeping connection pooling and database migrations simple.
* **Trade-offs:**
  - *Pro:* Single database connection pool, low hosting cost, easy cross-tenant aggregate analytics for admins.
  - *Con:* Requires strict developer and query discipline to ensure that no query omits the `WHERE user_id = $userId` predicate.
* **Alternatives Considered:**
  1. *Database per Tenant:* High operational complexity and cost for an early MVP.
  2. *Schema per Tenant:* Complicates database migrations and dynamic connection pooling.

---

## ADR-005: Input Validation via Zod Schemas

* **Status:** Accepted
* **Date:** 2026-09-13
* **Context:** External API inputs (authentication bodies, client creation forms, invoice item arrays) must be validated before processing.

### Decision
Use **Zod** schemas to validate request payloads at the middleware layer before passing requests to controllers.

### Rationale
* **Reason:** Unvalidated input causes unexpected runtime errors, SQL injection vulnerabilities, and dirty database records.
* **Purpose:** Ensure payload integrity, strip unpermitted fields, and return clear, actionable `400 Bad Request` messages to the client.
* **Trade-offs:**
  - *Pro:* Strong type inference, declarative validation rules, small runtime footprint.
  - *Con:* Minor overhead of writing schemas for each request payload.
* **Alternatives Considered:**
  1. *Ad-hoc manual validation:* Fragile and inconsistent across different controller endpoints.
  2. *Joi:* Effective, but lacks native TypeScript type inference.
