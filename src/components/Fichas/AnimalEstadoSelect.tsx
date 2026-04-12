import axios from "axios";
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { estadoBorderClass, estadoDotClass } from "../../constants/animalEstadoStyles";
import { isEstadoAdotado } from "../../lib/isEstadoAdotado";
import { patchAnimalState } from "../../services/animalsApi";
import type { AnimalEstadoApiRow } from "../../services/animalStatesApi";
import type { AnimalFicha } from "../../types/animalFicha";

type Props = {
  animal: AnimalFicha;
  estados: AnimalEstadoApiRow[];
  onUpdated: (next: AnimalFicha) => void;
  onSuccessNotify?: (detail: { celebration: boolean; animalNome: string }) => void;
};

type MenuBox = {
  top: number;
  left: number;
  width: number;
  maxHeight: number;
};

function loadPatchError(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { message?: string } | undefined;
    return data?.message ?? err.message ?? "Não foi possível atualizar o estado.";
  }
  if (err instanceof Error) return err.message;
  return "Não foi possível atualizar o estado.";
}

function measureMenu(trigger: HTMLElement): MenuBox {
  const r = trigger.getBoundingClientRect();
  const gap = 6;
  const margin = 12;
  const below = window.innerHeight - r.bottom - margin;
  const above = r.top - margin;
  const preferBelow = below >= 160 || below >= above;
  const maxBelow = Math.max(120, below - gap);
  const maxAbove = Math.max(120, above - gap);
  const maxHeight = Math.min(320, preferBelow ? maxBelow : maxAbove);
  const top = preferBelow ? r.bottom + gap : Math.max(margin, r.top - gap - maxHeight);
  const width = Math.max(r.width, 200);
  const left = Math.max(margin, Math.min(r.left, window.innerWidth - width - margin));
  return {
    top,
    left,
    width,
    maxHeight,
  };
}

export default function AnimalEstadoSelect({ animal, estados, onUpdated, onSuccessNotify }: Props) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [menuBox, setMenuBox] = useState<MenuBox | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const listId = useId();

  const close = useCallback(() => setOpen(false), []);

  const syncMenuPosition = useCallback(() => {
    const el = triggerRef.current;
    if (!el || !open) return;
    setMenuBox(measureMenu(el));
  }, [open]);

  useLayoutEffect(() => {
    if (!open) {
      setMenuBox(null);
      return;
    }
    syncMenuPosition();
    const ro = new ResizeObserver(syncMenuPosition);
    if (triggerRef.current) ro.observe(triggerRef.current);
    window.addEventListener("resize", syncMenuPosition);
    window.addEventListener("scroll", syncMenuPosition, true);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", syncMenuPosition);
      window.removeEventListener("scroll", syncMenuPosition, true);
    };
  }, [open, syncMenuPosition]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (wrapRef.current?.contains(t)) return;
      if (menuRef.current?.contains(t)) return;
      close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  async function chooseState(stateId: number) {
    if (busy) return;
    if (String(stateId) === animal.estado.id) {
      close();
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const next = await patchAnimalState(animal.id, stateId);
      onUpdated(next);
      const celebration =
        isEstadoAdotado(next.estado.nome) && !isEstadoAdotado(animal.estado.nome);
      onSuccessNotify?.({ celebration, animalNome: animal.nome });
      close();
    } catch (e) {
      setError(loadPatchError(e));
    } finally {
      setBusy(false);
    }
  }

  const triggerLabel = `Alterar estado de ${animal.nome}. Estado atual: ${animal.estado.nome}.`;
  const triggerTitle =
    "Abrir lista de estados — mudar só o estado, sem abrir a ficha completa";
  const borderTok = estadoBorderClass(animal.estado.nome);

  const menu =
    open &&
    estados.length > 0 &&
    menuBox &&
    createPortal(
      <ul
        ref={menuRef}
        id={listId}
        role="listbox"
        aria-label={`Estados disponíveis para ${animal.nome}`}
        style={{
          position: "fixed",
          top: menuBox.top,
          left: menuBox.left,
          width: menuBox.width,
          maxHeight: menuBox.maxHeight,
          zIndex: 150,
        }}
        className="
          overflow-y-auto overflow-x-hidden
          rounded-xl border border-(--light-gray)/30 bg-(--background-second-layer) py-1.5 shadow-lg
        "
      >
        {estados.map((s) => {
          const selected = String(s.id) === animal.estado.id;
          return (
            <li key={s.id} role="presentation">
              <button
                type="button"
                role="option"
                aria-selected={selected}
                disabled={busy}
                onClick={() => chooseState(s.id)}
                className={`
                  flex w-full min-h-[2.75rem] items-center gap-2 px-3 py-2.5 text-left text-sm
                  transition-colors
                  ${selected ? "bg-(--light-green-bg)/80" : "hover:bg-(--background-first-layer)"}
                  focus:outline-none focus-visible:bg-(--background-first-layer)
                  disabled:opacity-50
                `}
              >
                <span className={`${estadoDotClass(s.nome)}`} aria-hidden />
                <span className="min-w-0 flex-1 font-medium text-(--text-primary) break-words">
                  {s.nome}
                </span>
                {selected && (
                  <span className="shrink-0 text-xs text-(--text-secondary)">Atual</span>
                )}
              </button>
            </li>
          );
        })}
      </ul>,
      document.body,
    );

  return (
    <div
      ref={wrapRef}
      className="relative shrink-0"
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <button
        ref={triggerRef}
        type="button"
        disabled={busy || estados.length === 0}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={open ? listId : undefined}
        aria-label={triggerLabel}
        title={triggerTitle}
        onClick={() => {
          setError(null);
          setOpen((v) => !v);
        }}
        className={`
          rounded-xl p-2 text-(--text-secondary)
          border-2 ${borderTok} bg-(--background-second-layer)
          hover:brightness-[1.04]
          focus:outline-none focus-visible:ring-2 focus-visible:ring-(--highlighted-text)
          transition-[filter,opacity]
          disabled:pointer-events-none disabled:opacity-50
        `}
      >
        {busy ? (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            aria-hidden
            className="block animate-spin opacity-80"
          >
            <path
              d="M12 3a9 9 0 109 9"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden
            className={`block transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          >
            <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      {error && (
        <p
          className="absolute left-0 top-full z-10 mt-1 max-w-[min(18rem,calc(100vw-2rem))] text-[0.7rem] leading-snug text-(--error-advice)"
          role="alert"
        >
          {error}
        </p>
      )}

      {menu}
    </div>
  );
}
