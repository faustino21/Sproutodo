# Shared types

- `Todo`, `Settings`, and `ReportRange` are duplicated by design between:
  - `electron/storage.ts` / `electron/notion.ts` (main-side source of truth)
  - `src/lib/types.ts` (renderer-side, also declares the `Window.api` global)
- When you change one, change the other in the same commit.
- Do NOT "fix" the duplication by importing across the `electron/` ↔ `src/` boundary — it breaks the renderer build (no Node, different module context).
