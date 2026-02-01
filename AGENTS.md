# AGENTS.md

This file provides context and instructions for AI agents working on the **CUEsto** project.

## Project Overview
CUEsto is a modern, Electron-based desktop application for editing CUE sheets. It features a React-based frontend, a Vite-powered build pipeline, and uses Electron's main process for file system and audio operations (FFmpeg, metadata extraction).

- **Framework**: React 18
- **Build Tool**: Vite 7
- **Runtime**: Electron 39
- **Languages**: TypeScript (Strict mode)
- **Styling**: TailwindCSS 4
- **Audio Engine**: FFmpeg (via `ffmpeg-static`)

## Setup Commands
- Install dependencies: `npm install`
- Start development server: `npm run dev`
- Run linting: `npm run lint`
- Build production app: `npm run build`

## Project Structure
- `electron/`: Main process code, including IPC handlers, audio splitting logic, and external API fetching (GnuDB, Discogs).
- `src/`: Renderer process (React) code.
  - `src/components/`: UI components (Modals, Editor, Rows, etc.).
  - `src/lib/`: Core utilities (CUE parser, time utilities, i18n logic).
  - `src/Main.tsx`: Application entry point.
- `docs/`: Technical and user documentation.

## Key Architectures & Conventions
- **IPC Communication**: All system-level tasks (file I/O, audio processing, network requests to Discogs/GnuDB) must go through IPC handlers defined in `electron/`.
- **State Management**: The `CueSheet` object in `CueEditor.tsx` is the single source of truth for the active file.
- **Localization**: Use the `t()` function from `src/lib/i18n.ts` for all user-facing strings. Do not hardcode text.
- **Theming**: Uses TailwindCSS 4 with CSS variables. Apply classes like `text-primary` or `bg-surface-1` which are defined in `index.css`.
- **Time Format**: CUE sheets use `MM:SS:FF` (75 frames per second). Use `timeUtils.ts` for conversions.

## Code Style
- **TypeScript**: Use strict typing. Avoid `any`.
- **Components**: Prefer functional components with hooks.
- **Modals**: Follow the existing pattern in `src/components/` (e.g., `ConfirmModal.tsx`, `SettingsModal.tsx`) for consistent aesthetics.
- **Linting**: Ensure all changes pass `npm run lint`.

## External Integrations
- **Discogs**: Requires a token in `electron/credentials.ts` (not checked into git).
- **GnuDB**: Handled via custom fetching logic in the main process.
- **Audio Splitting**: Uses FFmpeg. Progress is reported back to the renderer via IPC events.
