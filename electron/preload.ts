import { contextBridge, ipcRenderer } from 'electron';
import type { Todo, Settings, Workspace } from './storage.js';
import type { ReportRange } from './notion.js';
import type { UpdaterStatus } from './main.js';

const api = {
  todos: {
    list: (workspaceId: string): Promise<Todo[]> => ipcRenderer.invoke('todos:list', workspaceId),
    add: (text: string, workspaceId: string): Promise<Todo> =>
      ipcRenderer.invoke('todos:add', text, workspaceId),
    toggle: (id: string): Promise<Todo> => ipcRenderer.invoke('todos:toggle', id),
    remove: (id: string): Promise<void> => ipcRenderer.invoke('todos:remove', id),
    update: (id: string, text: string): Promise<Todo> =>
      ipcRenderer.invoke('todos:update', id, text),
    reorder: (workspaceId: string, ids: string[]): Promise<Todo[]> =>
      ipcRenderer.invoke('todos:reorder', workspaceId, ids),
    move: (id: string, workspaceId: string): Promise<Todo> =>
      ipcRenderer.invoke('todos:move', id, workspaceId),
  },
  workspaces: {
    list: (): Promise<Workspace[]> => ipcRenderer.invoke('workspaces:list'),
    create: (name: string): Promise<Workspace> => ipcRenderer.invoke('workspaces:create', name),
    rename: (id: string, name: string): Promise<Workspace> =>
      ipcRenderer.invoke('workspaces:rename', id, name),
    remove: (id: string): Promise<{ removedTodoIds: string[] }> =>
      ipcRenderer.invoke('workspaces:delete', id),
  },
  settings: {
    get: (): Promise<Settings> => ipcRenderer.invoke('settings:get'),
    save: (s: Settings): Promise<void> => ipcRenderer.invoke('settings:save', s),
  },
  notion: {
    sendReport: (
      range: ReportRange,
      clearCompleted: boolean,
      workspaceId: string,
    ): Promise<{ url: string; removedIds: string[] }> =>
      ipcRenderer.invoke('notion:sendReport', range, clearCompleted, workspaceId),
  },
  shell: {
    openExternal: (url: string): Promise<void> => ipcRenderer.invoke('shell:openExternal', url),
  },
  updater: {
    check: (): Promise<UpdaterStatus> => ipcRenderer.invoke('updater:check'),
    quitAndInstall: (): Promise<boolean> => ipcRenderer.invoke('updater:quitAndInstall'),
    getState: (): Promise<{ status: UpdaterStatus; appVersion: string }> =>
      ipcRenderer.invoke('updater:getState'),
    onStatus: (cb: (s: UpdaterStatus) => void): (() => void) => {
      const handler = (_e: unknown, s: UpdaterStatus) => cb(s);
      ipcRenderer.on('updater:status', handler);
      return () => {
        ipcRenderer.off('updater:status', handler);
      };
    },
  },
};

contextBridge.exposeInMainWorld('api', api);

export type Api = typeof api;
