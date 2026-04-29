# Creating a new release

Sproutodo ships via GitHub Releases. Pushing a `v*` tag triggers `.github/workflows/release.yml`, which builds installers on macOS, Windows, and Linux and uploads them as release assets. The in-app auto-updater (`electron-updater`) reads from those releases.

## Versioning

Follow [Semantic Versioning](https://semver.org/spec/v2.0.0.html):

- **Patch** (`0.1.0 → 0.1.1`) — bug fixes only.
- **Minor** (`0.1.0 → 0.2.0`) — new features, backward-compatible.
- **Major** (`0.1.0 → 1.0.0`) — breaking changes (e.g., persisted-data shape change with no read-time fallback).

The version in `package.json` MUST match the git tag (without the `v` prefix). `electron-builder` uses `package.json` version; the tag triggers the workflow.

## Release steps

Run from `main` with a clean working tree.

### 1. Pick the next version

```bash
git pull origin main
git status   # must be clean
```

Decide the new version (e.g., `0.2.0`). Below, `X.Y.Z` is that version.

### 2. Update `package.json`

Bump `"version"` in `package.json` to `X.Y.Z`. Do not edit `package-lock.json` by hand — run:

```bash
npm install --package-lock-only
```

### 3. Update `CHANGELOG.md`

Add a new section above the previous one, dated today (YYYY-MM-DD), grouped under `Added` / `Changed` / `Fixed` / `Removed` as applicable. Keep the format consistent with prior entries.

```markdown
## [X.Y.Z] - 2026-MM-DD

### Added
- ...

### Changed
- ...

### Fixed
- ...
```

### 4. Verify the build locally

```bash
npm run build
```

This runs `tsc --noEmit` (typecheck) + `vite build`. There is no test suite — for UI changes, also exercise the feature in `npm run dev` before tagging.

Optional: produce installers locally to sanity-check packaging without publishing.

```bash
npm run package        # current platform only
```

Output goes to `release/`. This step is not required (CI does the real build) but is useful for catching `electron-builder` config issues early.

### 5. Commit, tag, and push

```bash
git add package.json package-lock.json CHANGELOG.md
git commit -m "release: vX.Y.Z"
git tag vX.Y.Z
git push origin main
git push origin vX.Y.Z
```

The tag push triggers the `Build & Release` workflow.

### 6. Watch the workflow

```bash
gh run watch
```

Or open Actions → **Build & Release** in the browser. The job runs three matrix builds (`windows-latest`, `macos-latest`, `ubuntu-latest`) and publishes via `electron-builder --publish always` using `GITHUB_TOKEN`.

### 7. Publish the release notes

The workflow creates a **draft** GitHub Release with the installers attached. Open it:

```bash
gh release view vX.Y.Z --web
```

- Paste the matching `CHANGELOG.md` section into the release body.
- Confirm assets are present:
  - `Sproutodo-X.Y.Z.dmg` (macOS)
  - `Sproutodo Setup X.Y.Z.exe` (Windows)
  - `Sproutodo-X.Y.Z.AppImage` (Linux)
  - `latest.yml`, `latest-mac.yml`, `latest-linux.yml` (auto-updater feeds — required, do not delete)
- Click **Publish release**.

Once published, existing installs will pick up the update on next launch via the in-app updater.

## Manual / dry-run build

To produce installers without publishing (e.g., to test packaging on all three OSes from CI):

1. Actions → **Build & Release** → **Run workflow** (the `workflow_dispatch` trigger).
2. The job runs `electron-builder --publish never` and uploads installers as workflow artifacts (`sproutodo-<os>`), retained 30 days.

This does not create a GitHub Release and does not bump the auto-updater.

## Troubleshooting

- **Workflow didn't trigger** — confirm the tag starts with `v` (matches `tags: ['v*']`) and was pushed to the remote (`git push origin vX.Y.Z`).
- **Version mismatch** — `electron-builder` reads `package.json`. If `package.json` says `0.1.0` but you tagged `v0.2.0`, the installer filenames will say `0.1.0`. Fix by deleting the tag (`git tag -d vX.Y.Z && git push --delete origin vX.Y.Z`), correcting `package.json`, and re-tagging.
- **`GH_TOKEN` / 403 from electron-builder** — the workflow uses the default `GITHUB_TOKEN`; no secret to configure. If publishing fails with 403, check the repo's Actions → General → Workflow permissions allow "Read and write".
- **Auto-updater not picking up the new version** — verify `latest.yml` / `latest-mac.yml` / `latest-linux.yml` are attached to the published (not draft) release. The `publish` block in `electron-builder.yml` points at `faustino21/Sproutodo`; if the repo moves, update both `electron-builder.yml` and `package.json` `repository.url`.
- **Stuck Electron process after a local `npm run package` test** — `pkill -f "Electron.app/Contents/MacOS/Electron"`.

## Files involved

- `.github/workflows/release.yml` — CI build + publish.
- `electron-builder.yml` — installer targets, icons, GitHub publish config.
- `package.json` — version source of truth.
- `CHANGELOG.md` — user-facing release notes.
