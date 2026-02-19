import React, { useState, useEffect } from 'react';
import { parse1001Tracklist } from '../lib/tracklistParser';
import { Translations } from '../lib/i18n';
import { CueSheet } from '../lib/cueParser';

interface TracklistModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (result: CueSheet, options: TracklistOptions) => void;
    t: Translations;
    albumTitle?: string;
    performer?: string;
    initialHtml?: string;
}

export interface TracklistOptions {
    header: boolean;
    trackTitles: boolean;
    trackPerformers: boolean;
    timings: boolean;
}

export const TracklistModal: React.FC<TracklistModalProps> = ({ isOpen, onClose, onSuccess, t, albumTitle, performer, initialHtml }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [browserActive, setBrowserActive] = useState(false);
    const [htmlLoaded, setHtmlLoaded] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setHtmlLoaded(false);
            return;
        }

        if (initialHtml) {
            setHtmlLoaded(true);
        }

        if (!(window as any).ipcRenderer) return;

        const checkBrowser = async () => {
            const status = await (window as any).ipcRenderer.invoke('browser:get-status');
            if (status && status.url.includes('1001tracklists.com')) {
                setBrowserActive(true);
            } else {
                setBrowserActive(false);
            }
        };

        checkBrowser();
        const interval = setInterval(checkBrowser, 2000);

        return () => clearInterval(interval);
    }, [isOpen, initialHtml]);

    const [options, setOptions] = useState<TracklistOptions>({
        header: false,
        trackTitles: true,
        trackPerformers: true,
        timings: true,
    });

    if (!isOpen) return null;

    const handleImportHtml = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const html = initialHtml || await (window as any).ipcRenderer.invoke('browser:get-html');
            if (html) {
                const parsed = parse1001Tracklist(html);
                onSuccess(parsed, options);
                onClose();
            } else {
                setError(t.importFailed);
            }
        } catch (e: any) {
            setError(e.message || t.importFailed);
        } finally {
            setIsLoading(false);
        }
    };


    const toggleOption = (key: keyof TracklistOptions) => {
        setOptions(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            onClose();
        } else if (e.key === 'Enter' && (htmlLoaded || browserActive) && !isLoading) {
            handleImportHtml();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4">
            <div
                className="bg-brand-surface p-8 rounded-modal shadow-2xl w-full max-w-[480px] border border-white/5 transition-all duration-300 relative overflow-hidden flex flex-col gap-6"
                onKeyDown={handleKeyDown}
            >
                {/* Title */}
                <h2 className="text-brand-text font-semibold text-modal-body leading-tight">
                    {t.modalTitleTracklist}
                </h2>

                {/* Searching info */}
                {(albumTitle || performer) && (
                    <div className="text-brand-text/60 text-modal-small font-light italic">
                        <span className="text-brand-text font-normal">{performer || 'Unknown Artist'}</span> - <span className="text-brand-text font-normal">{albumTitle || 'Unknown Album'}</span>
                    </div>
                )}

                {/* Link to Homepage */}
                <div className="mb-[-8px]">
                    <a
                        href="https://www.1001tracklists.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand-orange hover:drop-shadow-[0_0_8px_var(--color-brand-orange)] font-semibold text-modal-body flex items-center gap-2"
                    >
                        <img src="images/tracklists.svg" alt="1001tracklists" className="w-[24px] h-[19.75px]" />
                        {t.visitTracklist}
                    </a>
                </div>

                {/* Help Text */}
                <p className="text-brand-text text-modal-body font-light leading-relaxed">
                    {htmlLoaded ? (
                        <span className="text-brand-orange font-normal flex items-center gap-2">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                <polyline points="22 4 12 14.01 9 11.01" />
                            </svg>
                            HTML already loaded from browser.
                        </span>
                    ) : (
                        t.helpTracklist
                    )}
                </p>

                {/* Overwrite Options Checkboxes */}
                <div className="flex flex-col gap-4 mb-2">
                    <CheckboxItem
                        label={t.overwriteHeader}
                        checked={options.header}
                        onChange={() => toggleOption('header')}
                    />
                    <CheckboxItem
                        label={t.overwriteTrackTitles}
                        checked={options.trackTitles}
                        onChange={() => toggleOption('trackTitles')}
                    />
                    <CheckboxItem
                        label={t.overwriteTrackPerformers}
                        checked={options.trackPerformers}
                        onChange={() => toggleOption('trackPerformers')}
                    />
                    <CheckboxItem
                        label={t.overwriteTimings}
                        checked={options.timings}
                        onChange={() => toggleOption('timings')}
                    />
                </div>

                {/* Inline Error Display */}
                {error && (
                    <div className="flex items-start gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
                        <div className="w-[1.5px] min-h-[36px] bg-brand-orange self-stretch" />
                        <div className="flex gap-2.5 items-start">
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0 mt-0.5">
                                <path d="M9.87109 0.410156L13.6172 4.12891C13.8633 4.375 14 4.70312 14 5.05859V8.96875C14 9.32422 13.8633 9.65234 13.6172 9.89844L9.87109 13.6172C9.625 13.8633 9.29688 14 8.94141 14H5.03125C4.67578 14 4.34766 13.8633 4.10156 13.6172L0.382812 9.89844C0.136719 9.65234 0 9.32422 0 8.96875V5.05859C0 4.70312 0.136719 4.375 0.382812 4.12891L4.10156 0.410156C4.34766 0.164062 4.67578 0 5.03125 0H8.94141C9.29688 0 9.625 0.164062 9.87109 0.410156ZM13.125 8.96875V5.05859C13.125 4.94922 13.0703 4.83984 12.9883 4.75781L9.24219 1.01172C9.16016 0.929688 9.05078 0.875 8.94141 0.875H5.03125C4.92188 0.875 4.8125 0.929688 4.73047 1.01172L0.984375 4.75781C0.902344 4.83984 0.875 4.94922 0.875 5.05859V8.96875C0.875 9.07812 0.902344 9.1875 0.984375 9.26953L4.73047 13.0156C4.8125 13.0977 4.92188 13.125 5.03125 13.125H8.94141C9.05078 13.125 9.16016 13.0977 9.24219 13.0156L12.9883 9.26953C13.0703 9.1875 13.125 9.07812 13.125 8.96875Z" fill="#E8D7C9" />
                            </svg>
                            <span className="text-brand-orange text-modal-small leading-tight font-light whitespace-pre-wrap">
                                {error}
                            </span>
                        </div>
                    </div>
                )}

                {/* Footer Buttons */}

            </div>
            {/* Click outside to close (only if not loading) */}
            <div className="absolute inset-0 -z-10" onClick={isLoading ? undefined : onClose} />
        </div>
    );
};

interface CheckboxItemProps {
    label: string;
    checked: boolean;
    onChange: () => void;
    disabled?: boolean;
}

const CheckboxItem: React.FC<CheckboxItemProps> = ({ label, checked, onChange, disabled }) => (
    <div
        className={`flex items-center gap-3 group ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
        onClick={disabled ? undefined : onChange}
    >
        <div className={`w-5 h-5 rounded-[4px] border border-brand-input-border flex items-center justify-center transition-all duration-200 ${checked && !disabled ? 'bg-brand-orange border-brand-orange shadow-[0_0_8px_rgba(255,116,0,0.4)]' : 'group-hover:border-brand-orange'} ${disabled ? 'bg-transparent' : ''}`}>
            {checked && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                </svg>
            )}
        </div>
        <span className={`text-brand-text/80 text-modal-body font-light leading-none ${!disabled && 'group-hover:text-brand-text'} transition-colors`}>
            {label}
        </span>
    </div>
);
