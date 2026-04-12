import { useMemo, useState } from "react";
import type {
  AnimalFila,
  ProcedimentoTipo,
  PrioridadeTipo,
  ResumoCardData,
} from "../mocks/painelData";
import { buildPainelMock } from "../mocks/painelData";

function procedimentoLabel(t: ProcedimentoTipo): string {
  const map: Record<ProcedimentoTipo, string> = {
    cirurgia: "Cirurgia",
    vacina: "Vacina",
    consulta: "Consulta",
    observacao: "Observação",
  };
  return map[t];
}

function procedimentoClasses(t: ProcedimentoTipo): string {
  const map: Record<ProcedimentoTipo, string> = {
    cirurgia: "bg-(--red-bg) text-(--red)",
    vacina: "bg-(--green-bg) text-(--green)",
    consulta: "bg-(--blue-bg) text-(--blue)",
    observacao: "bg-(--orange-bg) text-(--orange)",
  };
  return map[t];
}

function prioridadeClasses(p: PrioridadeTipo): string {
  const map: Record<PrioridadeTipo, string> = {
    alta: "text-(--error-advice) font-medium",
    media: "text-(--orange) font-medium",
    baixa: "text-amber-600 font-medium dark:text-amber-400",
  };
  return map[p];
}

function prioridadeLabel(p: PrioridadeTipo): string {
  const map: Record<PrioridadeTipo, string> = {
    alta: "Alta",
    media: "Média",
    baixa: "Baixa",
  };
  return map[p];
}

function ResumoIcon({ icon, className }: { icon: ResumoCardData["icon"]; className?: string }) {
  const cn = ["shrink-0", className].filter(Boolean).join(" ");
  switch (icon) {
    case "paw":
      return (
        <span className={`${cn} text-(--light-green)`}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M12 14c-1.66 0-3 1.34-3 3v2h6v-2c0-1.66-1.34-3-3-3zm-6-4a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm12 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm-6-3a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm-3.5 3.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm7 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
          </svg>
        </span>
      );
    case "dog":
      return (
        <span className={`${cn} text-(--orange)`}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M8.5 6.5C9.88 6.5 11 7.62 11 9s-1.12 2.5-2.5 2.5S6 10.38 6 9s1.12-2.5 2.5-2.5zm7 0C16.88 6.5 18 7.62 18 9s-1.12 2.5-2.5 2.5S13 10.38 13 9s1.12-2.5 2.5-2.5zM12 12c2.28 0 4.22 1.55 4.78 3.67.14.54-.18 1.08-.71 1.23-.12.03-.24.05-.37.05H8.3c-.55 0-1-.45-1-1 0-.13.02-.25.05-.37C7.78 13.55 9.72 12 12 12zm-5.5 4c-.83 0-1.5.67-1.5 1.5V19c0 .55.45 1 1 1h1v1.5c0 .83.67 1.5 1.5 1.5S11 22.33 11 21.5V20h2v1.5c0 .83.67 1.5 1.5s1.5-.67 1.5-1.5V20h1c.55 0 1-.45 1-1v-1.5c0-.83-.67-1.5-1.5-1.5h-11z" />
          </svg>
        </span>
      );
    case "heart":
      return (
        <span className={`${cn} text-(--success-advice)`}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </span>
      );
    case "home":
      return (
        <span className={`${cn} text-(--blue)`}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8h5z" />
          </svg>
        </span>
      );
  }
}

export default function Painel() {
  const [dashboard] = useState(buildPainelMock);

  const pendentesCount = dashboard.filaAtendimento.length;

  const legendaClass = useMemo(
    () => ({
      success: "text-(--success-advice)",
      warning: "text-(--orange)",
      neutral: "text-(--text-secondary)",
    }),
    []
  );

  return (
    <div className="max-w-7xl mx-auto w-full space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-(--green-title) tracking-tight">
            Painel
          </h1>
          <p className="mt-1 text-(--text-secondary) text-sm sm:text-base">
            Veja seu resumo de hoje
          </p>
        </div>
        <label className="relative w-full sm:max-w-xs block">
          <span className="sr-only">Buscar</span>
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-(--text-secondary)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3-3" strokeLinecap="round" />
            </svg>
          </span>
          <input
            type="search"
            placeholder="Buscar..."
            className="
              w-full rounded-full border border-(--light-gray)/50
              bg-(--background-second-layer) text-(--text-primary)
              pl-10 pr-4 py-2.5 text-sm
              shadow-sm outline-none
              focus:border-(--light-green) focus:ring-2 focus:ring-(--highlighted-text)/40
            "
          />
        </label>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {dashboard.resumos.map((card) => (
          <article
            key={card.id}
            className="
              relative overflow-hidden rounded-2xl
              bg-(--background-second-layer)
              border border-(--light-gray)/25
              px-5 pt-5 pb-4 shadow-sm
            "
          >
            <div className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-xl bg-(--background-first-layer)">
              <ResumoIcon icon={card.icon} />
            </div>
            <p className="text-sm text-(--text-secondary) pr-12">{card.titulo}</p>
            <p className="mt-2 text-3xl font-bold text-(--text-primary) tracking-tight">{card.valor}</p>
            <p className={`mt-1 text-xs sm:text-sm ${legendaClass[card.legendaVariant]}`}>
              {card.legenda}
            </p>
          </article>
        ))}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
        <div
          className="
            lg:col-span-2 rounded-2xl
            bg-(--background-second-layer)
            border border-(--light-gray)/25
            shadow-sm overflow-hidden
          "
        >
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-(--light-gray)/20">
            <h2 className="text-lg font-semibold text-(--text-primary)">
              Animais aguardando atendimento
            </h2>
            <span
              className="
                inline-flex items-center rounded-full px-3 py-1 text-xs font-medium
                bg-(--orange-bg) text-(--orange)
              "
            >
              {pendentesCount} pendentes
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-(--text-secondary) border-b border-(--light-gray)/15">
                  <th className="font-medium px-5 py-3 whitespace-nowrap">Animal</th>
                  <th className="font-medium px-3 py-3 whitespace-nowrap">Espécie</th>
                  <th className="font-medium px-3 py-3 whitespace-nowrap">Procedimento</th>
                  <th className="font-medium px-3 py-3 whitespace-nowrap">Prioridade</th>
                  <th className="font-medium px-5 py-3 whitespace-nowrap text-right">Entrada</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.filaAtendimento.map((row: AnimalFila) => (
                  <tr
                    key={row.id}
                    className="border-b border-(--light-gray)/10 last:border-0 hover:bg-(--background-first-layer)/80"
                  >
                    <td className="px-5 py-3.5 font-medium text-(--text-primary)">{row.nome}</td>
                    <td className="px-3 py-3.5 text-(--text-secondary)">{row.especie}</td>
                    <td className="px-3 py-3.5">
                      <span
                        className={`
                          inline-flex rounded-lg px-2.5 py-1 text-xs font-medium
                          ${procedimentoClasses(row.procedimento)}
                        `}
                      >
                        {procedimentoLabel(row.procedimento)}
                      </span>
                    </td>
                    <td className={`px-3 py-3.5 ${prioridadeClasses(row.prioridade)}`}>
                      {prioridadeLabel(row.prioridade)}
                    </td>
                    <td className="px-5 py-3.5 text-right tabular-nums text-(--text-secondary)">
                      {row.entrada}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div
          className="
            rounded-2xl
            bg-(--background-second-layer)
            border border-(--light-gray)/25
            shadow-sm overflow-hidden
          "
        >
          <div className="px-5 py-4 border-b border-(--light-gray)/20">
            <h2 className="text-lg font-semibold text-(--text-primary)">Cadastrados hoje</h2>
          </div>
          <ul className="divide-y divide-(--light-gray)/15 p-3 space-y-2">
            {dashboard.cadastrosHoje.map((item) => (
              <li
                key={item.id}
                className="
                  flex items-center gap-3 rounded-xl p-3
                  bg-(--background-first-layer)/50
                  hover:bg-(--background-first-layer) transition-colors
                "
              >
                <div
                  className="
                    flex h-11 w-11 shrink-0 items-center justify-center rounded-lg
                    bg-(--light-green) text-white
                  "
                  aria-hidden
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 10.5c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm4.5 2c-.8 0-1.5-.7-1.5-1.5S15.7 9.5 16.5 9.5 18 10.2 18 11s-.7 1.5-1.5 1.5zm-9 0C6.7 12.5 6 11.8 6 11s.7-1.5 1.5-1.5S9 10.2 9 11s-.7 1.5-1.5 1.5z" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-(--text-primary) truncate">{item.nome}</p>
                  <p className="text-xs text-(--text-secondary) truncate">{item.tipoRaca}</p>
                </div>
                <span className="text-xs tabular-nums text-(--text-secondary) shrink-0">{item.horario}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
