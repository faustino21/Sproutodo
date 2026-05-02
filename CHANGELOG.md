# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.0] - 2026-05-02

### Added
- Keyboard shortcuts: global mod-key shortcuts for focusing the add input, opening the report/settings/workspaces dialogs, and switching workspaces; in-list navigation (`j`/`k`, `x`, `e`, `m`, `Delete`); shared `Esc`/`Cmd+Enter` handling for modal dialogs.
- Shortcuts cheatsheet dialog reachable via `?` or a new help button.

### Fixed
- Focused todo's focus ring no longer clipped by the list scroll container.

## [0.2.0] - 2026-04-29

### Added
- Workspaces: create, rename, and delete multiple todo lists, with a header switcher and a "Manage workspaces" dialog.
- Per-workspace todos persisted in `todos.json` via a new `workspaceId` field; new `workspaces.json` file under `userData`.
- Active workspace persisted in `settings.json` (`activeWorkspaceId`) and restored on launch.
- Move a todo to another workspace from the todo item menu.
- IPC namespace `workspaces:list|create|rename|remove` and `todos:move`; `todos:list`, `todos:add`, `todos:reorder`, and `notion:sendReport` now take a `workspaceId`.
- Notion report is scoped to the active workspace, and the created page title is prefixed with the workspace name.
- One-time migration on startup: existing todos without a `workspaceId` are assigned to a "Default" workspace.
- Release process guide at `docs/release.md`.

### Changed
- Reordering todos only affects items within the active workspace; other workspaces' order is preserved.



### Added
- Rebrand to **Sproutodo** (app name, productName, window title).
- Desktop packaging via electron-builder for macOS (dmg), Windows (nsis), and Linux (AppImage).
- GitHub Actions workflow that builds and publishes installers to GitHub Releases on tag push (`.github/workflows/release.yml`).
- Separate Windows-installer build workflow.
- In-app auto-updater wired to GitHub Releases.
- Drag-and-drop reordering of todos.
- Inline editing of todo text.
- Settings option to clear completed todos automatically after sending the Notion report.

### Changed
- Display name capitalization standardized to "Sproutodo".
