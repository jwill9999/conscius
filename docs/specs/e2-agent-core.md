# E2 — @conscius/agent-core

**Beads ID:** coreai-nsn  
**Status:** as-built (complete)  
**Package:** `packages/agent-core`  
**Import path:** `@conscius/agent-core`

---

## Overview

The runtime engine of the agent ecosystem. Provides three core systems:

- **ContextBuilder** — assembles the final prompt from plugin segments, compression summaries and recent messages
- **HookRunner** — resolves and executes shell/JS lifecycle hooks; manages write permissions
- **PluginLoader** — dynamically imports `AgentPlugin` modules and dispatches lifecycle events

---

## File structure (as-built)

```
packages/agent-core/
└── src/
    ├── cli.ts                            ← minimal CLI entry point
    ├── index.ts                          ← public barrel
    ├── utils.ts                          ← shared helpers
    ├── context-builder/
    │   ├── context-builder.ts            ← buildContext(), shouldCompress(), getMessagesToCompress()
    │   ├── context-builder.spec.ts
    │   └── index.ts
    ├── hook-runner/
    │   ├── hook-runner.ts                ← HookRunner class + DEFAULT_AGENT_CONFIG
    │   ├── hook-runner.spec.ts
    │   └── index.ts
    └── plugin-loader/
        ├── plugin-loader.ts              ← PluginLoader class
        ├── plugin-loader.spec.ts
        └── index.ts
```

---

## ContextBuilder

### Constants

| Constant | Value | Purpose |
| -------- | ----- | ------- |
| `COMPRESSION_THRESHOLD` | 30 | Trigger `onConversationThreshold` when message count ≥ this |
| `RECENT_MESSAGES_TO_KEEP` | 10 | Always preserve last N messages uncompressed |

### Functions

```ts
buildContext(context: AgentContext): BuiltContext
```
Assembles the prompt in canonical order:
1. `context.promptSegments` — plugin-injected blocks (skills, SESSION.md, task metadata)
2. `context.compressionSummaries` — formatted as `## Segment N: topic`
3. Last 10 `context.conversation` messages — formatted as `**role:** content`

Sections are separated by `\n\n---\n\n`.

```ts
shouldCompress(messages: ConversationMessage[]): boolean
// returns true when messages.length >= COMPRESSION_THRESHOLD

getMessagesToCompress(messages: ConversationMessage[]): ConversationMessage[]
// returns all but the last RECENT_MESSAGES_TO_KEEP messages
```

---

## HookRunner

### Hook resolution order

1. `{repoRoot}/.agent/hooks/{hookName}.{ext}` — project-specific (takes priority)
2. `~/.agent/hooks/{hookName}.{ext}` — global

Extensions tried in order: `.sh`, `.js`, `.mjs`, `.cjs`

### Hook names (mapped from `AgentPlugin` lifecycle keys)

| Plugin lifecycle | Hook script name |
| ---------------- | ---------------- |
| `onSessionStart` | `session-start` |
| `onTaskStart` | `task-start` |
| `onConversationThreshold` | `conversation-threshold` |
| `onSessionEnd` | `session-end` |

### Environment injected into hook scripts

| Variable | Value |
| -------- | ----- |
| `AGENT_REPO_ROOT` | absolute repo root path |
| `AGENT_APPROVED_WRITES` | colon-separated list of approved write paths |
| `AGENT_ACTIVE_TASK_ID` | current Beads task ID (or empty string) |

### Write permissions

- Default allow list: `['SESSION.md', '.mulch/mulch.jsonl']`
- Persisted in `.agent/config.json`
- First run: prompts user interactively (skipped in non-TTY / CI)
- `isApprovedWrite(filePath)` — checks `approvedWrites` map first, then `permissions.allowWrite` list

### Security

- Hook path validated against approved hook directories before `spawn`
- Prevents shell injection via path traversal check

### Config file

`.agent/config.json` — read on startup, created on first run:
```json
{
  "plugins": [],
  "hooks": { "repoHooksDir": ".agent/hooks", "globalHooksDir": "~/.agent/hooks" },
  "permissions": { "allowWrite": ["SESSION.md", ".mulch/mulch.jsonl"] },
  "approvedWrites": {}
}
```

---

## PluginLoader

Dynamically imports plugin modules by path (npm package name or file path).

Expected module shape:
```ts
export default beadsPlugin;  // default export
// OR
export const plugin = beadsPlugin;  // named export
```

Lifecycle dispatch:
```ts
loader.runSessionStart(context)
loader.runTaskStart(context)
loader.runConversationThreshold(context)
loader.runSessionEnd(context)
```

Error handling: collects all plugin errors per lifecycle event; throws `AggregateError` when multiple plugins fail.

---

## Key decisions

- Hook scripts run with `spawn` (not `exec`) — no shell interpolation, args passed as array
- `execPath` (Node binary) used for `.js`/`.mjs`/`.cjs` hooks
- `AggregateError` on multi-plugin failure — all plugins run even if one throws
- `.agent/config.json` created only on first interactive run; CI defaults to no approved writes

---

## Archive

Original design: `docs/specs/archive/AGENT_RUNTIME_FLOW.md`, `docs/specs/archive/agent_plugin_interface.md`, `docs/specs/archive/layer6_context_injection_hooks_spec.md`
