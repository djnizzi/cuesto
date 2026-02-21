import React from 'react';

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmTooltip?: string;
    cancelTooltip?: string;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    title,
    message,
    onConfirm,
    onCancel,
    confirmTooltip = 'confirm',
    cancelTooltip = 'cancel'
}) => {
    if (!isOpen) return null;

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            onConfirm();
        } else if (e.key === 'Escape') {
            onCancel();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4">
            <div
                className="bg-brand-surface p-8 rounded-modal shadow-2xl w-full max-w-[440px] border border-white/5 transition-all duration-300 relative overflow-hidden flex flex-col gap-6"
                onKeyDown={handleKeyDown}
            >
                {/* Title */}
                <h2 className="text-brand-text font-semibold text-modal-body leading-tight">
                    {title}
                </h2>

                {/* Message */}
                <p className="text-brand-text text-modal-body font-light leading-relaxed">
                    {message}
                </p>

                {/* Footer with Buttons */}
                <div className="flex justify-end gap-5 mt-4">

                    <button
                        onClick={onCancel}
                        className="text-brand-orange hover:drop-shadow-[0_0_8px_var(--color-brand-orange)] transition-all"
                        data-tooltip={cancelTooltip}
                    >
                        <img src="icons/cancel.svg" alt={cancelTooltip} className="size-6" />
                    </button>
                    <button
                        onClick={onConfirm}
                        className="text-brand-orange hover:drop-shadow-[0_0_8px_var(--color-brand-orange)] transition-all"
                        data-tooltip={confirmTooltip}
                    >
                        <img src="icons/ok.svg" alt={confirmTooltip} className="size-6" />
                    </button>


                </div>
            </div>
            {/* Click outside to close */}
            <div 
                className="absolute inset-0 -z-10 cursor-default" 
                onClick={onCancel}
                onKeyDown={(e) => { if (e.key === 'Escape') onCancel(); }}
                role="presentation"
            />
        </div>
    );
};
