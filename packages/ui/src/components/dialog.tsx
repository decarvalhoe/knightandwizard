import type { ReactNode } from 'react';
import { useId } from 'react';

export type DialogProps = {
  open: boolean;
  title: ReactNode;
  children: ReactNode;
  id?: string;
  description?: ReactNode;
  closeLabel?: string;
  onClose?: () => void;
};

export function Dialog({
  open,
  title,
  description,
  children,
  id,
  closeLabel = 'Fermer',
  onClose
}: DialogProps) {
  const generatedId = useId();
  const dialogId = id ?? generatedId;
  const titleId = dialogId + '-title';
  const descriptionId = description ? dialogId + '-description' : undefined;

  if (!open) return null;

  return (
    <div className="kw-dialog" role="presentation">
      <div
        aria-describedby={descriptionId}
        aria-labelledby={titleId}
        aria-modal="true"
        className="kw-dialog__panel"
        role="dialog"
      >
        <div className="kw-dialog__header">
          <h2 className="kw-dialog__title" id={titleId}>
            {title}
          </h2>
          {onClose ? (
            <button
              aria-label={closeLabel}
              className="kw-dialog__close"
              onClick={onClose}
              type="button"
            >
              X
            </button>
          ) : null}
        </div>
        {description ? (
          <p className="kw-dialog__description" id={descriptionId}>
            {description}
          </p>
        ) : null}
        <div className="kw-dialog__body">{children}</div>
      </div>
    </div>
  );
}
