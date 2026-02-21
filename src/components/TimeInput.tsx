import React from 'react';
import { isValidTimeFormat } from '../lib/timeUtils';

interface TimeInputProps {
    value: string;
    onChange: (val: string) => void;
    onBlur?: () => void;
    className?: string;
    placeholder?: string;
    readOnly?: boolean;
}

export const TimeInput: React.FC<TimeInputProps> = ({ value, onChange, onBlur, className, placeholder, readOnly }) => {
    // FIX: Use value prop directly (controlled component) instead of derived state
    // This fixes react-doctor/no-derived-useState and react-doctor/no-derived-state-effect

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        // Allow typing only valid chars (digits and colon)
        if (/^[0-9:]*$/.test(val)) {
            onChange(val);
        }
    };

    const handleBlur = () => {
        // Validate on blur
        if (isValidTimeFormat(value)) {
            onChange(value);
        }
        if (onBlur) onBlur();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.currentTarget.blur();
        }
    };

    return (
        <input
            type="text"
            value={value}
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className={`bg-transparent text-brand-text outline-none text-center font-light ${className}`}
            placeholder={placeholder || "MM:SS:FF"}
            readOnly={readOnly}
        />
    );
};
