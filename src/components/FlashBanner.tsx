import { useEffect, type CSSProperties } from "react";
import { alertToneClass } from "./ui/alertStyles";

export type FlashPayload = {
  variant: "success" | "error";
  message: string;
  celebration?: boolean;
};

const AUTO_DISMISS_MS = 5200;
const AUTO_DISMISS_CELEBRATION_MS = 7000;

/** Porcentagens horizontais para confetes (apenas visual). */
const CONFETTI_LEFT_PCT = [10, 22, 34, 46, 54, 66, 78, 88, 16, 40, 58, 72, 8, 92];

type Props = {
  flash: FlashPayload | null;
  onDismiss: () => void;
};

function ConfettiBurst() {
  return (
    <div
      className="celebration-confetti-wrap absolute inset-x-0 -top-2 bottom-0 overflow-visible z-0"
      aria-hidden
    >
      {CONFETTI_LEFT_PCT.map((left, i) => (
        <span
          key={i}
          className="celebration-confetti-piece"
          style={
            {
              left: `${left}%`,
              animationDelay: `${i * 0.06}s`,
              "--celebrate-tx": `${((i % 7) - 3) * 16}px`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}

function SuccessIcon() {
  return (
    <svg className="shrink-0 mt-0.5" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function FlashBanner({ flash, onDismiss }: Props) {
  useEffect(() => {
    if (!flash) return;
    const ms =
      flash.variant === "success" && flash.celebration
        ? AUTO_DISMISS_CELEBRATION_MS
        : AUTO_DISMISS_MS;
    const t = window.setTimeout(onDismiss, ms);
    return () => window.clearTimeout(t);
  }, [flash, onDismiss]);

  if (!flash) return null;

  const celebration = flash.variant === "success" && flash.celebration;
  const toneClass = alertToneClass(flash.variant, celebration);

  return (
    <div
      className="pointer-events-none fixed top-4 right-4 z-[200] w-[min(100vw-2rem,24rem)]"
      aria-live="polite"
    >
      <div className="pointer-events-auto relative isolate w-full">
        {celebration && <ConfettiBurst />}
        <div
          role="status"
          className={`
            relative z-10 flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm shadow-lg
            modal-panel-enter
            ${toneClass}
            ${celebration ? "flash-banner-celebrate font-medium" : ""}
          `}
        >
          <SuccessIcon />
          <p className="min-w-0 flex-1 leading-snug">{flash.message}</p>
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
        </div>
      </div>
    </div>
  );
}
