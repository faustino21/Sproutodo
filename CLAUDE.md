# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — single command for everything: starts Vite for the renderer, builds `electron/main.ts` + `electron/preload.ts` via `vite-plugin-electron`, then launches the Electron window. There is no separate "build main / run electron" step.
- `npm run build` — `tsc --noEmit` (typecheck both `src` and `electron`) followed by `vite build`. Use this to verify types; there is no separate `lint` or `test` script.
- No test framework is configured.
- If an Electron window survives Ctrl+C: `pkill -f "Electron.app/Contents/MacOS/Electron"`.

## Architecture

This is an Electron + React + TypeScript desktop todo app with a Notion "send report" feature. Three processes/boundaries matter:

1. **Main process** (`electron/`, Node) — owns all I/O: filesystem (`storage.ts`) and Notion API (`notion.ts`). Registers IPC handlers in `electron/main.ts` (`registerIpc`).
2. **Preload** (`electron/preload.ts`) — the *only* bridge. Uses `contextBridge.exposeInMainWorld('api', …)` to expose a typed `window.api` to the renderer. `contextIsolation: true`, `nodeIntegration: false` — the renderer has no Node access.
3. **Renderer** (`src/`, React 18) — calls `window.api.*` only; never imports from `electron/` or Node modules. UI state lives in `src/hooks/useTodos.ts`; persistence is delegated to main via IPC on every mutation.

### IPC contract (must stay in sync across three files)

When you add or change an IPC method, update **all three**:
- `electron/main.ts` — `ipcMain.handle('namespace:action', …)` in `registerIpc()`
- `electron/preload.ts` — add it to the `api` object exposed via `contextBridge`
- `src/lib/types.ts` — update the `Window.api` global declaration so the renderer is typed

Current channels: `todos:list|add|toggle|remove`, `settings:get|save`, `notion:sendReport`, `shell:openExternal`.

### Types are duplicated by design

`Todo` / `Settings` / `ReportRange` exist in **both** `electron/storage.ts` (+ `electron/notion.ts`) and `src/lib/types.ts`. The renderer cannot import from `electron/` (different tsconfig context, no Node), so the renderer-side copy in `src/lib/types.ts` is the source of truth for `window.api` typing. Keep the two in sync when changing shapes.

### Persistence

`electron/storage.ts` writes JSON to `app.getPath('userData')` (on macOS: `~/Library/Application Support/simple-todo/`):
- `todos.json` — array of `Todo`
- `settings.json` — `{ notionToken?, notionPageId? }`

Writes go through `writeJsonAtomic` (write to `*.tmp`, then `rename`). Preserve this pattern for any new persisted data — partial writes corrupt the file.

### Notion report

`sendNotionReport` in `electron/notion.ts` creates a **new child page** under the configured `notionPageId` per report (it does not append to an existing page). Filtering rules:
- Completed tasks: `done && completedAt ∈ [from, to]`
- Open tasks: `!done && createdAt ∈ [from, to]`

The Notion integration must be added to the target page's Connections, otherwise the API call 404s.

### Build wiring quirks

`vite.config.ts` configures the preload to emit `.mjs` (`entryFileNames: '[name].mjs'`); `electron/main.ts` references `preload.mjs` by that exact name. Don't change one without the other. The main process is loaded as ESM (`"type": "module"` in `package.json`), so relative imports in `electron/` use `.js` extensions even though the source files are `.ts`.

## Data file paths (macOS)

- Todos: `~/Library/Application Support/simple-todo/todos.json`
- Settings: `~/Library/Application Support/simple-todo/settings.json`

## Repo rules

Project rules live in `.claude/rules/`. Read them before making changes in the matching area:

- `process-boundaries.md` — what `src/` vs `electron/` may import; preload/contextIsolation invariants.
- `ipc-contract.md` — the three-file rule for adding/changing IPC channels.
- `persistence.md` — atomic writes, `userData` paths, forward-compatible reads.
- `types.md` — why `Todo`/`Settings`/`ReportRange` are duplicated and how to keep them in sync.
- `build-wiring.md` — `preload.mjs` naming, ESM `.js` import extensions, allowed npm scripts.
- `verification.md` — what counts as "done".
- `notion.md` — report semantics and token handling.
- `styling.md` — CSS Modules convention and library restrictions.
