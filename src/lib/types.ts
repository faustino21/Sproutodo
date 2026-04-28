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
        list: () => Promise<Todo[]>;
        add: (text: string) => Promise<Todo>;
        toggle: (id: string) => Promise<Todo>;
        remove: (id: string) => Promise<void>;
        update: (id: string, text: string) => Promise<Todo>;
        reorder: (ids: string[]) => Promise<Todo[]>;
      };
      settings: {
        get: () => Promise<Settings>;
        save: (s: Settings) => Promise<void>;
      };
      notion: {
        sendReport: (
          range: ReportRange,
          clearCompleted: boolean,
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
