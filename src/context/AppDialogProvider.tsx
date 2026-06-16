import { createContext, useCallback, useContext, useId, useRef, useState, type ReactNode } from "react";
import AppDialog from "../components/ui/AppDialog";
import type { AlertVariant } from "../components/ui/alertStyles";

export type ConfirmOptions = {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
};

export type AlertDialogOptions = {
  title: string;
  message: string;
  variant?: AlertVariant;
  confirmLabel?: string;
};

type DialogRequest =
  | { kind: "confirm"; options: ConfirmOptions; resolve: (value: boolean) => void }
  | { kind: "alert"; options: AlertDialogOptions; resolve: () => void };

type AppDialogContextValue = {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  alert: (options: AlertDialogOptions) => Promise<void>;
};

const AppDialogContext = createContext<AppDialogContextValue | null>(null);

export function AppDialogProvider({ children }: { children: ReactNode }) {
  const titleId = useId();
  const queueRef = useRef<DialogRequest[]>([]);
  const [active, setActive] = useState<DialogRequest | null>(null);

  const advanceQueue = useCallback(() => {
    setActive(queueRef.current.shift() ?? null);
  }, []);

  const enqueue = useCallback(
    (request: DialogRequest) => {
      queueRef.current.push(request);
      setActive((current) => current ?? queueRef.current.shift() ?? null);
    },
    [],
  );

  const dismissActive = useCallback(
    (done: () => void) => {
      done();
      setActive(null);
      window.setTimeout(advanceQueue, 0);
    },
    [advanceQueue],
  );

  const confirm = useCallback(
    (options: ConfirmOptions) =>
      new Promise<boolean>((resolve) => {
        enqueue({
          kind: "confirm",
          options,
          resolve,
        });
      }),
    [enqueue],
  );

  const alert = useCallback(
    (options: AlertDialogOptions) =>
      new Promise<void>((resolve) => {
        enqueue({
          kind: "alert",
          options,
          resolve,
        });
      }),
    [enqueue],
  );

  const value: AppDialogContextValue = { confirm, alert };

  return (
    <AppDialogContext.Provider value={value}>
      {children}
      {active?.kind === "confirm" && (
        <AppDialog
          open
          titleId={titleId}
          title={active.options.title}
          onClose={() => dismissActive(() => active.resolve(false))}
          footer={
            <>
              <button
                type="button"
                onClick={() => dismissActive(() => active.resolve(false))}
                className="
                  w-full sm:w-auto px-6 py-2.5 rounded-full text-sm font-medium
                  border border-(--light-gray)/50 text-(--text-primary)
                  hover:bg-(--background-first-layer)
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-(--highlighted-text)
                "
              >
                {active.options.cancelLabel ?? "Cancelar"}
              </button>
              <button
                type="button"
                autoFocus
                onClick={() => dismissActive(() => active.resolve(true))}
                className={`
                  w-full sm:w-auto px-6 py-2.5 rounded-full text-sm font-medium text-white
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-(--highlighted-text)
                  ${active.options.destructive
                    ? "bg-(--error-advice) hover:opacity-90"
                    : "bg-(--light-green) hover:opacity-90"}
                `}
              >
                {active.options.confirmLabel ?? (active.options.destructive ? "Excluir" : "Confirmar")}
              </button>
            </>
          }
        >
          {active.options.message}
        </AppDialog>
      )}
      {active?.kind === "alert" && (
        <AppDialog
          open
          titleId={titleId}
          title={active.options.title}
          onClose={() => dismissActive(() => active.resolve())}
          footer={
            <button
              type="button"
              autoFocus
              onClick={() => dismissActive(() => active.resolve())}
              className="
                w-full sm:w-auto px-6 py-2.5 rounded-full text-sm font-medium
                bg-(--light-green) text-white hover:opacity-90
                focus:outline-none focus-visible:ring-2 focus-visible:ring-(--highlighted-text)
              "
            >
              {active.options.confirmLabel ?? "OK"}
            </button>
          }
        >
          {active.options.message}
        </AppDialog>
      )}
    </AppDialogContext.Provider>
  );
}

export function useAppDialog(): AppDialogContextValue {
  const ctx = useContext(AppDialogContext);
  if (!ctx) {
    throw new Error("useAppDialog deve ser usado dentro de AppDialogProvider.");
  }
  return ctx;
}
