import { timeToFrames, framesToTime } from './timeUtils';

export interface CueTrack {
    number: number;
    title: string;
    performer: string;
    index01: number; // Start time in frames
    duration?: number; // Calculated duration in frames (optional in storage, computed in UI)
}

export interface CueSheet {
    title: string;
    performer: string;
    file: string; // The audio file referenced
    date?: string;
    genre?: string;
    totalDuration?: number; // Total duration in frames
    gnucdid?: string;
    discogs?: string; // REM DISCOGS [releaseCode]
    mb_discid?: string; // REM MUSICBRAINZ_DISCID [discId]
    barcode?: string;
    label?: string;
    catalog?: string;
    tracks: CueTrack[];
}

export function parseCue(content: string): CueSheet {
    const lines = content.split(/\r?\n/);
    const cue: CueSheet = {
        title: '',
        performer: '',
        file: '',
        tracks: []
    };

    let currentTrack: CueTrack | null = null;

    const removeQuotes = (s: string) => s.replace(/^"(.*)"$/, '$1');

    lines.forEach(line => {
        const trimmed = line.trim();
        if (!trimmed) return;

        if (trimmed.startsWith('PERFORMER')) {
            const val = removeQuotes(trimmed.substring(9).trim());
            if (currentTrack) currentTrack.performer = val;
            else cue.performer = val;
        } else if (trimmed.startsWith('TITLE')) {
            const val = removeQuotes(trimmed.substring(5).trim());
            if (currentTrack) currentTrack.title = val;
            else cue.title = val;
        } else if (trimmed.startsWith('REM DATE')) {
            const val = removeQuotes(trimmed.substring(8).trim());
            cue.date = val;
        } else if (trimmed.startsWith('REM GENRE')) {
            const val = removeQuotes(trimmed.substring(9).trim());
            cue.genre = val;
        } else if (trimmed.startsWith('REM TOTAL DURATION')) {
            const match = trimmed.match(/^REM TOTAL DURATION\s+(\d+:\d{2}:\d{2})$/);
            if (match) {
                cue.totalDuration = timeToFrames(match[1]);
            }
        } else if (trimmed.startsWith('REM GNUCDID')) {
            const val = removeQuotes(trimmed.substring(12).trim());
            cue.gnucdid = val;
        } else if (trimmed.startsWith('REM DISCOGS')) {
            const val = removeQuotes(trimmed.substring(12).trim());
            cue.discogs = val;
        } else if (trimmed.startsWith('REM MUSICBRAINZ_DISCID')) {
            const val = removeQuotes(trimmed.substring(23).trim());
            cue.mb_discid = val;
        } else if (trimmed.startsWith('REM BARCODE')) {
            const val = removeQuotes(trimmed.substring(11).trim());
            cue.barcode = val;
        } else if (trimmed.startsWith('REM LABEL')) {
            const val = removeQuotes(trimmed.substring(9).trim());
            cue.label = val;
        } else if (trimmed.startsWith('REM CATALOG')) {
            const val = removeQuotes(trimmed.substring(11).trim());
            cue.catalog = val;
        } else if (trimmed.startsWith('FILE')) {
            // FILE "filename" WAVE
            const match = trimmed.match(/^FILE\s+"(.*)"\s+\w+$/);
            if (match) cue.file = match[1];
            else {
                // Try relaxed matching
                const parts = trimmed.split(' ');
                if (parts.length >= 2) {
                    // Assume last part is type, everything in between is filename
                    // but filenames can have spaces.
                    // Regex is safer.
                    const simpleMatch = trimmed.match(/^FILE\s+(.*)\s+\w+$/);
                    if (simpleMatch) cue.file = removeQuotes(simpleMatch[1]);
                }
            }
        } else if (trimmed.startsWith('TRACK')) {
            const match = trimmed.match(/^TRACK\s+(\d+)\s+AUDIO$/);
            if (match) {
                if (currentTrack) {
                    cue.tracks.push(currentTrack);
                }
                currentTrack = {
                    number: parseInt(match[1], 10),
                    title: '',
                    performer: '',
                    index01: 0
                };
            }
        } else if (trimmed.startsWith('INDEX 01')) {
            const match = trimmed.match(/^INDEX 01\s+(\d+:\d{2}:\d{2})$/);
            if (match && currentTrack) {
                currentTrack.index01 = timeToFrames(match[1]);
            }
        }
    });

    if (currentTrack) {
        cue.tracks.push(currentTrack);
    }

    return cue;
}

export function generateCue(cue: CueSheet, version: string = '1.0.18'): string {
    let output = '';
    if (cue.performer) output += `PERFORMER "${cue.performer}"\n`;
    if (cue.title) output += `TITLE "${cue.title}"\n`;
    if (cue.date) output += `REM DATE "${cue.date}"\n`;
    if (cue.genre) output += `REM GENRE "${cue.genre}"\n`;
    if (cue.gnucdid) output += `REM GNUCDID "${cue.gnucdid}"\n`;
    if (cue.discogs) output += `REM DISCOGS "${cue.discogs}"\n`;
    if (cue.mb_discid) output += `REM MUSICBRAINZ_DISCID "${cue.mb_discid}"\n`;
    if (cue.barcode) output += `REM BARCODE "${cue.barcode}"\n`;
    if (cue.label) output += `REM LABEL "${cue.label}"\n`;
    if (cue.catalog) output += `REM CATALOG "${cue.catalog}"\n`;

    if (cue.totalDuration) {
        output += `REM TOTAL DURATION ${framesToTime(cue.totalDuration)}\n`;
    }
    output += `REM Generated by CUEsto ${version}\n`;

    // Determine file type based on extension
    const fileType = cue.file.toLowerCase().endsWith('.mp3') ? 'MP3' : 'WAVE';
    if (cue.file) output += `FILE "${cue.file}" ${fileType}\n`;
    // TODO: better file type handling if needed.

    cue.tracks.forEach(track => {
        output += `  TRACK ${track.number.toString().padStart(2, '0')} AUDIO\n`;
        if (track.title) output += `    TITLE "${track.title}"\n`;
        if (track.performer) output += `    PERFORMER "${track.performer}"\n`;
        output += `    INDEX 01 ${framesToTime(track.index01)}\n`;
    });

    return output;
}

/**
 * Calculates duration given a track index and the list of tracks + total duration (if known)
 * For the last track, duration is unknown unless we have total audio length.
 */
export function calculateDuration(trackIndex: number, tracks: CueTrack[], totalLengthFrames?: number): number {
    const current = tracks[trackIndex];
    if (!current) return 0;

    if (trackIndex < tracks.length - 1) {
        const next = tracks[trackIndex + 1];
        return next.index01 - current.index01;
    } else if (totalLengthFrames) {
        return totalLengthFrames - current.index01;
    }

    return 0; // Unknown
}
