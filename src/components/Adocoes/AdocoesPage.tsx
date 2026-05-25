import { isAxiosError } from "axios";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import FlashBanner, { type FlashPayload } from "../FlashBanner";
import AdocaoModal from "./AdocaoModal";
import { adoptionCelebrationMessage } from "../../lib/adoptionCelebrationMessage";
import { formatDateBR, toIsoDateOnly } from "../../lib/formatFicha";
import { fetchAdocoes } from "../../services/adocoesApi";
import type { AdocaoListItem } from "../../types/adocao";

function formatCPF(value: string | undefined) {
  const v = value ?? "";
  return v
    .replace(/\D/g, "")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function loadErrorMessage(err: unknown): string {
  if (isAxiosError(err)) {
    const data = err.response?.data as { message?: string } | undefined;
    return data?.message ?? err.message ?? "Erro ao carregar as adoções.";
  }
  if (err instanceof Error) return err.message;
  return "Erro ao carregar as adoções.";
}

export default function AdocoesPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<AdocaoListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [flash, setFlash] = useState<FlashPayload | null>(null);

  const dismissFlash = useCallback(() => setFlash(null), []);

  const load = useCallback(async () => {
    setLoadError(null);
    try {
      const list = await fetchAdocoes();
      setRows(list);
    } catch (e) {
      setLoadError(loadErrorMessage(e));
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const list = await fetchAdocoes();
        if (!cancelled) setRows(list);
      } catch (e) {
        if (!cancelled) setLoadError(loadErrorMessage(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSaved({ animalNome }: { animalNome: string }) {
    setFlash({
      variant: "success",
      celebration: true,
      message: adoptionCelebrationMessage(animalNome),
    });
    await load();
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

      {flash && (
        <div className="mb-4">
          <FlashBanner flash={flash} onDismiss={dismissFlash} />
        </div>
      )}

      {loadError && (
        <div
          className="
            mb-4 rounded-2xl border border-(--error-advice)/40 bg-(--red-bg)/50
            px-4 py-3 text-sm text-(--error-advice)
          "
          role="alert"
        >
          {loadError}
        </div>
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
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="p-4 text-center text-(--text-secondary)">
                  Carregando...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-4 text-center text-(--text-secondary)">
                  Nenhuma adoção registrada ainda. Use &quot;+ Nova adoção&quot; para registrar a primeira.
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const dataIso = toIsoDateOnly(
                  typeof row.data_adocao === "string" ? row.data_adocao : String(row.data_adocao ?? ""),
                );
                const estadoNome = row.animal?.animal_state?.nome ?? "—";
                return (
                  <tr key={row.id} className="border-t border-(--light-gray)/20">
                    <td className="p-3 text-(--text-primary)">{formatDateBR(dataIso)}</td>
                    <td className="p-3 text-(--text-primary) font-medium">{row.animal?.nome ?? "—"}</td>
                    <td className="p-3 text-(--text-primary)">{estadoNome}</td>
                    <td className="p-3 text-(--text-primary)">{row.adotante?.nome ?? "—"}</td>
                    <td className="p-3 text-(--text-primary)">{formatCPF(row.adotante?.cpf)}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <AdocaoModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={handleSaved}
      />
    </div>
  );
}
