import { execFile } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';
import type { MulchLesson } from '@conscius/agent-types';

function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) && value.every((entry) => typeof entry === 'string')
  );
}

function isMulchLesson(value: unknown): value is MulchLesson {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const lesson = value as Record<string, unknown>;

  return (
    typeof lesson['id'] === 'string' &&
    typeof lesson['topic'] === 'string' &&
    typeof lesson['summary'] === 'string' &&
    typeof lesson['recommendation'] === 'string' &&
    typeof lesson['created'] === 'string' &&
    (lesson['task_id'] === undefined ||
      typeof lesson['task_id'] === 'string') &&
    (lesson['files'] === undefined || isStringArray(lesson['files'])) &&
    (lesson['tags'] === undefined || isStringArray(lesson['tags'])) &&
    (lesson['service'] === undefined || typeof lesson['service'] === 'string')
  );
}

function parseLesson(value: unknown, source: string): MulchLesson {
  if (!isMulchLesson(value)) {
    throw new Error(`queryMulch: invalid lesson in ${source}`);
  }

  return value;
}

function parseMulchOutput(output: string, source: string): MulchLesson[] {
  const trimmed = output.trim();

  if (!trimmed) {
    return [];
  }

  const nonEmptyLines = trimmed
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0);

  if (nonEmptyLines.length > 1) {
    return nonEmptyLines.map((line, index) =>
      parseLesson(JSON.parse(line), `${source} line ${index + 1}`),
    );
  }

  if (trimmed.startsWith('[')) {
    const parsed: unknown = JSON.parse(trimmed);

    if (!Array.isArray(parsed)) {
      throw new Error(`queryMulch: expected JSON array in ${source}`);
    }

    return parsed.map((entry, index) =>
      parseLesson(entry, `${source} entry ${index + 1}`),
    );
  }

  if (trimmed.startsWith('{')) {
    return [parseLesson(JSON.parse(trimmed), source)];
  }

  return nonEmptyLines.map((line, index) =>
    parseLesson(JSON.parse(line), `${source} line ${index + 1}`),
  );
}

function matchesTopic(lesson: MulchLesson, topic: string): boolean {
  const query = topic.toLowerCase();
  return (
    lesson.topic.toLowerCase().includes(query) ||
    lesson.summary.toLowerCase().includes(query)
  );
}

function runMulchSearch(topic: string, repoRoot: string): Promise<string> {
  return new Promise((resolve, reject) => {
    execFile('mulch', ['search', topic], { cwd: repoRoot }, (err, stdout) => {
      if (err) {
        reject(err);
      } else {
        resolve(String(stdout));
      }
    });
  });
}

function isCommandNotFound(err: unknown): boolean {
  if (!err || typeof err !== 'object') {
    return false;
  }

  const execError = err as NodeJS.ErrnoException;

  return (
    execError.code === 'ENOENT' ||
    execError.message.includes('not found') ||
    execError.message.includes('spawn mulch')
  );
}

async function readMulchFile(
  filePath: string,
  topic: string,
): Promise<MulchLesson[]> {
  try {
    const content = await readFile(filePath, 'utf8');
    return parseMulchOutput(content, filePath).filter((lesson) =>
      matchesTopic(lesson, topic),
    );
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }

    throw err;
  }
}

export async function queryMulch(
  topic: string,
  repoRoot: string,
): Promise<MulchLesson[]> {
  const trimmedTopic = topic.trim();

  if (!trimmedTopic) {
    throw new Error('queryMulch: topic must not be empty');
  }

  try {
    const stdout = await runMulchSearch(trimmedTopic, repoRoot);
    return parseMulchOutput(stdout, `mulch search ${trimmedTopic}`);
  } catch (err) {
    if (!isCommandNotFound(err)) {
      throw err;
    }
  }

  const [projectLessons, globalLessons] = await Promise.all([
    readMulchFile(join(repoRoot, '.mulch', 'mulch.jsonl'), trimmedTopic),
    readMulchFile(join(homedir(), '.mulch', 'mulch.jsonl'), trimmedTopic),
  ]);

  const seenLessonIds = new Set<string>();

  return [...projectLessons, ...globalLessons].filter((lesson) => {
    if (seenLessonIds.has(lesson.id)) {
      return false;
    }

    seenLessonIds.add(lesson.id);
    return true;
  });
}
