# IPC contract

- Every IPC channel change MUST update three files together in the same commit:
  1. `electron/main.ts` — `ipcMain.handle('namespace:action', …)` in `registerIpc()`
  2. `electron/preload.ts` — add the method to the `api` object
  3. `src/lib/types.ts` — update the `Window.api` global declaration
- Channel names follow the `namespace:action` convention (e.g. `todos:add`, `notion:sendReport`). Keep this.
- Validate/coerce IPC inputs inside the handler. The renderer is trusted, but data shapes are not enforced at runtime.
- Never expose raw `ipcRenderer` or generic `invoke(channel, …)` to the renderer.
