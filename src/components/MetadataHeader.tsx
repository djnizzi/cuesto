import React from 'react';
import { framesToTime } from '../lib/timeUtils';
import { Translations } from '../lib/i18n';

interface MetadataHeaderProps {
    fileName: string;
    albumTitle: string;
    performer: string;
    date: string;
    genre: string;
    totalDuration?: number;
    onUpdate: (field: string, value: string) => void;
    onSelectAudioFile: () => void;
    isAudioResolved: boolean;
    showAudioError: boolean;
    t: Translations;
}

const InputGroup = ({ label, value, field, onUpdate }: { label: string, value: string, field: string, onUpdate: (field: string, value: string) => void }) => (
    <div className="flex flex-col flex-1 mx-2">
        <div className="border border-brand-input-border rounded-full px-3 py-1 flex items-center bg-transparent focus-within:border-brand-orange transition-colors">
            <input
                type="text"
                value={value}
                onChange={(e) => onUpdate(field, e.target.value)}
                className="bg-transparent w-full outline-none text-brand-text placeholder-brand-placeholder text-sm font-light"
                placeholder={label}
            />
        </div>
    </div>
);

export const MetadataHeader: React.FC<MetadataHeaderProps> = ({
    fileName,
    albumTitle,
    performer,
    date,
    genre,
    totalDuration,
    onUpdate,
    onSelectAudioFile,
    isAudioResolved,
    showAudioError,
    t
}) => {
    return (
        <div className="w-full max-w-5xl mx-auto px-4 py-3 flex flex-col gap-4 mt-16">
            <div className="w-full">
                <div className={`mx-2 border rounded-full px-3 py-1 flex items-center bg-transparent transition-colors mb-2 ${isAudioResolved ? 'border-brand-input-border focus-within:border-brand-orange' : (showAudioError ? 'border-red-500/50 focus-within:border-red-500' : 'border-brand-input-border focus-within:border-brand-orange')}`}>
                    <input
                        type="text"
                        value={fileName}
                        onChange={(e) => onUpdate('fileName', e.target.value)}
                        className="bg-transparent w-full min-w-0 outline-none text-brand-text placeholder-brand-placeholder text-sm font-light"
                        placeholder={t.fileName}
                    />
                    {totalDuration !== undefined && totalDuration > 0 && (
                        <span className="text-brand-text text-sm font-light px-2 whitespace-nowrap">
                            {framesToTime(totalDuration)}
                        </span>
                    )}
                    <button
                        onClick={onSelectAudioFile}
                        className={`${isAudioResolved ? 'text-brand-orange' : (showAudioError ? 'text-red-500' : 'text-brand-orange')} hover:drop-shadow-[0_0_8px_currentColor] transition ml-1`}
                        data-tooltip={isAudioResolved ? t.audioFileResolved : t.audioFileNotFound}
                    >
                        <img
                            src="icons/audiofile.svg"
                            alt="audio file"
                            className="size-5"
                            style={{ filter: isAudioResolved ? 'none' : (showAudioError ? 'sepia(1) saturate(5) hue-rotate(-50deg)' : 'none') }}
                        />
                    </button>
                </div>
                <div className="flex mb-2">
                    <InputGroup label={t.albumTitle} value={albumTitle} field="title" onUpdate={onUpdate} />
                    <InputGroup label={t.date} value={date} field="date" onUpdate={onUpdate} />
                </div>
                <div className="flex">
                    <InputGroup label={t.performer} value={performer} field="performer" onUpdate={onUpdate} />
                    <InputGroup label={t.genre} value={genre} field="genre" onUpdate={onUpdate} />
                </div>
            </div>
        </div>
    );
};
