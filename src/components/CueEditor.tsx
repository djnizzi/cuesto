import React, { useState } from 'react';
import { MetadataHeader } from './MetadataHeader';
import { TrackRow } from './TrackRow';
import { MusicBrainzModal } from './MusicBrainzModal';
import { musicbrainzToCue, MusicBrainzResult } from '../lib/musicbrainz';
import { CueSheet, CueTrack, generateCue, parseCue } from '../lib/cueParser';
import { timeToFrames, parseAudacityLabels } from '../lib/timeUtils';
import { parse1001Tracklist } from '../lib/tracklistParser';
import { GnuDbModal } from './GnuDbModal';
import { GnuDbResult, OverwriteOptions } from '../lib/gnudb';
import { DiscogsModal } from './DiscogsModal';
import { DiscogsOptions, DiscogsResult, interpolateTimings, discogsTracksToCueTracks } from '../lib/discogs';
import { ConfirmModal } from './ConfirmModal';
import { SplitProgressModal } from './SplitProgressModal';
import { AlertModal } from './AlertModal';
import { LanguageSelector } from './LanguageSelector';
import { SettingsModal } from './SettingsModal';
import { TracklistModal, TracklistOptions } from './TracklistModal';
import { AboutModal } from './AboutModal';
import { TextEditingModal } from './TextEditingModal';
import { Language, getCurrentLanguage, getTranslations } from '../lib/i18n';
import { useTheme } from '../lib/themeContext';

type MusicBrainzOptions = DiscogsOptions;

// Dummy initial state or empty
const INITIAL_CUE: CueSheet = {
    title: '',
    performer: '',
    file: '',
    tracks: Array.from({ length: 9 }, (_, i) => ({
        number: i + 1,
        title: '',
        performer: '',
        index01: i * 13500 // 3:00:00 default duration
    }))
};

export const CueEditor: React.FC = () => {
    const { theme } = useTheme();
    const [cue, setCue] = useState<CueSheet>(INITIAL_CUE);
    const [showToast, setShowToast] = useState(false);
    const [currentFilePath, setCurrentFilePath] = useState<string | null>(null);
    const [isSplitting, setIsSplitting] = useState(false);
    const [isSplitModalOpen, setIsSplitModalOpen] = useState(false);

    // Modal States
    const [alertModal, setAlertModal] = useState<{ isOpen: boolean, title: string, message: string, okTooltip?: string }>({
        isOpen: false,
        title: '',
        message: '',
        okTooltip: 'ok'
    });
    const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean, title: string, message: string, onConfirm: () => void, confirmTooltip?: string, cancelTooltip?: string }>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
        confirmTooltip: 'confirm',
        cancelTooltip: 'cancel'
    });
    const [isGnuDbModalOpen, setIsGnuDbModalOpen] = useState(false);
    const [isDiscogsModalOpen, setIsDiscogsModalOpen] = useState(false);
    const [isMusicBrainzModalOpen, setIsMusicBrainzModalOpen] = useState(false);
    const [isTracklistModalOpen, setIsTracklistModalOpen] = useState(false);
    const [discogsConnected, setDiscogsConnected] = useState(false);
    const [importHtml, setImportHtml] = useState<string | null>(null);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [isTextEditingModalOpen, setIsTextEditingModalOpen] = useState(false);
    const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
    const [appVersion, setAppVersion] = useState('1.0.22');
    const [fullAudioPath, setFullAudioPath] = useState<string | null>(null);
    const [hasAttemptedSplit, setHasAttemptedSplit] = useState(false);
    const [splitProgress, setSplitProgress] = useState<{ progress: number, currentTrack: number, totalTracks: number, fileName: string } | null>(null);
    const [currentLanguage, setCurrentLanguage] = useState<Language>(getCurrentLanguage());
    const t = getTranslations(currentLanguage);

    React.useEffect(() => {
        if ((window as any).ipcRenderer) {
            (window as any).ipcRenderer.send('app:sync-language', currentLanguage);
        }
    }, [currentLanguage]);

    // Check Discogs auth status on mount
    React.useEffect(() => {
        const checkDiscogsAuth = async () => {
            if ((window as any).ipcRenderer) {
                try {
                    const result = await (window as any).ipcRenderer.invoke('discogs:getAuthStatus');
                    setDiscogsConnected(result.connected);
                } catch (e) {
                    console.error('Failed to check Discogs auth:', e);
                }
            }
        };
        checkDiscogsAuth();
    }, []);

    const handleLanguageChange = (lang: Language) => {
        setCurrentLanguage(lang);
    };

    const showSaveToast = () => {
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    const handleUpdateMetadata = (field: string, value: string) => {
        setCue(prev => ({
            ...prev,
            [field === 'fileName' ? 'file' : field]: value
        }));
    };

    const showAlert = (title: string, message: string, okTooltip?: string) => {
        setAlertModal({ isOpen: true, title, message, okTooltip: okTooltip || t.ok });
    };

    const showConfirm = (title: string, message: string, onConfirm: () => void, confirmTooltip?: string, cancelTooltip?: string) => {
        setConfirmModal({
            isOpen: true,
            title,
            message,
            onConfirm,
            confirmTooltip: confirmTooltip || t.confirm,
            cancelTooltip: cancelTooltip || t.cancel
        });
    };

    React.useEffect(() => {
        const titleSuffix = currentFilePath
            ? ` | ${currentFilePath.replace(/^.*[\\/]/, '')}`
            : ` | ${t.newCueFile}`;
        document.title = `CUEsto ${appVersion}${titleSuffix}`;
    }, [appVersion, currentFilePath, t]);

    React.useEffect(() => {
        console.log('CueEditor mounted');
        const setAppTitle = async () => {
            try {
                if ((window as any).ipcRenderer) {
                    const version = await (window as any).ipcRenderer.invoke('getAppVersion');
                    setAppVersion(version);
                }
            } catch (e) {
                console.error('Failed to get app version', e);
            }
        };
        setAppTitle();

        // Check for pending startup file (Main process 'pull' model)
        const checkPendingFile = async () => {
            if ((window as any).ipcRenderer) {
                try {
                    const data = await (window as any).ipcRenderer.invoke('app:check-pending-file');
                    if (data && data.content) {
                        const parsed = parseCue(data.content);
                        setCue(parsed);
                        if (data.filepath) {
                            setCurrentFilePath(data.filepath);
                        }
                        if (data.audioPath) {
                            setFullAudioPath(data.audioPath);
                            setHasAttemptedSplit(false);
                        }
                    }
                } catch (e) {
                    console.error('Failed to check pending file', e);
                }
            }
        };
        checkPendingFile();

        // Listen for file-opened event from main process (File Association - Runtime)
        if ((window as any).ipcRenderer) {
            (window as any).ipcRenderer.on('file-opened', (_: any, data: { content: string, filePath: string, audioPath?: string }) => {
                if (data && data.content) {
                    const parsed = parseCue(data.content);
                    setCue(parsed);
                    if (data.filePath) {
                        setCurrentFilePath(data.filePath);
                    }
                    if (data.audioPath) {
                        setFullAudioPath(data.audioPath);
                        setHasAttemptedSplit(false);
                    }
                }
            });
        }

        // Listen for splitting events
        if ((window as any).ipcRenderer) {
            (window as any).ipcRenderer.on('audio:split-progress', (_: any, data: any) => {
                setSplitProgress(data);
                setIsSplitModalOpen(true);
            });
            (window as any).ipcRenderer.on('audio:split-complete', () => {
                setIsSplitting(false);
                // We keep splitProgress so the modal shows 100% and totalTracks
                setSplitProgress(prev => prev ? { ...prev, progress: 100 } : null);
                // The modal will remain open showing completion, user closes it.
            });
            (window as any).ipcRenderer.on('audio:split-error', (_: any, error: string) => {
                setIsSplitting(false);
                setIsSplitModalOpen(false); // Close the progress modal on error
                setSplitProgress(null);
                showAlert(t.splittingError, error);
            });

            (window as any).ipcRenderer.on('1001tracklists:import-html', (_: any, html: string) => {
                try {
                    const parsed = parse1001Tracklist(html);
                    handleTracklistSuccess(parsed, {
                        header: false,
                        trackTitles: true,
                        trackPerformers: true,
                        timings: true
                    });
                    setImportHtml(null);
                    setIsTracklistModalOpen(false);
                } catch (e: any) {
                    console.error('Failed to auto-import 1001tracklists', e);
                    showAlert(t.importFailed, e.message);
                }
            });
        }

        // Cleanup? 
        return () => {
            if ((window as any).ipcRenderer) {
                (window as any).ipcRenderer.removeAllListeners('file-opened');
                (window as any).ipcRenderer.removeAllListeners('audio:split-progress');
                (window as any).ipcRenderer.removeAllListeners('audio:split-complete');
                (window as any).ipcRenderer.removeAllListeners('audio:split-error');
            }
        };
    }, []);

    const handleTrackUpdate = (index: number, field: keyof CueTrack, value: any) => {
        setCue(prev => {
            const newTracks = [...prev.tracks];
            newTracks[index] = { ...newTracks[index], [field]: value };
            return { ...prev, tracks: newTracks };
        });
    };

    const handleStartTimeChange = (index: number, newTimeStr: string) => {
        const newFrames = timeToFrames(newTimeStr);
        setCue(prev => {
            const newTracks = [...prev.tracks];
            // Logic: Move this track. Do NOT move subsequent tracks.
            // Constraint: Must be > Prev Start and < Next Start.
            // But we can relax constraints or warn. For now just set it.
            newTracks[index] = { ...newTracks[index], index01: newFrames };
            // Sort tracks? Usually CUE must be sorted. 
            // User might want to reorder by changing time? 
            // Let's keep order fixed for now, sorting index01 might act as reorder.
            return { ...prev, tracks: newTracks };
        });
    };

    const handleDurationChange = (index: number, newDurationStr: string) => {
        const durationFrames = timeToFrames(newDurationStr);
        setCue(prev => {
            const newTracks = [...prev.tracks];
            if (index >= newTracks.length) return prev; // Should not happen

            // Duration of track[i] = track[i+1].index - track[i].index
            // We want newDuration. So track[i+1].index should become track[i].index + newDuration
            // And we shift all subsequent tracks by the delta to preserve their relative durations?
            // "Editing Duration shifts the Start Time of all subsequent tracks." => Yes.

            // However, last track duration implies Total Length. If last track, we can't really shift "next start".
            // We just store/render. But CUE format doesn't natively store duration for last track unless we have total.
            // If it's the last track, we probably just can't do much unless we track total audio duration.
            // For now, ignore last track duration change or treat as metadata?

            if (index === newTracks.length - 1) {
                // Last track. Nothing to shift. 
                // Maybe just store it in ephemeral state or ignore?
                // User requirement: "Edit a large duration (e.g., 105:00:00). Verify it is accepted."
                // This suggests we might just update "Total Length" implicitly?
                return prev;
            }

            const currentStart = newTracks[index].index01;
            const nextStartWrapper = newTracks[index + 1].index01;
            const currentDuration = nextStartWrapper - currentStart;
            const diff = durationFrames - currentDuration;

            // Shift all subsequent tracks by diff
            for (let i = index + 1; i < newTracks.length; i++) {
                newTracks[i].index01 += diff;
            }

            return { ...prev, tracks: newTracks };
        });
    };

    const handleDeleteTrack = (index: number) => {
        const newTracks = [...cue.tracks];
        newTracks.splice(index, 1);
        // Re-number
        newTracks.forEach((track, i) => track.number = i + 1);
        setCue(prev => ({ ...prev, tracks: newTracks }));
    };

    const handleAddRow = () => {
        setCue(prev => {
            const lastTrack = prev.tracks[prev.tracks.length - 1];
            const newStart = lastTrack ? lastTrack.index01 + 13500 : 0; // Default add 3:00:00
            return {
                ...prev,
                tracks: [
                    ...prev.tracks,
                    {
                        number: prev.tracks.length + 1,
                        title: '',
                        performer: '',
                        index01: newStart
                    }
                ]
            };
        });
    };

    const handleClear = () => {
        showConfirm(t.clearAll, t.clearAllConfirm, confirmClear, t.clearAll, t.cancel);
    };

    const confirmClear = () => {
        setCue(INITIAL_CUE);
        setCurrentFilePath(null);
        setFullAudioPath(null);
        setHasAttemptedSplit(false);
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
    };

    const handleOpenFile = async () => {
        try {
            if (!(window as any).ipcRenderer) return;
            const result = await (window as any).ipcRenderer.invoke('dialog:openFile');
            if (result) {
                setHasAttemptedSplit(false);
                const { content, filepath, audioPath } = result;
                const parsed = parseCue(content);
                setCue(parsed);
                setCurrentFilePath(filepath);
                if (audioPath) {
                    setFullAudioPath(audioPath);
                }
            }
        } catch (e) {
            console.error(e);
            showAlert(t.errorOpeningFile, `Failed to open file: ${(e as any).message || e}`);
        }
    };

    const handleSelectAudioFile = async () => {
        try {
            if (!(window as any).ipcRenderer) return;
            const result = await (window as any).ipcRenderer.invoke('dialog:openAudioFile');
            if (result) {
                const { filename, filepath, durationFrames, metadata, error } = result;
                if (error) {
                    showAlert(t.error, error);
                }
                setFullAudioPath(filepath);
                setHasAttemptedSplit(false);
                setCue(prev => ({
                    ...prev,
                    file: filename,
                    totalDuration: durationFrames,
                    performer: metadata?.artist || prev.performer,
                    title: metadata?.title || prev.title,
                    date: metadata?.year || prev.date,
                    genre: metadata?.genre || prev.genre
                }));
            }
        } catch (e) {
            console.error('Failed to select audio file', e);
            showAlert(t.errorSelectingAudio, `Failed to select audio file: ${(e as any).message || e}`);
        }
    };

    const handleImport = async (source: string) => {
        if (source === '1001tracklists') {
            setIsTracklistModalOpen(true);
        } else if (source === 'gnudb') {
            setIsGnuDbModalOpen(true);
        } else if (source === 'discogs') {
            setIsDiscogsModalOpen(true);
        } else if (source === 'audacity') {
            try {
                if (!(window as any).ipcRenderer) return;
                const result = await (window as any).ipcRenderer.invoke('dialog:openLabels');
                if (result) {
                    const { content } = result;
                    const audacityTracks = parseAudacityLabels(content);
                    setCue(prev => ({
                        ...prev,
                        tracks: audacityTracks.map((at, i) => {
                            const prevTrack = prev.tracks[i];
                            return {
                                number: i + 1,
                                title: (prevTrack?.title && prevTrack.title.trim()) ? prevTrack.title : at.title,
                                performer: (prevTrack?.performer && prevTrack.performer.trim()) ? prevTrack.performer : at.performer,
                                index01: at.index01
                            };
                        })
                    }));
                }
            } catch (e) {
                console.error('Audacity import failed', e);
                showAlert(t.audacityImportFailed, `Failed to import Audacity labels: ${(e as any).message || e}`);
            }
        } else if (source === 'musicbrainz') {
            setIsMusicBrainzModalOpen(true);
        } else {
            console.log('Import source not implemented:', source);
            showAlert(t.importNotImplemented, `Import from '${source}' is not yet implemented.`);
        }
    };

    const handleTracklistSuccess = (parsed: CueSheet, options: TracklistOptions) => {
        setCue(prev => {
            const newCue = { ...prev };

            if (options.header) {
                newCue.performer = parsed.performer || prev.performer;
                newCue.title = parsed.title || prev.title;
                newCue.date = parsed.date || prev.date;
                newCue.genre = parsed.genre || prev.genre;
            }

            if (options.trackTitles || options.trackPerformers || options.timings) {
                newCue.tracks = parsed.tracks.map((pTrack, i) => {
                    const prevTrack = prev.tracks[i];
                    return {
                        number: pTrack.number,
                        title: (options.trackTitles || !prevTrack?.title) ? pTrack.title : (prevTrack?.title || pTrack.title),
                        performer: (options.trackPerformers || !prevTrack?.performer) ? pTrack.performer : (prevTrack?.performer || pTrack.performer),
                        index01: (options.timings || prevTrack?.index01 === undefined) ? pTrack.index01 : (prevTrack?.index01 || pTrack.index01)
                    };
                });
            }

            return newCue;
        });
    };

    const handleTextEditingSuccess = (updatedTracks: CueTrack[]) => {
        setCue(prev => ({
            ...prev,
            tracks: updatedTracks
        }));
    };

    const handleMusicBrainzSuccess = (data: MusicBrainzResult, options: MusicBrainzOptions) => {
        const mbCue = musicbrainzToCue(data);

        setCue(prev => {
            const newCue = { ...prev };
            newCue.mb_discid = mbCue.mb_discid;
            newCue.barcode = mbCue.barcode;
            newCue.label = mbCue.label;
            newCue.catalog = mbCue.catalog;

            if (options.header || !prev.performer) newCue.performer = mbCue.performer || prev.performer;
            if (options.header || !prev.title) newCue.title = mbCue.title || prev.title;
            if (options.header || !prev.date) newCue.date = mbCue.date || prev.date;
            if (options.header || !prev.genre) newCue.genre = mbCue.genre || prev.genre;

            if (options.trackTitles || options.trackPerformers || options.timings || prev.tracks.length === 0) {
                let finalTracks = mbCue.tracks || [];

                if (options.interpolate && prev.totalDuration && finalTracks.length > 0) {
                    // Inject durations for interpolation if missing
                    const tracksWithDurations = finalTracks.map((t, i) => {
                        const next = finalTracks[i + 1];
                        const duration = next ? next.index01 - t.index01 : 0;
                        return { ...t, duration };
                    });
                    finalTracks = interpolateTimings(tracksWithDurations, prev.totalDuration);
                }

                newCue.tracks = finalTracks.map((mTrack, i) => {
                    const prevTrack = prev.tracks[i];
                    return {
                        number: mTrack.number,
                        title: (options.trackTitles || !prevTrack?.title) ? mTrack.title : (prevTrack?.title || mTrack.title),
                        performer: (options.trackPerformers || !prevTrack?.performer) ? mTrack.performer : (prevTrack?.performer || mTrack.performer),
                        index01: (options.timings || prevTrack?.index01 === undefined) ? mTrack.index01 : (prevTrack?.index01 || mTrack.index01)
                    };
                });
            }

            return newCue;
        });
    };

    const handleGnuDbSuccess = (result: GnuDbResult, options: OverwriteOptions) => {
        setCue(prev => {
            const newCue = { ...prev };

            // Store the source CD ID
            newCue.gnucdid = result.id;

            // Header: Update if option checked OR if current value is missing/empty
            if (options.header || !prev.performer) newCue.performer = result.artist;
            if (options.header || !prev.title) newCue.title = result.album;
            if (options.header || !prev.date) newCue.date = result.year || prev.date;
            if (options.header || !prev.genre) newCue.genre = result.genre || prev.genre;

            // Tracks: We use the GnuDB tracklist if any track change is requested OR if current tracklist is empty
            if (options.trackTitles || options.trackPerformers || options.timings || prev.tracks.length === 0) {
                newCue.tracks = result.tracks.map((gTrack, i) => {
                    const prevTrack = prev.tracks[i];
                    return {
                        number: gTrack.number,
                        // Update if option checked OR if current value is missing/empty
                        title: (options.trackTitles || !prevTrack?.title) ? gTrack.title : (prevTrack?.title || gTrack.title),
                        performer: (options.trackPerformers || !prevTrack?.performer) ? gTrack.performer : (prevTrack?.performer || gTrack.performer),
                        index01: (options.timings || prevTrack?.index01 === undefined) ? gTrack.index01 : (prevTrack?.index01 || gTrack.index01)
                    };
                });
            }

            return newCue;
        });
    };

    const handleDiscogsSuccess = (result: DiscogsResult, options: DiscogsOptions) => {
        setCue(prev => {
            const newCue = { ...prev };

            // Header: Update if option checked OR if current value is missing/empty
            if (options.header || !prev.performer) newCue.performer = result.artist;
            if (options.header || !prev.title) newCue.title = result.album;
            if (options.header || !prev.date) newCue.date = result.year || prev.date;
            if (options.header || !prev.genre) newCue.genre = result.genre || prev.genre;

            // Store Discogs release code
            if (result.releaseCode) {
                newCue.discogs = result.releaseCode;
            }

            // Filter tracks by Disc # if provided
            let discTracks = result.tracks;
            if (options.discNumber) {
                const prefix = `${options.discNumber}-`;
                discTracks = result.tracks.filter(t => t.position.startsWith(prefix));
                // If discTracks is empty, it might mean the position format is different or only one disc
                if (discTracks.length === 0) discTracks = result.tracks;
            }

            // Tracks: Update if any track change is requested OR if current tracklist is empty/initial
            const isInitial = prev.tracks.length === 1 && !prev.tracks[0].title && !prev.tracks[0].performer && prev.tracks[0].index01 === 0;
            if (options.trackTitles || options.trackPerformers || options.timings || options.interpolate || isInitial) {
                let newTracks: CueTrack[] = [];

                if (options.interpolate && prev.totalDuration) {
                    newTracks = interpolateTimings(discTracks as any, prev.totalDuration);
                } else {
                    newTracks = discogsTracksToCueTracks(discTracks);
                }

                newCue.tracks = newTracks.map((nt, i) => {
                    const prevTrack = prev.tracks[i];

                    // Determine final values index-by-index
                    const finalTitle = (options.trackTitles || !prevTrack?.title) ? (nt.title || 'Untitled') : prevTrack.title;
                    const finalPerformer = (options.trackPerformers || !prevTrack?.performer) ? (nt.performer || '') : prevTrack.performer;
                    const finalIndex = (options.timings || options.interpolate || prevTrack?.index01 === undefined) ? nt.index01 : prevTrack.index01;

                    return {
                        number: nt.number,
                        title: finalTitle,
                        performer: finalPerformer,
                        index01: finalIndex
                    };
                });
            }

            return newCue;
        });
    };

    const handleSave = async () => {
        const data = generateCue(cue, appVersion);
        try {
            if (!(window as any).ipcRenderer) return;

            if (currentFilePath) {
                // Overwrite existing file
                const success = await (window as any).ipcRenderer.invoke('dialog:saveFile', data, currentFilePath);
                if (success) {
                    showSaveToast();
                }
            } else {
                // No path known, do Save As
                await handleSaveAs();
            }
        } catch (e) {
            console.error(e);
            showAlert(t.errorSaving, `Failed to save file: ${(e as any).message || e}`);
        }
    };

    const handleSaveAs = async () => {
        const data = generateCue(cue, appVersion);
        let baseName = `${cue.performer} - ${cue.title}`;
        if (cue.file) {
            const lastDot = cue.file.lastIndexOf('.');
            baseName = lastDot > 0 ? cue.file.substring(0, lastDot) : cue.file;
        }
        const suggestedName = `${baseName}.cue`.replace(/[\\/:"*?<>|]/g, ''); // Clean filename
        try {
            if (!(window as any).ipcRenderer) return;
            const savedPath = await (window as any).ipcRenderer.invoke('dialog:saveFile', data, suggestedName);
            if (savedPath && typeof savedPath === 'string') {
                setCurrentFilePath(savedPath);
                showSaveToast();
            } else if (savedPath === true) {
                // Should not really happen with name passed but for safety
                showSaveToast();
            }
        } catch (e) {
            console.error(e);
            showAlert(t.errorSaveAs, `Failed to save file: ${(e as any).message || e}`);
        }
    };

    const handleViewCue = () => {
        if (!(window as any).ipcRenderer) return;
        const data = generateCue(cue, appVersion);
        (window as any).ipcRenderer.invoke('window:open-viewer', data);
    };

    const handleOpenFolder = async () => {
        if (!(window as any).ipcRenderer || !fullAudioPath) return;
        try {
            await (window as any).ipcRenderer.invoke('shell:open-folder', fullAudioPath);
        } catch (e) {
            console.error('Failed to open folder', e);
            showAlert(t.error, `Could not open folder: ${(e as any).message || e}`);
        }
    };

    const handleSplitAudio = () => {
        setHasAttemptedSplit(true);
        if (!fullAudioPath) {
            showAlert(t.missingAudio, t.missingAudioMessage);
            return;
        }
        if (cue.tracks.length === 0) {
            showAlert(t.noTracks, t.noTracksMessage);
            return;
        }
        // Check if last track has duration or if we have total duration
        if (!cue.totalDuration || cue.totalDuration <= 0) {
            showAlert(t.missingDuration, t.missingDurationMessage);
        }

        setIsSplitting(true);
        setIsSplitModalOpen(true);
        setSplitProgress({ progress: 0, currentTrack: 0, totalTracks: cue.tracks.length, fileName: '' });
        (window as any).ipcRenderer.send('audio:split', cue, fullAudioPath);
    };

    // Rendering Helper: Calculate durations for display
    const getRenderDuration = (index: number) => {
        if (index < cue.tracks.length - 1) {
            return cue.tracks[index + 1].index01 - cue.tracks[index].index01;
        }
        if (cue.totalDuration) {
            return Math.max(0, cue.totalDuration - cue.tracks[index].index01);
        }
        return 0; // Last track unknown/infinity
    };

    const isDurationReadOnly = (index: number) => {
        return index === cue.tracks.length - 1 && cue.totalDuration !== undefined && cue.totalDuration > 0;
    };

    return (
        <div className="min-h-screen bg-brand-dark text-brand-text font-sans selection:bg-brand-orange selection:text-white pt-2">
            {/* Fixed Top Bar */}
            <div className="fixed top-0 left-0 right-0 z-50 bg-brand-dark/10 backdrop-blur-xs border-b border-brand-text/5 py-4">
                <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                    {/* Left: Logo & File Actions */}
                    <div className="flex items-center gap-6">
                        <img
                            src={`images/logo${theme === 'light' ? '-light' : ''}.png`}
                            alt="CUEsto Logo"
                            className="h-10 w-auto cursor-pointer hover:drop-shadow-[0_0_8px_var(--color-brand-orange)] transition-all"
                            onClick={() => setIsAboutModalOpen(true)}
                        />
                        <div className="h-5 w-px bg-brand-text/30 mx-1"></div>
                        <div className="flex gap-4">
                            <button
                                onClick={handleOpenFile}
                                className="text-brand-orange hover:drop-shadow-[0_0_8px_var(--color-brand-orange)] transition-all"
                                data-tooltip-bottom={t.openFile}
                            >
                                <img src="icons/open.svg" alt="open" className="size-5" />
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={!currentFilePath}
                                className={`text-brand-orange hover:drop-shadow-[0_0_8px_var(--color-brand-orange)] transition-all ${!currentFilePath ? 'opacity-30 cursor-not-allowed' : ''}`}
                                data-tooltip-bottom={t.save}
                            >
                                <img src="icons/save.svg" alt="save" className="size-5" />
                            </button>
                            <button
                                onClick={handleSaveAs}
                                className="text-brand-orange hover:drop-shadow-[0_0_8px_var(--color-brand-orange)] transition-all"
                                data-tooltip-bottom={t.saveAs}
                            >
                                <img src="icons/saveas.svg" alt="save as" className="size-5" />
                            </button>
                            <button
                                onClick={handleClear}
                                className="text-brand-orange hover:drop-shadow-[0_0_8px_var(--color-brand-orange)] transition-all"
                                data-tooltip-bottom={t.clear}
                            >
                                <img src="icons/clean.svg" alt="clear" className="size-5" />
                            </button>
                            <button
                                onClick={() => setIsTextEditingModalOpen(true)}
                                className="text-brand-orange hover:drop-shadow-[0_0_8px_var(--color-brand-orange)] transition-all"
                                data-tooltip-bottom={t.textEditing}
                            >
                                <img src="icons/edit.svg" alt="edit" className="size-5" />
                            </button>
                            <button
                                onClick={handleSplitAudio}
                                className="text-brand-orange hover:drop-shadow-[0_0_8px_var(--color-brand-orange)] transition-all"
                                data-tooltip-bottom={t.splitAudio}
                            >
                                <img src="icons/split.svg" alt="split" className="size-5" />
                            </button>
                            <button
                                onClick={handleViewCue}
                                className="text-brand-orange hover:drop-shadow-[0_0_8px_var(--color-brand-orange)] transition-all"
                                data-tooltip-bottom={t.viewCue}
                            >
                                <img src="icons/code.svg" alt="view cue" className="size-5" />
                            </button>
                        </div>

                        <div className="h-5 w-px bg-brand-text/30 mx-1"></div>

                        {/* Imports */}
                        <div className="flex gap-4 items-center">
                            <span className="text-[12px] text-brand-text/60  whitespace-nowrap">{t.getDataFrom}</span>
                            <button onClick={() => handleImport('musicbrainz')} data-tooltip-bottom={t.importFromMusicBrainz} className="hover:drop-shadow-[0_0_8_px_var(--color-brand-orange)] transition-all">
                                <img src="images/musicbrainz.svg" alt="musicbrainz" className="h-5 w-auto" />
                            </button>
                            <button onClick={() => handleImport('gnudb')} data-tooltip-bottom={t.importFromGnudb} className="hover:drop-shadow-[0_0_8_px_var(--color-brand-orange)] transition-all">
                                <img src="images/gnudb.svg" alt="gnudb" className="h-5 w-auto" />
                            </button>
                            <button onClick={() => handleImport('audacity')} data-tooltip-bottom={t.importAudacityLabels} className="hover:drop-shadow-[0_0_8_px_var(--color-brand-orange)] transition-all">
                                <img src="images/audacity.svg" alt="audacity" className="h-5 w-auto" />
                            </button>
                            <button onClick={() => handleImport('1001tracklists')} data-tooltip-bottom={t.importFrom1001Tracklists} className="hover:drop-shadow-[0_0_8_px_var(--color-brand-orange)] transition-all">
                                <img src="images/tracklists.svg" alt="1001tracklists" className="h-5 w-auto" />
                            </button>
                            <button
                                onClick={() => discogsConnected ? handleImport('discogs') : setIsSettingsModalOpen(true)}
                                data-tooltip-bottom={discogsConnected ? t.importFromDiscogs : t.connectToDiscogs}
                                className={`transition-all ${discogsConnected ? 'hover:drop-shadow-[0_0_8_px_var(--color-brand-orange)]' : 'opacity-40 cursor-not-allowed'}`}
                            >
                                <img src="images/discogs.svg" alt="discogs" className="h-5 w-auto" />
                            </button>
                        </div>
                    </div>

                    {/* Right: Settings/Language */}
                    <div className="flex items-center">
                        <LanguageSelector
                            onLanguageChange={handleLanguageChange}
                            variant="icon"
                            direction="down"
                            tooltipDirection="left"
                            onIconClick={() => setIsSettingsModalOpen(true)}
                            currentLanguage={currentLanguage}
                        />
                    </div>
                </div>
            </div>

            <MetadataHeader
                fileName={cue.file}
                albumTitle={cue.title}
                performer={cue.performer}
                date={cue.date || ''}
                genre={cue.genre || ''}
                totalDuration={cue.totalDuration}
                onUpdate={handleUpdateMetadata}
                onSelectAudioFile={handleSelectAudioFile}
                isAudioResolved={!!fullAudioPath}
                showAudioError={hasAttemptedSplit && !fullAudioPath}
                t={t}
            />

            <div className="max-w-5xl mx-auto px-6 mt-1 pb-10">
                {/* Table Header */}
                <div className="flex gap-2 text-sm text-brand-text mb-2 px-2 font-normal">
                    <div className="w-3 text-right">{t.trackNumber}</div>
                    <div className="flex-1 pl-6">{t.title}</div>
                    <div className="flex-1 pl-5">{t.performer}</div>
                    <div className="w-24 pl-6">{t.startTime}</div>
                    <div className="w-24 pl-7">{t.duration}</div>
                    <div className="w-8"></div>
                </div>

                <div className="flex flex-col gap-0">
                    {cue.tracks.map((track, i) => (
                        <TrackRow
                            key={i}
                            index={i}
                            track={track}
                            durationFrames={getRenderDuration(i)}
                            isDurationReadOnly={isDurationReadOnly(i)}
                            showDuration={!(i === cue.tracks.length - 1 && (!cue.totalDuration || cue.totalDuration <= 0))}
                            onUpdate={handleTrackUpdate}
                            onDurationChange={handleDurationChange}
                            onStartTimeChange={handleStartTimeChange}
                            onDelete={handleDeleteTrack}
                            t={t}
                        />
                    ))}
                </div>

                <div className="flex justify-end gap-6 mx-1 mt-2">
                    <button
                        onClick={handleAddRow}
                        className="text-brand-orange hover:drop-shadow-[0_0_8px_var(--color-brand-orange)] transition-all"
                        data-tooltip={t.addRow}
                    >
                        <img src="icons/add.svg" alt={t.addRow} className="size-6" />
                    </button>
                </div>

                {/* The SplitProgressModal will handle rendering progress */}
            </div>

            {/* Toast Notification */}
            {showToast && (
                <div className="fixed bottom-8 left-1/2 bg-brand-surface/10 backdrop-blur-sm px-6 py-2 rounded-full border text-modal-body font-light transition-opacity animate-fade-in-up">
                    {t.savedSuccessfully}
                </div>
            )}

            <GnuDbModal
                isOpen={isGnuDbModalOpen}
                onClose={() => setIsGnuDbModalOpen(false)}
                onSuccess={handleGnuDbSuccess}
                t={t}
                albumTitle={cue.title}
                performer={cue.performer}
            />

            <DiscogsModal
                isOpen={isDiscogsModalOpen}
                onClose={() => setIsDiscogsModalOpen(false)}
                onSuccess={handleDiscogsSuccess}
                totalDuration={cue.totalDuration}
                t={t}
                albumTitle={cue.title}
                performer={cue.performer}
            />

            <MusicBrainzModal
                isOpen={isMusicBrainzModalOpen}
                onClose={() => setIsMusicBrainzModalOpen(false)}
                onSuccess={handleMusicBrainzSuccess}
                t={t}
                albumTitle={cue.title}
                performer={cue.performer}
            />

            <TracklistModal
                isOpen={isTracklistModalOpen}
                onClose={() => {
                    setIsTracklistModalOpen(false);
                    setImportHtml(null);
                }}
                onSuccess={handleTracklistSuccess}
                t={t}
                albumTitle={cue.title}
                performer={cue.performer}
                initialHtml={importHtml || undefined}
            />

            <SplitProgressModal
                isOpen={isSplitModalOpen}
                isSplitting={isSplitting}
                progress={splitProgress?.progress || 0}
                currentTrack={splitProgress?.currentTrack || 0}
                totalTracks={splitProgress?.totalTracks || 0}
                fileName={splitProgress?.fileName || ''}
                onClose={() => setIsSplitModalOpen(false)}
                onOpenFolder={handleOpenFolder}
                t={t}
            />

            <AlertModal
                isOpen={alertModal.isOpen}
                title={alertModal.title}
                message={alertModal.message}
                onClose={() => setAlertModal(prev => ({ ...prev, isOpen: false }))}
                okTooltip={alertModal.okTooltip}
            />

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                title={confirmModal.title}
                message={confirmModal.message}
                onConfirm={confirmModal.onConfirm}
                onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                confirmTooltip={confirmModal.confirmTooltip}
                cancelTooltip={confirmModal.cancelTooltip}
            />

            <TextEditingModal
                isOpen={isTextEditingModalOpen}
                onClose={() => setIsTextEditingModalOpen(false)}
                tracks={cue.tracks}
                onApply={handleTextEditingSuccess}
                t={t}
            />

            <SettingsModal
                isOpen={isSettingsModalOpen}
                onClose={() => setIsSettingsModalOpen(false)}
                onLanguageChange={handleLanguageChange}
                currentLanguage={currentLanguage}
                onDiscogsConnect={() => setDiscogsConnected(true)}
                onDiscogsDisconnect={() => setDiscogsConnected(false)}
            />

            <AboutModal
                isOpen={isAboutModalOpen}
                onClose={() => setIsAboutModalOpen(false)}
                appVersion={appVersion}
                t={t}
            />
        </div>
    );
};
