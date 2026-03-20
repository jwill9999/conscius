import { access } from 'node:fs/promises';
import { join } from 'node:path';
import type { AgentContext, AgentPlugin } from '@conscius/agent-types';
import {
  assertMlRunnable,
  queryMulch,
  resolveMlExecutable,
  runMlInit,
} from './mulchAdapter.js';

/**
 * Three-step setup guard:
 * 1. Is `ml` on PATH?
 * 2. Can `ml` execute (is Bun present)?
 * 3. Is `.mulch/` initialised? If not, run `ml init`.
 */
export async function ensureMlReady(repoRoot: string): Promise<void> {
  const mlPath = await resolveMlExecutable();
  await assertMlRunnable(mlPath);

  const mulchDir = join(repoRoot, '.mulch');

  try {
    await access(mulchDir);
  } catch {
    await runMlInit(mlPath, repoRoot);
  }
}

/**
 * `agent-plugin-mulch` — injects experience lessons from `ml prime`
 * into the agent prompt when a session starts.
 */
export const mulchPlugin: AgentPlugin = {
  name: 'agent-plugin-mulch',

  async onSessionStart(context: AgentContext): Promise<void> {
    await ensureMlReady(context.repoRoot);

    const output = await queryMulch(context.repoRoot);

    if (!output) {
      return;
    }

    context.promptSegments.push(output);
  },
};

export default mulchPlugin;
