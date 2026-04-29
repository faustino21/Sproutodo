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

export type ReportRange = { from: string; to: string };

export type UpdaterStatus =
  | { kind: 'idle' }
  | { kind: 'unsupported-dev' }
  | { kind: 'checking' }
  | { kind: 'not-available' }
  | { kind: 'available'; version: string }
  | { kind: 'downloading'; percent: number }
  | { kind: 'downloaded'; version: string }
  | { kind: 'error'; message: string };

declare global {
  interface Window {
    api: {
      todos: {
        list: (workspaceId: string) => Promise<Todo[]>;
        add: (text: string, workspaceId: string) => Promise<Todo>;
        toggle: (id: string) => Promise<Todo>;
        remove: (id: string) => Promise<void>;
        update: (id: string, text: string) => Promise<Todo>;
        reorder: (workspaceId: string, ids: string[]) => Promise<Todo[]>;
        move: (id: string, workspaceId: string) => Promise<Todo>;
      };
      workspaces: {
        list: () => Promise<Workspace[]>;
        create: (name: string) => Promise<Workspace>;
        rename: (id: string, name: string) => Promise<Workspace>;
        remove: (id: string) => Promise<{ removedTodoIds: string[] }>;
      };
      settings: {
        get: () => Promise<Settings>;
        save: (s: Settings) => Promise<void>;
      };
      notion: {
        sendReport: (
          range: ReportRange,
          clearCompleted: boolean,
          workspaceId: string,
        ) => Promise<{ url: string; removedIds: string[] }>;
      };
      shell: {
        openExternal: (url: string) => Promise<void>;
      };
      updater: {
        check: () => Promise<UpdaterStatus>;
        quitAndInstall: () => Promise<boolean>;
        getState: () => Promise<{ status: UpdaterStatus; appVersion: string }>;
        onStatus: (cb: (s: UpdaterStatus) => void) => () => void;
      };
    };
  }
}
