# CUEsto Technical Documentation

## Overview
CUEsto is a modern, Electron-based desktop application for editing CUE sheets. It is built with React, TypeScript, and Vite, leveraging TailwindCSS for styling. The application is designed to be fast, responsive, and aesthetically pleasing with support for both **Dark and Light modes**.

## Tech Stack
- **Runtime**: [Electron](https://www.electronjs.org/)
- **Frontend Framework**: [React](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [TailwindCSS](https://tailwindcss.com/) (v4 with CSS variables for dynamic themes)
- **Localization**: Custom i18n implementation with support for 5 languages.
- **Audio Processing**: [FFmpeg](https://ffmpeg.org/) (bundled via `ffmpeg-static`)
- **Linting**: ESLint

### IPC Handlers
- **`dialog:openFile`**: Opens CUE/TXT files.
- **`dialog:openLabels`**: Opens Audacity Labels files (.txt).
- **`dialog:openAudioFile`**: Uses `music-metadata` to return filename, duration in frames, and common tags (Artist, Title, Year, Genre).
- **`dialog:saveFile`**: Handles saving the generated CUE content to disk.
- **`window:open-viewer`**: Opens a new read-only window with syntax highlighting to view raw CUE content.
- **`viewer:get-content`**: Used by the viewer window to retrieve the CUE content stored in the main process.
- **`getAppVersion`**: Returns the current application version from `package.json`.
- **`gnudb:fetchMetadata`**: Facilitates context-specific CD lookup from `gnudb.org`.
- **`musicbrainz:fetchMetadata`**: Retrieves detailed release metadata (including barcode/label) from MusicBrainz.
- **`discogs:fetchMetadata`**: Retrieves release data directly from the Discogs API. Requires a `DISCOGS_TOKEN`.
- **`browser:get-status`**: Returns the current status (canGoBack, canGoForward, title, url) of the active `WebContentsView`.
- **`browser:go-back` / `browser:go-forward`**: Triggers navigation in the target browser view.
- **`browser:status-updated` (Event)**: Pushed from main to renderer whenever navigation or title changes occur.
- **`app:sync-language`**: Notifies the main process of the current renderer language to keep context menus synchronized.
- **`musicbrainz:set-discid` / `discogs:set-releasecode` / `gnudb:set-cdid` (Events)**: Pushed from main to renderer when a ID is extracted from the internal browser via context menu.
- **`audio:split`**: Initiates the FFmpeg splitting process.
- **`audio:split-progress` / `-complete` / `-error` (Events)**: Progress updates and status for the audio splitting operation.
- **`shell:open-folder`**: Opens an absolute path in the system's file explorer.

### Key Components
- **`CueEditor.tsx`**: The main container component that manages the state of the CUE sheet (`CueSheet` object). It implements the selective overwrite logic for GnuDB and Discogs imports and handles the display of calculated durations.
- **`CueViewer.tsx`**: A read-only viewer for CUE content. It uses **JetBrains Mono** and implements regex-based syntax highlighting for keywords like `REM`, `TRACK`, `INDEX`, etc.
- **`BrowserShell.tsx`**: A specialized view for the internal search browser. It provides a navigation header and syncs its state with the main process's `WebContentsView`.
- **`GnuDbModal.tsx`**: A dedicated modal for GnuDB integration. It manages internal state for selective overwrite options and handles link redirection to the custom browser.
- **`DiscogsModal.tsx`**: A dedicated modal for Discogs integration. It supports selective overwrite and features an advanced **Interpolation** mode for track timings.
- **`MusicBrainzModal.tsx`**: A dedicated modal for MusicBrainz integration. Supports detailed metadata capture including Barcode, Label, and Catalog Number.
- **`ConfirmModal.tsx`**: A reusable, styled confirmation modal for sensitive actions like clearing the editor.
- **`AlertModal.tsx`**: A generic modal for displaying errors or warnings.
- **`SplitProgressModal.tsx`**: Displays the real-time progress of the FFmpeg splitting operation.
- **`TextEditingModal.tsx`**: Manages batch text operations (separator replacement, splitting, swapping, and propercase normalization) across all tracks.
- **`TrackRow.tsx`**: Represents a single track in the cue sheet. Contains inputs for title, performer, start time, and duration.
- **`MetadataHeader.tsx`**: Displays and edits global CUE properties. Includes the audio file icon and total duration display.
- **`TimeInput.tsx`**: A specialized input component for handling timestamp formats (MM:SS:FF). Supports a read-only mode for calculated fields.
- **`SettingsModal.tsx`**: Manages application preferences including language selection and theme toggling (Light/Dark).
- **`LanguageSelector.tsx`**: A specialized icon-based selector that opens the settings modal and provides localized tooltips.

### Utilities
- **`cueParser.ts`**: Handles parsing of .cue files and generation of output. Now supports `REM TOTAL DURATION`, `REM GNUCDID`, and `REM DISCOGS` for enhanced metadata persistence.
- **`tracklistParser.ts`**: Implements 1001tracklists.com HTML parsing using the browser's native `DOMParser`. It extracts metadata, tracks, and handles mashup logic (merging sub-tracks).
- **`gnudb.ts`**: Facilitates interaction with the `gnudb:fetchMetadata` IPC handler and defines types for `OverwriteOptions`.
- **`discogs.ts`**: Implements track duration interpolation and bridges the gap between raw Discogs API responses and CUE-compatible track structures.
- **`timeUtils.ts`**: Helper functions for frame/time conversions (75 frames per second). Now includes `parseAudacityLabels` for extracting start times and labels from Audacity export files.
- **Audio Engine**: Uses `ffmpeg-static` in the main process to handle audio splitting. The binary is unpacked from the ASAR during production builds to ensure compatibility.
- **Audio Metadata**: Uses `music-metadata` in the main process (via `dialog:openAudioFile` IPC) to extract duration and tags (Artist, Title, Year, Genre). Now includes multi-artist support.
- **`i18n.ts`**: Provides a robust translation system (`t()` function) and handles persistence of the user's language preference.
- **`themeContext.tsx`**: Manages the application-wide theme state, applying the `.dark` class to the document root and persisting the setting in local storage.

### State Management
State is largely local to `CueEditor.tsx`, with the `CueSheet` object serving as the single source of truth for the currently open file. Changes flow down to child components via props, and updates bubble up via callbacks.

## Setup & Build

### Prerequisites
- Node.js (v16+ recommended)
- npm or yarn

### Installation
```bash
npm install
```

### Development
Run the app in development mode with HMR:
```bash
npm run dev
```

### Production Build
Build the Electron app for production:
```bash
npm run build
```
The output will be in the `release` or `dist` folder depending on configuration.

## File Structure
```
v1/
├── src/
│   ├── components/    # React components (including GnuDbModal.tsx)
│   ├── lib/           # Utility functions (cueParser, gnudb, timeUtils)
│   ├── Main.tsx       # Entry point
│   └── index.css      # Global styles & Tailwind directives
├── electron/          # Main process code (includes GnuDB fetching logic)
├── dist/              # Built assets
└── package.json       # Dependencies and scripts
```
