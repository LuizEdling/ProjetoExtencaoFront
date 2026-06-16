import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { filterQuickActions, type QuickAction } from "../../constants/quickActions";
import { fetchAnimalsPage } from "../../services/animalsApi";
import type { AnimalFicha } from "../../types/animalFicha";
import AppAlert from "../ui/AppAlert";

type Props = {
  open: boolean;
  onClose: () => void;
};

type SearchItem =
  | { type: "action"; action: QuickAction }
  | { type: "animal"; animal: AnimalFicha };

function SearchIcon() {
  return (
    <svg
      aria-hidden
      className="h-5 w-5 shrink-0 text-(--text-secondary)"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      aria-hidden
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function AnimalSpeciesIcon({ especie }: { especie: string }) {
  const isCat = especie.toLowerCase().includes("gato");
  if (isCat) {
    return (
      <svg aria-hidden className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 5c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-4.5 3C5.7 8 4 9.7 4 11.8V20h3v-2h10v2h3v-8.2c0-2.1-1.7-3.8-3.5-3.8-.8 0-1.5.3-2.1.7-.9-.8-2.2-1.3-3.4-1.3s-2.5.5-3.4 1.3c-.6-.4-1.3-.7-2.1-.7z" />
      </svg>
    );
  }

  return (
    <svg aria-hidden className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8.5 6.5C9.88 6.5 11 7.62 11 9s-1.12 2.5-2.5 2.5S6 10.38 6 9s1.12-2.5 2.5-2.5zm7 0C16.88 6.5 18 7.62 18 9s-1.12 2.5-2.5 2.5S13 10.38 13 9s1.12-2.5 2.5-2.5zM12 12c2.28 0 4.22 1.55 4.78 3.67.14.54-.18 1.08-.71 1.23-.12.03-.24.05-.37.05H8.3c-.55 0-1-.45-1-1 0-.13.02-.25.05-.37C7.78 13.55 9.72 12 12 12z" />
    </svg>
  );
}

function ActionIcon() {
  return (
    <svg
      aria-hidden
      className="h-5 w-5 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export default function PainelSearchModal({ open, onClose }: Props) {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [animais, setAnimais] = useState<AnimalFicha[]>([]);
  const [loadingAnimais, setLoadingAnimais] = useState(false);
  const [animaisError, setAnimaisError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const filteredActions = useMemo(() => filterQuickActions(query), [query]);

  const items: SearchItem[] = useMemo(() => {
    const actionItems: SearchItem[] = filteredActions.map((action) => ({
      type: "action",
      action,
    }));
    const animalItems: SearchItem[] =
      debouncedQuery.trim() !== ""
        ? animais.map((animal) => ({ type: "animal", animal }))
        : [];
    return [...actionItems, ...animalItems];
  }, [filteredActions, animais, debouncedQuery]);

  const resetState = useCallback(() => {
    setQuery("");
    setDebouncedQuery("");
    setAnimais([]);
    setAnimaisError(null);
    setActiveIndex(0);
  }, []);

  const handleClose = useCallback(() => {
    resetState();
    onClose();
  }, [onClose, resetState]);

  const selectItem = useCallback(
    (item: SearchItem) => {
      if (item.type === "action") {
        navigate(item.action.path);
      } else {
        navigate("/fichas", { state: { openAnimal: item.animal } });
      }
      handleClose();
    },
    [handleClose, navigate]
  );

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const trimmed = query.trim();
    const t = window.setTimeout(() => setDebouncedQuery(trimmed), 350);
    return () => window.clearTimeout(t);
  }, [open, query]);

  useEffect(() => {
    if (!open) return;
    setActiveIndex(0);
  }, [open, query, debouncedQuery, filteredActions.length, animais.length]);

  useEffect(() => {
    if (!open || debouncedQuery.trim() === "") {
      setAnimais([]);
      setAnimaisError(null);
      setLoadingAnimais(false);
      return;
    }

    let cancelled = false;
    setLoadingAnimais(true);
    setAnimaisError(null);

    fetchAnimalsPage({ page: 1, perPage: 8, q: debouncedQuery })
      .then((res) => {
        if (!cancelled) {
          setAnimais(res.data);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setAnimaisError("Erro ao buscar animais.");
          setAnimais([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingAnimais(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [open, debouncedQuery]);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        handleClose();
        return;
      }

      if (items.length === 0) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((prev) => (prev + 1) % items.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((prev) => (prev - 1 + items.length) % items.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        const item = items[activeIndex];
        if (item) selectItem(item);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, items, activeIndex, handleClose, selectItem]);

  if (!open) return null;

  const actionCount = filteredActions.length;

  return (
    <div className="fixed inset-0 z-30 flex items-start justify-center p-4 pt-20">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        onClick={handleClose}
        aria-label="Fechar busca"
      />

      <div
        className="
          relative z-10 w-full max-w-lg overflow-hidden
          rounded-2xl border border-(--light-gray)/25
          bg-(--background-second-layer) shadow-lg
        "
        role="dialog"
        aria-modal="true"
        aria-label="Buscar animais e acoes"
      >
        <div className="flex items-center gap-3 border-b border-(--light-gray)/20 px-4 py-3">
          <SearchIcon />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar animais, ações…"
            className="
              min-w-0 flex-1 bg-transparent text-(--text-primary)
              placeholder:text-(--text-secondary) outline-none
            "
          />
          <button
            type="button"
            onClick={handleClose}
            className="
              flex h-8 w-8 items-center justify-center rounded-full
              text-(--text-secondary) transition hover:bg-(--background-first-layer)
            "
            aria-label="Fechar"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="max-h-[min(60vh,24rem)] overflow-y-auto p-2">
          {filteredActions.length > 0 && (
            <section className="mb-2">
              <p className="px-3 py-1 text-xs font-medium uppercase tracking-wide text-(--text-secondary)">
                Ações
              </p>
              <ul>
                {filteredActions.map((action, index) => {
                  const globalIndex = index;
                  const isActive = globalIndex === activeIndex;
                  return (
                    <li key={action.id}>
                      <button
                        type="button"
                        onClick={() => selectItem({ type: "action", action })}
                        onMouseEnter={() => setActiveIndex(globalIndex)}
                        className={`
                          flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition
                          ${isActive ? "bg-(--light-green) text-white" : "text-(--text-primary) hover:bg-(--background-first-layer)"}
                        `}
                      >
                        <ActionIcon />
                        <span className="font-medium">{action.label}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
          {debouncedQuery.trim() !== "" && (
            <section>
              <p className="px-3 py-1 text-xs font-medium uppercase tracking-wide text-(--text-secondary)">
                Animais
              </p>
              {loadingAnimais && (
                <p className="px-3 py-4 text-sm text-(--text-secondary)">Buscando…</p>
              )}
              {!loadingAnimais && animaisError && (
                <div className="px-3 py-2">
                  <AppAlert variant="error" compact>
                    {animaisError}
                  </AppAlert>
                </div>
              )}
              {!loadingAnimais && !animaisError && animais.length === 0 && (
                <p className="px-3 py-4 text-sm text-(--text-secondary)">
                  Nenhum animal encontrado.
                </p>
              )}
              {!loadingAnimais && !animaisError && animais.length > 0 && (
                <ul>
                  {animais.map((animal, index) => {
                    const globalIndex = actionCount + index;
                    const isActive = globalIndex === activeIndex;
                    return (
                      <li key={animal.id}>
                        <button
                          type="button"
                          onClick={() => selectItem({ type: "animal", animal })}
                          onMouseEnter={() => setActiveIndex(globalIndex)}
                          className={`
                            flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition
                            ${isActive ? "bg-(--light-green) text-white" : "text-(--text-primary) hover:bg-(--background-first-layer)"}
                          `}
                        >
                          <AnimalSpeciesIcon especie={animal.especie} />
                          <span className="min-w-0 truncate">
                            <span className="font-semibold">{animal.nome}</span>{" "}
                            <span className={isActive ? "text-white/90" : "text-(--text-secondary)"}>
                              {animal.raca} · {animal.estado.nome}
                            </span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          )}

          {filteredActions.length === 0 && debouncedQuery.trim() === "" && (
            <p className="px-3 py-4 text-sm text-(--text-secondary)">
              Digite para buscar animais ou filtrar ações.
            </p>
          )}
          {filteredActions.length === 0 && debouncedQuery.trim() !== "" && !loadingAnimais && (
            <p className="px-3 py-4 text-sm text-(--text-secondary)">
              Nenhuma ação encontrada.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
