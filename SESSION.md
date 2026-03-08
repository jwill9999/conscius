# Session Context

## Current Objective
Build the coreai agent ecosystem — a layered AI-assisted engineering workflow platform — as an Nx monorepo with 8 publishable packages.

## Active Task
Epic 2 — `@coreai/agent-core` (not yet started)

## Progress Since Last Session
- ✅ Epic 1 complete and committed
  - Scaffolded `@coreai/agent-types` publishable Nx package with all shared TypeScript interfaces: `AgentPlugin`, `AgentContext`, `AgentConfig`, `BeadsTask`, `MulchLesson`, `ConversationMessage`, `ConversationSegment`, `CompressionSummary`
  - Installed and configured `@nx/eslint` and `@nx/jest` plugins — all packages now have `lint`, `test`, `typecheck`, `build` targets via Nx inference
  - Root `.eslintrc.js` + per-package `.eslintrc.json` pattern established
  - `jest.preset.js` + per-package `jest.config.cts` pattern established
  - `.nvmrc` pinned to Node 24 (project uses nvm)
  - `copilot-instructions.md` created and updated with architecture, Nx plugin conventions, and Node setup
  - All quality checks passing: typecheck ✅ lint ✅ test ✅ format ✅
  - Committed (2 commits) and pushed to https://github.com/jwill9999/coreai (`main`)

## Decisions Made
- Nx monorepo using `@nx/js`, `@nx/eslint`, `@nx/jest` plugins (prefer Nx ecosystem over manual config)
- TypeScript: `module: nodenext`, strict mode, `.js` import extensions in `.ts` source files
- `tsconfig.spec.json` must set `"customConditions": null` to avoid TS5098 when Jest uses `moduleResolution: node10`
- Node 24 via nvm (`.nvmrc` in repo root)
- ESLint uses legacy config format (`.eslintrc.*`) — ESLint 8 is installed
- Do not fork `bd` (Beads) or `mulch` — adapter plugins only
- Hooks may only write to `SESSION.md` and `.mulch/mulch.jsonl`
- For now pushing directly to `main` (early scaffolding phase)

## Open Issues
- None currently

## Next Steps
1. Start Epic 2 — scaffold `@coreai/agent-core` package
2. Implement context builder (`src/context-builder/`) — assembles prompt in correct injection order
3. Implement plugin loader (`src/plugin-loader/`) — loads plugins and calls lifecycle hooks
4. Implement hook runner (`src/hook-runner/`) — resolves and executes hooks with controlled write permissions
5. Implement CLI (`src/cli/`) — `agent start`, `agent end`, `agent task start <id>` using `commander`
6. Write unit tests for context builder and plugin loader

## References
- Plan: `.copilot/session-state/1599717e-a507-4b20-88eb-68cf1030df61/plan.md` (session only)
- Architecture specs: `docs/specs/agent_architecture_documentation_pack/`
- Copilot instructions: `.github/copilot-instructions.md`
- Repo: https://github.com/jwill9999/coreai
- Epic breakdown: see commit history and plan above
