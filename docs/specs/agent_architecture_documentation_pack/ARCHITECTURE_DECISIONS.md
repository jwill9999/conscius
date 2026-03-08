# ARCHITECTURE_DECISIONS.md

This document records the key architectural decisions made while
designing the AI‑assisted engineering system. It acts as a lightweight
**Architecture Decision Record (ADR)** so future engineers and AI agents
understand *why* certain decisions were made.

------------------------------------------------------------------------

# Decision 1 --- Layered Agent Architecture

## Context

The system needed a clear separation between execution logic, memory
systems, agent knowledge, and orchestration.

## Decision

Adopt a **7‑layer architecture** separating responsibilities.

## Layers

1.  Beads Execution Layer
2.  Mulch Experience Layer
3.  Skills / Instruction Knowledge Layer
4.  Conversation Compression Layer
5.  Session Continuity (SESSION.md)
6.  Context Injection Hooks
7.  Guardrails & Quality Gates

## Rationale

Benefits:

-   clear separation of concerns
-   extensible architecture
-   tool independence
-   easier reasoning for AI agents

------------------------------------------------------------------------

# Decision 2 --- External Tool Integration (Beads & Mulch)

## Context

Beads and Mulch are already established tools.

## Decision

Do **not fork these tools**.

Instead create **plugin adapters**.

Example:

agent-plugin-beads → wraps `bd` CLI\
agent-plugin-mulch → wraps `mulch` CLI

## Rationale

-   avoids maintenance burden
-   stays compatible with upstream
-   leverages existing ecosystems

------------------------------------------------------------------------

# Decision 3 --- Core + Plugin Architecture

## Context

The system must be extensible and support future integrations.

## Decision

Implement the runtime as:

    agent-core
        +
    plugin ecosystem

Example plugins:

-   agent-plugin-beads
-   agent-plugin-mulch
-   agent-plugin-session
-   agent-plugin-compression
-   agent-plugin-guardrails

## Rationale

-   modular architecture
-   easier upgrades
-   third‑party plugin ecosystem possible

------------------------------------------------------------------------

# Decision 4 --- Library + CLI Distribution

## Context

The system should work with:

-   CLI agents
-   VS Code extensions
-   custom runtimes

## Decision

Provide both:

    library API
    +
    CLI tool

Example:

    @agent/core
    agent CLI

## Rationale

-   programmatic integration
-   flexible tooling
-   easier automation

------------------------------------------------------------------------

# Decision 5 --- Ephemeral Conversation Compression

## Context

Long AI conversations can exceed context window limits.

## Decision

Conversation compression should be:

    runtime only
    ephemeral

No repository files are created.

## Rationale

-   avoids repo noise
-   reduces token usage
-   improves runtime performance

------------------------------------------------------------------------

# Decision 6 --- Hybrid Hook Locations

Hooks should be discoverable in both:

    repo/.agent/hooks
    ~/.agent/hooks

Resolution order:

    repo hooks
    ↓
    global hooks

## Rationale

Allows:

-   project customization
-   reusable global automation

------------------------------------------------------------------------

# Decision 7 --- Controlled File Writes

Hooks may only write to:

    SESSION.md
    .mulch/mulch.jsonl

All other repository files are read‑only.

## Rationale

Prevents unsafe modifications by automated agents.

------------------------------------------------------------------------

# Future Evolution

Possible future layers:

-   vector knowledge memory
-   multi‑agent orchestration
-   distributed task execution

This document should be updated whenever a major design decision
changes.
