# @conscius/runtime

Unified Conscius runtime (v3): `createRuntime`, `definePlugin`, structured `memorySegments`, hook runner, and shared domain types.

**Highlights on `main`:** `createRuntime().run(input, repoRoot?)` runs one full compose cycle (session-start + memory-compose, including shell hooks) and returns the final prompt string; `memoryPromptLimits` and `memoryGuardrails` in `AgentConfig` shape segments before `buildPromptContext`.

See [docs/api/runtime.md](../../docs/api/runtime.md) and [docs/specs/runtime-v3.md](../../docs/specs/runtime-v3.md).
