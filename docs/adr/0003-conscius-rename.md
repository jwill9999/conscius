# ADR-0003: Rename project from @coreai to @conscius

**Date:** 2026-03-10
**Status:** accepted

## Context

The project was initially named `coreai` with npm packages scoped under `@coreai`. During pre-publish planning it was discovered that the `@coreai` npm organisation scope was already registered by a third party, making it impossible to publish under the intended name.

A rename was triggered to establish a unique, publishable identity before the first `npm publish`. Several candidate names were evaluated for:

- npm unscoped package availability (`conscius`)
- npm org scope availability (`@conscius`)
- GitHub namespace saturation (number of existing repos using the name)
- Semantic fit with the project's purpose

Candidates evaluated: AgentCortex, MindMesh, Neuron, NeuralKit, Synapse, Dendrite, Axon, CerebralAI, Hippocampus, Memoria, Conscius.

## Decision

Rename the project to **Conscius** (Latin: _aware, knowing, conscious_).

- npm package `conscius` — available
- npm org `@conscius` — registered by project owner
- GitHub repo renamed from `jwill9999/coreai` to `jwill9999/conscius`
- All package names updated: `@coreai/*` → `@conscius/*`
- All TypeScript path mappings, jest `displayName` values, and prose references updated
- Custom tsconfig condition updated: `@conscius/source`

Rename executed in a single bulk commit on `main` after full suite verification (58 tests passing).

## Consequences

- All future packages published under `@conscius` scope
- GitHub repo URL is `https://github.com/jwill9999/conscius`
- SonarCloud project key updated to `jwill9999_conscius`
- Pre-publish: cross-package `"*"` deps (`@conscius/agent-types: "*"`) must be pinned to a concrete version before first `npm publish`
- The name Conscius has no trademark conflicts and low GitHub saturation (13 repos at time of adoption)
