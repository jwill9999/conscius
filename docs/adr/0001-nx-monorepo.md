# ADR-0001: Use Nx for monorepo tooling

**Date:** 2026-01-15
**Status:** accepted

## Context

The Conscius project requires a monorepo that hosts multiple interdependent npm packages (`agent-types`, `agent-core`, `agent-plugin-*`). These packages share TypeScript configuration, linting rules, test setup, and build pipelines. Managing this manually across packages would create drift and overhead.

Options considered:

- **Nx** — monorepo-first build system with caching, affected commands, and a first-party plugin ecosystem
- **Turborepo** — lightweight task orchestrator, less opinionated
- **Manual npm workspaces** — no build orchestration, no caching

## Decision

Adopt **Nx** with first-party plugins (`@nx/js`, `@nx/eslint`, `@nx/jest`).

Use inferred targets wherever possible (Nx reads `tsconfig.lib.json`, `.eslintrc.json`, `jest.config.*` and generates targets automatically without manual `project.json` configuration).

## Consequences

- Nx caching reduces redundant builds and test runs
- `npx nx affected` limits CI work to changed packages
- `@nx/js` provides `typecheck`, `build`, `build-deps`, and `watch-deps` targets out of the box
- All packages follow the same `tsconfig.lib.json` + `tsconfig.spec.json` pattern
- Adding a new package requires `npx nx g @nx/js:lib` — not manual wiring
- Nx Cloud can be added later for remote caching and CI visibility
