import { isAxiosError } from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import FlashBanner, { type FlashPayload } from "../components/FlashBanner";
import AnimalEstadoSelect from "../components/Fichas/AnimalEstadoSelect";
import FichaAdicionarModal from "../components/Fichas/FichaAdicionarModal";
import FichaDetalheModal from "../components/Fichas/FichaDetalheModal";
import { estadoDotClass } from "../constants/animalEstadoStyles";
import { formatDateBR } from "../lib/formatFicha";
import { deleteAnimal, fetchAnimals } from "../services/animalsApi";
import { fetchAnimalStates } from "../services/animalStatesApi";
import type { AnimalEstadoApiRow } from "../services/animalStatesApi";
import type { AnimalFicha } from "../types/animalFicha";

function normalize(s: string) {
  return s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
}

function loadErrorMessage(err: unknown): string {
  if (isAxiosError(err)) {
    const data = err.response?.data as { message?: string } | undefined;
    return data?.message ?? err.message ?? "Erro ao carregar os animais.";
  }
  if (err instanceof Error) return err.message;
  return "Erro ao carregar os animais.";
}

function adoptionCelebrationMessage(nome: string): string {
  return `Parabéns! ${nome} agora está adotado — uma conquista incrível para o abrigo!`;
}

function deleteErrorMessage(err: unknown): string {
  if (isAxiosError(err)) {
    const data = err.response?.data as { message?: string } | undefined;
    return data?.message ?? err.message ?? "Não foi possível excluir a ficha.";
  }
  if (err instanceof Error) return err.message;
  return "Não foi possível excluir a ficha.";
}

export default function Fichas() {
  const [animais, setAnimais] = useState<AnimalFicha[]>([]);
  const [estadosCatalogo, setEstadosCatalogo] = useState<AnimalEstadoApiRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const [selecionado, setSelecionado] = useState<AnimalFicha | null>(null);
  const [fichaFormOpen, setFichaFormOpen] = useState(false);
  const [animalToEdit, setAnimalToEdit] = useState<AnimalFicha | null>(null);
  const [flash, setFlash] = useState<FlashPayload | null>(null);

  const dismissFlash = useCallback(() => setFlash(null), []);

  const refreshAnimals = useCallback(async () => {
    setLoadError(null);
    try {
      const list = await fetchAnimals();
      setAnimais(list);
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
        const [list, estados] = await Promise.all([fetchAnimals(), fetchAnimalStates()]);
        if (!cancelled) {
          setAnimais(list);
          setEstadosCatalogo(estados);
        }
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

  const filtradas = useMemo(() => {
    const q = normalize(busca.trim());
    if (!q) return animais;
    return animais.filter((a) => {
      const hay = `${a.nome} ${a.raca} ${a.especie}`;
      return normalize(hay).includes(q);
    });
  }, [animais, busca]);

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

  function onCardKeyDown(e: React.KeyboardEvent, a: AnimalFicha) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      abrirFicha(a);
    }
  }

  async function handleSaved(detail: {
    action: "create" | "update";
    adoptedCelebration?: boolean;
    animalNome?: string;
  }) {
    await refreshAnimals();
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
      setAnimais((prev) => prev.filter((a) => a.id !== animal.id));
      setSelecionado((cur) => (cur?.id === animal.id ? null : cur));
      if (animalToEdit?.id === animal.id) closeFichaModal();
      setFlash({ variant: "success", message: "Ficha deletada com sucesso." });
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
                placeholder="Buscar por nome, raça ou espécie..."
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

      {!loading && !loadError && animais.length === 0 && (
        <p className="text-center text-(--text-secondary) py-16 rounded-2xl border border-(--light-gray)/25 bg-(--background-second-layer)">
          Nenhum animal cadastrado ainda. Use &quot;Adicionar Ficha&quot; para incluir o primeiro.
        </p>
      )}

      {!loading && !loadError && animais.length > 0 && filtradas.length === 0 && (
        <p className="text-center text-(--text-secondary) py-16 rounded-2xl border border-(--light-gray)/25 bg-(--background-second-layer)">
          Nenhum animal encontrado para essa busca.
        </p>
      )}

      {!loading && !loadError && filtradas.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtradas.map((animal) => (
            <article
              key={animal.id}
              className="
                flex flex-col rounded-2xl overflow-hidden
                bg-(--background-second-layer)
                border border-(--light-gray)/30 shadow-md
                hover:border-(--light-green)/45 hover:shadow-lg
                transition-all duration-200
              "
            >
              <div
                className="
                  flex flex-wrap items-start gap-3 p-4
                  bg-(--background-first-layer)/40 border-b border-(--light-gray)/25
                "
              >
                <div className="min-w-0 flex-1 space-y-1.5">
                  <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-(--text-secondary)">
                    Estado no abrigo
                  </p>
                  <p className="text-xs text-(--text-secondary) leading-snug">
                    <span className="text-(--text-secondary)/90">Atual: </span>
                    <span className="inline-flex items-center gap-1.5 font-medium text-(--text-primary)">
                      <span className={`${estadoDotClass(animal.estado.nome)}`} aria-hidden />
                      {animal.estado.nome}
                    </span>
                  </p>
                </div>
                <div className="flex shrink-0 gap-1.5 self-start pt-0.5">
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
                  <button
                    type="button"
                    aria-label={`Editar ficha de ${animal.nome}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditFicha(animal);
                    }}
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
              </div>

              <div
                role="button"
                tabIndex={0}
                onClick={() => abrirFicha(animal)}
                onKeyDown={(e) => onCardKeyDown(e, animal)}
                className="
                  flex flex-col flex-1 min-h-[120px] p-5 cursor-pointer text-left
                  outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-(--highlighted-text)
                "
              >
                <p className="font-semibold text-lg text-(--text-primary) leading-snug">{animal.nome}</p>
                <p className="mt-1.5 text-sm text-(--text-secondary)">{animal.raca}</p>
                <p className="mt-1 text-xs text-(--text-secondary)/80">{animal.especie}</p>
                <p className="mt-auto pt-4 text-xs text-(--text-secondary) text-right tabular-nums border-t border-(--light-gray)/15">
                  Ficha · {formatDateBR(animal.data)}
                </p>
              </div>
            </article>
          ))}
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
