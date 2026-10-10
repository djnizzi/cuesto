export const FRAMES_PER_SECOND = 75;

/**
 * Longest timing addressable in the Red Book (CD-DA) standard: 79:59:74.
 * The standard requires MM to stay within 00-79, so a disc (or file) longer
 * than this cannot be described by a compliant MM:SS:FF value.
 */
export const REDBOOK_MAX_FRAMES = (79 * 60 + 59) * FRAMES_PER_SECOND + (FRAMES_PER_SECOND - 1); // 359999

/**
 * Checks whether a frame count can be expressed within the Red Book (CD-DA)
 * 79:59:74 limit, i.e. whether zero-padding its minutes stays meaningful.
 */
export function isRedbookCompliant(frames: number | undefined | null): boolean {
    if (frames === undefined || frames === null) return false;
    if (!Number.isFinite(frames) || frames < 0) return false;
    return frames <= REDBOOK_MAX_FRAMES;
}

/**
 * Converts a time string (MM:SS:FF) to absolute frames.
 * Relaxed parsing: Minutes can be > 99.
 */
export function timeToFrames(timeStr: string): number {
    const parts = timeStr.split(':').map(Number);
    if (parts.some(isNaN)) return 0; // or throw error

    let m = 0, s = 0, f = 0;
    if (parts.length === 3) {
        [m, s, f] = parts;
    } else if (parts.length === 2) {
        [m, s] = parts;
    } else if (parts.length === 1) {
        [s] = parts; // Ambiguous, but assuming seconds if only one number? or Frames? CUE usually MM:SS:FF. Let's assume 00:00:FF if just one number? No, usually MM:SS:FF is strict.
        // For safety, let's treat single number as index (bad idea). 
        // Let's stick to strict 3 parts or 2 parts (MM:SS).
    }

    return (m * 60 * FRAMES_PER_SECOND) + (s * FRAMES_PER_SECOND) + f;
}

/**
 * Converts absolute frames to time string (MM:SS:FF).
 * FF is always 2 digits, SS is always 2 digits.
 * MM is zero-padded to 2 digits by default (Red Book compliant).
 * Minutes are never truncated: 105 minutes stays "105", it is only padded up to
 * the 2 digits the standard requires.
 * @param padMinutes set to false for timings beyond the Red Book 79:59 limit.
 */
export function framesToTime(frames: number, padMinutes: boolean = true): string {
    if (frames < 0) frames = 0;

    const f = frames % FRAMES_PER_SECOND;
    let remainingSeconds = Math.floor(frames / FRAMES_PER_SECOND);
    const s = remainingSeconds % 60;
    const m = Math.floor(remainingSeconds / 60);

    const format = (n: number) => n.toString().padStart(2, '0');

    return `${padMinutes ? format(m) : m}:${format(s)}:${format(f)}`;
}

/**
 * Converts MM:SS or HH:MM:SS to absolute seconds.
 */
export function mmssToSeconds(duration: string): number {
    if (!duration) return 0;
    const parts = duration.split(':').map(Number);
    if (parts.length === 2) {
        return parts[0] * 60 + parts[1];
    } else if (parts.length === 3) {
        return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    return 0;
}

/**
 * Validates if the string is in MM:SS:FF format or M:SS:FF
 */
export function isValidTimeFormat(str: string): boolean {
    return /^\d+:\d{2}:\d{2}$/.test(str);
}
export interface AudacityTrack {
    title: string;
    performer: string;
    index01: number; // in frames
}

/**
 * Parses an Audacity labels file (tab-separated: start \t end \t label).
 * Following the logic in functions.py:
 * - First track always starts at 00:00:00.
 * - Subsequent tracks start at the time specified in the labels file.
 */
export function parseAudacityLabels(content: string): AudacityTrack[] {
    const tracks: AudacityTrack[] = [];
    const lines = content.split(/\r?\n/).filter(line => line.trim() !== '');

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const parts = line.split('\t');
        if (parts.length < 3) continue;

        const startTime = parseFloat(parts[0]);
        const label = parts[2].trim();

        let artist = 'Artist';
        let song = label;
        if (label.includes(' - ')) {
            const labelParts = label.split(' - ');
            artist = labelParts[0].trim();
            song = labelParts.slice(1).join(' - ').trim();
        }

        if (!song) song = `Title ${i + 1}`;

        // First track starts at 0, others start at their specified time
        const actualStartTime = i === 0 ? 0 : startTime;

        tracks.push({
            title: song,
            performer: artist,
            index01: Math.floor(actualStartTime * 75)
        });
    }

    return tracks;
}
