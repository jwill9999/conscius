# .mulch/

This directory is managed by [mulch](https://github.com/jayminwest/mulch) — a structured expertise layer for coding agents.

## Key Commands

- `mulch init` — Initialize a .mulch directory
- `mulch add` — Add a new domain
- `mulch record` — Record an expertise record
- **`make mulch-record`** (repo root) — Interactive prompts for record type and required fields, then runs `ml`/`mulch record` with safe quoting. If `.mulch/mulch.config.yaml` lists exactly one domain, it is used automatically; otherwise you pick from the list. Optional tags, related files, and evidence bead ID. Offers a dry-run before writing. Requires `ml` or `mulch` on your `PATH` (e.g. `@os-eco/mulch-cli`). Cancel anytime with **q** or **Ctrl+C** (exits non-zero).
- `mulch edit` — Edit an existing record
- `mulch query` — Query expertise records
- `mulch prime [domain]` — Output a priming prompt (optionally scoped to one domain)
- `mulch search` — Search records across domains
- `mulch status` — Show domain statistics
- `mulch validate` — Validate all records against the schema
- `mulch prune` — Remove expired records

## Structure

- `mulch.config.yaml` — Configuration file
- `expertise/` — JSONL files, one per domain

## Interactive recording from the repo

From the repository root:

```bash
make mulch-record
```

The script lives at `scripts/mulch-record-interactive.sh`. Field requirements match `mulch record --help` (e.g. **failure** needs description + resolution; **decision** needs title + rationale).
