import type { AnimalFicha } from "../../types/animalFicha";

export type CuidadosKey = "vermifugado" | "vacinado" | "castrado";

const LABELS: Record<CuidadosKey, string> = {
  vermifugado: "Vermifugado",
  vacinado: "Vacinado",
  castrado: "Castrado",
};

const KEYS: CuidadosKey[] = ["vermifugado", "vacinado", "castrado"];

type Props = {
  vermifugado: boolean;
  vacinado: boolean;
  castrado: boolean;
  onChange: (key: CuidadosKey, checked: boolean) => void;
  disabled?: boolean;
  /** Ex.: `${animalId}-vacinado` enquanto o PATCH desse campo está em andamento */
  savingKey?: string | null;
  animalId?: string;
  /** Layout mais denso nos cards da grade */
  variant?: "default" | "compact";
};

export default function AnimalCuidadosCheckboxes({
  vermifugado,
  vacinado,
  castrado,
  onChange,
  disabled = false,
  savingKey = null,
  animalId,
  variant = "default",
}: Props) {
  const values: Record<CuidadosKey, boolean> = {
    vermifugado,
    vacinado,
    castrado,
  };

  const wrapClass =
    variant === "compact"
      ? "flex flex-wrap gap-2"
      : "flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-3";

  return (
    <div className={wrapClass} role="group" aria-label="Cuidados veterinários">
      {KEYS.map((key) => {
        const busy = animalId != null && savingKey === `${animalId}-${key}`;
        return (
          <label
            key={key}
            className="
              inline-flex cursor-pointer select-none items-center gap-2 rounded-xl border border-(--light-gray)/40
              bg-(--background-second-layer) px-3 py-2 text-sm text-(--text-primary)
              transition-colors hover:border-(--light-green)/45
              has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-55
              focus-within:outline-none focus-within:ring-2 focus-within:ring-(--highlighted-text)/50
            "
          >
            <input
              type="checkbox"
              checked={values[key]}
              disabled={disabled || busy}
              onChange={(e) => onChange(key, e.target.checked)}
              className="
                h-4 w-4 shrink-0 rounded border-(--light-gray) text-(--light-green)
                focus:ring-(--highlighted-text)
              "
              style={{ accentColor: "var(--light-green)" }}
            />
            <span className="font-medium">{LABELS[key]}</span>
          </label>
        );
      })}
    </div>
  );
}

type CellProps = {
  cuidado: CuidadosKey;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  busy?: boolean;
};

/** Uma única checkbox (para colunas de tabela; rótulo só para leitores de tela). */
export function AnimalCuidadoCheckboxCell({
  cuidado,
  checked,
  onChange,
  disabled = false,
  busy = false,
}: CellProps) {
  return (
    <div className="flex justify-center px-1 py-0.5" onClick={(e) => e.stopPropagation()}>
      <label
        className="
          inline-flex cursor-pointer select-none items-center justify-center rounded-lg border border-transparent
          p-1.5 text-(--text-primary) transition-colors
          hover:border-(--light-green)/40 hover:bg-(--background-first-layer)/50
          has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50
          focus-within:outline-none focus-within:ring-2 focus-within:ring-(--highlighted-text)/50
        "
      >
        <span className="sr-only">{LABELS[cuidado]}</span>
        <input
          type="checkbox"
          checked={checked}
          disabled={disabled || busy}
          onChange={(e) => onChange(e.target.checked)}
          className="
            h-4 w-4 shrink-0 rounded border-(--light-gray) text-(--light-green)
            focus:ring-(--highlighted-text)
          "
          style={{ accentColor: "var(--light-green)" }}
        />
      </label>
    </div>
  );
}

export function cuidadosSummary(a: Pick<AnimalFicha, CuidadosKey>): string {
  const parts: string[] = [];
  if (a.vermifugado) parts.push("Vermifugado");
  if (a.vacinado) parts.push("Vacinado");
  if (a.castrado) parts.push("Castrado");
  return parts.length > 0 ? parts.join(" · ") : "Nenhum registrado ainda";
}
