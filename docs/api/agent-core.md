# `@conscius/agent-core` API reference

The core Conscius runtime. Provides the context builder, plugin loader, hook runner, and CLI.

**Version:** see [npm](https://www.npmjs.com/package/@conscius/agent-core)  
**Import path:** `@conscius/agent-core`

---

## `buildContext`

Compiles the active `AgentContext` into an ordered array of prompt segments ready to inject into an agent's system prompt.

```typescript
function buildContext(context: AgentContext): BuiltContext;
```

```typescript
export interface BuiltContext {
  segments: string[];
  tokenEstimate: number;
}
```

**Usage:**

```typescript
import { buildContext } from '@conscius/agent-core';

const built = buildContext(context);
console.log(built.segments.join('\n\n'));
```

---

## `shouldCompress`

Returns `true` when the conversation length has reached the compression threshold and `onConversationThreshold` should be fired.

```typescript
function shouldCompress(context: AgentContext): boolean;
```

**Constants:**

```typescript
const COMPRESSION_THRESHOLD = 30; // messages before compression triggers
const RECENT_MESSAGES_TO_KEEP = 5; // messages kept verbatim after compression
```

---

## `getMessagesToCompress`

Returns the slice of conversation messages that should be compressed, leaving the most recent messages intact.

```typescript
function getMessagesToCompress(context: AgentContext): ConversationMessage[];
```

---

## `PluginLoader`

Discovers and instantiates plugin modules listed in `AgentConfig.plugins`.

```typescript
class PluginLoader {
  load(config: AgentConfig): Promise<AgentPlugin[]>;
}
```

Plugins are resolved relative to the `repoRoot`. Each entry in `config.plugins` is a module path that default-exports or named-exports an `AgentPlugin`.

---

## `HookRunner`

Iterates registered plugins and invokes a named lifecycle hook on each.

```typescript
class HookRunner {
  constructor(plugins: AgentPlugin[]);
  run(hook: HookName, context: AgentContext): Promise<void>;
}

type HookName =
  | 'onSessionStart'
  | 'onTaskStart'
  | 'onConversationThreshold'
  | 'onSessionEnd';

const HOOK_NAMES: HookName[];
```

**Usage:**

```typescript
import { HookRunner } from '@conscius/agent-core';

const runner = new HookRunner(plugins);
await runner.run('onSessionStart', context);
```

---

## `DEFAULT_AGENT_CONFIG`

The default `AgentConfig` used when no `.agent/config.json` is present.

```typescript
const DEFAULT_AGENT_CONFIG: AgentConfig;
```

---

## Related

- [`@conscius/agent-types` API reference](./agent-types.md) — all shared interfaces
- [Plugin interface spec](../specs/agent_architecture_documentation_pack/agent_plugin_interface.md)
- [Agent runtime flow](../specs/agent_architecture_documentation_pack/AGENT_RUNTIME_FLOW.md)
