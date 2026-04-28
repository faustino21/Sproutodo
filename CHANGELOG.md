# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-04-29

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
