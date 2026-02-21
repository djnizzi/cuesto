import React from 'react';
import { Translations } from '../lib/i18n';

interface SplitProgressModalProps {
    isOpen: boolean;
    isSplitting: boolean;
    progress: number;
    currentTrack: number;
    totalTracks: number;
    fileName: string;
    onClose: () => void;
    onOpenFolder: () => void;
    t: Translations;
}

export const SplitProgressModal: React.FC<SplitProgressModalProps> = ({
    isOpen,
    isSplitting,
    progress,
    currentTrack,
    totalTracks,
    fileName,
    onClose,
    onOpenFolder,
    t
}) => {
    if (!isOpen) return null;

    const isFinished = !isSplitting && progress === 100;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4">
            <div className="bg-brand-surface p-8 rounded-modal shadow-2xl w-full max-w-[480px] border border-white/5 transition-all duration-300 relative overflow-hidden flex flex-col gap-6">

                <h2 className="text-brand-text font-semibold text-modal-body leading-tight capitalize">
                    {isFinished ? t.splittingComplete : `${t.splitting}...`}
                </h2>

                <div className="flex flex-col gap-4">
                    {!isFinished ? (
                        <>
                            <div className="flex justify-between text-brand-text text-modal-body">
                                <span className="truncate max-w-[80%]">{fileName || t.preparing}</span>
                                <span>{currentTrack} / {totalTracks}</span>
                            </div>
                            <div className="progress-container !mt-0">
                                <div
                                    className="progress-bar"
                                    style={{ width: `${progress}%` }}
                                >
                                    <div className="progress-glow"></div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <p className="text-brand-text text-modal-body font-light leading-relaxed">
                            {t.filesCreated}: {totalTracks}
                        </p>
                    )}
                </div>

                <div className="flex justify-end gap-5 mt-4">
                    {isFinished && (
                        <button
                            onClick={onOpenFolder}
                            className="text-brand-orange hover:drop-shadow-[0_0_8px_var(--color-brand-orange)] transition-all"
                            data-tooltip={t.openFolder}
                        >
                            <img src="icons/open.svg" alt="open folder" className="size-6" />
                        </button>
                    )}

                    {!isSplitting && (
                        <button
                            onClick={onClose}
                            className="text-brand-orange hover:drop-shadow-[0_0_8px_var(--color-brand-orange)] transition-all"
                            data-tooltip={t.close}
                        >
                            <img src="icons/cancel.svg" alt="close" className="size-6" />
                        </button>
                    )}
                </div>
            </div>
            {/* Click outside to close (only if finished) */}
            {isFinished && (
                <div 
                    className="absolute inset-0 -z-10 cursor-default" 
                    onClick={onClose}
                    onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }}
                    role="presentation"
                />
            )}
        </div>
    );
};
