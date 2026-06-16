import { useCallback, useEffect, useMemo, useState } from "react";
import GastoModal from "../components/Gastos/GastoModal";
import FlashBanner, { type FlashPayload } from "../components/FlashBanner";
import AppAlert from "../components/ui/AppAlert";
import { useAppDialog } from "../hooks/useAppDialog";
import { getApiErrorMessage } from "../lib/apiErrorMessage";
import { formatBRL, formatDateBR } from "../lib/formatFicha";
import { deleteGasto, fetchGastos } from "../services/gastosApi";
import type { Gasto } from "../types/gasto";

export default function Gastos() {
  const { confirm, alert } = useAppDialog();
  const [data, setData] = useState<Gasto[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [filtroData, setFiltroData] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<Gasto | null>(null);
  const [flash, setFlash] = useState<FlashPayload | null>(null);

  const dismissFlash = useCallback(() => setFlash(null), []);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const list = await fetchGastos(filtroData.trim() ? { data: filtroData.trim() } : undefined);
      setData(list);
    } catch (e) {
      setLoadError(getApiErrorMessage(e, { fallback: "Erro ao carregar os gastos." }));
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [filtroData]);

  useEffect(() => {
    void load();
  }, [load]);

  const totalGasto = useMemo(
    () => data.reduce((sum, g) => sum + (Number.isFinite(g.valor) ? g.valor : 0), 0),
    [data],
  );

  async function handleDelete(id: number) {
    const ok = await confirm({
      title: "Excluir saída",
      message: "Excluir esta saída?",
      destructive: true,
      confirmLabel: "Excluir",
    });
    if (!ok) return;
    try {
      await deleteGasto(id);
      await load();
      setFlash({ variant: "success", message: "Saída excluída com sucesso." });
    } catch (e) {
      await alert({
        title: "Erro ao excluir",
        message: getApiErrorMessage(e, { fallback: "Não foi possível excluir." }),
        variant: "error",
      });
    }
  }

  return (
    <div className="p-6">
      {flash && <FlashBanner flash={flash} onDismiss={dismissFlash} />}

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-(--green-title)">Gastos</h1>
        <p className="text-sm text-(--text-secondary)">Registre e consulte saídas (valor, data e descrição).</p>
      </div>

      <div className="flex flex-wrap justify-between items-end gap-3 mb-4">
        <div className="flex flex-wrap items-end gap-2">
          <label className="block">
            <span className="form-label text-xs">Filtrar por data</span>
            <input
              type="date"
              value={filtroData}
              onChange={(e) => setFiltroData(e.target.value)}
              className="mt-1 form-control w-[11rem]"
            />
          </label>
          <button
            type="button"
            disabled={!filtroData}
            onClick={() => setFiltroData("")}
            className="
              px-4 py-2 rounded-full text-sm font-medium border border-(--light-gray)/50
              text-(--text-primary) hover:bg-(--background-first-layer)
              disabled:opacity-40 disabled:pointer-events-none
              focus:outline-none focus-visible:ring-2 focus-visible:ring-(--highlighted-text)
            "
          >
            Limpar filtro
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            setSelected(null);
            setModalOpen(true);
          }}
          className="
            px-6 py-2.5 rounded-full
            bg-(--light-green) text-white text-sm font-medium
            hover:opacity-90 transition-all duration-200
            active:scale-[0.98]
            focus:outline-none focus-visible:ring-2 focus-visible:ring-(--highlighted-text)
          "
        >
          + Nova saída
        </button>
      </div>

      {loadError && (
        <AppAlert variant="error" className="mb-4" onDismiss={() => setLoadError(null)}>
          {loadError}
        </AppAlert>
      )}

      <div
        className="
          rounded-2xl border border-(--light-gray)/25
          bg-[color-mix(in_srgb,var(--red-bg)_18%,var(--background-second-layer))]
          dark:bg-[color-mix(in_srgb,rgb(127_29_29)_12%,var(--background-second-layer))]
          shadow-sm overflow-x-auto max-h-[min(70vh,28rem)] overflow-y-auto relative
        "
      >
        <table className="w-full min-w-[36rem] text-sm text-left border-separate border-spacing-0">
          <thead className="sticky top-0 z-[2] bg-(--background-first-layer) text-(--text-secondary) shadow-[0_1px_0_color-mix(in_srgb,var(--light-gray)_35%,transparent)]">
            <tr>
              <th className="p-3 whitespace-nowrap">Data</th>
              <th className="p-3 whitespace-nowrap">Valor</th>
              <th className="p-3 whitespace-nowrap hidden sm:table-cell">Tipo</th>
              <th className="p-3 min-w-[12rem]">Descrição</th>
              <th className="p-3 text-right whitespace-nowrap">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="p-4 text-center text-(--text-secondary)">
                  Carregando…
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-4 text-center text-(--text-secondary)">
                  Nenhuma saída encontrada{filtroData.trim() ? " para esta data." : "."}
                </td>
              </tr>
            ) : (
              data.map((g) => (
                <tr
                  key={g.id}
                  className="border-t border-(--light-gray)/20 hover:bg-(--background-first-layer)/30 transition-colors"
                >
                  <td className="p-3 text-(--text-primary) tabular-nums whitespace-nowrap align-top">
                    {formatDateBR(g.data)}
                  </td>
                  <td className="p-3 text-(--text-primary) tabular-nums whitespace-nowrap align-top font-medium">
                    {formatBRL(g.valor)}
                  </td>
                  <td className="p-3 text-(--text-primary) whitespace-nowrap align-top hidden sm:table-cell">
                    {g.doacao ? (
                      <span className="inline-flex rounded-full border border-(--light-green)/40 bg-(--light-green)/10 px-2.5 py-0.5 text-xs font-medium text-(--green-title)">
                        Doação
                      </span>
                    ) : (
                      <span className="text-(--text-secondary) text-xs">Saída</span>
                    )}
                  </td>
                  <td className="p-3 text-(--text-primary) align-top">
                    <p className="whitespace-pre-wrap break-words line-clamp-4">{g.descricao}</p>
                    {g.doacao && (
                      <p className="mt-1 text-xs text-(--text-secondary) sm:hidden">Doação</p>
                    )}
                  </td>
                  <td className="p-3 text-right align-top">
                    <div className="inline-flex gap-2 text-(--text-secondary)">
                      <button
                        type="button"
                        aria-label={`Editar saída de ${formatDateBR(g.data)}`}
                        onClick={() => {
                          setSelected(g);
                          setModalOpen(true);
                        }}
                        className="
                          rounded-full p-2
                          hover:bg-(--background-first-layer)
                          focus:outline-none focus-visible:ring-2 focus-visible:ring-(--highlighted-text)
                          transition
                        "
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          aria-hidden
                        >
                          <path
                            d="M12 20h9M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4L16.5 3.5z"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                      <button
                        type="button"
                        aria-label="Excluir saída"
                        onClick={() => void handleDelete(g.id)}
                        className="
                          rounded-full p-2
                          hover:bg-(--background-first-layer)
                          focus:outline-none focus-visible:ring-2 focus-visible:ring-(--highlighted-text)
                          transition
                        "
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          aria-hidden
                        >
                          <path
                            d="M3 6h18M8 6V4h8v2m-9 4v10m10-10v10M10 11v6M14 11v6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
          <tfoot
            className="
              sticky bottom-0 z-[2] border-t-2 border-(--light-green)/40
              bg-[color-mix(in_srgb,var(--background-first-layer)_92%,var(--light-green)_8%))]
              dark:bg-[color-mix(in_srgb,var(--background-second-layer)_88%,var(--light-green)_12%))]
              text-(--text-primary) shadow-[0_-1px_0_color-mix(in_srgb,var(--light-green)_25%,transparent)]
            "
          >
            <tr>
              <td colSpan={4} className="p-3 align-middle">
                <div className="font-semibold">Total</div>
              </td>
              <td className="p-3 text-right font-semibold tabular-nums whitespace-nowrap align-middle">
                {loading ? "—" : formatBRL(totalGasto)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <GastoModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelected(null);
        }}
        onSaved={load}
        gastoToEdit={selected}
      />
    </div>
  );
}
