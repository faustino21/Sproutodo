# Verification before declaring done

- Run `npm run build` (typecheck + vite build) to verify TypeScript work. There is no test suite.
- For UI/renderer changes, launch `npm run dev` and exercise the feature in the Electron window. Type-checking passing is not the same as the feature working.
- If you cannot test the UI in this environment, say so explicitly rather than claiming success.
- Do not add lint or test tooling unless the user asks.
