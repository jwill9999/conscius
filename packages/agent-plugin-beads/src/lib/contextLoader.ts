import { readFile, realpath } from 'node:fs/promises';
import { isAbsolute, relative, resolve } from 'node:path';

/** Maximum spec file size injected into the prompt (50 KB). */
const MAX_SPEC_BYTES = 50 * 1024;

function isOutsideRoot(filePath: string, rootPath: string): boolean {
  const rel = relative(rootPath, filePath);
  return rel.startsWith('..') || isAbsolute(rel);
}

/**
 * Reads the content of a spec file referenced by a Beads task.
 *
 * @param specPath  - Relative or absolute path to the spec file.
 * @param repoRoot  - Absolute repository root; used to resolve relative paths.
 * @returns The file content as a UTF-8 string (capped at 50 KB), or `null` if
 *          the file cannot be read.
 */
export async function loadSpecContent(
  specPath: string,
  repoRoot: string,
): Promise<string | null> {
  const absolutePath = resolve(repoRoot, specPath);

  // Prevent path traversal: relative path must not escape the repo root.
  if (isOutsideRoot(absolutePath, repoRoot)) {
    throw new Error(
      `loadSpecContent: specPath '${specPath}' resolves outside the repository root`,
    );
  }

  try {
    // Resolve symlinks to prevent symlink-based escape attacks.
    const [realAbs, realRoot] = await Promise.all([
      realpath(absolutePath),
      realpath(repoRoot),
    ]);

    if (isOutsideRoot(realAbs, realRoot)) {
      throw new Error(
        `loadSpecContent: specPath '${specPath}' resolves outside the repository root via symlink`,
      );
    }

    const buffer = await readFile(realAbs);
    if (buffer.length > MAX_SPEC_BYTES) {
      return (
        buffer.subarray(0, MAX_SPEC_BYTES).toString('utf8') +
        '\n\n[...truncated at 50 KB]'
      );
    }
    return buffer.toString('utf8');
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      return null;
    }
    throw err;
  }
}
