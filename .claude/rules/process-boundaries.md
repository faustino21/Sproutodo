# Process boundaries

- The renderer (`src/`) MUST NOT import from `electron/`, `node:*`, `electron`, or `@notionhq/client`. All side effects go through `window.api`.
- The main process (`electron/`) MUST NOT import from `src/`.
- The preload (`electron/preload.ts`) is the only bridge. Never expose `ipcRenderer` directly or arbitrary channels — only the typed `api` object via `contextBridge.exposeInMainWorld`.
- Keep `contextIsolation: true`, `nodeIntegration: false`, `sandbox: false` in `electron/main.ts`. Do not loosen these without explicit user approval.
