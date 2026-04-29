import { app } from 'electron';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

export type Todo = {
  id: string;
  text: string;
  done: boolean;
  createdAt: string;
  completedAt?: string;
  workspaceId: string;
};

export type Settings = {
  notionToken?: string;
  notionPageId?: string;
  activeWorkspaceId?: string;
};

export type Workspace = {
  id: string;
  name: string;
  createdAt: string;
};

const todosPath = () => path.join(app.getPath('userData'), 'todos.json');
const settingsPath = () => path.join(app.getPath('userData'), 'settings.json');
const workspacesPath = () => path.join(app.getPath('userData'), 'workspaces.json');

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

export const readWorkspaces = () => readJson<Workspace[]>(workspacesPath(), []);
export const writeWorkspaces = (ws: Workspace[]) => writeJsonAtomic(workspacesPath(), ws);

export const readSettings = () => readJson<Settings>(settingsPath(), {});
export const writeSettings = (s: Settings) => writeJsonAtomic(settingsPath(), s);

export async function ensureWorkspaces(): Promise<Workspace[]> {
  let workspaces = await readWorkspaces();

  if (workspaces.length === 0) {
    workspaces = [
      {
        id: randomUUID(),
        name: 'Default',
        createdAt: new Date().toISOString(),
      },
    ];
    await writeWorkspaces(workspaces);
  }

  const defaultId = workspaces[0].id;
  const validIds = new Set(workspaces.map((w) => w.id));

  const todos = await readTodos();
  let todosChanged = false;
  for (const t of todos) {
    if (!t.workspaceId || !validIds.has(t.workspaceId)) {
      t.workspaceId = defaultId;
      todosChanged = true;
    }
  }
  if (todosChanged) await writeTodos(todos);

  const settings = await readSettings();
  if (!settings.activeWorkspaceId || !validIds.has(settings.activeWorkspaceId)) {
    settings.activeWorkspaceId = defaultId;
    await writeSettings(settings);
  }

  return workspaces;
}

export async function moveTodo(id: string, workspaceId: string): Promise<Todo> {
  const [workspaces, todos] = await Promise.all([readWorkspaces(), readTodos()]);
  if (!workspaces.some((w) => w.id === workspaceId)) {
    throw new Error(`Workspace ${workspaceId} not found`);
  }
  const idx = todos.findIndex((t) => t.id === id);
  if (idx === -1) throw new Error(`Todo ${id} not found`);
  if (todos[idx].workspaceId === workspaceId) return todos[idx];
  todos[idx].workspaceId = workspaceId;
  await writeTodos(todos);
  return todos[idx];
}

export async function reorderTodos(workspaceId: string, ids: string[]): Promise<Todo[]> {
  const current = await readTodos();
  const byId = new Map(current.map((t) => [t.id, t]));

  const ordered: Todo[] = [];
  const placed = new Set<string>();
  for (const id of ids) {
    const t = byId.get(id);
    if (t && t.workspaceId === workspaceId && !placed.has(id)) {
      ordered.push(t);
      placed.add(id);
    }
  }
  for (const t of current) {
    if (t.workspaceId === workspaceId && !placed.has(t.id)) {
      ordered.push(t);
      placed.add(t.id);
    }
  }

  const queue = [...ordered];
  const result: Todo[] = current.map((t) =>
    t.workspaceId === workspaceId ? (queue.shift() as Todo) : t,
  );
  await writeTodos(result);
  return ordered;
}
