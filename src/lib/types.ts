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
    };
  }
}
