# @conscius/agent-types

Shared TypeScript types and interfaces for the Conscius agent ecosystem.

[![CI](https://github.com/jwill9999/conscius/actions/workflows/ci.yml/badge.svg)](https://github.com/jwill9999/conscius/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/@conscius/agent-types)](https://www.npmjs.com/package/@conscius/agent-types)

---

## What it provides

- `AgentContext` — runtime context passed to every plugin lifecycle hook
- `AgentPlugin` — plugin interface (`onSessionStart`, `onTaskStart`, `onConversationThreshold`, `onSessionEnd`)
- `BeadsTask` — task shape returned by the Beads adapter
- `CompressionSummary` — shape for conversation compression segments in `SUMMARY.md`
- `PromptSegment` — unit of content injected into the assembled prompt

## Installation

This package is consumed internally within the monorepo. Once published:

```bash
npm install @conscius/agent-types
```

## Usage

```ts
import type { AgentContext, AgentPlugin } from '@conscius/agent-types';

export const myPlugin: AgentPlugin = {
  name: 'my-plugin',
  async onSessionStart(context: AgentContext) {
    // ...
  },
};
```

## Related packages

- [`@conscius/agent-core`](../agent-core/README.md) — runtime engine that consumes these types
- [`@conscius/agent-plugin-beads`](../agent-plugin-beads/README.md) — Beads task context plugin
