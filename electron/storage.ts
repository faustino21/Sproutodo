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

export async function reorderTodos(ids: string[]): Promise<Todo[]> {
  const current = await readTodos();
  const byId = new Map(current.map((t) => [t.id, t]));
  const ordered: Todo[] = [];
  for (const id of ids) {
    const t = byId.get(id);
    if (t) {
      ordered.push(t);
      byId.delete(id);
    }
  }
  for (const t of current) if (byId.has(t.id)) ordered.push(t);
  await writeTodos(ordered);
  return ordered;
}

export const readSettings = () => readJson<Settings>(settingsPath(), {});
export const writeSettings = (s: Settings) => writeJsonAtomic(settingsPath(), s);
