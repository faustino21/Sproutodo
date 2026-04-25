# Build wiring

- The preload bundle is emitted as `preload.mjs` (configured in `vite.config.ts`) and loaded by that exact filename in `electron/main.ts`. If you rename one, rename both.
- `package.json` sets `"type": "module"`, so files in `electron/` use `.js` extensions in relative imports even though the source is `.ts` (TypeScript resolves `./foo.js` → `./foo.ts`). Keep this convention.
- Do not add a separate "build the electron main" or "run electron" script. `vite-plugin-electron/simple` handles main + preload + window launch inside `npm run dev` and `npm run build`.
- There are only two npm scripts: `dev` and `build`. Don't invent `start`, `electron:dev`, `lint`, `test`, etc., without explicit user approval.
