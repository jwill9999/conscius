# Adding a plugin

This guide walks through scaffolding a new Conscius plugin package and wiring it into `agent-core`.

## Prerequisites

- Working monorepo install (see [Getting started](./getting-started.md))
- Familiarity with the [AgentPlugin interface](../specs/agent_architecture_documentation_pack/agent_plugin_interface.md)

## 1. Scaffold the package

Use the Nx generator to create a new publishable library:

```bash
npx nx g @nx/js:lib packages/agent-plugin-<name> \
  --publishable \
  --importPath=@conscius/agent-plugin-<name>
```

Replace `<name>` with your plugin's short identifier (e.g. `mulch`, `session`, `guardrails`).

## 2. Add the agent-types dependency

In `packages/agent-plugin-<name>/package.json`, add:

```json
{
  "dependencies": {
    "@conscius/agent-types": "*"
  }
}
```

Then run `npm install` from the repo root to link the workspace package.

## 3. Apply project config

Copy the Jest and ESLint config pattern from an existing plugin (e.g. `agent-plugin-beads`):

- `jest.config.cts` — set `displayName` to `@conscius/agent-plugin-<name>`
- `.eslintrc.json` — extend `../../.eslintrc.js`
- `tsconfig.spec.json` — set `"customConditions": null`

## 4. Implement the plugin

Create `src/index.ts` and export a class or object implementing `AgentPlugin`:

```typescript
import type { AgentPlugin, AgentContext } from '@conscius/agent-types';

export const myPlugin: AgentPlugin = {
  name: '@conscius/agent-plugin-<name>',

  async onSessionStart(context: AgentContext): Promise<void> {
    // inject context, fetch data, write to promptSegments, etc.
  },

  async onSessionEnd(context: AgentContext): Promise<void> {
    // persist state, write lessons, clean up
  },
};
```

Only implement the hooks your plugin needs. All hooks are optional.

## 5. Register with agent-core

Import and register your plugin in the consuming agent's bootstrap:

```typescript
import { AgentRuntime } from '@conscius/agent-core';
import { myPlugin } from '@conscius/agent-plugin-<name>';

const runtime = new AgentRuntime({
  plugins: [myPlugin],
});

await runtime.startSession();
```

## 6. Verify

```bash
npx nx run-many -t typecheck,lint,test --projects=agent-plugin-<name>
```

## Related

- [AgentPlugin interface spec](../specs/agent_architecture_documentation_pack/agent_plugin_interface.md)
- [`@conscius/agent-types` API reference](../api/agent-types.md)
- [`@conscius/agent-core` API reference](../api/agent-core.md)
