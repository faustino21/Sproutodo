import { app, BrowserWindow, ipcMain, shell } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import electronUpdater, { type UpdateInfo, type ProgressInfo } from 'electron-updater';
import {
  readTodos,
  writeTodos,
  reorderTodos,
  readSettings,
  writeSettings,
  type Todo,
} from './storage.js';
import { sendNotionReport, type ReportRange } from './notion.js';

const { autoUpdater } = electronUpdater;

export type UpdaterStatus =
  | { kind: 'idle' }
  | { kind: 'unsupported-dev' }
  | { kind: 'checking' }
  | { kind: 'not-available' }
  | { kind: 'available'; version: string }
  | { kind: 'downloading'; percent: number }
  | { kind: 'downloaded'; version: string }
  | { kind: 'error'; message: string };

const __dirname = path.dirname(fileURLToPath(import.meta.url));

process.env.APP_ROOT = path.join(__dirname, '..');
const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL;
const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist');

let win: BrowserWindow | null = null;
let updaterStatus: UpdaterStatus = { kind: 'idle' };
let updaterInitialized = false;

function setUpdaterStatus(next: UpdaterStatus) {
  if (
    updaterStatus.kind === 'downloading' &&
    next.kind === 'downloading' &&
    updaterStatus.percent === next.percent
  ) {
    return;
  }
  updaterStatus = next;
  win?.webContents.send('updater:status', next);
}

function initUpdater() {
  if (updaterInitialized) return;
  updaterInitialized = true;
  if (VITE_DEV_SERVER_URL) {
    setUpdaterStatus({ kind: 'unsupported-dev' });
    return;
  }
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;
  autoUpdater.on('checking-for-update', () => setUpdaterStatus({ kind: 'checking' }));
  autoUpdater.on('update-available', (info: UpdateInfo) =>
    setUpdaterStatus({ kind: 'available', version: info.version }),
  );
  autoUpdater.on('update-not-available', () => setUpdaterStatus({ kind: 'not-available' }));
  autoUpdater.on('download-progress', (p: ProgressInfo) =>
    setUpdaterStatus({ kind: 'downloading', percent: Math.round(p.percent) }),
  );
  autoUpdater.on('update-downloaded', (info: UpdateInfo) =>
    setUpdaterStatus({ kind: 'downloaded', version: info.version }),
  );
  autoUpdater.on('error', (err: Error) =>
    setUpdaterStatus({ kind: 'error', message: err?.message ?? 'Unknown updater error' }),
  );
  autoUpdater.checkForUpdates().catch(() => {
    /* error event already fires */
  });
}

function createWindow() {
  win = new BrowserWindow({
    width: 1000,
    height: 700,
    minWidth: 520,
    minHeight: 480,
    backgroundColor: '#FAFBF7',
    titleBarStyle: 'hiddenInset',
    title: 'Sproutodo',
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(RENDERER_DIST, 'index.html'));
  }
}

app.whenReady().then(() => {
  registerIpc();
  createWindow();
  initUpdater();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

function registerIpc() {
  ipcMain.handle('todos:list', async () => readTodos());

  ipcMain.handle('todos:add', async (_evt, text: string) => {
    const todos = await readTodos();
    const todo: Todo = {
      id: randomUUID(),
      text: text.trim(),
      done: false,
      createdAt: new Date().toISOString(),
    };
    todos.unshift(todo);
    await writeTodos(todos);
    return todo;
  });

  ipcMain.handle('todos:toggle', async (_evt, id: string) => {
    const todos = await readTodos();
    const idx = todos.findIndex((t) => t.id === id);
    if (idx === -1) throw new Error(`Todo ${id} not found`);
    const t = todos[idx];
    t.done = !t.done;
    t.completedAt = t.done ? new Date().toISOString() : undefined;
    await writeTodos(todos);
    return t;
  });

  ipcMain.handle('todos:remove', async (_evt, id: string) => {
    const todos = await readTodos();
    const next = todos.filter((t) => t.id !== id);
    await writeTodos(next);
  });

  ipcMain.handle('todos:reorder', async (_evt, ids: unknown) => {
    if (!Array.isArray(ids) || !ids.every((x) => typeof x === 'string')) {
      throw new Error('todos:reorder expects string[]');
    }
    return reorderTodos(ids);
  });

  ipcMain.handle('todos:update', async (_evt, id: string, text: string) => {
    const trimmed = text.trim();
    if (!trimmed) throw new Error('Todo text cannot be empty');
    const todos = await readTodos();
    const idx = todos.findIndex((t) => t.id === id);
    if (idx === -1) throw new Error(`Todo ${id} not found`);
    todos[idx].text = trimmed;
    await writeTodos(todos);
    return todos[idx];
  });

  ipcMain.handle('settings:get', async () => readSettings());
  ipcMain.handle('settings:save', async (_evt, s) => writeSettings(s));

  ipcMain.handle('notion:sendReport', async (_evt, range: ReportRange, clearCompleted?: unknown) => {
    const settings = await readSettings();
    if (!settings.notionToken || !settings.notionPageId) {
      throw new Error('Notion settings missing. Add token and page ID first.');
    }
    const todos = await readTodos();
    const result = await sendNotionReport({
      token: settings.notionToken,
      pageId: settings.notionPageId,
      todos,
      range,
    });

    let removedIds: string[] = [];
    if (clearCompleted === true) {
      const fresh = await readTodos();
      removedIds = fresh.filter((t) => t.done).map((t) => t.id);
      if (removedIds.length > 0) {
        await writeTodos(fresh.filter((t) => !t.done));
      }
    }

    return { url: result.url, removedIds };
  });

  ipcMain.handle('shell:openExternal', async (_evt, url: string) => {
    await shell.openExternal(url);
  });

  ipcMain.handle('updater:check', async () => {
    if (VITE_DEV_SERVER_URL) return updaterStatus;
    try {
      await autoUpdater.checkForUpdates();
    } catch {
      /* error event already fires */
    }
    return updaterStatus;
  });

  ipcMain.handle('updater:quitAndInstall', async () => {
    if (updaterStatus.kind !== 'downloaded') return false;
    autoUpdater.quitAndInstall();
    return true;
  });

  ipcMain.handle('updater:getState', async () => ({
    status: updaterStatus,
    appVersion: app.getVersion(),
  }));
}
