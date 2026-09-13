# Contributing to Receively MVP

Thank you for contributing to **Receively MVP**. To ensure consistent code quality, safe collaboration, and a smooth developer experience, please adhere to the guidelines outlined below.

---

## 1. Development Principles

- **Simplicity First:** Build only what is needed for the current milestone. Avoid premature optimization or over-engineering abstractions.
- **Explicit Typing & Validation:** Validate all input boundaries (HTTP request payloads, query params, environment variables).
- **Security by Default:** Never commit `.env` files, API tokens, or secrets. Always use `.env.example` as a template.
- **Domain Cohesion:** Organize logic by business domain (e.g., `auth`, `clients`, `invoices`, `payments`) to keep components, routes, and services self-contained.

---

## 2. Git & Branching Strategy

- **Default Branch:** `main` (production-ready code).
- **Feature Branches:** Branch off `main` using descriptive prefixes:
  - `feat/<feature-name>` (e.g., `feat/invoice-pdf-generation`)
  - `fix/<bug-name>` (e.g., `fix/client-delete-cascade`)
  - `refactor/<scope>` (e.g., `refactor/auth-middleware`)
  - `docs/<scope>` (e.g., `docs/update-architecture`)

### Commit Message Conventions
Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` A new feature for the user or system
- `fix:` A bug fix
- `docs:` Documentation-only changes
- `refactor:` Code change that neither fixes a bug nor adds a feature
- `test:` Adding missing tests or correcting existing tests
- `chore:` Maintenance tasks, dependency updates, configuration

*Example:* `feat(invoices): add status filter to invoice listing query`

---

## 3. Pull Request (PR) Checklist

Before submitting a pull request or merging a task:

1. [ ] **No Secrets Exposed:** Ensure no secret keys, tokens, or local credentials are included in the diff.
2. [ ] **Environment Updates:** If new environment variables are introduced, update [`.env.example`](file:///c:/all@gAurav/receively-mvp/.env.example).
3. [ ] **Linting & Formatting:** Ensure code conforms to project formatting rules.
4. [ ] **Manual Verification:** Test the affected endpoint, UI screen, or workflow locally.
5. [ ] **Documentation:** If an architectural change was introduced, add an entry to [`docs/DECISIONS.md`](file:///c:/all@gAurav/receively-mvp/docs/DECISIONS.md).

---

## 4. Reporting Issues & Proposing Features

- Open an issue describing the expected behavior, actual behavior, and steps to reproduce.
- For architectural proposals, include **Reason**, **Purpose**, **Trade-offs**, and **Alternatives considered** before writing code.
