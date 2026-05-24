import type { ReactNode } from 'react';

export type ProgressTone = 'neutral' | 'success' | 'warn' | 'danger' | 'info';

export type ProgressBarProps = {
  label: ReactNode;
  value: number;
  max?: number;
  tone?: ProgressTone;
  showValue?: boolean;
};

export function ProgressBar({
  label,
  value,
  max = 100,
  tone = 'neutral',
  showValue = true
}: ProgressBarProps) {
  const safeMax = max > 0 ? max : 100;
  const clampedValue = Math.min(Math.max(value, 0), safeMax);
  const percent = Math.round((clampedValue / safeMax) * 100);

  return (
    <div className={'kw-progress kw-progress--' + tone}>
      <div className="kw-progress__header">
        <span className="kw-progress__label">{label}</span>
        {showValue ? (
          <span className="kw-progress__value">
            {clampedValue}/{safeMax}
          </span>
        ) : null}
      </div>
      <div
        aria-label={typeof label === 'string' ? label : undefined}
        aria-valuemax={safeMax}
        aria-valuemin={0}
        aria-valuenow={clampedValue}
        className="kw-progress__track"
        role="progressbar"
      >
        <span className="kw-progress__bar" style={{ width: percent + '%' }} />
      </div>
    </div>
  );
}
