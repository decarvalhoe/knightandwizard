import type { ButtonHTMLAttributes } from 'react';

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary';
};

/** Bouton K&W — branché tokens (accent, ombre dure, typo label). Neutre au skin. */
export function Button({ variant = 'primary', className, type = 'button', ...props }: ButtonProps) {
  const cls = ['kw-btn', `kw-btn--${variant}`, className].filter(Boolean).join(' ');
  return <button type={type} className={cls} {...props} />;
}
