import { useEffect, useId, useRef, type ReactNode } from "react";
import { estadoBadgeClass, estadoDotClass } from "../../constants/animalEstadoStyles";
import { formatDateBR, formatPesoKg } from "../../lib/formatFicha";
import type { AnimalFicha } from "../../types/animalFicha";
import { cuidadosSummary } from "./AnimalCuidadosCheckboxes";

type Props = {
  animal: AnimalFicha | null;
  onClose: () => void;
};

function DetailRow({
  label,
  value,
  index,
  valueClassName,
}: {
  label: string;
  value: ReactNode;
  index: number;
  valueClassName?: string;
}) {
  return (
    <div
      className="detail-row-enter rounded-lg border border-(--light-gray)/20 bg-(--background-first-layer)/80 px-3 py-2.5 sm:px-4 sm:py-3 dark:bg-(--background-first-layer)/40"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <div className="text-[0.65rem] font-semibold uppercase tracking-wider text-(--text-secondary)">
        {label}
      </div>
      <div className={`mt-1 text-sm font-medium text-(--text-primary) ${valueClassName ?? ""}`}>
        {value}
      </div>
    </div>
  );
}

export default function FichaDetalheModal({ animal, onClose }: Props) {
  const titleId = useId();
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!animal) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    closeBtnRef.current?.focus();

    return () => window.removeEventListener("keydown", onKeyDown);
  }, [animal, onClose]);

  if (!animal) return null;

  const rows: { label: string; value: ReactNode; valueClassName?: string }[] = [
    {
      label: "Estado",
      value: (
        <span className={`${estadoBadgeClass(animal.estado.nome)}`}>
          <span className={`${estadoDotClass(animal.estado.nome)}`} aria-hidden />
          {animal.estado.nome}
        </span>
      ),
    },
    { label: "Data (ficha)", value: formatDateBR(animal.data) },
    {
      label: "Nº de protocolo",
      value: animal.numeroProtocolo.trim() !== "" ? animal.numeroProtocolo : "—",
      valueClassName: "tabular-nums",
    },
    { label: "Sexo", value: animal.sexo },
    { label: "Idade", value: `${animal.idade} anos` },
    { label: "Peso", value: formatPesoKg(animal.peso) },
    { label: "Cor", value: animal.cor },
    {
      label: "Microchip",
      value: animal.microchip.trim() !== "" ? animal.microchip : "—",
      valueClassName: "tabular-nums",
    },
    {
      label: "Bairro (resgate)",
      value: animal.bairroResgate.trim() !== "" ? animal.bairroResgate : "—",
    },
    {
      label: "Rua (resgate)",
      value: animal.ruaResgate.trim() !== "" ? animal.ruaResgate : "—",
    },
    {
      label: "Cuidados",
      value: (
        <div className="space-y-1 text-(--text-secondary)">
          <p className="text-(--text-primary) font-medium">{cuidadosSummary(animal)}</p>
          <ul className="list-none space-y-0.5 text-xs font-normal">
            <li>Vermifugado: {animal.vermifugado ? "Sim" : "Não"}</li>
            <li>Vacinado: {animal.vacinado ? "Sim" : "Não"}</li>
            <li>Castrado: {animal.castrado ? "Sim" : "Não"}</li>
          </ul>
        </div>
      ),
      valueClassName: "font-normal",
    },
    { label: "Entrada", value: formatDateBR(animal.dataEntrada) },
    {
      label: "Observações",
      value: animal.observacoes,
      valueClassName: "whitespace-pre-wrap break-words font-normal",
    },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="presentation">
      <button
        type="button"
        className="absolute inset-0 cursor-default bg-black/40 modal-backdrop-enter"
        aria-label="Fechar modal"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="
          modal-panel-enter relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto
          rounded-2xl border border-(--light-gray)/25 border-t-4 border-t-(--light-green)
          bg-(--background-second-layer) shadow-xl p-6 sm:p-8
        "
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id={titleId} className="text-xl font-bold text-(--green-title) pr-10">
          {animal.nome}
        </h2>
        <p className="mt-3">
          <span
            className="
              inline-flex items-center rounded-full border border-(--light-gray)/35
              bg-(--light-green-bg) px-3 py-1 text-xs font-medium text-(--text-primary)
            "
          >
            {animal.especie} · {animal.raca}
          </span>
        </p>

        <div
          className="
            mt-6 rounded-xl border border-(--light-gray)/20 bg-(--background-first-layer)/50 p-3 sm:p-4
            dark:bg-(--background-first-layer)/25
          "
        >
          <div className="grid grid-cols-1 gap-2 sm:gap-2.5">
            {rows.map((row, i) => (
              <DetailRow
                key={row.label}
                label={row.label}
                value={row.value}
                index={i}
                valueClassName={row.valueClassName}
              />
            ))}
          </div>
        </div>

        <button
          ref={closeBtnRef}
          type="button"
          onClick={onClose}
          className="
            mt-8 w-full rounded-full bg-(--light-green) px-6 py-2.5 text-sm font-medium text-white
            transition-all duration-200 hover:opacity-90 active:scale-[0.98]
            focus:outline-none focus-visible:ring-2 focus-visible:ring-(--highlighted-text) sm:w-auto
          "
        >
          Fechar
        </button>
      </div>
    </div>
  );
}
