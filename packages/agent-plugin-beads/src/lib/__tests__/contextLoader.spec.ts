import { readFile } from 'node:fs/promises';
import { loadSpecContent } from '../contextLoader.js';

jest.mock('node:fs/promises');

const mockReadFile = readFile as jest.MockedFunction<typeof readFile>;

describe('loadSpecContent', () => {
  const repoRoot = '/repo';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns file content for a valid relative specPath', async () => {
    mockReadFile.mockResolvedValue(
      '# Spec\n\nSome content.' as unknown as Buffer,
    );

    const result = await loadSpecContent('docs/specs/task.md', repoRoot);

    expect(result).toBe('# Spec\n\nSome content.');
    expect(mockReadFile).toHaveBeenCalledWith(
      '/repo/docs/specs/task.md',
      'utf8',
    );
  });

  it('returns file content for an absolute specPath inside the repo', async () => {
    mockReadFile.mockResolvedValue(
      'Absolute path content.' as unknown as Buffer,
    );

    const result = await loadSpecContent('/repo/docs/spec.md', repoRoot);

    expect(result).toBe('Absolute path content.');
  });

  it('returns null when the file does not exist', async () => {
    mockReadFile.mockRejectedValue(
      Object.assign(new Error('ENOENT'), { code: 'ENOENT' }),
    );

    const result = await loadSpecContent('missing/file.md', repoRoot);

    expect(result).toBeNull();
  });

  it('returns null for any file read error', async () => {
    mockReadFile.mockRejectedValue(new Error('Permission denied'));

    const result = await loadSpecContent('protected/file.md', repoRoot);

    expect(result).toBeNull();
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
});
