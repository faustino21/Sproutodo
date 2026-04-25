import { contextBridge, ipcRenderer } from 'electron';
import type { Todo, Settings } from './storage.js';
import type { ReportRange } from './notion.js';

const api = {
  todos: {
    list: (): Promise<Todo[]> => ipcRenderer.invoke('todos:list'),
    add: (text: string): Promise<Todo> => ipcRenderer.invoke('todos:add', text),
    toggle: (id: string): Promise<Todo> => ipcRenderer.invoke('todos:toggle', id),
    remove: (id: string): Promise<void> => ipcRenderer.invoke('todos:remove', id),
  },
  settings: {
    get: (): Promise<Settings> => ipcRenderer.invoke('settings:get'),
    save: (s: Settings): Promise<void> => ipcRenderer.invoke('settings:save', s),
  },
  notion: {
    sendReport: (range: ReportRange): Promise<{ url: string }> =>
      ipcRenderer.invoke('notion:sendReport', range),
  },
  shell: {
    openExternal: (url: string): Promise<void> => ipcRenderer.invoke('shell:openExternal', url),
  },
};

contextBridge.exposeInMainWorld('api', api);

export type Api = typeof api;
