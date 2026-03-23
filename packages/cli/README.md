# @conscius/cli

Thin CLI for the **`conscius`** binary (`package.json` `bin`). Depends only on `@conscius/runtime`.

**Commands:** `conscius run --input "<text>"` prints the assembled prompt for one user turn (full config + plugins + hooks). Existing `start`, `end`, and `task start` commands remain thin wrappers over the runtime.

See [docs/api/cli.md](../../docs/api/cli.md).
