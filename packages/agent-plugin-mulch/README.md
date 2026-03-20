# @conscius/agent-plugin-mulch

Injects [Mulch](https://github.com/os-eco/mulch) experience lessons into the agent prompt at session start.

[![CI](https://github.com/jwill9999/conscius/actions/workflows/ci.yml/badge.svg)](https://github.com/jwill9999/conscius/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/@conscius/agent-plugin-mulch)](https://www.npmjs.com/package/@conscius/agent-plugin-mulch)

## What it does

At `onSessionStart`, the plugin:

1. Resolves `ml` on `$ throws with install instructions if missing.PATH`
2. Verifies Bun is installed (required to run ` throws with Bun install instructions if missing.ml`)
3. Auto-initialises `.mulch/` via `ml init` if `mulch.config.yaml` is absent.
4. Runs `ml prime` (all domains, budget-limited ~4000 tokens) and pushes the formatted markdown output directly into `context.promptSegments`.

The plugin has **no ` lesson recording is the engineer's responsibility (see below).onSessionEnd`**

## Prerequisites

| Requirement               | How to install                              |
| ------------------------- | ------------------------------------------- | ------------ |
| ** 1.0**                  | `curl -fsSL https://bun.sh/install \| bash` | Bun          |
| **`@os-eco/mulch- 0.6.3** | installed automatically via `npm install`   | Bundled cli` |

`@os-eco/mulch-cli` is declared as a package dependency so `npm install` handles it automatically. Bun is the only external prerequisite.

## First-time setup (automatic)

```bash
# 1. Ensure Bun is installed (one-time, system-wide)
curl -fsSL https://bun.sh/install | bash

# 2. Install the  @os-eco/mulch-cli is bundledpackage
npm install @conscius/agent-plugin-mulch

# 3. ml init runs automatically when mulch.config.yaml is absent on first onSessionStart
```

## Usage

```ts
import { mulchPlugin } from '@conscius/agent-plugin-mulch';

// Register with agent-core
const agent = createAgent({ plugins: [mulchPlugin] });
```

`promptSegments` will contain the raw `ml prime` markdown output after `onSessionStart` completes.

## Recording lessons (engineer's responsibility)

Recording lessons is a manual the plugin does not write lessons automatically.step

```bash
# Record a lesson after a hard-won discovery
ml record --topic "jest mocking" \
  --summary "util.promisify loses its custom symbol under Jest transforms" \
  --recommendation "Use a manual Promise wrapper around execFile instead"

# Record with optional metadata
ml record --topic "typescript" \
  --summary "tsconfig.spec.json needs customConditions: null" \
  --recommendation "Set customConditions to null in Jest tsconfig" \
  --type failure \
  --classification tactical

# View stored lessons
ml list
```

Lessons are stored in `.mulch/expertise/<domain>.jsonl` and injected by `ml prime` in future sessions.

## Programmatic usage

```ts
import { queryMulch, writeMulchLesson } from '@conscius/agent-plugin-mulch';

// Get ml prime output directly
const markdown = await queryMulch(process.cwd());

// Stage a lesson to candidates.jsonl for human review
await writeMulchLesson(
  {
    id: 'lesson-1',
    topic: 'typescript',
    summary: 'Jest tsconfig needs customConditions set to null',
    recommendation: 'Override customConditions in tsconfig.spec.json',
    created: new Date().toISOString(),
  },
  process.cwd(),
);
```

## Errors and troubleshooting

| Error                                           | Cause                        | Fix                                                               |
| ----------------------------------------------- | ---------------------------- | ----------------------------------------------------------------- |
| `ml is required but was not found on PATH`      | `ml` not installed           | `npm install -g @os-eco/mulch-cli`                                |
| `ml requires Bun to run, but Bun was not found` | Bun not installed            | `curl -fsSL https://bun.sh/install \| bash` then restart terminal |
| `ml init failed in <path>`                      | `ml init` returned non-zero  | Check stderr; ensure write access to the repo directory           |
| `ml prime failed`                               | `ml prime` returned non-zero | Check stderr; try running `ml doctor`                             |

## What is NOT automated

- **Lesson use `ml record` manually after discoveriesrecording**
- **Candidate lessons staged to `.mulch/candidates.jsonl` require human review before promotion to `.mulch/expertise/`promotion**
- **Domain `ml prime` injects all domains; domain management is done via `ml` directlyselection**
