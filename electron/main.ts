import { app, BrowserWindow, ipcMain, shell } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import {
  readTodos,
  writeTodos,
  readSettings,
  writeSettings,
  type Todo,
} from './storage.js';
import { sendNotionReport, type ReportRange } from './notion.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

process.env.APP_ROOT = path.join(__dirname, '..');
const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL;
const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist');

let win: BrowserWindow | null = null;

function createWindow() {
  win = new BrowserWindow({
    width: 1000,
    height: 700,
    minWidth: 520,
    minHeight: 480,
    backgroundColor: '#FAFBF7',
    titleBarStyle: 'hiddenInset',
    title: 'simple todo',
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

  ipcMain.handle('settings:get', async () => readSettings());
  ipcMain.handle('settings:save', async (_evt, s) => writeSettings(s));

  ipcMain.handle('notion:sendReport', async (_evt, range: ReportRange) => {
    const settings = await readSettings();
    if (!settings.notionToken || !settings.notionPageId) {
      throw new Error('Notion settings missing. Add token and page ID first.');
    }
    const todos = await readTodos();
    return sendNotionReport({
      token: settings.notionToken,
      pageId: settings.notionPageId,
      todos,
      range,
    });
  });

  ipcMain.handle('shell:openExternal', async (_evt, url: string) => {
    await shell.openExternal(url);
  });
}
