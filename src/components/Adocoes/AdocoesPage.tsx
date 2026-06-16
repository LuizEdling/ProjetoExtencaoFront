import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import FlashBanner, { type FlashPayload } from "../FlashBanner";
import AppAlert from "../ui/AppAlert";
import AdocaoModal from "./AdocaoModal";
import { getApiErrorMessage } from "../../lib/apiErrorMessage";
import { adoptionCelebrationMessage } from "../../lib/adoptionCelebrationMessage";
import { formatDateBR, toIsoDateOnly } from "../../lib/formatFicha";
import { useAppDialog } from "../../hooks/useAppDialog";
import {
  fetchAdocoesPage,
  downloadContratoPdf,
  openContratoPdfInNewTab,
  deleteAdocao,
} from "../../services/adocoesApi";
import type { AdocaoListItem } from "../../types/adocao";

function formatCPF(value: string | undefined) {
  const v = value ?? "";
  return v
    .replace(/\D/g, "")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

export default function AdocoesPage() {
  const navigate = useNavigate();
  const { confirm, alert } = useAppDialog();
  const [rows, setRows] = useState<AdocaoListItem[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [flash, setFlash] = useState<FlashPayload | null>(null);
  const [contratoBusy, setContratoBusy] = useState<{ id: number; action: "view" | "download" } | null>(null);
  const [undoBusy, setUndoBusy] = useState<number | null>(null);
  const [contractError, setContractError] = useState<string | null>(null);

  const dismissFlash = useCallback(() => setFlash(null), []);

  const loadList = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetchAdocoesPage({ page, perPage: 10 });
      setRows(res.data);
      setLastPage(res.lastPage);
      setTotal(res.total);
    } catch (e) {
      setLoadError(getApiErrorMessage(e, { fallback: "Erro ao carregar as adoções." }));
      setRows([]);
      setLastPage(1);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    void loadList();
  }, [loadList]);

  async function handleSaved({ animalNome }: { animalNome: string }) {
    setFlash({
      variant: "success",
      celebration: true,
      message: adoptionCelebrationMessage(animalNome),
    });
    if (page === 1) {
      await loadList();
    } else {
      setPage(1);
    }
  }

  async function handleVerContrato(adocaoId: number) {
    setContractError(null);
    setContratoBusy({ id: adocaoId, action: "view" });
    try {
      await openContratoPdfInNewTab(adocaoId);
      await loadList();
    } catch (e) {
      setContractError(getApiErrorMessage(e, { fallback: "Não foi possível abrir o contrato." }));
    } finally {
      setContratoBusy(null);
    }
  }

  async function handleGerarContrato(adocaoId: number) {
    setContractError(null);
    setContratoBusy({ id: adocaoId, action: "download" });
    try {
      await downloadContratoPdf(adocaoId);
      await loadList();
    } catch (e) {
      setContractError(getApiErrorMessage(e, { fallback: "Não foi possível gerar o contrato." }));
    } finally {
      setContratoBusy(null);
    }
  }

  async function handleDesfazerAdocao(row: AdocaoListItem) {
    const animalNome = row.animal?.nome?.trim() || "este animal";
    const ok = await confirm({
      title: "Desfazer adoção",
      message: `Deseja desfazer a adoção de “${animalNome}”? O registro será removido e o animal voltará para Esperando adoção.`,
      destructive: true,
      confirmLabel: "Desfazer adoção",
    });
    if (!ok) return;

    setUndoBusy(row.id);
    try {
      await deleteAdocao(row.id);
      setFlash({
        variant: "success",
        message: "Adoção desfeita. O animal voltou para Esperando adoção.",
      });
      if (rows.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        await loadList();
      }
    } catch (err) {
      await alert({
        title: "Erro ao desfazer adoção",
        message: getApiErrorMessage(err, { fallback: "Não foi possível desfazer a adoção." }),
        variant: "error",
      });
    } finally {
      setUndoBusy(null);
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-(--green-title)">Adoções</h1>
          <p className="text-sm text-(--text-secondary)">Gerencie as adoções realizadas</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="
              inline-flex items-center justify-center gap-2
              px-6 py-2.5 rounded-full
              bg-(--light-green) text-white text-sm font-medium
              hover:opacity-90 transition-all duration-200
              active:scale-[0.98]
              focus:outline-none focus-visible:ring-2 focus-visible:ring-(--highlighted-text)
            "
          >
            + Nova adoção
          </button>
          <button
            type="button"
            onClick={() => navigate("/adotantes")}
            className="
              inline-flex items-center justify-center gap-2
              px-6 py-2.5 rounded-full
              bg-(--light-green) text-white text-sm font-medium
              hover:opacity-90 transition-all duration-200
              active:scale-[0.98]
              focus:outline-none focus-visible:ring-2 focus-visible:ring-(--highlighted-text)
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
                d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="12" cy="7" r="4" />
            </svg>
            Gerenciar Adotantes
          </button>
        </div>
      </div>

      {flash && <FlashBanner flash={flash} onDismiss={dismissFlash} />}

      {contractError && (
        <AppAlert variant="error" className="mb-4" onDismiss={() => setContractError(null)}>
          {contractError}
        </AppAlert>
      )}

      {loadError && (
        <AppAlert variant="error" className="mb-4" onDismiss={() => setLoadError(null)}>
          {loadError}
        </AppAlert>
      )}

      <div
        className="
          rounded-2xl border border-(--light-gray)/25
          bg-(--background-second-layer)
          shadow-sm overflow-hidden
        "
      >
        <table className="w-full text-sm">
          <thead className="bg-(--background-first-layer) text-(--text-secondary)">
            <tr>
              <th className="p-3 text-left">Data</th>
              <th className="p-3 text-left">Animal</th>
              <th className="p-3 text-left">Estado (na adoção)</th>
              <th className="p-3 text-left">Adotante</th>
              <th className="p-3 text-left">CPF</th>
              <th className="p-3 text-left w-[1%] whitespace-nowrap">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="p-4 text-center text-(--text-secondary)">
                  Carregando...
                </td>
              </tr>
            ) : total === 0 ? (
              <tr>
                <td colSpan={6} className="p-4 text-center text-(--text-secondary)">
                  Nenhuma adoção registrada ainda. Use &quot;+ Nova adoção&quot; para registrar a primeira.
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const dataIso = toIsoDateOnly(
                  typeof row.data_adocao === "string" ? row.data_adocao : String(row.data_adocao ?? ""),
                );
                const estadoNome = row.animal?.animal_state?.nome ?? "—";
                const rowContratoBusy = contratoBusy?.id === row.id;
                const rowUndoBusy = undoBusy === row.id;
                const rowActionsBusy = rowContratoBusy || rowUndoBusy;
                const viewLoading = rowContratoBusy && contratoBusy.action === "view";
                const downloadLoading = rowContratoBusy && contratoBusy.action === "download";
                return (
                  <tr key={row.id} className="border-t border-(--light-gray)/20">
                    <td className="p-3 text-(--text-primary)">{formatDateBR(dataIso)}</td>
                    <td className="p-3 text-(--text-primary) font-medium">{row.animal?.nome ?? "—"}</td>
                    <td className="p-3 text-(--text-primary)">{estadoNome}</td>
                    <td className="p-3 text-(--text-primary)">{row.adotante?.nome ?? "—"}</td>
                    <td className="p-3 text-(--text-primary)">{formatCPF(row.adotante?.cpf)}</td>
                    <td className="p-3 align-top">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          disabled={rowActionsBusy}
                          onClick={() => {
                            void handleVerContrato(row.id);
                          }}
                          title="Visualizar contrato"
                          aria-label="Visualizar contrato em nova aba"
                          className="
                            rounded-full p-2 text-(--text-secondary)
                            border border-(--light-gray)/40 bg-(--background-second-layer)
                            hover:text-(--light-green) hover:border-(--light-green)/50
                            disabled:opacity-45 disabled:pointer-events-none
                            focus:outline-none focus-visible:ring-2 focus-visible:ring-(--highlighted-text)
                            transition-colors
                          "
                        >
                          {viewLoading ? (
                            <svg
                              className="animate-spin"
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              aria-hidden
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              />
                            </svg>
                          ) : (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                              <path
                                d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </button>
                        <button
                          type="button"
                          disabled={rowActionsBusy}
                          onClick={() => {
                            void handleGerarContrato(row.id);
                          }}
                          title="Gerar e baixar PDF"
                          aria-label="Gerar e baixar PDF do contrato"
                          className="
                            rounded-full p-2 text-(--text-secondary)
                            border border-(--light-gray)/40 bg-(--background-second-layer)
                            hover:text-(--light-green) hover:border-(--light-green)/50
                            disabled:opacity-45 disabled:pointer-events-none
                            focus:outline-none focus-visible:ring-2 focus-visible:ring-(--highlighted-text)
                            transition-colors
                          "
                        >
                          {downloadLoading ? (
                            <svg
                              className="animate-spin"
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              aria-hidden
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              />
                            </svg>
                          ) : (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                              <path
                                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          )}
                        </button>
                        <button
                          type="button"
                          disabled={rowActionsBusy}
                          onClick={() => {
                            void handleDesfazerAdocao(row);
                          }}
                          title="Desfazer adoção"
                          aria-label={`Desfazer adoção de ${row.animal?.nome ?? "animal"}`}
                          className="
                            rounded-full p-2 text-(--text-secondary)
                            border border-(--light-gray)/40 bg-(--background-second-layer)
                            hover:text-(--error-advice) hover:border-(--error-advice)/45
                            disabled:opacity-45 disabled:pointer-events-none
                            focus:outline-none focus-visible:ring-2 focus-visible:ring-(--highlighted-text)
                            transition-colors
                          "
                        >
                          {rowUndoBusy ? (
                            <svg
                              className="animate-spin"
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              aria-hidden
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              />
                            </svg>
                          ) : (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                              <path
                                d="M3 10h10a4 4 0 014 4v0a4 4 0 01-4 4H5M3 10l4-4M3 10l4 4"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {!loading && !loadError && total > 0 && lastPage > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4">
          <p className="text-sm text-(--text-secondary)">
            Página {page} de {lastPage} · {total} adoç{total === 1 ? "ão" : "ões"}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="
                px-4 py-2 rounded-full text-sm font-medium border border-(--light-gray)/50
                text-(--text-primary) hover:bg-(--background-first-layer)
                disabled:opacity-40 disabled:pointer-events-none
                focus:outline-none focus-visible:ring-2 focus-visible:ring-(--highlighted-text)
              "
            >
              Anterior
            </button>
            <button
              type="button"
              disabled={page >= lastPage}
              onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
              className="
                px-4 py-2 rounded-full text-sm font-medium border border-(--light-gray)/50
                text-(--text-primary) hover:bg-(--background-first-layer)
                disabled:opacity-40 disabled:pointer-events-none
                focus:outline-none focus-visible:ring-2 focus-visible:ring-(--highlighted-text)
              "
            >
              Próxima
            </button>
          </div>
        </div>
      )}

      <AdocaoModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={handleSaved}
      />
    </div>
  );
}
