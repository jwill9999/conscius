# Layer 7 --- Guardrails & Quality Gates

## Purpose

The Guardrails & Quality Gate layer ensures that work produced by agents
meets engineering quality standards before being marked complete.

This layer prevents unfinished or unsafe work from being committed or
marked as done.

---

## Trigger

Typically triggered when a task transitions to a **review state**.

Example lifecycle:

todo → in_progress → review → done

When entering **review**, the guardrail pipeline runs.

---

## Typical Validation Pipeline

Formatting ↓ Linting ↓ Type Checking ↓ Unit Tests ↓ Integration Tests ↓
Agent Review ↓ Task Completion

If any step fails:

agent fixes issues → pipeline reruns.

---

## Example Checks

Formatting - prettier - black

Static Analysis - eslint - type checking

Testing - unit tests - integration tests

Build Validation - docker build - compile checks

---

## Integration With Beads

When task state becomes **review**, the guardrail system runs
automatically.

If all checks pass:

review → done

If checks fail:

review → in_progress

---

## Output Artifacts

Possible artifacts include:

- test output
- lint reports
- review summaries

These may optionally be summarised in SESSION.md.

---

## Benefits

- protects code quality
- enables safe agent autonomy
- aligns with CI/CD pipelines
