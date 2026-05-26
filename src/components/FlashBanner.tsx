import { useEffect, type CSSProperties } from "react";

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

  const isSuccess = flash.variant === "success";
  const celebration = isSuccess && flash.celebration;

  const toneClass = celebration
    ? "border-(--success-advice)/50 bg-(--green-bg)/80 text-(--green)"
    : isSuccess
      ? "border-(--light-green)/45 bg-(--light-green-bg)/70 text-(--green-title)"
      : "border-(--error-advice)/40 bg-(--red-bg)/50 text-(--error-advice)";

  return (
    <div className="relative isolate w-full">
      {celebration && <ConfettiBurst />}
      <div
        role={isSuccess ? "status" : "alert"}
        aria-live={isSuccess ? "polite" : "assertive"}
        className={`
          relative z-10 flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm shadow-sm
          ${toneClass}
          ${celebration ? "flash-banner-celebrate font-medium" : ""}
        `}
      >
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
  );
}
