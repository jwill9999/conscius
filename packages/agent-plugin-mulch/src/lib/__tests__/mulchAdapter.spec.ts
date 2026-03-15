import { execFile } from 'node:child_process';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { homedir, tmpdir } from 'node:os';
import { join } from 'node:path';
import { queryMulch } from '../mulchAdapter.js';

jest.mock('node:child_process');
jest.mock('node:os', () => ({
  ...jest.requireActual('node:os'),
  homedir: jest.fn(),
}));

const mockExecFile = execFile as jest.MockedFunction<typeof execFile>;
const mockHomedir = homedir as jest.MockedFunction<typeof homedir>;

function mockExecFileSuccess(stdout: string) {
  mockExecFile.mockImplementation(
    (_cmd: unknown, _args: unknown, _opts: unknown, callback: unknown) => {
      (callback as (err: null, stdout: string, stderr: string) => void)(
        null,
        stdout,
        '',
      );
      return {} as ReturnType<typeof execFile>;
    },
  );
}

function mockExecFileError(error: NodeJS.ErrnoException) {
  mockExecFile.mockImplementation(
    (_cmd: unknown, _args: unknown, _opts: unknown, callback: unknown) => {
      (callback as (err: Error, stdout: string, stderr: string) => void)(
        error,
        '',
        '',
      );
      return {} as ReturnType<typeof execFile>;
    },
  );
}

describe('queryMulch', () => {
  let tempRoot: string;
  let tempHome: string;

  beforeEach(async () => {
    jest.clearAllMocks();
    tempRoot = await mkdtemp(join(tmpdir(), 'mulch-root-'));
    tempHome = await mkdtemp(join(tmpdir(), 'mulch-home-'));
    mockHomedir.mockReturnValue(tempHome);
  });

  afterEach(async () => {
    await Promise.all([
      rm(tempRoot, { recursive: true, force: true }),
      rm(tempHome, { recursive: true, force: true }),
    ]);
  });

  it('parses JSONL output from mulch search', async () => {
    mockExecFileSuccess(
      [
        JSON.stringify({
          id: 'lesson-1',
          topic: 'docker',
          summary: 'Docker cannot access localhost',
          recommendation: 'Use service names',
          created: '2026-03-07',
          tags: ['containers'],
        }),
        JSON.stringify({
          id: 'lesson-2',
          topic: 'docker networking',
          summary: 'Bridge networking needs aliases',
          recommendation: 'Add service aliases',
          created: '2026-03-08',
        }),
      ].join('\n'),
    );

    const lessons = await queryMulch('docker', tempRoot);

    expect(lessons).toEqual([
      {
        id: 'lesson-1',
        topic: 'docker',
        summary: 'Docker cannot access localhost',
        recommendation: 'Use service names',
        created: '2026-03-07',
        tags: ['containers'],
      },
      {
        id: 'lesson-2',
        topic: 'docker networking',
        summary: 'Bridge networking needs aliases',
        recommendation: 'Add service aliases',
        created: '2026-03-08',
      },
    ]);
  });

  it('calls mulch search with the expected arguments', async () => {
    mockExecFileSuccess(
      JSON.stringify({
        id: 'lesson-1',
        topic: 'jest',
        summary: 'Manual wrappers work better',
        recommendation: 'Avoid promisify',
        created: '2026-03-07',
      }),
    );

    await queryMulch('jest', tempRoot);

    expect(mockExecFile).toHaveBeenCalledWith(
      'mulch',
      ['search', 'jest'],
      { cwd: tempRoot },
      expect.any(Function),
    );
  });

  it('returns an empty array for empty CLI output', async () => {
    mockExecFileSuccess('');

    await expect(queryMulch('typescript', tempRoot)).resolves.toEqual([]);
  });

  it('falls back to project and global JSONL files when mulch is unavailable', async () => {
    const error = new Error('spawn mulch ENOENT') as NodeJS.ErrnoException;
    error.code = 'ENOENT';
    mockExecFileError(error);

    await mkdir(join(tempRoot, '.mulch'), { recursive: true });
    await mkdir(join(tempHome, '.mulch'), { recursive: true });

    await writeFile(
      join(tempRoot, '.mulch', 'mulch.jsonl'),
      [
        JSON.stringify({
          id: 'project-1',
          topic: 'typescript',
          summary: 'tsconfig.spec.json needs customConditions null',
          recommendation: 'Set customConditions to null in Jest config',
          created: '2026-03-09',
        }),
        JSON.stringify({
          id: 'shared-1',
          topic: 'typescript',
          summary: 'Project-specific lesson should win ordering',
          recommendation: 'Read project mulch before global mulch',
          created: '2026-03-10',
        }),
      ].join('\n'),
    );

    await writeFile(
      join(tempHome, '.mulch', 'mulch.jsonl'),
      [
        JSON.stringify({
          id: 'shared-1',
          topic: 'typescript',
          summary: 'Duplicate global lesson',
          recommendation: 'Should be deduplicated by id',
          created: '2026-03-11',
        }),
        JSON.stringify({
          id: 'global-1',
          topic: 'jest',
          summary: 'TypeScript tooling can fail under Jest mocks',
          recommendation: 'Use manual wrappers around execFile',
          created: '2026-03-12',
        }),
      ].join('\n'),
    );

    const lessons = await queryMulch('typescript', tempRoot);

    expect(lessons).toEqual([
      {
        id: 'project-1',
        topic: 'typescript',
        summary: 'tsconfig.spec.json needs customConditions null',
        recommendation: 'Set customConditions to null in Jest config',
        created: '2026-03-09',
      },
      {
        id: 'shared-1',
        topic: 'typescript',
        summary: 'Project-specific lesson should win ordering',
        recommendation: 'Read project mulch before global mulch',
        created: '2026-03-10',
      },
      {
        id: 'global-1',
        topic: 'jest',
        summary: 'TypeScript tooling can fail under Jest mocks',
        recommendation: 'Use manual wrappers around execFile',
        created: '2026-03-12',
      },
    ]);
  });

  it('matches fallback lessons by topic or summary case-insensitively', async () => {
    const error = new Error('mulch: not found') as NodeJS.ErrnoException;
    error.code = 'ENOENT';
    mockExecFileError(error);

    await mkdir(join(tempHome, '.mulch'), { recursive: true });
    await writeFile(
      join(tempHome, '.mulch', 'mulch.jsonl'),
      [
        JSON.stringify({
          id: 'global-1',
          topic: 'Jest mocking',
          summary: 'Manual wrappers preserve behavior',
          recommendation: 'Use execFile wrappers',
          created: '2026-03-12',
        }),
        JSON.stringify({
          id: 'global-2',
          topic: 'node',
          summary: 'JEST transforms can affect util.promisify',
          recommendation: 'Avoid promisify in tests',
          created: '2026-03-13',
        }),
      ].join('\n'),
    );

    const lessons = await queryMulch('jest', tempRoot);

    expect(lessons.map((lesson) => lesson.id)).toEqual([
      'global-1',
      'global-2',
    ]);
  });

  it('throws when mulch returns malformed JSONL', async () => {
    mockExecFileSuccess(
      '{"id":"ok","topic":"docker","summary":"x","recommendation":"y","created":"2026-03-07"}\nnot-json',
    );

    await expect(queryMulch('docker', tempRoot)).rejects.toThrow();
  });

  it('throws when mulch returns an invalid lesson shape', async () => {
    mockExecFileSuccess(
      JSON.stringify({
        id: 'bad',
        topic: 'docker',
        summary: 'Missing recommendation',
        created: '2026-03-07',
      }),
    );

    await expect(queryMulch('docker', tempRoot)).rejects.toThrow(
      /invalid lesson/,
    );
  });

  it('propagates CLI execution errors when mulch exists but fails', async () => {
    mockExecFileError(new Error('mulch search failed'));

    await expect(queryMulch('docker', tempRoot)).rejects.toThrow(
      'mulch search failed',
    );
  });

  it('rejects an empty topic', async () => {
    await expect(queryMulch('   ', tempRoot)).rejects.toThrow(
      'queryMulch: topic must not be empty',
    );
  });
});
