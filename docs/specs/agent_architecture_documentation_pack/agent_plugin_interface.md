# Agent Plugin Interface Contract

The plugin interface defines how extensions integrate with agent-core.

Plugins should be lightweight adapters that provide additional
functionality.

Examples include:

-   beads integration
-   mulch integration
-   session management
-   conversation compression
-   guardrails

------------------------------------------------------------------------

## Minimal Plugin Interface (TypeScript)

``` ts
export interface AgentPlugin {
  name: string

  onSessionStart?(context: AgentContext): Promise<void>

  onTaskStart?(context: AgentContext): Promise<void>

  onConversationThreshold?(context: AgentContext): Promise<void>

  onSessionEnd?(context: AgentContext): Promise<void>
}
```

------------------------------------------------------------------------

## Responsibilities

Plugins may:

-   inject context
-   read repository artifacts
-   trigger automation tasks
-   integrate external tools

Plugins must **not modify repository files outside their defined
scope**.

------------------------------------------------------------------------

## Example Plugins

agent-plugin-beads\
agent-plugin-mulch\
agent-plugin-session\
agent-plugin-compression\
agent-plugin-guardrails

------------------------------------------------------------------------

## Plugin Goals

-   modular design
-   independent evolution
-   ecosystem extensibility
