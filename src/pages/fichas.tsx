import axios from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import FichaAdicionarModal from "../components/Fichas/FichaAdicionarModal";
import FichaDetalheModal from "../components/Fichas/FichaDetalheModal";
import { formatDateBR } from "../lib/formatFicha";
import { fetchAnimals } from "../services/animalsApi";
import type { AnimalFicha } from "../types/animalFicha";

function normalize(s: string) {
  return s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
}

function loadErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { message?: string } | undefined;
    return data?.message ?? err.message ?? "Erro ao carregar os animais.";
  }
  if (err instanceof Error) return err.message;
  return "Erro ao carregar os animais.";
}

export default function Fichas() {
  const [animais, setAnimais] = useState<AnimalFicha[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const [selecionado, setSelecionado] = useState<AnimalFicha | null>(null);
  const [addOpen, setAddOpen] = useState(false);

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
        const list = await fetchAnimals();
        if (!cancelled) setAnimais(list);
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

  async function handleCreated() {
    await refreshAnimals();
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
              onClick={() => setAddOpen(true)}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtradas.map((animal) => (
            <div
              key={animal.id}
              role="button"
              tabIndex={0}
              onClick={() => abrirFicha(animal)}
              onKeyDown={(e) => onCardKeyDown(e, animal)}
              className="
                flex flex-col min-h-[140px] p-5 rounded-2xl cursor-pointer
                bg-(--background-second-layer)
                border border-(--light-gray)/25 shadow-sm
                hover:border-(--light-green)/40 hover:shadow-md
                transition-all
                focus:outline-none focus-visible:ring-2 focus-visible:ring-(--highlighted-text)
              "
            >
              <p className="font-semibold text-lg text-(--text-primary)">{animal.nome}</p>
              <p className="mt-1 text-sm text-(--text-secondary)">{animal.raca}</p>
              <p className="mt-auto pt-4 text-xs text-(--text-secondary) text-right tabular-nums">
                {formatDateBR(animal.data)}
              </p>
            </div>
          ))}
        </div>
      )}

      <FichaDetalheModal animal={selecionado} onClose={fecharModal} />
      <FichaAdicionarModal open={addOpen} onClose={() => setAddOpen(false)} onCreated={handleCreated} />
    </div>
  );
}
