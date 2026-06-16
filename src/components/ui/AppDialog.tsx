import { useEffect, type ReactNode } from "react";

type AppDialogProps = {
  open: boolean;
  title: string;
  titleId: string;
  onClose: () => void;
  children: ReactNode;
  footer: ReactNode;
};

export default function AppDialog({ open, title, titleId, onClose, children, footer }: AppDialogProps) {
  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-black/40 cursor-default modal-backdrop-enter"
        aria-label="Fechar"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="
          modal-panel-enter relative z-10 w-full max-w-md
          rounded-2xl border border-(--light-gray)/25 border-t-4 border-t-(--light-green)
          bg-(--background-second-layer) shadow-xl p-6
        "
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id={titleId} className="text-lg font-bold text-(--green-title)">
          {title}
        </h2>
        <div className="mt-3 text-sm text-(--text-secondary) leading-relaxed">{children}</div>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">{footer}</div>
      </div>
    </div>
  );
}
