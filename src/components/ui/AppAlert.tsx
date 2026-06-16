import type { ReactNode } from "react";
import { alertAriaLive, alertRole, alertToneClass, type AlertVariant } from "./alertStyles";

type AppAlertProps = {
  variant: AlertVariant;
  children: ReactNode;
  onDismiss?: () => void;
  className?: string;
  compact?: boolean;
  celebration?: boolean;
};

function AlertIcon({ variant }: { variant: AlertVariant }) {
  const cn = "shrink-0 mt-0.5";
  switch (variant) {
    case "success":
      return (
        <svg className={cn} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "error":
      return (
        <svg className={cn} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
        </svg>
      );
    case "warning":
      return (
        <svg className={cn} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M12 9v4M12 17h.01" strokeLinecap="round" />
          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "info":
      return (
        <svg className={cn} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4M12 8h.01" strokeLinecap="round" />
        </svg>
      );
  }
}

export default function AppAlert({
  variant,
  children,
  onDismiss,
  className = "",
  compact = false,
  celebration = false,
}: AppAlertProps) {
  return (
    <div
      role={alertRole(variant)}
      aria-live={alertAriaLive(variant)}
      className={`
        form-alert-enter flex items-start gap-3 rounded-2xl border text-sm shadow-sm
        ${compact ? "px-3 py-2" : "px-4 py-3"}
        ${alertToneClass(variant, celebration)}
        ${celebration ? "flash-banner-celebrate font-medium" : ""}
        ${className}
      `}
    >
      <AlertIcon variant={variant} />
      <p className="min-w-0 flex-1 leading-snug">{children}</p>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Fechar aviso"
          className="
            shrink-0 rounded-lg p-1 -m-1 transition-colors
            hover:bg-[color-mix(in_srgb,var(--text-primary)_10%,transparent)]
            focus:outline-none focus-visible:ring-2 focus-visible:ring-(--highlighted-text)
          "
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </div>
  );
}
