import { readFile, realpath } from 'node:fs/promises';
import { loadSpecContent } from '../contextLoader.js';

jest.mock('node:fs/promises');

const mockReadFile = readFile as jest.MockedFunction<typeof readFile>;
const mockRealpath = realpath as jest.MockedFunction<typeof realpath>;

describe('loadSpecContent', () => {
  const repoRoot = '/repo';

  beforeEach(() => {
    jest.clearAllMocks();
    // Default: realpath returns the path unchanged (no symlinks present).
    mockRealpath.mockImplementation(async (p) => String(p));
  });

  it('returns file content for a valid relative specPath', async () => {
    const content = '# Spec\n\nSome content.';
    mockReadFile.mockResolvedValue(Buffer.from(content) as unknown as Buffer);

    const result = await loadSpecContent('docs/specs/task.md', repoRoot);

    expect(result).toBe(content);
    expect(mockReadFile).toHaveBeenCalledWith('/repo/docs/specs/task.md');
  });

  it('returns file content for an absolute specPath inside the repo', async () => {
    const content = 'Absolute path content.';
    mockReadFile.mockResolvedValue(Buffer.from(content) as unknown as Buffer);

    const result = await loadSpecContent('/repo/docs/spec.md', repoRoot);

    expect(result).toBe(content);
  });

  it('returns null when the file does not exist (ENOENT)', async () => {
    mockReadFile.mockRejectedValue(
      Object.assign(new Error('ENOENT'), { code: 'ENOENT' }),
    );

    const result = await loadSpecContent('missing/file.md', repoRoot);

    expect(result).toBeNull();
  });

  it('returns null when realpath throws ENOENT (file does not exist)', async () => {
    mockRealpath.mockImplementation(async (p) => {
      if (String(p) !== repoRoot) {
        throw Object.assign(new Error('ENOENT'), { code: 'ENOENT' });
      }
      return repoRoot;
    });

    const result = await loadSpecContent('missing/file.md', repoRoot);

    expect(result).toBeNull();
  });

  it('throws for non-ENOENT file read errors', async () => {
    mockReadFile.mockRejectedValue(new Error('Permission denied'));

    await expect(
      loadSpecContent('protected/file.md', repoRoot),
    ).rejects.toThrow('Permission denied');
  });

  it('throws for a path that resolves outside the repo root', async () => {
    await expect(loadSpecContent('../../etc/passwd', repoRoot)).rejects.toThrow(
      /resolves outside the repository root/,
    );

    expect(mockReadFile).not.toHaveBeenCalled();
  });

  it('throws for an absolute path outside the repo root', async () => {
    await expect(loadSpecContent('/etc/passwd', repoRoot)).rejects.toThrow(
      /resolves outside the repository root/,
    );
  });

  it('throws for a path that is a sibling directory starting with the repo name', async () => {
    await expect(
      loadSpecContent('/repo-sibling/evil.md', repoRoot),
    ).rejects.toThrow(/resolves outside the repository root/);
  });

  it('throws when realpath resolves to a path outside the repo via symlink', async () => {
    mockRealpath.mockImplementation(async (p) => {
      const str = String(p);
      if (str === '/repo/symlink.md') return '/etc/secret';
      return str;
    });

    await expect(loadSpecContent('symlink.md', repoRoot)).rejects.toThrow(
      /resolves outside the repository root via symlink/,
    );
  });

  it('truncates content exceeding 50 KB', async () => {
    const bigContent = 'x'.repeat(52 * 1024);
    mockReadFile.mockResolvedValue(
      Buffer.from(bigContent) as unknown as Buffer,
    );

    const result = await loadSpecContent('big.md', repoRoot);

    expect(result).toContain('[...truncated at 50 KB]');
    expect(result!.length).toBeLessThan(bigContent.length);
  });
});
