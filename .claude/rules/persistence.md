# Persistence

- All filesystem writes for user data MUST go through `writeJsonAtomic` in `electron/storage.ts` (write-to-tmp + rename). Never call `fs.writeFile` directly on a user-data file.
- Persisted data lives under `app.getPath('userData')`. Do not hardcode `~/Library/Application Support/...` or other absolute paths.
- Treat `todos.json` and `settings.json` as forward-evolving user data:
  - Reads must tolerate missing/extra fields (default with `??`, optional chaining).
  - Never throw at read time on shape mismatch — the file may predate the schema change.
  - When changing a persisted shape, ensure old files still load.
