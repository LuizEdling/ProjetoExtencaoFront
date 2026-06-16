import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import {
  createCatalogEntry,
  fetchCatalog,
  type CatalogKind,
} from "../../services/catalogApi";
import AppAlert from "../ui/AppAlert";

function mergeOptionLists(defaultOptions: string[] | undefined, server: string[]): string[] {
  const set = new Set<string>();
  for (const o of defaultOptions ?? []) {
    const t = o.trim();
    if (t) set.add(t);
  }
  for (const o of server) {
    const t = String(o).trim();
    if (t) set.add(t);
  }
  return [...set].sort((a, b) => a.localeCompare(b, "pt-BR"));
}

export type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  kind: CatalogKind;
  defaultOptions?: string[];
  required?: boolean;
  inputRef?: React.RefObject<HTMLInputElement | null>;
};

export default function CreatableCatalogCombobox({
  label,
  value,
  onChange,
  kind,
  defaultOptions,
  required = false,
  inputRef: externalInputRef,
}: Props) {
  const listId = useId();
  const internalRef = useRef<HTMLInputElement>(null);
  const inputRef = externalInputRef ?? internalRef;
  const blurTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [serverOptions, setServerOptions] = useState<string[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoadError(null);
    fetchCatalog(kind)
      .then((rows) => {
        if (!cancelled) setServerOptions(rows);
      })
      .catch(() => {
        if (!cancelled) setLoadError("Não foi possível carregar as opções.");
      });
    return () => {
      cancelled = true;
    };
  }, [kind]);

  const options = useMemo(
    () => mergeOptionLists(defaultOptions, serverOptions),
    [defaultOptions, serverOptions],
  );

  const q = value.trim().toLowerCase();
  const filtered = useMemo(() => {
    if (value.trim() === "") return options;
    return options.filter((o) => o.toLowerCase().includes(q));
  }, [options, value, q]);

  const showNewRow = value.trim() !== "" && filtered.length === 0;
  const showList = open && (filtered.length > 0 || showNewRow);

  const clearBlurTimeout = useCallback(() => {
    if (blurTimeout.current !== null) {
      clearTimeout(blurTimeout.current);
      blurTimeout.current = null;
    }
  }, []);

  const pickExisting = useCallback(
    (name: string) => {
      clearBlurTimeout();
      onChange(name);
      setOpen(false);
    },
    [onChange, clearBlurTimeout],
  );

  const pickNew = useCallback(async () => {
    const trimmed = value.trim();
    if (trimmed === "" || creating) return;
    clearBlurTimeout();
    setCreating(true);
    setLoadError(null);
    try {
      const saved = await createCatalogEntry(kind, trimmed);
      setServerOptions((prev) => mergeOptionLists(undefined, [...prev, saved]));
      onChange(saved);
      setOpen(false);
    } catch {
      setLoadError("Não foi possível criar esta opção.");
    } finally {
      setCreating(false);
    }
  }, [value, creating, kind, onChange, clearBlurTimeout]);

  return (
    <label className="block relative">
      <span className="form-label">{label}</span>
      <input
        ref={inputRef}
        required={required}
        autoComplete="off"
        role="combobox"
        aria-expanded={showList}
        aria-controls={listId}
        aria-autocomplete="list"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => {
          clearBlurTimeout();
          setOpen(true);
        }}
        onBlur={() => {
          blurTimeout.current = setTimeout(() => setOpen(false), 150);
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            if (open) {
              e.preventDefault();
              e.stopPropagation();
              clearBlurTimeout();
              setOpen(false);
            }
            return;
          }
          if (e.key === "Enter" && showList) {
            e.preventDefault();
            if (showNewRow) void pickNew();
            else if (filtered.length === 1) pickExisting(filtered[0]);
          }
        }}
        className="mt-1 form-control"
      />
      {loadError && (
        <AppAlert variant="error" compact className="mt-1 text-xs [&_p]:text-xs">
          {loadError}
        </AppAlert>
      )}
      {showList && (
        <ul
          id={listId}
          role="listbox"
          className="
            combobox-list-enter absolute left-0 right-0 top-full z-50 mt-1 max-h-48 overflow-auto rounded-xl border border-(--light-gray)/50 bg-(--background-second-layer)
            py-1 shadow-lg text-sm
          "
        >
          {filtered.map((o) => (
            <li key={o} role="option">
              <button
                type="button"
                className="w-full px-3 py-2 text-left transition-colors duration-150 hover:bg-(--background-first-layer) text-(--text-primary)"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pickExisting(o)}
              >
                {o}
              </button>
            </li>
          ))}
          {showNewRow && (
            <li role="option">
              <button
                type="button"
                disabled={creating}
                className="w-full px-3 py-2 text-left font-medium text-(--green-title) transition-colors duration-150 hover:bg-(--background-first-layer) disabled:opacity-50"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => void pickNew()}
              >
                {value.trim()} — NOVO
              </button>
            </li>
          )}
        </ul>
      )}
    </label>
  );
}
