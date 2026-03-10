# ADR-0002: AgentPlugin lifecycle interface

**Date:** 2026-01-20
**Status:** accepted

## Context

Conscius needs a stable contract that all plugins implement. This interface must be expressive enough to cover the known plugin lifecycle events (session start, task start, conversation threshold, session end) while remaining minimal enough for simple plugins to implement only what they need.

The interface must be defined in a shared package (`@conscius/agent-types`) so that plugin authors can depend on types without taking a runtime dependency on `agent-core`.

## Decision

Define the `AgentPlugin` interface in `@conscius/agent-types` as:

```typescript
export interface AgentPlugin {
  name: string;
  onSessionStart?(context: AgentContext): Promise<void>;
  onTaskStart?(context: AgentContext): Promise<void>;
  onConversationThreshold?(context: AgentContext): Promise<void>;
  onSessionEnd?(context: AgentContext): Promise<void>;
}
```

All hook methods are optional. The `name` field is required for logging, diagnostics, and deduplication.

`AgentContext` carries the mutable session state that plugins read from and write to (e.g. `promptSegments`, `sessionId`, `taskId`).

## Consequences

- Plugin authors only implement the hooks they need — no mandatory stub implementations
- `agent-core` iterates registered plugins and calls each hook if it exists
- Adding new lifecycle hooks is non-breaking (existing plugins silently skip new hooks)
- All plugin packages depend on `@conscius/agent-types` for the interface — no circular deps
- Pre-publish: `@conscius/agent-types` must be published first; other packages pin a concrete version of it (not `"*"`)
