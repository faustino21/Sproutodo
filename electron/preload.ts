import { contextBridge, ipcRenderer } from 'electron';
import type { Todo, Settings } from './storage.js';
import type { ReportRange } from './notion.js';
import type { UpdaterStatus } from './main.js';

const api = {
  todos: {
    list: (): Promise<Todo[]> => ipcRenderer.invoke('todos:list'),
    add: (text: string): Promise<Todo> => ipcRenderer.invoke('todos:add', text),
    toggle: (id: string): Promise<Todo> => ipcRenderer.invoke('todos:toggle', id),
    remove: (id: string): Promise<void> => ipcRenderer.invoke('todos:remove', id),
    update: (id: string, text: string): Promise<Todo> =>
      ipcRenderer.invoke('todos:update', id, text),
    reorder: (ids: string[]): Promise<Todo[]> =>
      ipcRenderer.invoke('todos:reorder', ids),
  },
  settings: {
    get: (): Promise<Settings> => ipcRenderer.invoke('settings:get'),
    save: (s: Settings): Promise<void> => ipcRenderer.invoke('settings:save', s),
  },
  notion: {
    sendReport: (
      range: ReportRange,
      clearCompleted: boolean,
    ): Promise<{ url: string; removedIds: string[] }> =>
      ipcRenderer.invoke('notion:sendReport', range, clearCompleted),
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
