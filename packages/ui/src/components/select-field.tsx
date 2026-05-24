import type { ReactNode, SelectHTMLAttributes } from 'react';
import { useId } from 'react';

export type SelectOption = {
  label: ReactNode;
  value: string;
  disabled?: boolean;
};

export type SelectFieldProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id'> & {
  id?: string;
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  options: readonly SelectOption[];
};

export function SelectField({
  id,
  label,
  hint,
  error,
  options,
  className,
  ...props
}: SelectFieldProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const hintId = hint ? selectId + '-hint' : undefined;
  const errorId = error ? selectId + '-error' : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <label className={['kw-field', className].filter(Boolean).join(' ')} htmlFor={selectId}>
      <span className="kw-field__label">{label}</span>
      <select
        aria-describedby={describedBy}
        aria-invalid={error ? true : undefined}
        className="kw-field__control kw-field__select"
        id={selectId}
        {...props}
      >
        {options.map((option) => (
          <option disabled={option.disabled} key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
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
