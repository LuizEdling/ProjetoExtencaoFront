import type { Adotante } from "../../types/adotante";
import { fetchAdotantes, deleteAdotante } from "../../services/adotantesApi";
import AdotanteModal from "./AdotanteModal";
import { useEffect, useState } from "react";

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

export default function AdotantesPage() {
  const [data, setData] = useState<Adotante[]>([]);
  const [loading, setLoading] = useState(true);

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
    if (!confirm("Deseja excluir este adotante?")) return;

    await deleteAdotante(id);
    await load();
  }

  return (
    <div className="p-6">
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
        <div className="flex gap-2 flex-wrap">
          <input
            placeholder="Buscar por nome"
            value={filters.nome}
            onChange={(e) =>
              setFilters({ ...filters, nome: e.target.value })
            }
            className="form-control"
          />

          <input
            placeholder="Buscar por CPF"
            value={filters.cpf}
            onChange={(e) =>
              setFilters({ ...filters, cpf: e.target.value })
            }
            className="form-control"
          />
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
          shadow-sm overflow-hidden
        "
      >
        <table className="w-full text-sm">
          <thead className="bg-(--background-first-layer) text-(--text-secondary)">
            <tr>
              <th className="p-3 text-left">Nome</th>
              <th className="p-3 text-left">CPF</th>
              <th className="p-3 text-left">Telefone</th>
              <th className="p-3 text-left">Ações</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="p-4 text-center text-(--text-secondary)">
                  Carregando...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-4 text-center text-(--text-secondary)">
                  Nenhum adotante encontrado
                </td>
              </tr>
            ) : (
              data.map((a) => (
                <tr key={a.id} className="border-t border-(--light-gray)/20">
                  <td className="p-3 text-(--text-primary)">
                    {a.nome}
                  </td>

                  {/* CPF FORMATADO E MESMA COR DO NOME */}
                  <td className="p-3 text-(--text-primary)">
                    {formatCPF(a.cpf)}
                  </td>

                  {/* TELEFONE FORMATADO */}
                  <td className="p-3 text-(--text-primary)">
                    {formatTelefone(a.telefone)}
                  </td>

                  <td className="p-3 flex gap-2 text-(--text-secondary)">
                    <button
                      onClick={() => {
                        setSelected(a);
                        setModalOpen(true);
                      }}
                      className="
                        px-3 py-1 rounded-full text-xs
                        hover:bg-(--background-first-layer)
                        transition
                      "
                    >
                      ✏️
                    </button>

                    <button
                      onClick={() => handleDelete(a.id)}
                      className="
                        px-3 py-1 rounded-full text-xs
                        hover:bg-(--background-first-layer)
                        transition
                      "
                    >
                      🗑️
                    </button>
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
