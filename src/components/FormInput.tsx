import React from 'react';

interface FormInputProps {
    id: string;
    label: string;
    type: 'text' | 'password';
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    required?: boolean;
    error?: boolean;
    autoComplete?: string;
}

export const FormInput: React.FC<FormInputProps> = ({
    id,
    label,
    type,
    value,
    onChange,
    placeholder,
    required = false,
    error = false,
    autoComplete
}) => {
    return (
        <div className="form-group">
            <label htmlFor={id}>{label}</label>
            <input
                type={type}
                id={id}
                name={id}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                required={required}
                autoComplete={autoComplete}
                className={error ? 'error' : ''}
            />
        </div>
    );
};
