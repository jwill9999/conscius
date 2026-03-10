import { readFile } from 'node:fs/promises';
import { resolve, sep } from 'node:path';

/**
 * Reads the content of a spec file referenced by a Beads task.
 *
 * @param specPath  - Relative or absolute path to the spec file.
 * @param repoRoot  - Absolute repository root; used to resolve relative paths.
 * @returns The file content as a UTF-8 string, or `null` if the file cannot be read.
 */
export async function loadSpecContent(
  specPath: string,
  repoRoot: string,
): Promise<string | null> {
  const absolutePath = resolve(repoRoot, specPath);
  const safeRoot = repoRoot.endsWith(sep) ? repoRoot : repoRoot + sep;

  // Ensure the resolved path stays within the repo root to prevent path traversal.
  if (!absolutePath.startsWith(safeRoot) && absolutePath !== repoRoot) {
    throw new Error(
      `loadSpecContent: specPath '${specPath}' resolves outside the repository root`,
    );
  }

  try {
    return await readFile(absolutePath, 'utf8');
  } catch {
    return null;
  }
}
