import { isAxiosError } from "axios";
import { useCallback, useEffect, useState } from "react";
import GastoModal from "../components/Gastos/GastoModal";
import { formatBRL, formatDateBR } from "../lib/formatFicha";
import { deleteGasto, fetchGastos } from "../services/gastosApi";
import type { Gasto } from "../types/gasto";

function loadErrorMessage(err: unknown): string {
  if (isAxiosError(err)) {
    const data = err.response?.data as { message?: string } | undefined;
    return data?.message ?? err.message ?? "Erro ao carregar os gastos.";
  }
  if (err instanceof Error) return err.message;
  return "Erro ao carregar os gastos.";
}

function deleteErrorMessage(err: unknown): string {
  if (isAxiosError(err)) {
    const data = err.response?.data as { message?: string } | undefined;
    return data?.message ?? err.message ?? "Não foi possível excluir.";
  }
  if (err instanceof Error) return err.message;
  return "Não foi possível excluir.";
}

export default function Gastos() {
  const [data, setData] = useState<Gasto[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [filtroData, setFiltroData] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<Gasto | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const list = await fetchGastos(filtroData.trim() ? { data: filtroData.trim() } : undefined);
      setData(list);
    } catch (e) {
      setLoadError(loadErrorMessage(e));
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [filtroData]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleDelete(id: number) {
    if (!confirm("Excluir esta saída?")) return;
    try {
      await deleteGasto(id);
      await load();
    } catch (e) {
      alert(deleteErrorMessage(e));
    }
  }

  return (
    <div className="p-6">
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
        <p className="mb-4 text-sm text-(--error-advice)" role="alert">
          {loadError}
        </p>
      )}

      <div
        className="
          rounded-2xl border border-(--light-gray)/25
          bg-[color-mix(in_srgb,var(--red-bg)_18%,var(--background-second-layer))]
          dark:bg-[color-mix(in_srgb,rgb(127_29_29)_12%,var(--background-second-layer))]
          shadow-sm overflow-hidden overflow-x-auto
        "
      >
        <table className="w-full min-w-[36rem] text-sm text-left">
          <thead className="bg-(--background-first-layer) text-(--text-secondary)">
            <tr>
              <th className="p-3 whitespace-nowrap">Data</th>
              <th className="p-3 whitespace-nowrap">Valor</th>
              <th className="p-3 min-w-[12rem]">Descrição</th>
              <th className="p-3 text-right whitespace-nowrap">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="p-4 text-center text-(--text-secondary)">
                  Carregando…
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-4 text-center text-(--text-secondary)">
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
                  <td className="p-3 text-(--text-primary) align-top">
                    <p className="whitespace-pre-wrap break-words line-clamp-4">{g.descricao}</p>
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
