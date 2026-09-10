import type { ReactNode } from 'react';
import type { FieldError } from 'react-hook-form';

interface FormFieldProps {
  id: string;
  label: string;
  required?: boolean;
  error?: FieldError;
  hint?: string;
  children: ReactNode;
}

/**
 * Generic form field wrapper that renders label, input slot, error, and hint.
 * The `children` prop receives the actual input element (input, select, etc).
 */
export default function FormField({
  id,
  label,
  required = false,
  error,
  hint,
  children,
}: FormFieldProps) {
  return (
    <div className="form-field">
      <label
        htmlFor={id}
        className={`form-label${required ? ' form-label--required' : ''}`}
      >
        {label}
      </label>
      {children}
      {error && (
        <span className="form-error" role="alert" id={`${id}-error`}>
          ⚠ {error.message}
        </span>
      )}
      {hint && !error && (
        <span className="form-hint" id={`${id}-hint`}>
          {hint}
        </span>
      )}
    </div>
  );
}
