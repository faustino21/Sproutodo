# Notion integration

- `sendNotionReport` (in `electron/notion.ts`) creates a NEW child page under the configured `notionPageId` per call. Do not change it to append to an existing page without explicit user approval — that changes the user-visible model.
- Filtering rules currently in use:
  - Completed: `done && completedAt ∈ [from, to]`
  - Open: `!done && createdAt ∈ [from, to]`
- Do NOT log `notionToken`, embed it in error messages, or persist it anywhere outside `settings.json`.
- Errors surfaced from the Notion client must be sanitized before crossing IPC back to the renderer (no token, no full request URL).
