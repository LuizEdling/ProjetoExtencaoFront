import { isAxiosError } from "axios";
import { useCallback, useEffect, useState } from "react";
import FlashBanner, { type FlashPayload } from "../components/FlashBanner";
import AnimalEstadoSelect from "../components/Fichas/AnimalEstadoSelect";
import { AnimalCuidadoCheckboxCell, type CuidadosKey } from "../components/Fichas/AnimalCuidadosCheckboxes";
import FichaAdicionarModal from "../components/Fichas/FichaAdicionarModal";
import FichaDetalheModal from "../components/Fichas/FichaDetalheModal";
import { formatDateBR } from "../lib/formatFicha";
import { adoptionCelebrationMessage } from "../lib/adoptionCelebrationMessage";
import { deleteAnimal, fetchAnimalsPage, patchAnimalCuidados } from "../services/animalsApi";
import { fetchAnimalStates } from "../services/animalStatesApi";
import type { AnimalEstadoApiRow } from "../services/animalStatesApi";
import type { AnimalFicha } from "../types/animalFicha";

function loadErrorMessage(err: unknown): string {
  if (isAxiosError(err)) {
    const data = err.response?.data as { message?: string } | undefined;
    return data?.message ?? err.message ?? "Erro ao carregar os animais.";
  }
  if (err instanceof Error) return err.message;
  return "Erro ao carregar os animais.";
}

function deleteErrorMessage(err: unknown): string {
  if (isAxiosError(err)) {
    const data = err.response?.data as { message?: string } | undefined;
    return data?.message ?? err.message ?? "Não foi possível excluir a ficha.";
  }
  if (err instanceof Error) return err.message;
  return "Não foi possível excluir a ficha.";
}

function cuidadosPatchErrorMessage(err: unknown): string {
  if (isAxiosError(err)) {
    const data = err.response?.data as { message?: string } | undefined;
    return data?.message ?? err.message ?? "Não foi possível atualizar os cuidados.";
  }
  if (err instanceof Error) return err.message;
  return "Não foi possível atualizar os cuidados.";
}

export default function Fichas() {
  const [animais, setAnimais] = useState<AnimalFicha[]>([]);
  const [estadosCatalogo, setEstadosCatalogo] = useState<AnimalEstadoApiRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const [qApi, setQApi] = useState("");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [selecionado, setSelecionado] = useState<AnimalFicha | null>(null);
  const [fichaFormOpen, setFichaFormOpen] = useState(false);
  const [animalToEdit, setAnimalToEdit] = useState<AnimalFicha | null>(null);
  const [flash, setFlash] = useState<FlashPayload | null>(null);
  const [savingCuidadosKey, setSavingCuidadosKey] = useState<string | null>(null);

  const dismissFlash = useCallback(() => setFlash(null), []);

  useEffect(() => {
    const trimmed = busca.trim();
    if (trimmed === "") {
      setQApi("");
      return;
    }
    const t = window.setTimeout(() => setQApi(trimmed), 400);
    return () => window.clearTimeout(t);
  }, [busca]);

  useEffect(() => {
    setPage(1);
  }, [qApi]);

  const loadList = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetchAnimalsPage({ page, perPage: 10, q: qApi || undefined });
      setAnimais(res.data);
      setLastPage(res.lastPage);
      setPerPage(res.perPage);
      setTotal(res.total);
    } catch (e) {
      setLoadError(loadErrorMessage(e));
      setAnimais([]);
      setLastPage(1);
      setPerPage(10);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, qApi]);

  useEffect(() => {
    void loadList();
  }, [loadList]);

  useEffect(() => {
    let cancelled = false;
    fetchAnimalStates()
      .then((estados) => {
        if (!cancelled) setEstadosCatalogo(estados);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  function openAddFicha() {
    setAnimalToEdit(null);
    setFichaFormOpen(true);
  }

  function openEditFicha(animal: AnimalFicha) {
    setAnimalToEdit(animal);
    setFichaFormOpen(true);
  }

  function closeFichaModal() {
    setFichaFormOpen(false);
    setAnimalToEdit(null);
  }

  function abrirFicha(a: AnimalFicha) {
    setSelecionado(a);
  }

  function fecharModal() {
    setSelecionado(null);
  }

  async function handleSaved(detail: {
    action: "create" | "update";
    adoptedCelebration?: boolean;
    animalNome?: string;
  }) {
    await loadList();
    try {
      const estados = await fetchAnimalStates();
      setEstadosCatalogo(estados);
    } catch {
      /* catálogo de estados é secundário */
    }
    if (detail.adoptedCelebration && detail.animalNome) {
      setFlash({
        variant: "success",
        celebration: true,
        message: adoptionCelebrationMessage(detail.animalNome),
      });
      return;
    }
    setFlash({
      variant: "success",
      message:
        detail.action === "create"
          ? "Ficha cadastrada com sucesso."
          : "Ficha atualizada com sucesso.",
    });
  }

  function handleEstadoUpdated(animalId: string, next: AnimalFicha) {
    setAnimais((prev) => prev.map((a) => (a.id === animalId ? next : a)));
    setSelecionado((cur) => (cur?.id === animalId ? next : cur));
    setAnimalToEdit((cur) => (cur?.id === animalId ? next : cur));
  }

  async function handleCuidadosToggle(animal: AnimalFicha, key: CuidadosKey, checked: boolean) {
    const sk = `${animal.id}-${key}`;
    setSavingCuidadosKey(sk);
    try {
      const next = await patchAnimalCuidados(animal.id, { [key]: checked });
      handleEstadoUpdated(animal.id, next);
    } catch (err) {
      setFlash({ variant: "error", message: cuidadosPatchErrorMessage(err) });
    } finally {
      setSavingCuidadosKey(null);
    }
  }

  async function handleDelete(e: React.MouseEvent, animal: AnimalFicha) {
    e.stopPropagation();
    if (
      !window.confirm(
        `Excluir a ficha de “${animal.nome}”? O animal sai da listagem, mas o registro permanece no sistema (exclusão suave).`,
      )
    ) {
      return;
    }
    try {
      await deleteAnimal(animal.id);
      setSelecionado((cur) => (cur?.id === animal.id ? null : cur));
      if (animalToEdit?.id === animal.id) closeFichaModal();
      setFlash({ variant: "success", message: "Ficha deletada com sucesso." });
      if (animais.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        await loadList();
      }
    } catch (err) {
      setFlash({ variant: "error", message: deleteErrorMessage(err) });
    }
  }

  return (
    <div className="max-w-7xl mx-auto w-full space-y-8">
      <header className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-(--green-title) tracking-tight">
              Fichas
            </h1>
            <p className="mt-1 text-(--text-secondary) text-sm sm:text-base">
              Animais cadastrados
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto lg:max-w-xl">
            <button
              type="button"
              onClick={openAddFicha}
              className="
                shrink-0 px-5 py-2.5 rounded-full
                bg-(--light-green) text-white text-sm font-medium
                hover:opacity-90 transition-opacity
                focus:outline-none focus-visible:ring-2 focus-visible:ring-(--highlighted-text)
              "
            >
              Adicionar Ficha
            </button>
            <label className="relative flex-1 min-w-0 block">
              <span className="sr-only">Buscar fichas</span>
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-(--text-secondary)">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <circle cx="11" cy="11" r="7" />
                  <path d="M20 20l-3-3" strokeLinecap="round" />
                </svg>
              </span>
              <input
                type="search"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar por nome, raça, espécie ou microchip..."
                disabled={loading || !!loadError}
                className="
                  w-full rounded-full border border-(--light-gray)/50
                  bg-(--background-second-layer) text-(--text-primary)
                  pl-10 pr-4 py-2.5 text-sm
                  shadow-sm outline-none
                  focus:border-(--light-green) focus:ring-2 focus:ring-(--highlighted-text)/40
                  disabled:opacity-50
                "
              />
            </label>
          </div>
        </div>
      </header>

      {flash && <FlashBanner flash={flash} onDismiss={dismissFlash} />}

      {loadError && (
        <div
          className="
            rounded-2xl border border-(--error-advice)/40 bg-(--red-bg)/50
            px-4 py-3 text-sm text-(--error-advice)
          "
          role="alert"
        >
          {loadError}
        </div>
      )}

      {loading && (
        <p className="text-center text-(--text-secondary) py-16">Carregando animais…</p>
      )}

      {!loading && !loadError && total === 0 && !qApi && (
        <p className="text-center text-(--text-secondary) py-16 rounded-2xl border border-(--light-gray)/25 bg-(--background-second-layer)">
          Nenhum animal cadastrado ainda. Use &quot;Adicionar Ficha&quot; para incluir o primeiro.
        </p>
      )}

      {!loading && !loadError && total === 0 && qApi && (
        <p className="text-center text-(--text-secondary) py-16 rounded-2xl border border-(--light-gray)/25 bg-(--background-second-layer)">
          Nenhum animal encontrado para essa busca.
        </p>
      )}

      {!loading && !loadError && total > 0 && (
        <div
          className="
            rounded-2xl border border-(--light-gray)/25
            bg-(--background-second-layer)
            shadow-sm overflow-hidden overflow-x-auto
          "
        >
          <table className="w-full min-w-[62rem] text-sm text-left">
            <thead className="bg-(--background-first-layer) text-(--text-secondary)">
              <tr>
                <th className="p-3 min-w-[10rem]">Animal</th>
                <th className="p-3 hidden md:table-cell">Raça</th>
                <th className="p-3 hidden lg:table-cell">Espécie</th>
                <th className="p-3 whitespace-nowrap hidden md:table-cell">Microchip</th>
                <th className="p-3 whitespace-nowrap">Estado</th>
                <th className="p-3 whitespace-nowrap hidden sm:table-cell">Data ficha</th>
                <th className="p-3 text-center w-24">Vermifugado</th>
                <th className="p-3 text-center w-24">Vacinado</th>
                <th className="p-3 text-center w-24">Castrado</th>
                <th className="p-3 text-right whitespace-nowrap">Ações</th>
              </tr>
            </thead>
            <tbody>
              {animais.map((animal) => (
                <tr
                  key={animal.id}
                  className="border-t border-(--light-gray)/20 hover:bg-(--background-first-layer)/30 transition-colors"
                >
                  <td className="p-3 align-top">
                    <button
                      type="button"
                      onClick={() => abrirFicha(animal)}
                      className="
                        text-left font-semibold text-(--text-primary) leading-snug
                        hover:text-(--green-title) hover:underline underline-offset-2
                        focus:outline-none focus-visible:ring-2 focus-visible:ring-(--highlighted-text) rounded
                      "
                    >
                      {animal.nome}
                    </button>
                    <p className="mt-1 text-xs text-(--text-secondary) md:hidden">{animal.raca}</p>
                    <p className="mt-0.5 text-[0.65rem] text-(--text-secondary)/80 lg:hidden">{animal.especie}</p>
                    <p className="mt-1 text-xs text-(--text-secondary) md:hidden tabular-nums">
                      Microchip · {animal.microchip.trim() !== "" ? animal.microchip : "—"}
                    </p>
                    <p className="mt-1 text-xs text-(--text-secondary) sm:hidden tabular-nums">
                      Ficha · {formatDateBR(animal.data)}
                    </p>
                  </td>
                  <td className="p-3 text-(--text-primary) hidden md:table-cell align-top">{animal.raca}</td>
                  <td className="p-3 text-(--text-primary) hidden lg:table-cell align-top">{animal.especie}</td>
                  <td className="p-3 text-(--text-secondary) tabular-nums hidden md:table-cell align-top whitespace-nowrap">
                    {animal.microchip.trim() !== "" ? animal.microchip : "—"}
                  </td>
                  <td className="p-3 align-top" onClick={(e) => e.stopPropagation()}>
                    <div className="inline-flex min-w-0 max-w-full">
                      <AnimalEstadoSelect
                        animal={animal}
                        estados={estadosCatalogo}
                        onUpdated={(next) => handleEstadoUpdated(animal.id, next)}
                        onSuccessNotify={({ celebration, animalNome }) =>
                          setFlash(
                            celebration
                              ? {
                                  variant: "success",
                                  celebration: true,
                                  message: adoptionCelebrationMessage(animalNome),
                                }
                              : { variant: "success", message: "Estado atualizado com sucesso." },
                          )
                        }
                      />
                    </div>
                  </td>
                  <td className="p-3 text-(--text-secondary) tabular-nums hidden sm:table-cell align-top whitespace-nowrap">
                    {formatDateBR(animal.data)}
                  </td>
                  <td className="p-2 align-middle bg-(--background-first-layer)/15">
                    <AnimalCuidadoCheckboxCell
                      cuidado="vermifugado"
                      checked={animal.vermifugado}
                      busy={savingCuidadosKey === `${animal.id}-vermifugado`}
                      onChange={(c) => {
                        void handleCuidadosToggle(animal, "vermifugado", c);
                      }}
                    />
                  </td>
                  <td className="p-2 align-middle bg-(--background-first-layer)/15">
                    <AnimalCuidadoCheckboxCell
                      cuidado="vacinado"
                      checked={animal.vacinado}
                      busy={savingCuidadosKey === `${animal.id}-vacinado`}
                      onChange={(c) => {
                        void handleCuidadosToggle(animal, "vacinado", c);
                      }}
                    />
                  </td>
                  <td className="p-2 align-middle bg-(--background-first-layer)/15">
                    <AnimalCuidadoCheckboxCell
                      cuidado="castrado"
                      checked={animal.castrado}
                      busy={savingCuidadosKey === `${animal.id}-castrado`}
                      onChange={(c) => {
                        void handleCuidadosToggle(animal, "castrado", c);
                      }}
                    />
                  </td>
                  <td className="p-3 align-top text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="inline-flex gap-1 justify-end">
                      <button
                        type="button"
                        aria-label={`Editar ficha de ${animal.nome}`}
                        onClick={() => openEditFicha(animal)}
                        className="
                          rounded-xl p-2 text-(--text-secondary)
                          border border-(--light-gray)/40 bg-(--background-second-layer)
                          hover:text-(--light-green) hover:border-(--light-green)/50
                          focus:outline-none focus-visible:ring-2 focus-visible:ring-(--highlighted-text)
                          transition-colors
                        "
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                          <path d="M12 20h9M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4L16.5 3.5z" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        aria-label={`Excluir ficha de ${animal.nome}`}
                        onClick={(e) => handleDelete(e, animal)}
                        className="
                          rounded-xl p-2 text-(--text-secondary)
                          border border-(--light-gray)/40 bg-(--background-second-layer)
                          hover:text-(--error-advice) hover:border-(--error-advice)/45
                          focus:outline-none focus-visible:ring-2 focus-visible:ring-(--highlighted-text)
                          transition-colors
                        "
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                          <path d="M3 6h18M8 6V4h8v2m-9 4v10m10-10v10M10 11v6M14 11v6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && !loadError && total > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <p className="text-sm text-(--text-secondary)">
            Página {page} de {lastPage} · {total} ficha{total === 1 ? "" : "s"} · {perPage} por página
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

      <FichaDetalheModal animal={selecionado} onClose={fecharModal} />
      <FichaAdicionarModal
        open={fichaFormOpen}
        animalToEdit={animalToEdit}
        estados={estadosCatalogo}
        onClose={closeFichaModal}
        onSaved={handleSaved}
      />
    </div>
  );
}
