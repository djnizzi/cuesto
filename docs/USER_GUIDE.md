# CUEsto User Guide

## Introduction
CUEsto is a dedicated tool for creating and editing CUE sheets with ease. Whether you need to fix track timings, update metadata, or create a sheet from scratch, CUEsto provides a streamlined interface to get the job done.

## Features
- **Visual Editor**: See your tracks in a clear, table-like layout.
- **Smart Time Editing**: Automatically recalculates durations when you edit start times.
- **Metadata Management**: Update Album Title, Performer, File reference, etc. We might add more if you, the users, request them
- **Audio Integration**: Automatically extract duration and metadata tags (title, artist, year, genre) from your audio files. Full support for multiple artists (separated by `; `).
- **Text Editing**: Perform batch operations across your tracklist, such as swapping fields, changing separators, or converting to propercase.
- **Audio Splitting**: Slice large mix files into individual tracks using the bundled FFmpeg engine.
- **Improved Browser**: Customized internal search browser for MusicBrainz, GnuDB, Discogs and 1001tracklists with navigation controls (Back/Forward) and custom right-click actions.
- **CUE Viewer**: Inspect your raw CUE sheet with built-in syntax highlighting in a separate window.
- **Dark & Light Modes**: Switch between a sleek dark interface or a clean light mode to suit your environment.
- **Multilingual Support**: Fully localized interface in English, German, Spanish, French, and Italian.
- **Top Bar Console**: A centralized header that persists during scrolling, containing all primary file, text editing, and import actions.
- **Improved Workflow**: Start with 9 default tracks, each with a standard 3-minute duration and add and delete track rows instantly.

## Getting Started

### Opening a CUE Sheet
1. Launch CUEsto or double click an existing .cue file and choose to open it with CUEsto.
2. Click the **"Open File"** icon in the **Top Bar** to select an existing `.cue` file.
3. The editor will populate with the tracks and metadata from your file.

### Linking an Audio File
Linking an audio file to your CUE sheet allows CUEsto to provide more accurate information.
1. Click the **Disc Icon** next to the "file name" field in the header.
2. Select your audio file (MP3, WAV, FLAC, etc.).
3. CUEsto will:
   - Extract and populate the **Title**, **Performer**, **Date**, and **Genre** from the file's metadata tags.
   - **Multi-Artist Support**: If the file contains multiple artists or album artists, they are automatically detected and joined with `; ` in the editor.
   - Display the precise **Total Duration** of the audio file.
   - Automatically calculate the duration of the **Final Track**.
   - Suggest the audio filename as the default when saving.

### Importing from 1001tracklists
CUEsto integrates directly with **1001tracklists.com** through its built-in browser.
1. In CUEsto, click the **1001tracklists** logo in the **Top Bar** imports section to open the internal browser.
2. Search for and navigate to the tracklist page you want to import.
3. Click the **import** icon in the browser's top bar.
4. The grid will automatically populate with metadata and tracks from the page.
5. Sometimes 1001tracklists may not provide exact timings. In these cases, CUEsto will import the track titles and performers but leave the timing fields empty for you to fill in manually. No way around it, sorry.

### Importing from GnuDB
You can quickly retrieve high-quality metadata from the **GnuDB** database using a CD ID.
1. In CUEsto, click the **GnuDB** logo (or press the corresponding icon).
2. A modal window will appear displaying the current **performer** and **album title** being searched.
3. **Search Link**: The modal includes a "search on gnudb.org" link. Clicking this opens a **Custom Internal Browser**.
4. **Selective Overwrite**: Before fetching, you can use the checkboxes to choose exactly which fields to update:
   - **Header**: Artist, Album Title, Year, Genre.
   - **Track Titles**: Updates titles for all tracks.
   - **Track Performers**: Updates performers for all tracks.
   - **Start Times/Durations**: Updates indices/timings.
5. **Auto-Fallback**: If a field in your CUE sheet is currently empty, GnuDB will always populate it regardless of your checkbox selections.
6. Enter the **GnuDB CD ID** (e.g., `860a8c86`) and click the **get metadata** icon.
7. CUEsto will fetch the requested metadata directly into the editor.
8. **Persistence**: When you import from GnuDB, CUEsto automatically saves the CD ID as a `REM GNUCDID` line in your CUE file.
9. **Import Icons**: GnuDB, Discogs, MusicBrainz, and other import tools are located in the **Top Bar** under the "Get data from" label.

### Importing from Discogs
CUEsto provides a powerful integration with **Discogs**, the premier music database. 

**Note**: You must connect your Discogs account before using this feature. See the [Connecting to Discogs](#connecting-to-discogs) section below.

1. In CUEsto, click the **Discogs** logo.
2. A modal window appears showing the **performer** and **album title** CUEsto is searching for.
3. **Search Link**: Click "search on discogs.com" to open the internal browser.
4. **Release Code**: Enter the numeric release ID (e.g., `153184`). CUEsto also accepts common formats like `r153184`.
5. **Disc # (Optional)**: For multi-disc releases, specify which disc to import.
6. **Selective Overwrite**: Choose exactly what you want to import:
   - **Header**: Artist, Album Title, Year, Genre.
   - **Track Titles**: Updates titles for all imported tracks.
   - **Track Performers**: Updates performers for all imported tracks.
   - **Start Times/Durations**: Updates indices/timings using raw durations.
   - **Interpolate Start Times/Durations**: (Requires a linked audio file) Uses total length to adjust Discogs track durations for high-precision start times.
7. **Persistence**: The release ID is saved as a `REM DISCOGS` line.

### Importing from MusicBrainz
You can import extremely detailed metadata (including barcode and label info) from **MusicBrainz**.
1. In CUEsto, click the **MusicBrainz** logo.
2. Like other modals, it shows what you are searching for and provides a "search on musicbrainz.org" link.
3. **Disc ID**: Enter the MusicBrainz Disc ID (e.g., `qT8E_p...`).
4. **Selective Overwrite**: Customize your import (Header, Titles, Performers, Timings) just like with other sources.
5. **Persistence**: The Disc ID is saved as a `REM MUSICBRAINZ_DISCID` line.
6. **Enhanced Metadata**: CUEsto automatically captures `BARCODE`, `LABEL`, and `CATALOG` number, storing them as `REM` lines.

## Internal Browser and Context Menu
CUEsto features a customized internal browser that makes finding metadata IDs effortless.
- **Smart Extraction**: When right-clicking on specific items within GnuDB, Discogs, or MusicBrainz, CUEsto offers specialized actions:
    - **"use this disc id"**: Automatically sends the CD TOC/Disc ID to the MusicBrainz modal.
    - **"use this release code"**: Automatically sends the release ID (prefixed with 'r') to the Discogs modal.
    - **"use this gnucdid"**: Automatically sends the CDID to the GnuDb modal.
- **Navigation**: The browser header includes **Back** and **Forward** buttons.
- **Standard Actions**: Localized right-click options for **"copy"**, **"copy link"**, and **"open in new window"**.

### Importing from Audacity
CUEsto supports importing timing and label data from **Audacity Labels** files.
1. In Audacity, ensure your labels are set up (`Tracks` -> `Add New` -> `Label Track`).
2. Export your labels (`File` -> `Export` -> `Export Labels...`) as a `.txt` file.
3. In CUEsto, click the **Audacity** logo.
4. Select the exported `.txt` file.
5. **Conditional Update**:
   - **Start Times**: All track timings are unconditionally updated from the Audacity file.
   - **Titles/Performers**: These are only updated if the current fields in CUEsto are empty. This allows you to re-sync timings from Audacity without losing any manual track naming corrections you've made in the editor.

### Splitting Audio
CUEsto includes a built-in audio splitting engine based on FFmpeg. You can slice a single large audio file into individual tracks based on your CUE sheet.
1. **Link the Audio File**: Follow the steps in the [Linking an Audio File](#linking-an-audio-file) section.
2. **Review Timings**: Ensure your track start times and durations are correct in the grid.
3. **Click Split**: Click the **Scissors** icon in the **Top Bar**.
4. **Monitor Progress**: A dedicated modal will appear showing the progress of each track being created.
5. **Direct Output**: Tracks are saved in the same directory as the source file using the naming convention: `Track## - Title.ext`.
6. **Actions**: Once complete, you can click the **Open Folder** icon to jump directly to your new files in Windows Explorer.

### Editing Tracks
- **Title/Performer**: Click directly on the text fields to edit the track title or performer.
- **Start Time**: Edit the start time of a track. The duration of the previous track will be automatically recalculated.
- **Duration**: You can edit the duration of a track. Changing a track's duration will shift the start times of all subsequent tracks to maintain continuity.
- **Final Track Duration**: 
  - If an audio file is linked, the duration of the final track is calculated automatically.
  - If a `REM TOTAL DURATION` line is present in the CUE file, CUEsto will use it to display the total length and final track duration even without the audio file.
  - **Smart Visibility**: If neither an audio file nor a duration tag is available, the duration field for the final track is hidden to prevent confusion.
- **Add/Remove/Clear**: 
  - **Add Row**: Click the **add row** icon at the bottom of the tracklist to add a new track with a default 3-minute duration.
  - **Trash Icon**: Click the **trash icon** on any track to remove it instantly.
  - **Clear Editor**: Click the **clear** icon in the **Top Bar** to reset the entire cue sheet. A confirmation modal will appear to prevent accidental data loss.
  - **Track Initialization**: The application opens with 9 default tracks pre-spaced by 3:00:00.

### Text Editing Tools
CUEsto provides batch editing tools to normalize your track metadata. Click the **Edit** icon in the **Top Bar** to open the Text Editing Modal.
- **Change Separator**: Scan all track performers and change a specific separator (e.g., from `,` to `;`). Default values are `,` and `;`.
- **Split Titles to Title and Performer**: If your track titles contain the performer name (e.g., "Song Name - Artist"), you can automatically split them. Specify the separator (e.g., `-`) and CUEsto will move the artist part to the Performer field.
- **Swap Track Titles and Performers**: Quickly flip the contents of the Title and Performer fields for all tracks.
- **Change to Propercase**: Automatically convert all track titles and performers to "Propercase" (e.g., "SONG NAME" becomes "Song Name").

### Viewing the Raw CUE Sheet
If you want to inspect or verify the raw CUE sheet text before saving:
1. Click the **"view cue"** icon at the bottom of the editor.
2. A new read-only window will open displaying the formatted CUE content.
3. **Syntax Highlighting**: The viewer uses specific colors to help you identify CUE commands:
   - **Green**: Metadata comments (`REM` lines).
   - **Red**: Track definitions (`TRACK`).
   - **Magenta**: Timing indices (`INDEX`).
   - **Cyan**: Artist information (`PERFORMER`).
   - **Yellow**: Track and Album titles (`TITLE`).
   - **Blue**: File references (`FILE`).

### Settings and Personalization
You can customize your CUEsto experience through the **Settings Modal**.
1. Click the **Language/Settings (Globe)** icon in the right side of the **Top Bar**.
2. **Language Selection**: Choose your preferred language (English, Deutsch, Español, Français, or Italiano). All interface elements and tooltips will update immediately.
3. **Theme Toggle**: Switch between **Light Mode** (Sun icon) and **Dark Mode** (Moon icon). Your preference is saved automatically and persists when you restart the application.

### Connecting to Discogs
To use the Discogs import feature, you must connect your Discogs account using OAuth authentication.
1. Click the **Language/Settings (Globe)** icon in the right side of the **Top Bar**.
2. In the Settings modal, scroll down to the **Discogs Account** section.
3. Click the **Connect to Discogs** button.
4. Your default web browser will open to the Discogs authorization page.
5. Log in to your Discogs account and authorize CUEsto.
6. Once authorized, the Discogs section will show your username.
7. You can now use the Discogs import feature in the Top Bar.
8. To disconnect, click the **Disconnect** button in the Settings modal.

**Note**: The Discogs import button in the Top Bar will be disabled (dimmed) until you connect your account.

## Tips
- **Time Format**: Times are displayed in `MM:SS:FF` (Frames). CUE sheets use 75 frames per second.
- **File Reference**: Ensure the "File" field matches the actual audio file name (e.g., `mix.mp3`) so apps that CUE sheets can find the audio.
