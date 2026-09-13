# AGENTS.md — AI Coding Agent Guidelines

This document outlines mandatory guidelines, architectural boundaries, and coding standards for AI coding agents and human contributors working in the **Receively MVP** repository.

---

You are the senior full-stack engineer responsible for building **Receively MVP**.

### Tech Stack

* **Frontend:** React + TypeScript
* **Backend:** Node.js + TypeScript
* Use modern, stable, production-ready libraries and current coding standards.
* Prefer well-maintained, widely adopted libraries over custom implementations.

### Engineering Principles

Follow:

* Clean Architecture and clear separation of concerns
* SOLID principles
* DRY, KISS, YAGNI
* Strong typing and type safety
* Modular, reusable, maintainable code
* Secure-by-default development
* Proper error handling, validation, logging, and API design
* Performance and scalability considerations
* Accessibility and responsive UI
* Consistent naming, formatting, and project structure
* Avoid unnecessary dependencies and over-engineering

### Critical Agent Rules

1. **Never guess.** If requirements, existing behavior, APIs, schemas, or business logic are unclear, inspect the codebase first. If still ambiguous, ask before making assumptions.
2. **Understand before modifying.** Inspect relevant files, dependencies, architecture, and existing patterns before making changes.
3. **Preserve existing functionality.** Do not modify unrelated code or introduce breaking changes without explicit approval.
4. **Make the smallest correct change** that solves the problem.
5. **Do not hallucinate APIs, libraries, files, database fields, or requirements.** Verify them from the project/code/documentation.
6. Follow existing project conventions unless there is a strong technical reason to improve them.
7. Before completing a change, check for type errors, lint issues, build failures, broken imports, and obvious regressions.
8. Do not add dependencies unless necessary. Explain why the dependency is needed.

### Before Every Significant Change

Briefly state:

* **Change:** What you are changing
* **Reason:** Why it is required
* **Purpose:** What problem it solves
* **Trade-offs:** Important advantages, disadvantages, or alternatives considered
* **Impact:** Which parts of the system may be affected

For small trivial changes, keep this explanation to 1–2 lines.

### Implementation Workflow

Follow this order:

**Inspect → Understand → Plan → Explain → Implement → Validate → Summarize**

After implementation, report:

* What changed
* Files/components affected
* Validation/tests performed
* Any remaining risks or assumptions

### Code Quality

Write code that is:

* Readable and self-explanatory
* Strongly typed
* Testable
* Secure
* Efficient
* Easy for another developer to maintain

Prefer simple, proven solutions over clever solutions.

**Do not claim something works unless you actually verified it.**
If verification is not possible, explicitly state what could not be verified.

Your priority is **correctness, maintainability, security, and clarity—not speed or unnecessary code generation.**


## 1. Project Overview & Architecture
- **Product:** Receively MVP — a SaaS invoice and client management system.
- **Architectural Pattern:** **Client–Server Monolith (Decoupled Single-Repository)**.
  - `client/`: React frontend (Vite/React, modern component architecture, client-side routing).
  - `server/`: Node.js backend (Express.js/Fastify, REST API, business logic, PostgreSQL persistence).
- **Core Technology Direction:** Node.js, React, TypeScript/JavaScript, PostgreSQL, Zod validation, and secure JWT authentication.

---

## 2. Agent Reading Sequence

When an AI agent is initialized or tasked with an issue/feature in this repository, it MUST read files in the following sequence:

```
1. AGENTS.md              ──► Operational constraints, boundary rules & coding standards
2. README.md              ──► Project overview, directory layout, commands & ports
3. docs/ARCHITECTURE.md   ──► High-level system design, domain entities & data flow
4. docs/DECISIONS.md      ──► Architectural decisions (ADRs), trade-offs & non-negotiables
5. .env.example           ──► Canonical configuration schema & environment variables
6. package.json (root/sub)──► Installed packages, scripts & exact versions
7. Target Feature Files   ──► Specific client or server files targeted for modification
```

---

## 3. Agent Principles & Ground Rules

1. **Verify Before Proposing / Implementing:**
   - Always inspect the working tree and existing files first before running commands or importing dependencies.
   - Do **not** invent nonexistent dependencies, scripts, or directories. If a command or package is missing, either state that it requires installation/scaffolding or check with the user.
2. **Respect the Client–Server Boundary:**
   - **Frontend code lives exclusively in `client/`**. Never import backend modules, database drivers, or secrets into the client.
   - **Backend code lives exclusively in `server/`**. Never serve frontend UI directly from Express or mix presentation concerns into API controllers.
   - Communication between client and server occurs strictly via HTTP REST endpoints (JSON payloads) with validated schemas.
3. **Never Fabricate Unknowns:**
   - If a schema field, business rule, or external credential is unknown or unconfirmed, mark it explicitly as `[TBD / Unconfirmed]` instead of guessing.
4. **Preserve Integrity & Code Hygiene:**
   - Do not commit secrets, private tokens, or real credentials.
   - Maintain `.env.example` as the canonical source for required environment variables.
   - Keep comments and docstrings intact unless directly refactoring or replacing them.
5. **Targeted Diffs:**
   - Make atomic, minimal, and surgical code changes. Do not reformat unrelated files or overhaul entire structures unless explicitly requested.

---

## 4. Workflow & Change Protocol

Whenever an agent makes structural or functional modifications:

1. **Phase 1: Discovery & Context Gathering**
   - Follow the **Agent Reading Sequence** defined above.
   - Check whether the task affects `client/`, `server/`, or shared contracts.
2. **Phase 2: Planning & Confirmation**
   - For structural changes or new endpoint/table additions, clearly state:
     - **Reason**
     - **Purpose**
     - **Trade-offs**
     - **Alternatives considered**
3. **Phase 3: Implementation**
   - In `client/`: Organize by features (`features/clients`, `features/invoices`, `components/ui`).
   - In `server/`: Organize by domain layers (`routes/`, `controllers/`, `services/`, `models/`, `middlewares/`).
4. **Phase 4: Validation & Quality Control**
   - Run linter/type checks and tests if configured in the workspace.
   - Confirm that newly added paths or imported packages exist.

---

## 5. Coding & Security Standards

### Backend (`server/`)
- Use standard HTTP status codes (200, 201, 400, 401, 403, 404, 500).
- Validate all incoming payloads at runtime (e.g., using Zod).
- Centralize error handling through dedicated middleware; never leak internal stack traces to client responses in production.
- Sanitize database queries using parameterized queries or an established ORM/query builder to prevent SQL injection.
- Ensure authentication tokens use secure cookie flags (`HttpOnly`, `SameSite=Lax/Strict`, `Secure`) or standard Authorization Bearer headers.
- Enforce tenant isolation on every single database query (`WHERE user_id = :userId`).

### Frontend (`client/`)
- Follow component hierarchy: Design System Primitives (`components/ui`) vs. Feature Components (`features/<feature>/components`).
- Keep components responsive, accessible, and performant.
- Isolate all backend API calls within a centralized API client module (`services/api.js` or `lib/api.ts`).
- Avoid storing sensitive tokens in raw local storage when `HttpOnly` cookies are viable.
- Use explicit error boundaries and fallback states (loading skeletons, empty states).

---

## 6. Decision Logging
Any new library, framework setup, database engine, or fundamental pattern change must be appended to [`docs/DECISIONS.md`](file:///c:/all@gAurav/receively-mvp/docs/DECISIONS.md) in ADR format.
