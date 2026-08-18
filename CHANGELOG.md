# Changelog

All notable changes to this project are documented here. Format loosely follows [Keep a Changelog](https://keepachangelog.com/).

## 2026-08-18

### Added
- **Mobile responsiveness & touch controls** — the game is now fully playable on phones and tablets:
  - Phaser canvas supports single-finger pan, two-finger pinch-to-zoom, and tap-to-select, alongside the existing mouse/wheel controls
  - `input.activePointers: 3` enables Phaser to track simultaneous touches for pinch gestures
  - HUD collapses to icon-only bottom navigation and a condensed top bar (secondary stats hidden) below the `sm` breakpoint, with safe-area padding for notched devices
  - `FloorplanEditorModal`, `NPCEditorModal`, and `MenuEditorModal` switch their fixed-width sidebar + content layout to a stacked single-column layout on narrow screens
  - `OrderQueueTracker` and `NPCInspectorCard` switch from fixed pixel widths to viewport-relative widths so they no longer overflow on small screens
  - `viewport-fit=cover` added to the viewport meta tag
- Comprehensive [README](README.md) and [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) covering the simulation engine, state machines, order lifecycle, A* pathfinding, AI Director heuristics, rendering pipeline, and CI/CD, with styled Mermaid diagrams throughout
- GitHub Actions workflow ([.github/workflows/deploy.yml](.github/workflows/deploy.yml)) that builds and deploys to GitHub Pages on every push to `main`

### Fixed
- Absolute asset paths (`index.html`, `manifest.json`, `sw.js`) that would 404 once deployed under the GitHub Pages project-site subpath (`/restaurant-sim-pwa/`) — switched to relative paths and set `base` in `vite.config.ts`
- Markdown bold/asterisk rendering collision in the README's "A\* pathfinding" feature row

### Initial Release
- ChefAI: Autonomous Restaurant Simulator — 2D top-down restaurant management sim built with React, Phaser 3, and TypeScript. Floorplan editor, staff customization studio, menu/recipe editor, autonomous AI Director with 4 policy modes, live order tickets, daily ledger & reviews, procedural Web Audio sound, installable PWA, and localStorage/JSON save-load.
