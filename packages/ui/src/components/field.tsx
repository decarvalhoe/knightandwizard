import type { InputHTMLAttributes, ReactNode } from 'react';
import { useId } from 'react';

export type FieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> & {
  id?: string;
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
};

export function Field({ id, label, hint, error, className, ...props }: FieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const hintId = hint ? inputId + '-hint' : undefined;
  const errorId = error ? inputId + '-error' : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <label className={['kw-field', className].filter(Boolean).join(' ')} htmlFor={inputId}>
      <span className="kw-field__label">{label}</span>
      <input
        aria-describedby={describedBy}
        aria-invalid={error ? true : undefined}
        className="kw-field__control"
        id={inputId}
        {...props}
      />
      {hint ? (
        <span className="kw-field__hint" id={hintId}>
          {hint}
        </span>
      ) : null}
      {error ? (
        <span className="kw-field__error" id={errorId}>
          {error}
        </span>
      ) : null}
    </label>
  );
}
