# Backlog

Items not yet promoted to an active epic. Managed by the `planning` skill — use `/new-backlog` and `/move-to-feature` to maintain this list in sync with the Beads task graph (`bd` CLI).

---

### Pin workspace deps pre-publish (`pin-workspace-deps`)

**Planning ID:** backlog-2026-03-10-001
**Beads ID:** —
**Status:** not started
**Created:** 10/03/2026 (GMT)
**Priority:** medium
**Effort:** small
**Description:** Replace `"@conscius/agent-types": "*"` wildcard in `agent-core` and `agent-plugin-beads` `package.json` with a pinned concrete version (e.g. `"^0.4.0-alpha.0"`) before the first `npm publish`. The wildcard resolves correctly inside the npm workspace but is unsafe for public consumers.
**Dependencies:** Must be done before any `npm publish` run
**Related Docs:** [Publishing guide](../guides/publishing.md)

---

### Epic 5 — agent-plugin-session

**Planning ID:** backlog-2026-03-10-002
**Beads ID:** coreai-vq3
**Status:** not started
**Created:** 10/03/2026 (GMT)
**Priority:** high
**Effort:** medium
**Description:** Plugin that reads and writes `SESSION.md` — automates the session handoff document that is currently maintained manually.
**Related Docs:** [Session continuity spec](../specs/archive/session_continuity_layer_spec_v2.md)

---

### Epic 6 — agent-plugin-compression

**Planning ID:** backlog-2026-03-10-003
**Beads ID:** coreai-mbp
**Status:** not started
**Created:** 10/03/2026 (GMT)
**Priority:** high
**Effort:** medium
**Description:** Plugin implementing ephemeral conversation compression — summarises older segments to reduce prompt size while preserving decision history. Never writes to disk.
**Related Docs:** [Conversation compression spec](../specs/archive/layer4_conversation_compression_spec.md)

---

### Epic 7 — agent-plugin-guardrails

**Planning ID:** backlog-2026-03-10-004
**Beads ID:** coreai-7mm
**Status:** not started
**Created:** 10/03/2026 (GMT)
**Priority:** medium
**Effort:** medium
**Description:** Validation pipeline plugin — runs format → lint → typecheck → test on entering review state. Implements Layer 7.
**Related Docs:** [Guardrails spec](../specs/archive/layer7_guardrails_quality_gates.md)

---

### Epic 8 — agent-stack-standard

**Planning ID:** backlog-2026-03-10-005
**Beads ID:** coreai-zsh
**Status:** not started
**Created:** 10/03/2026 (GMT)
**Priority:** low
**Effort:** small
**Description:** Bundle package that installs all common plugins in one dependency — simplifies consumer setup.
**Related Docs:** [Ecosystem structure](../specs/archive/ECOSYSTEM_REPO_STRUCTURE.md)

---

### Epic 9 — skillshare

**Planning ID:** backlog-2026-03-10-006
**Beads ID:** coreai-yfl
**Status:** not started
**Created:** 10/03/2026 (GMT)
**Priority:** low
**Effort:** small
**Description:** Standalone `skillshare` package and CLI for syncing reusable skills/instructions from manifests across repositories.
