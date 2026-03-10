import { execFile } from 'node:child_process';
import { fetchBeadsTask } from '../beadsAdapter.js';

jest.mock('node:child_process');

const mockExecFile = execFile as jest.MockedFunction<typeof execFile>;

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

function mockExecFileError(message: string) {
  mockExecFile.mockImplementation(
    (_cmd: unknown, _args: unknown, _opts: unknown, callback: unknown) => {
      (callback as (err: Error, stdout: string, stderr: string) => void)(
        new Error(message),
        '',
        '',
      );
      return {} as ReturnType<typeof execFile>;
    },
  );
}

describe('fetchBeadsTask', () => {
  const repoRoot = '/repo';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('parses a single-object JSON response from bd show', async () => {
    mockExecFileSuccess(
      JSON.stringify({
        id: 'abc-123',
        title: 'Add login feature',
        status: 'in_progress',
        description: 'Implement JWT auth',
        external_ref: 'docs/specs/login.md',
        deps: [{ id: 'abc-100' }, { id: 'abc-101' }],
        assignee: 'alice',
      }),
    );

    const task = await fetchBeadsTask('abc-123', repoRoot);

    expect(task).toEqual({
      id: 'abc-123',
      title: 'Add login feature',
      status: 'in_progress',
      description: 'Implement JWT auth',
      specPath: 'docs/specs/login.md',
      dependencies: ['abc-100', 'abc-101'],
      assignee: 'alice',
    });
  });

  it('parses an array JSON response from bd show', async () => {
    mockExecFileSuccess(
      JSON.stringify([
        {
          id: 'abc-456',
          title: 'Fix bug',
          status: 'todo',
        },
      ]),
    );

    const task = await fetchBeadsTask('abc-456', repoRoot);

    expect(task.id).toBe('abc-456');
    expect(task.title).toBe('Fix bug');
    expect(task.status).toBe('todo');
  });

  it('normalises unknown status to "todo"', async () => {
    mockExecFileSuccess(
      JSON.stringify({ id: 'xyz', title: 'T', status: 'unknown-state' }),
    );

    const task = await fetchBeadsTask('xyz', repoRoot);
    expect(task.status).toBe('todo');
  });

  it('normalises space-separated status strings', async () => {
    mockExecFileSuccess(
      JSON.stringify({ id: 'xyz', title: 'T', status: 'in progress' }),
    );

    const task = await fetchBeadsTask('xyz', repoRoot);
    expect(task.status).toBe('in_progress');
  });

  it('maps all valid BeadsTaskStatus values correctly', async () => {
    const statuses = [
      'todo',
      'in_progress',
      'review',
      'blocked',
      'done',
    ] as const;

    for (const status of statuses) {
      mockExecFileSuccess(JSON.stringify({ id: 'x', title: 'T', status }));
      const task = await fetchBeadsTask('x', repoRoot);
      expect(task.status).toBe(status);
    }
  });

  it('handles missing optional fields gracefully', async () => {
    mockExecFileSuccess(
      JSON.stringify({ id: 'min', title: 'Minimal', status: 'done' }),
    );

    const task = await fetchBeadsTask('min', repoRoot);

    expect(task.id).toBe('min');
    expect(task.description).toBeUndefined();
    expect(task.specPath).toBeUndefined();
    expect(task.dependencies).toBeUndefined();
    expect(task.assignee).toBeUndefined();
  });

  it('calls bd with the correct arguments', async () => {
    mockExecFileSuccess(
      JSON.stringify({ id: 'abc', title: 'T', status: 'todo' }),
    );

    await fetchBeadsTask('my-task-id', repoRoot);

    expect(mockExecFile).toHaveBeenCalledWith(
      'bd',
      ['show', '--json', 'my-task-id'],
      { cwd: repoRoot },
      expect.any(Function),
    );
  });

  it('throws when bd returns invalid JSON', async () => {
    mockExecFileSuccess('not-json');

    await expect(fetchBeadsTask('bad', repoRoot)).rejects.toThrow();
  });

  it('throws when bd returns an object without an id field', async () => {
    mockExecFileSuccess(JSON.stringify({ title: 'No id' }));

    await expect(fetchBeadsTask('no-id', repoRoot)).rejects.toThrow(
      /unexpected response/,
    );
  });

  it('throws when bd returns an object missing title', async () => {
    mockExecFileSuccess(JSON.stringify({ id: 'x', status: 'todo' }));

    await expect(fetchBeadsTask('x', repoRoot)).rejects.toThrow(
      /unexpected response/,
    );
  });

  it('throws when bd returns an object missing status', async () => {
    mockExecFileSuccess(JSON.stringify({ id: 'x', title: 'T' }));

    await expect(fetchBeadsTask('x', repoRoot)).rejects.toThrow(
      /unexpected response/,
    );
  });

  it('propagates errors from bd CLI execution', async () => {
    mockExecFileError('bd: command not found');

    await expect(fetchBeadsTask('fail', repoRoot)).rejects.toThrow(
      'bd: command not found',
    );
  });
});
