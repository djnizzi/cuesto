import React, { useState, useEffect } from 'react';
import { fetchDiscogsMetadata, DiscogsResult, DiscogsOptions } from '../lib/discogs';
import { Translations } from '../lib/i18n';

interface DiscogsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (result: DiscogsResult, options: DiscogsOptions) => void;
    totalDuration?: number;
    t: Translations;
    albumTitle?: string;
    performer?: string;
}

export const DiscogsModal: React.FC<DiscogsModalProps> = ({ isOpen, onClose, onSuccess, totalDuration, t, albumTitle, performer }) => {
    const [releaseCode, setReleaseCode] = useState('');
    const [discNumber, setDiscNumber] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen || !(window as any).ipcRenderer) return;

        (window as any).ipcRenderer.on('discogs:set-releasecode', (_: any, code: string) => {
            setReleaseCode(code);
        });

        return () => {
            (window as any).ipcRenderer.removeAllListeners('discogs:set-releasecode');
        };
    }, [isOpen]);

    const [options, setOptions] = useState<DiscogsOptions>({
        header: false,
        trackTitles: true,
        trackPerformers: true,
        timings: false,
        interpolate: false
    });

    if (!isOpen) return null;

    const handleImport = async () => {
        if (!releaseCode.trim()) return;

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetchDiscogsMetadata(releaseCode.trim());
            if (response?.result) {
                onSuccess(response.result, { ...options, discNumber });
                setReleaseCode('');
                setDiscNumber('');
                onClose();
            } else {
                setError(response?.error || t.failedToFetch);
            }
        } catch (e: any) {
            setError(`${t.connectionFailed}<br>please, retry in a few moments.`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !isLoading) {
            handleImport();
        } else if (e.key === 'Escape') {
            onClose();
        }
    };

    const toggleOption = (key: keyof DiscogsOptions) => {
        if (key === 'discNumber') return; // Should not happen
        setOptions(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const hasTotalDuration = totalDuration !== undefined && totalDuration > 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4">
            <div
                className="bg-brand-surface p-8 rounded-modal shadow-2xl w-full max-w-[480px] border border-white/5 transition-all duration-300 relative overflow-hidden flex flex-col gap-6"
                onKeyDown={handleKeyDown}
            >
                {/* Title */}
                <h2 className="text-brand-text font-semibold text-modal-body leading-tight">
                    {t.modalTitleDiscogs}
                </h2>

                {/* Searching info */}
                {(albumTitle || performer) && (
                    <div className="text-brand-text/60 text-modal-small font-light italic">
                        <span className="text-brand-text font-normal">{performer || 'Unknown Artist'}</span> - <span className="text-brand-text font-normal">{albumTitle || 'Unknown Album'}</span>
                    </div>
                )}

                {/* Intelligent Link */}
                <div className="mb-[-8px]">
                    <a
                        href={(albumTitle || performer) ? `https://www.discogs.com/search?q=${encodeURIComponent(`${performer || ''} ${albumTitle || ''}`.trim())}&type=all` : "https://www.discogs.com/"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand-orange hover:underline font-semibold text-modal-body flex items-center gap-2"
                    >
                        <img src="images/discogs.svg" alt="discogs" className="w-[23.78px] h-[24px]" />
                        {(albumTitle || performer) ? t.searchOnDiscogs : t.visitDiscogs}
                    </a>
                </div>

                {/* Help Text */}
                <p className="text-brand-text text-modal-body font-light leading-relaxed">
                    {t.helpDiscogsPre}{' '}
                    Discogs
                    {t.helpDiscogsPost}
                </p>

                {/* Input Fields Row */}
                <div className="flex gap-4">
                    <div className="flex-[2] border border-brand-input-border rounded-full px-3 py-1 flex items-center bg-transparent focus-within:border-brand-orange transition-colors">
                        <input
                            disabled={isLoading}
                            type="text"
                            value={releaseCode}
                            onChange={(e) => setReleaseCode(e.target.value)}
                            className="bg-transparent w-full outline-none text-brand-text placeholder-brand-placeholder font-light text-sm"
                            placeholder={t.releaseCodePlaceholder}
                        />
                    </div>
                    <div className="flex-1 border border-brand-input-border rounded-full px-3 py-1 flex items-center bg-transparent focus-within:border-brand-orange transition-colors">
                        <input
                            disabled={isLoading}
                            type="text"
                            value={discNumber}
                            onChange={(e) => setDiscNumber(e.target.value)}
                            className="bg-transparent w-full outline-none text-brand-text placeholder-brand-placeholder font-light text-sm"
                            placeholder={t.discNumberPlaceholder}
                        />
                    </div>
                </div>

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
                    <CheckboxItem
                        label={t.interpolateTimings}
                        checked={options.interpolate && hasTotalDuration}
                        disabled={!hasTotalDuration || !options.timings}
                        onChange={() => toggleOption('interpolate')}
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

                {/* Footer with Button */}
                <div className="flex justify-end mt-2">
                    <button
                        disabled={isLoading || !releaseCode.trim()}
                        onClick={handleImport}
                        className="text-brand-orange hover:drop-shadow-[0_0_8px_var(--color-brand-orange)] transition-all disabled:text-brand-placeholder disabled:cursor-auto"
                        data-tooltip={t.getMetadata}
                    >
                        <svg width="24" height="24" viewBox="3177 2031 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3195.302001953125,2038.1209716796875C3193.952880859375,2035,3190.922119140625,2033,3187.5,2033C3182.81298828125,2033,3179,2036.81298828125,3179,2041.5C3179,2042.0909423828125,3179.06103515625,2042.6800537109375,3179.180908203125,2043.2540283203125C3177.826904296875,2044.125,3177,2045.623046875,3177,2047.25C3177,2049.868896484375,3179.131103515625,2052,3181.75,2052L3194,2052C3197.860107421875,2052,3201,2048.85888671875,3201,2045C3201,2041.64501953125,3198.570068359375,2038.737060546875,3195.302001953125,2038.1209716796875ZM3194,2051L3181.75,2051C3179.681884765625,2051,3178,2049.31689453125,3178,2047.25C3178,2045.863037109375,3178.760986328125,2044.593994140625,3179.987060546875,2043.93896484375L3180.3330078125,2043.7530517578125L3180.235107421875,2043.373046875C3180.077880859375,2042.7640380859375,3179.9990234375,2042.134033203125,3179.9990234375,2041.4990234375C3179.9990234375,2037.363037109375,3183.363037109375,2033.9990234375,3187.4990234375,2033.9990234375C3190.60205078125,2033.9990234375,3193.342041015625,2035.864013671875,3194.47900390625,2038.7509765625L3194.5849609375,2039.02099609375L3194.8720703125,2039.06298828125C3197.794921875,2039.489013671875,3199.998046875,2042.041015625,3199.998046875,2045C3199.998046875,2048.30908203125,3197.306884765625,2051,3193.998046875,2051ZM3192.14599609375,2043.56103515625L3192.85302734375,2044.2679443359375L3189.56005859375,2047.56103515625C3189.26806640625,2047.85302734375,3188.884033203125,2047.9990234375,3188.4990234375,2047.9990234375C3188.114013671875,2047.9990234375,3187.73095703125,2047.85302734375,3187.43798828125,2047.56103515625L3184.14501953125,2044.2679443359375L3184.85205078125,2043.56103515625L3187.998046875,2046.70703125L3187.998046875,2039L3188.998046875,2039L3188.998046875,2046.70703125L3192.14404296875,2043.56103515625Z" fill="currentColor" />
                        </svg>
                    </button>
                </div>
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
