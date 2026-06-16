import { useCallback, useEffect, useState } from "react";
import { getApiErrorMessage } from "../../lib/apiErrorMessage";
import type { Adotante } from "../../types/adotante";
import { fetchAdotantes, deleteAdotante } from "../../services/adotantesApi";
import AdotanteModal from "./AdotanteModal";
import FlashBanner, { type FlashPayload } from "../FlashBanner";
import { useAppDialog } from "../../hooks/useAppDialog";

/* =========================
   FORMATADORES
========================= */
function formatCPF(value: string) {
  return value
    ?.replace(/\D/g, "")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function formatTelefone(value: string) {
  return value
    ?.replace(/\D/g, "")
    .replace(/^(\d{2})(\d)/g, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2");
}

function dash(s: string | null | undefined) {
  const t = String(s ?? "").trim();
  return t !== "" ? t : "—";
}

export default function AdotantesPage() {
  const { confirm, alert } = useAppDialog();
  const [data, setData] = useState<Adotante[]>([]);
  const [loading, setLoading] = useState(true);
  const [flash, setFlash] = useState<FlashPayload | null>(null);

  const dismissFlash = useCallback(() => setFlash(null), []);

  const [filters, setFilters] = useState({ nome: "", cpf: "" });

  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<Adotante | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetchAdotantes(filters);
    setData(res);
    setLoading(false);
  }

  useEffect(() => {
    let isMounted = true;

    fetchAdotantes(filters)
      .then((res) => {
        if (isMounted) {
          setData(res);
        }
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [filters]);

  async function handleDelete(id: number) {
    const ok = await confirm({
      title: "Excluir adotante",
      message: "Deseja excluir este adotante?",
      destructive: true,
      confirmLabel: "Excluir",
    });
    if (!ok) return;

    try {
      await deleteAdotante(id);
      await load();
      setFlash({ variant: "success", message: "Adotante excluído com sucesso." });
    } catch (err) {
      await alert({
        title: "Erro ao excluir",
        message: getApiErrorMessage(err, { fallback: "Não foi possível excluir o adotante." }),
        variant: "error",
      });
    }
  }

  return (
    <div className="p-6">
      {flash && <FlashBanner flash={flash} onDismiss={dismissFlash} />}

      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-(--green-title)">
          Adotantes
        </h1>
        <p className="text-sm text-(--text-secondary)">
          Gerencie os adotantes cadastrados
        </p>
      </div>

      {/* TOOLBAR */}
      <div className="flex justify-between items-center mb-4 gap-3 flex-wrap">
        <div className="flex flex-nowrap gap-2 min-w-0">
          <div className="w-[min(100%,14rem)] shrink-0 sm:w-56">
            <input
              placeholder="Buscar por nome"
              value={filters.nome}
              onChange={(e) =>
                setFilters({ ...filters, nome: e.target.value })
              }
              className="form-control"
            />
          </div>
          <div className="w-[min(100%,14rem)] shrink-0 sm:w-52">
            <input
              placeholder="Buscar por CPF"
              value={filters.cpf}
              onChange={(e) =>
                setFilters({ ...filters, cpf: e.target.value })
              }
              className="form-control"
            />
          </div>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="
            px-6 py-2.5 rounded-full
            bg-(--light-green) text-white text-sm font-medium
            hover:opacity-90 transition-all duration-200
            active:scale-[0.98]
            focus:outline-none focus-visible:ring-2 focus-visible:ring-(--highlighted-text)
          "
        >
          + Novo adotante
        </button>
      </div>

      {/* TABELA */}
      <div
        className="
          rounded-2xl border border-(--light-gray)/25
          bg-(--background-second-layer)
          shadow-sm overflow-hidden overflow-x-auto
        "
      >
        <table className="w-full min-w-[56rem] text-sm text-left">
          <thead className="bg-(--background-first-layer) text-(--text-secondary)">
            <tr>
              <th className="p-3 whitespace-nowrap">Nome</th>
              <th className="p-3 whitespace-nowrap">CPF</th>
              <th className="p-3 whitespace-nowrap">Telefone</th>
              <th className="p-3 whitespace-nowrap">RG</th>
              <th className="p-3 min-w-[10rem]">Endereço</th>
              <th className="p-3 whitespace-nowrap">Bairro</th>
              <th className="p-3 whitespace-nowrap">Cidade</th>
              <th className="p-3 w-12 text-center">UF</th>
              <th className="p-3 text-right whitespace-nowrap">Ações</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} className="p-4 text-center text-(--text-secondary)">
                  Carregando...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-4 text-center text-(--text-secondary)">
                  Nenhum adotante encontrado
                </td>
              </tr>
            ) : (
              data.map((a) => (
                <tr key={a.id} className="border-t border-(--light-gray)/20">
                  <td className="p-3 text-(--text-primary) align-top">{a.nome}</td>

                  <td className="p-3 text-(--text-primary) tabular-nums align-top whitespace-nowrap">
                    {formatCPF(a.cpf)}
                  </td>

                  <td className="p-3 text-(--text-primary) tabular-nums align-top whitespace-nowrap">
                    {formatTelefone(a.telefone)}
                  </td>

                  <td className="p-3 text-(--text-primary) align-top whitespace-nowrap">{dash(a.rg)}</td>

                  <td className="p-3 text-(--text-primary) align-top max-w-[14rem]">
                    <span className="line-clamp-2 break-words">{dash(a.endereco)}</span>
                  </td>

                  <td className="p-3 text-(--text-primary) align-top">{dash(a.bairro)}</td>

                  <td className="p-3 text-(--text-primary) align-top whitespace-nowrap">{dash(a.cidade)}</td>

                  <td className="p-3 text-(--text-primary) align-top text-center font-medium uppercase">
                    {dash(a.uf)}
                  </td>

                  <td className="p-3 align-top text-right">
                    <div className="flex gap-2 text-(--text-secondary)">
                      <button
                        type="button"
                        aria-label={`Editar ${a.nome}`}
                        onClick={() => {
                          setSelected(a);
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
                        aria-label={`Excluir ${a.nome}`}
                        onClick={() => void handleDelete(a.id)}
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

      {/* MODAL */}
      <AdotanteModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelected(null);
        }}
        onSaved={load}
        adotanteToEdit={selected}
      />
    </div>
  );
}
