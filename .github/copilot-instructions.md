# Copilot Instructions — coreai

## Project Overview

This is an **Nx monorepo** (`@coreai/source`) that houses the **agent ecosystem** — a layered architecture for AI-assisted engineering workflows. Packages live in `packages/`.

The system separates concerns across 7 layers:

| Layer | Name | Persistence |
|-------|------|-------------|
| 1 | Beads — execution / task graph | persistent |
| 2 | Mulch — experience / lessons learned | persistent |
| 3 | Skills / instruction knowledge | persistent |
| 4 | Conversation compression | **ephemeral** (runtime only) |
| 5 | Session continuity (`SESSION.md`) | persistent |
| 6 | Context injection hooks | persistent |
| 7 | Guardrails & quality gates | runtime |

## Ecosystem Package Structure

The target architecture is a `agent-core` + plugin model:

```
agent-core              # runtime: context-builder, hook-runner, plugin-loader, CLI
agent-plugin-beads      # wraps `bd` CLI — injects task metadata
agent-plugin-mulch      # wraps `mulch` CLI — injects experience lessons
agent-plugin-session    # manages SESSION.md read/write
agent-plugin-compression# ephemeral conversation compression
agent-plugin-guardrails # validation pipeline: format → lint → typecheck → test
agent-stack-standard    # bundle that installs all common plugins
```

Plugin interface (TypeScript):
```ts
export interface AgentPlugin {
  name: string
  onSessionStart?(context: AgentContext): Promise<void>
  onTaskStart?(context: AgentContext): Promise<void>
  onConversationThreshold?(context: AgentContext): Promise<void>
  onSessionEnd?(context: AgentContext): Promise<void>
}
```

## Key Conventions

### TypeScript
- `module: nodenext`, `moduleResolution: nodenext` — use `.js` extensions in imports even for `.ts` source files
- `strict: true`, `noUnusedLocals: true`, `noImplicitReturns: true`
- `target: es2022`, `lib: ["es2022"]`
- Custom condition: `@coreai/source` (see `tsconfig.base.json`)

### Nx Workspace
- Build: `npx nx build <project>`
- Typecheck: `npx nx typecheck <project>`
- Run any target: `npx nx <target> <project>`
- Sync TypeScript project references: `npx nx sync`
- Generate a new publishable library: `npx nx g @nx/js:lib packages/<name> --publishable --importPath=@coreai/<name>`

### Controlled File Writes
Hooks and agents may only write to:
- `SESSION.md` (session continuity)
- `.mulch/mulch.jsonl` (experience lessons)

All other repository files are **read-only** from agent/hook context.

### Hook Resolution Order
```
repo/.agent/hooks/   ← project-specific (takes priority)
~/.agent/hooks/      ← global reusable hooks
```

### Mulch Experience Format
Lessons are stored in JSONL. Required fields: `id`, `topic`, `summary`, `recommendation`, `created`.
- Project lessons: `.mulch/mulch.jsonl`
- Global lessons: `~/.mulch/mulch.jsonl`
- Query order: project mulch → global mulch

### SESSION.md
Short-term session handoff document (150–400 words max). Sections: Current Objective, Active Task, Progress Since Last Session, Decisions Made, Open Issues, Next Steps, References.

### Context Injection Order (prompt assembly)
```
skills / instructions
SESSION.md
conversation compression summary
recent conversation messages
beads task context
specification file
```

## Planning Workflow

Feature and backlog tracking lives in `docs/planning/`:
- `index.md` — active features
- `backlog.md` — backlog items

Use the planning skill (`/.github/skills/planning/SKILL.md`) with slash commands: `/new-feature`, `/add-subtask`, `/update-status`, `/close-feature`, `/new-backlog`, `/move-to-feature`.

Feature IDs follow the pattern: `feature-YYYY-MM-DD-NNN`. Dates use GMT (UK time).

## Guardrails Pipeline

Tasks follow: `todo → in_progress → review → done`.

On entering **review**, the validation pipeline runs:
1. Formatting (Prettier)
2. Linting (ESLint)
3. Type checking
4. Unit tests
5. Integration tests
6. Agent review

If any step fails: fix issues → rerun pipeline.

## Specs

Architecture specification documents are in `docs/specs/agent_architecture_documentation_pack/`. Do not confuse specification docs with runtime artifacts (`SESSION.md`, `mulch.jsonl`).

## Related Projects

- `../plans/skillshare/skillshare-agent-plan.md` — plan for a standalone `skillshare` NPM package (manifest-driven skills/instructions sync CLI). Uses `commander`, `simple-git`, manifest file `skills-config.json`, commands: `init`, `sync`, optional `pull`.
