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
- **`discogs:fetchMetadata`**: Retrieves release data directly from the Discogs API. Requires OAuth authentication.
- **`discogs:getAuthStatus`**: Returns the current Discogs OAuth connection status (connected boolean, username).
- **`discogs:startOAuth`**: Initiates the OAuth flow and returns the authorization URL.
- **`discogs:handleOAuthCallback`**: Handles the OAuth callback and exchanges tokens.
- **`discogs:logout`**: Clears stored OAuth tokens.
- **`shell:openExternal`**: Opens a URL in the system's default browser.
- **`browser:get-status`**: Returns the current status (canGoBack, canGoForward, title, url) of the active `WebContentsView`.
- **`browser:go-back` / `browser:go-forward`**: Triggers navigation in the target browser view.
- **`browser:status-updated` (Event)**: Pushed from main to renderer whenever navigation or title changes occur.
- **`app:sync-language`**: Notifies the main process of the current renderer language to keep context menus synchronized.
- **`musicbrainz:set-discid` / `discogs:set-releasecode` / `gnudb:set-cdid` (Events)**: Pushed from main to renderer when a ID is extracted from the internal browser via context menu.
- **`audio:split`**: Initiates the FFmpeg splitting process.
- **`audio:split-progress` / `-complete` / `-error` (Events)**: Progress updates and status for the audio splitting operation.
- **`shell:open-folder`**: Opens an absolute path in the system's file explorer.

### Key Components
- **`CueEditor.tsx`**: The main container component that manages the state of the CUE sheet (`CueSheet` object). Implements the fixed **Top Bar** for global actions, selective overwrite logic for imports, and handles the display of calculated durations. Initializes with **9 tracks** at **3:00:00** intervals. Resolves the app version at runtime via the `getAppVersion` IPC handler.
- **`CueViewer.tsx`**: A read-only viewer for CUE content. It uses **JetBrains Mono** and implements regex-based syntax highlighting for keywords like `REM`, `TRACK`, `INDEX`, etc.
- **`BrowserShell.tsx`**: A specialized view for the internal search browser. It provides a navigation header and syncs its state with the main process's `WebContentsView`.
- **`GnuDbModal.tsx`**: A dedicated modal for GnuDB integration. It manages internal state for selective overwrite options and handles link redirection to the custom browser.
- **`DiscogsModal.tsx`**: A dedicated modal for Discogs integration. It supports selective overwrite and features an advanced **Interpolation** mode for track timings.
- **`MusicBrainzModal.tsx`**: A dedicated modal for MusicBrainz integration. Supports detailed metadata capture including Barcode, Label, and Catalog Number.
- **`ConfirmModal.tsx`**: A reusable, styled confirmation modal for sensitive actions like clearing the editor.
- **`AlertModal.tsx`**: A generic modal for displaying errors or warnings.
- **`SplitProgressModal.tsx`**: Displays the real-time progress of the FFmpeg splitting operation.
- **`TextEditingModal.tsx`**: Manages batch text operations (separator replacement, splitting, swapping, and propercase normalization) across all tracks.
- **`TrackRow.tsx`**: Represents a single track in the cue sheet. Contains inputs for title, performer, start time, and duration. Supports **instant deletion** without confirmation.
- **`MetadataHeader.tsx`**: Displays and edits global CUE properties. Includes the audio file selector integrated within the filename field, total duration display, and the Red Book **CDDA badge** shown when the sheet is compliant.
- **`TimeInput.tsx`**: A specialized input component for handling timestamp formats (MM:SS:FF). Supports a read-only mode for calculated fields.
- **`SettingsModal.tsx`**: Manages application preferences including language selection, theme toggling (Light/Dark), and Discogs OAuth connection status.
- **`LanguageSelector.tsx`**: A specialized icon-based selector in the Top Bar that opens settings. Supports dynamic tooltip positioning (`tooltipDirection`) to prevent window-edge clippings.

### Utilities
- **`cueParser.ts`**: Handles parsing of .cue files and generation of output. Now supports `REM TOTAL DURATION`, `REM GNUCDID`, and `REM DISCOGS` for enhanced metadata persistence. Also exports `isCueRedbookCompliant()`, the single source of truth for Red Book formatting that both the writer and the UI badge consult.
- **`tracklistParser.ts`**: Implements 1001tracklists.com HTML parsing using the browser's native `DOMParser`. It extracts metadata, tracks, and handles mashup logic (merging sub-tracks).
- **`gnudb.ts`**: Facilitates interaction with the `gnudb:fetchMetadata` IPC handler and defines types for `OverwriteOptions`.
- **`discogs.ts`**: Implements track duration interpolation and bridges the gap between raw Discogs API responses and CUE-compatible track structures.
- **`timeUtils.ts`**: Helper functions for frame/time conversions (75 frames per second). Now includes `parseAudacityLabels` for extracting start times and labels from Audacity export files, plus `isRedbookCompliant()` and the `REDBOOK_MAX_FRAMES` limit (79:59:74) that back the padded `MM:SS:FF` output.
- **Audio Engine**: Uses `ffmpeg-static` in the main process to handle audio splitting. The binary is unpacked from the ASAR during production builds to ensure compatibility.
- **Audio Metadata**: Uses `music-metadata` in the main process (via `dialog:openAudioFile` IPC) to extract duration and tags (Artist, Title, Year, Genre). Now includes multi-artist support.
- **`i18n.ts`**: Provides a robust translation system (`t()` function) and handles persistence of the user's language preference.
- **`themeContext.tsx`**: Manages the application-wide theme state, applying the `.dark` class to the document root and persisting the setting in local storage.

### Red Book Compliance
Timings follow the Red Book (CD-DA) standard, which addresses time as `MM:SS:FF` with minutes zero-padded to two digits and capped at 79.

- `framesToTime(frames, padMinutes = true)` pads minutes by default. Padding uses `padStart`, so it never truncates: 105 minutes still renders as `105:00:00`.
- `generateCue()` resolves the flag **once** via `isCueRedbookCompliant(cue)` and passes it to every `INDEX 01` and `REM TOTAL DURATION` it writes, so a sheet is formatted consistently.
- `isCueRedbookCompliant()` checks both `totalDuration` and the latest track index, so a hand-typed sheet is never padded beyond the standard even without a linked audio file.
- The **CDDA badge** in `MetadataHeader.tsx` is driven by the *same* predicate, gated on a known duration. The indicator therefore cannot disagree with what is written to disk.
- Round-tripping is safe: `parseCue()` already accepts `\d+:\d{2}:\d{2}`, so padded and unpadded forms both parse back to identical frame counts.

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

## Release Process
Releases are tag-driven. `.github/workflows/build-and-release.yml` triggers on `push` of a tag matching `v*` and runs three jobs (ubuntu / macos / windows) on Node 24. There is no manual "create release" step — `electron-builder.json5` declares a `publish` block pointing at GitHub, and the workflow passes `GH_TOKEN` with `contents: write`, so electron-builder creates the Release and uploads every installer itself.

> **The release is created as a DRAFT and must be published by hand.** electron-builder's GitHub publisher defaults to drafts (`gitHubPublisher.js`: `options.draft === false ? "release" : "draft"`), and it never flips a draft to published by itself. The three platform jobs run in parallel and each uploads its own assets, so **wait until all three jobs are green before publishing** — otherwise you expose an incomplete release to users and to `electron-updater`. Then click **Publish release**, add the notes, and save.

```bash
git add -A
git commit -m "1.1.0 - <summary>"
git push origin master
git tag -a v1.1.0 -m "CUEsto 1.1.0"
git push origin v1.1.0     # <-- this single command starts the release
```

> **The tag must match `package.json`.** electron-builder derives the release tag from the package version (`v${version}`), not from the pushed tag. Tagging `v1.2.0` while `package.json` still says `1.1.0` publishes the release under the wrong tag.

Expected output per platform, plus the auto-update manifests `latest.yml`, `latest-mac.yml` and `latest-linux.yml` that let existing installs discover the new version:

| Platform | Artifacts |
| --- | --- |
| Windows | `CUEsto-Windows-<v>-x64.exe`, `.zip`, `.exe.blockmap`, `latest.yml` |
| macOS | `CUEsto-Mac-<v>-Installer.dmg`, `.dmg.blockmap`, `latest-mac.yml` |
| Linux | `CUEsto-Linux-<v>.AppImage`, `latest-linux.yml` |

Release **notes are not auto-generated** — add them on the GitHub Release page after the run completes. The workflow also uploads a copy of `release/` as a run artifact (excluding `*-unpacked/`) so a build stays downloadable even if publishing failed.

### Code Signing & Notarization
Signing is entirely opt-in and driven by environment variables, so no config file changes are needed to add or remove certificates. Every variable below is optional: when absent, electron-builder builds **unsigned** rather than failing.

| Variable | Purpose |
| --- | --- |
| `CSC_LINK`, `CSC_KEY_PASSWORD` | Signing certificate (`.pfx` path or base64 contents) — Windows and macOS |
| `WIN_CSC_LINK`, `WIN_CSC_KEY_PASSWORD` | Windows-only certificate, overriding `CSC_*` |
| `APPLE_API_KEY`, `APPLE_API_KEY_ID`, `APPLE_API_ISSUER` | macOS notarization via API key (**recommended**) |
| `APPLE_ID`, `APPLE_APP_SPECIFIC_PASSWORD`, `APPLE_TEAM_ID` | macOS notarization via Apple ID (alternative) |

`mac.notarize` is enabled in `electron-builder.json5`, which activates the step **only** when one of the notarization variable sets is present. Until credentials are added, macOS builds are unsigned and users must clear the Gatekeeper warning (right-click → Open).

> **Never inject these into a step's `env:` directly.** In GitHub Actions, `${{ secrets.CSC_LINK }}` resolves to an **empty string** when the secret does not exist — and an empty `CSC_LINK` is not treated as "no certificate", it is treated as "a certificate was configured". electron-builder's macOS path then calls `importCertificate("")`, which resolves the empty value against the project directory and fails the job with:
> ```
> ⨯ /Users/runner/work/cuesto/cuesto not a file
> ```
> This is asymmetric inside electron-builder itself: the Windows path (`windowsSignToolManager.js`) guards with `if (cscLink == null || cscLink === "") return null`, while the macOS path (`macCodeSign.js`) has no such guard. That is why **only the macOS job fails** while Linux and Windows still succeed.
>
> The workflow therefore exports these variables through a `GITHUB_ENV` step that skips empty values, so "absent" stays genuinely absent instead of becoming `""`. If you ever move these into a step's `env:`, reintroduce this bug.

### Release Preflight
`scripts/release-preflight.js` runs before every build. electron-builder tolerates *no* credentials but throws a confusing `InvalidConfigurationError` on a *partial* set, which would otherwise surface minutes into a long build. The preflight turns those into immediate, actionable failures:

- partial Apple set (e.g. `APPLE_API_KEY` without `_KEY_ID`/`_ISSUER`) → **fail**
- both Apple methods configured at once → **fail**
- notarization configured without `CSC_LINK` → **fail** (Apple rejects unsigned apps)
- `CSC_KEY_PASSWORD` without `CSC_LINK` → **fail**
- missing Discogs credentials → **warn**, because the build succeeds but the feature silently ships broken

Run it locally to see the same report CI will:
```bash
node scripts/release-preflight.js
```

## File Structure
```
v1/
├── src/
│   ├── components/    # React components (including GnuDbModal.tsx)
│   ├── lib/           # Utility functions (cueParser, gnudb, timeUtils)
│   ├── Main.tsx       # Entry point
│   └── index.css      # Global styles & Tailwind directives
├── electron/          # Main process code (includes GnuDB fetching logic)
├── scripts/           # CI helpers (release-preflight.js)
├── .github/workflows/ # Tag-triggered build & release pipeline
├── dist/              # Built assets
├── electron-builder.json5  # Packaging, targets and publishing config
└── package.json       # Dependencies, scripts and the app version
```
