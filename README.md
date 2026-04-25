# Sproutodo

A clean Electron + React desktop todo list, with one-click reports to Notion.

## Features

- Add, complete, and remove todos — saved locally as JSON.
- Send a date-range report to a Notion page: completed and open tasks land as a new child page with checkbox blocks.
- macOS-friendly window with a hidden inset title bar.

## Tech

- Electron 33 (main + preload, `contextIsolation: true`)
- React 18 + TypeScript (renderer)
- Vite 5 with `vite-plugin-electron` (single dev/build pipeline)
- `@notionhq/client` for the report integration
- CSS Modules for component styles, `lucide-react` for icons

## Quickstart

```bash
npm install
npm run dev
```

`npm run dev` starts Vite, builds the Electron main + preload, and launches the desktop window — there is no separate "build main / run electron" step.

To typecheck and produce a production build:

```bash
npm run build   # tsc --noEmit + vite build
```

If an Electron window survives `Ctrl+C`:

```bash
pkill -f "Electron.app/Contents/MacOS/Electron"
```

## Where your data lives (macOS)

- Todos: `~/Library/Application Support/simple-todo/todos.json`
- Settings (Notion token + page ID): `~/Library/Application Support/simple-todo/settings.json`

Writes are atomic (write-to-tmp + rename) so a crash never corrupts the file.

## Notion setup (one-time)

1. Notion → Settings → Integrations → **New internal integration** → copy the `secret_…` token.
2. Open the Notion page where you want reports to appear → `…` menu → **Connections** → add your integration. (Without this the API call 404s.)
3. Copy the page ID from the URL (the 32-char hex string after the page title).
4. In the app, click ⚙ → paste the token and page ID → **Save**.
5. Click 📤 to send a report — pick a date range, hit **Send**, then click **Open in Notion ↗**.

Each report creates a **new child page** under the configured page (it does not append). Filtering rules:

- Completed: `done && completedAt ∈ [from, to]`
- Open: `!done && createdAt ∈ [from, to]`

## Project layout

```
electron/   main process: IPC handlers, JSON storage, Notion client, preload bridge
src/        React renderer: components, hooks, CSS Modules
docs/       run/setup notes
.claude/    project rules and slash commands for Claude Code
```

The renderer talks to the main process **only** through the typed `window.api` object exposed by the preload — it has no Node access.

## Scripts

- `npm run dev` — dev mode (Vite + Electron, hot reload).
- `npm run build` — typecheck (`tsc --noEmit`) + production Vite build.

There is no test or lint script.
