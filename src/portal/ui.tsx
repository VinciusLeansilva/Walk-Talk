import { useEffect, useId, useRef } from "react";
import type { ReactNode } from "react";
import { AlertCircle, X, LoaderCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";
export function Panel({
  title,
  action,
  children,
  className = "",
}: {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`wt-panel ${className}`}>
      {(title || action) && (
        <div className="wt-panel-heading">
          {title && <h2>{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="wt-empty">
      <span>
        <Icon size={25} />
      </span>
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  );
}
export function ErrorNotice({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="wt-error" role="alert">
      <AlertCircle size={19} />
      <p>{message}</p>
      {onRetry && (
        <button className="wt-button-secondary" onClick={onRetry}>
          Tentar novamente
        </button>
      )}
    </div>
  );
}
export function Loading({ label = "Carregando dados…" }: { label?: string }) {
  return (
    <div className="wt-loading" role="status">
      <LoaderCircle size={20} />
      {label}
    </div>
  );
}
export function Avatar({ name, size = 34 }: { name: string; size?: number }) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
  return (
    <span
      className="wt-avatar"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {initials || "WT"}
    </span>
  );
}
export function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    const element = dialog.current;
    const previous = document.activeElement as HTMLElement | null;
    element?.showModal();
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      element?.close();
      document.body.style.overflow = original;
      previous?.focus({ preventScroll: true });
    };
  }, []);
  return (
    <dialog
      ref={dialog}
      className="wt-modal"
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        close.current();
      }}
      onClick={(e) => {
        if (e.target !== e.currentTarget) return;
        const bounds = e.currentTarget.getBoundingClientRect();
        if (
          e.clientX < bounds.left ||
          e.clientX > bounds.right ||
          e.clientY < bounds.top ||
          e.clientY > bounds.bottom
        )
          close.current();
      }}
    >
      <div className="wt-modal-heading">
        <div>
          <span className="wt-eyebrow">WALK TALK EMPRESAS</span>
          <h2 id={titleId}>{title}</h2>
        </div>
        <button
          className="wt-icon-button"
          aria-label="Fechar janela"
          onClick={onClose}
        >
          <X size={20} />
        </button>
      </div>
      {children}
    </dialog>
  );
}
