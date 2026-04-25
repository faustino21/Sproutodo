import { app } from 'electron';
import { promises as fs } from 'node:fs';
import path from 'node:path';

export type Todo = {
  id: string;
  text: string;
  done: boolean;
  createdAt: string;
  completedAt?: string;
};

export type Settings = {
  notionToken?: string;
  notionPageId?: string;
};

const todosPath = () => path.join(app.getPath('userData'), 'todos.json');
const settingsPath = () => path.join(app.getPath('userData'), 'settings.json');

async function readJson<T>(file: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(file, 'utf8');
    return JSON.parse(raw) as T;
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return fallback;
    throw err;
  }
}

async function writeJsonAtomic(file: string, data: unknown): Promise<void> {
  await fs.mkdir(path.dirname(file), { recursive: true });
  const tmp = `${file}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(data, null, 2), 'utf8');
  await fs.rename(tmp, file);
}

export const readTodos = () => readJson<Todo[]>(todosPath(), []);
export const writeTodos = (todos: Todo[]) => writeJsonAtomic(todosPath(), todos);

export const readSettings = () => readJson<Settings>(settingsPath(), {});
export const writeSettings = (s: Settings) => writeJsonAtomic(settingsPath(), s);
