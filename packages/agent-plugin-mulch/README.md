# @conscius/agent-plugin-mulch

Wraps the `mulch` CLI to surface relevant experience lessons from Mulch into an
agent session.

[![CI](https://github.com/jwill9999/conscius/actions/workflows/ci.yml/badge.svg)](https://github.com/jwill9999/conscius/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/@conscius/agent-plugin-mulch)](https://www.npmjs.com/package/@conscius/agent-plugin-mulch)

## What it does

The initial adapter exports `queryMulch(topic, repoRoot)`, which:

1. Tries `mulch search <topic>` from the repository root.
2. Parses JSONL, JSON object, or JSON array output into `MulchLesson[]`.
3. Falls back to reading project and global `.mulch/mulch.jsonl` files if the
   CLI is unavailable.

## Usage

```ts
import { queryMulch } from '@conscius/agent-plugin-mulch';

const lessons = await queryMulch('typescript', process.cwd());
```

## Requirements

- `mulch` CLI should be installed and on `$PATH` to use CLI-backed lookups.
- Fallback file lookup reads:
  - `{repoRoot}/.mulch/mulch.jsonl`
  - `~/.mulch/mulch.jsonl`
