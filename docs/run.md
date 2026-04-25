# Running simple-todo

## Start the app (dev mode)

```bash
cd /Users/faustinoaron/Developments/home_server/simple-todo && npm run dev
```

Vite serves the React renderer, builds the Electron main + preload, then launches the desktop window automatically.

## Stop the app

In the terminal running `npm run dev`, press `Ctrl+C`.

If an Electron window stays open after that, kill any leftover processes:

```bash
pkill -f "Electron.app/Contents/MacOS/Electron"
```

## First-time setup

If you haven't installed dependencies yet:

```bash
cd /Users/faustinoaron/Developments/home_server/simple-todo && npm install
```

## Where your data lives

- Todos: `~/Library/Application Support/simple-todo/todos.json`
- Settings (Notion token + page ID): `~/Library/Application Support/simple-todo/settings.json`

## Notion setup (one-time)

1. Notion → Settings → Integrations → **New internal integration** → copy the `secret_…` token.
2. Open the Notion page where you want reports to appear → `…` menu → **Connections** → add your integration.
3. Copy the page ID from the URL (the 32-char hex string after the page title).
4. In the app, click ⚙ → paste the token and page ID → **Save**.
5. Click 📤 to send a report — pick a date range, hit **Send**, then click **Open in Notion ↗**.
