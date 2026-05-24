import type { ReactNode } from 'react';

export type ToastTone = 'neutral' | 'success' | 'warn' | 'danger' | 'info';

export type ToastProps = {
  title: ReactNode;
  children?: ReactNode;
  tone?: ToastTone;
};

export function Toast({ title, children, tone = 'neutral' }: ToastProps) {
  const role = tone === 'danger' || tone === 'warn' ? 'alert' : 'status';

  return (
    <div className={'kw-toast kw-toast--' + tone} role={role}>
      <strong className="kw-toast__title">{title}</strong>
      {children ? <span className="kw-toast__body">{children}</span> : null}
    </div>
  );
}
