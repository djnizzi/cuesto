# CUEsto
> A modern, electron-based CUE sheet editor built for speed and aesthetics.

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
![Version](https://img.shields.io/badge/version-v1.0.23-green.svg)
![Status](https://img.shields.io/badge/status-active-success.svg)

**CUEsto** is a powerful desktop application designed to make CUE sheet editing effortless. Built with modern web technologies, it offers a sleek interface with both light and dark modes, real-time duration calculations, and intuitive metadata management.

**I think we are nearing release... It will be 1.1.0 (currently focusing on UI/UX refinements)**

what is this for anyway? [Read on Wikipedia](https://en.wikipedia.org/wiki/Cue_sheet_(computing))

## Features

- 🎨 **Modern UI**: A focused interface with support for **Light and Dark modes**, built with custom branded modals.
- ⚡ **Fast & Responsive**: Built on Vite and React for instant feedback.
- ✍️ **Text Editing**: Advanced batch operations for track titles and performers, including separator replacement, field swapping, and propercase conversion.
- ✂️ **Audio Splitting**: Slice large audio files into individual tracks directly from the CUE sheet using bundled FFmpeg.
- 🕵️ **CUE Viewer**: Inspect your raw CUE sheet with syntax highlighting in a dedicated window.
- ⏱️ **Metadata Persistence**: Support for custom `REM` lines, including `TOTAL DURATION`, `GNUCDID`, `DISCOGS`, and `MUSICBRAINZ_DISCID`.
- 🏷️ **Enhanced Metadata**: Auto-captures and saves `BARCODE`, `LABEL`, and `CATALOG` number from MusicBrainz.
- 🎵 **Audio Integration**: Link audio files to your CUE sheet. Automatically extract duration and metadata (performer, title, year, genre) from audio files with multi-artist support.
- 📥 **Import Tools**: Support for importing tracklists from **GnuDB**, **1001tracklists**, **Discogs**, **MusicBrainz**, and **Audacity**.
- 🖱️ **Contextual Power**: Internal search browser with smart extraction of Disc IDs and Release Codes via a localized right-click menu.
- 🖥️ **Cross-Platform**: Runs on Windows, Mac, and Linux (via Electron).

## Quick Start
1. **Open a File**: Drag and drop or select your `.cue` file.
2. **Edit**: Modify track titles, performers, and timestamps directly in the grid.
3. **Save**: Hit save to overwrite or create a new CUE file.

## Documentation
For more detailed information, please refer to our documentation:

- 📖 **[User Guide](docs/USER_GUIDE.md)** - How to use the application.
- 🛠️ **[Technical Documentation](docs/TECHNICAL.md)** - Architecture, setup, and contribution guide.

## Development

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

### Setup
```bash
npm install
npm run dev
```

---
*Built with ❤️ by NiZDesign*
