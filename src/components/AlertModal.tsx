import React from 'react';

interface AlertModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    onClose: () => void;
    okTooltip?: string;
}

export const AlertModal: React.FC<AlertModalProps> = ({ isOpen, title, message, onClose, okTooltip = 'ok' }) => {
    if (!isOpen) return null;

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === 'Escape') {
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 backdrop-blur-sm px-4">
            <div
                className="bg-brand-surface p-8 rounded-modal shadow-2xl w-full max-w-[440px] border border-white/5 transition-all duration-300 relative overflow-hidden flex flex-col gap-6"
                onKeyDown={handleKeyDown}
            >
                <h2 className="text-brand-text font-semibold text-modal-body leading-tight capitalize">
                    {title}
                </h2>

                <p className="text-brand-text text-modal-body font-light leading-relaxed">
                    {message}
                </p>

                <div className="flex justify-end mt-4">
                    <button
                        onClick={onClose}
                        className="text-brand-orange hover:drop-shadow-[0_0_8px_var(--color-brand-orange)] transition-all"
                        data-tooltip={okTooltip}
                    >
                        <img src="icons/ok.svg" alt={okTooltip} className="size-6" />
                    </button>
                </div>
            </div>
            <div 
                className="absolute inset-0 -z-10 cursor-default" 
                onClick={onClose}
                onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }}
                role="presentation"
            />
        </div>
    );
};
