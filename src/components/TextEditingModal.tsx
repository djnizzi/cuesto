import React, { useState } from 'react';
import { Translations } from '../lib/i18n';
import { CueTrack } from '../lib/cueParser';

interface TextEditingModalProps {
    isOpen: boolean;
    onClose: () => void;
    tracks: CueTrack[];
    onApply: (updatedTracks: CueTrack[]) => void;
    t: Translations;
}

type Operation = 'separator' | 'split' | 'swap' | 'propercase';

export const TextEditingModal: React.FC<TextEditingModalProps> = ({ isOpen, onClose, tracks, onApply, t }) => {
    const [operation, setOperation] = useState<Operation>('separator');
    const [sepFrom, setSepFrom] = useState(',');
    const [sepTo, setSepTo] = useState(';');
    const [splitSep, setSplitSep] = useState('-');

    if (!isOpen) return null;

    const toProperCase = (str: string) => {
        return str.toLowerCase().replace(/\b\w/g, s => s.toUpperCase());
    };

    const handleApply = () => {
        const updatedTracks = tracks.map(track => {
            const newTrack = { ...track };

            if (operation === 'separator') {
                if (newTrack.performer) {
                    newTrack.performer = newTrack.performer.split(sepFrom).join(sepTo);
                }
            } else if (operation === 'split') {
                if (newTrack.title && newTrack.title.includes(splitSep)) {
                    const parts = newTrack.title.split(splitSep);
                    const titlePart = parts.shift()?.trim() || '';
                    const performerPart = parts.join(splitSep).trim();
                    newTrack.title = titlePart;
                    newTrack.performer = performerPart || newTrack.performer;
                }
            } else if (operation === 'swap') {
                const temp = newTrack.title;
                newTrack.title = newTrack.performer;
                newTrack.performer = temp;
            } else if (operation === 'propercase') {
                newTrack.title = toProperCase(newTrack.title);
                newTrack.performer = toProperCase(newTrack.performer);
            }

            return newTrack;
        });

        onApply(updatedTracks);
        onClose();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            onClose();
        } else if (e.key === 'Enter') {
            handleApply();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4">
            <div
                className="bg-brand-surface p-8 rounded-modal shadow-2xl w-full max-w-[560px] border border-white/5 transition-all duration-300 relative overflow-hidden flex flex-col gap-8"
                onKeyDown={handleKeyDown}
            >
                {/* Title */}
                <h2 className="text-brand-text font-semibold leading-tight mb-2">
                    {t.textEditing}
                </h2>

                <div className="flex flex-col gap-6">
                    {/* Operation 1: Separator */}
                    <RadioItem
                        selected={operation === 'separator'}
                        onClick={() => setOperation('separator')}
                    >
                        <div className="flex items-center gap-2 text-brand-text/80 text-modal-body font-light">
                            <span>{t.opChangeSeparator}</span>
                            <input
                                type="text"
                                value={sepFrom}
                                onChange={(e) => { setSepFrom(e.target.value); setOperation('separator'); }}
                                className="w-16 h-8 bg-brand-input/30 border border-brand-input-border rounded-full px-3 text-center focus:outline-none focus:border-brand-orange transition-colors"
                            />
                            <span>{t.to}</span>
                            <input
                                type="text"
                                value={sepTo}
                                onChange={(e) => { setSepTo(e.target.value); setOperation('separator'); }}
                                className="w-16 h-8 bg-brand-input/30 border border-brand-input-border rounded-full px-3 text-center focus:outline-none focus:border-brand-orange transition-colors"
                            />
                        </div>
                    </RadioItem>

                    {/* Operation 2: Split */}
                    <RadioItem
                        selected={operation === 'split'}
                        onClick={() => setOperation('split')}
                    >
                        <div className="flex items-center gap-2 text-brand-text/80 text-modal-body font-light">
                            <span>{t.opSplitTitlePerformer}</span>
                            <input
                                type="text"
                                value={splitSep}
                                onChange={(e) => { setSplitSep(e.target.value); setOperation('split'); }}
                                className="w-16 h-8 bg-brand-input/30 border border-brand-input-border rounded-full px-3 text-center focus:outline-none focus:border-brand-orange transition-colors"
                            />
                        </div>
                    </RadioItem>

                    {/* Operation 3: Swap */}
                    <RadioItem
                        selected={operation === 'swap'}
                        onClick={() => setOperation('swap')}
                    >
                        <span className="text-brand-text/80 text-modal-body font-light">{t.opSwapTitlePerformer}</span>
                    </RadioItem>

                    {/* Operation 4: Propercase */}
                    <RadioItem
                        selected={operation === 'propercase'}
                        onClick={() => setOperation('propercase')}
                    >
                        <span className="text-brand-text/80 text-modal-body font-light">{t.opToPropercase}</span>
                    </RadioItem>
                </div>

                {/* Apply Button */}
                <div className="flex justify-end mt-2">
                    <button
                        onClick={handleApply}
                        className="text-brand-orange hover:drop-shadow-[0_0_8px_var(--color-brand-orange)] transition-all"
                        data-tooltip={t.confirm}
                        aria-label={t.confirm}
                    >
                        <img src="icons/ok.svg" className="size-6" alt="" />
                    </button>
                </div>
            </div>
            {/* Click outside to close */}
            <div 
                className="absolute inset-0 -z-10 cursor-default" 
                onClick={onClose}
                onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }}
                role="presentation"
            />
        </div>
    );
};

interface RadioItemProps {
    selected: boolean;
    onClick: () => void;
    children: React.ReactNode;
}

const RadioItem: React.FC<RadioItemProps> = ({ selected, onClick, children }) => (
    <div
        className="flex items-center gap-4 cursor-pointer group"
        onClick={onClick}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } }}
        role="radio"
        aria-checked={selected}
        tabIndex={0}
    >
        <div className={`w-4 h-4 rounded-full border-1 flex items-center justify-center transition-all duration-200 ${selected
            ? 'border-brand-orange bg-brand-orange'
            : 'border-brand-muted-text group-hover:border-brand-orange'
            }`}>
            {selected && (
                <div className="w-2 h-2 rounded-full bg-brand-surface"></div>
            )}
        </div>
        {children}
    </div>
);
