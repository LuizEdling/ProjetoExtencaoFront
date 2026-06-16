import { isAxiosError } from "axios";
import { useEffect, useId, useRef, useState } from "react";
import { getApiErrorMessage } from "../../lib/apiErrorMessage";
import { isEstadoAdotado } from "../../lib/isEstadoAdotado";
import { fetchAdotantes } from "../../services/adotantesApi";
import { createAdocao } from "../../services/adocoesApi";
import { fetchAnimals } from "../../services/animalsApi";
import type { Adotante } from "../../types/adotante";
import type { AnimalFicha } from "../../types/animalFicha";
import AppAlert from "../ui/AppAlert";

type Props = {
  open: boolean;
  onClose: () => void;
  /** Chamado após adoção criada com sucesso (para flash com nome do animal). */
  onSaved: (detail: { animalNome: string }) => Promise<void>;
};

function toIsoDateLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function fieldError(err: unknown): string {
  if (isAxiosError(err)) {
    const data = err.response?.data as
      | { message?: string; errors?: Record<string, string[]> }
      | undefined;
    if (data?.errors) {
      const first = Object.values(data.errors).flat()[0];
      if (first) return first;
    }
  }
  return getApiErrorMessage(err, { fallback: "Não foi possível registrar a adoção." });
}

export default function AdocaoModal({ open, onClose, onSaved }: Props) {
  const titleId = useId();
  const heroId = useId();
  const firstFieldRef = useRef<HTMLSelectElement>(null);

  const [animais, setAnimais] = useState<AnimalFicha[]>([]);
  const [adotantes, setAdotantes] = useState<Adotante[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [animalId, setAnimalId] = useState("");
  const [adotanteId, setAdotanteId] = useState("");
  const [dataAdocao, setDataAdocao] = useState(() => toIsoDateLocal(new Date()));
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const animaisDisponiveis = animais.filter((a) => !isEstadoAdotado(a.estado.nome));

  useEffect(() => {
    if (!open) return;
    setFormError(null);
    setLoadError(null);
    setDataAdocao(toIsoDateLocal(new Date()));
    setAnimalId("");
    setAdotanteId("");

    let cancelled = false;
    Promise.all([fetchAnimals(), fetchAdotantes()])
      .then(([listaAnimais, listaAdotantes]) => {
        if (!cancelled) {
          setAnimais(listaAnimais);
          setAdotantes(listaAdotantes);
        }
      })
      .catch(() => {
        if (!cancelled) setLoadError("Não foi possível carregar animais ou adotantes.");
      });

    return () => {
      cancelled = true;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => firstFieldRef.current?.focus(), 0);
    return () => window.clearTimeout(t);
  }, [open]);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    const aid = animalId.trim();
    const tid = adotanteId.trim();
    if (!/^\d+$/.test(aid)) {
      setFormError("Selecione o animal adotado.");
      return;
    }
    if (!/^\d+$/.test(tid)) {
      setFormError("Selecione o adotante.");
      return;
    }
    const data = dataAdocao.trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) {
      setFormError("Informe a data da adoção (formato AAAA-MM-DD).");
      return;
    }

    setSubmitting(true);
    try {
      const created = await createAdocao({
        animal_id: parseInt(aid, 10),
        adotante_id: parseInt(tid, 10),
        data_adocao: data,
      });
      const nome = created.animal?.nome?.trim() || "O animal";
      await onSaved({ animalNome: nome });
      onClose();
    } catch (err) {
      setFormError(fieldError(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-black/40 cursor-default modal-backdrop-enter"
        aria-label="Fechar"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={heroId}
        className="
          modal-panel-enter relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto
          rounded-2xl border border-(--light-gray)/25 border-t-4 border-t-(--light-green)
          bg-(--background-second-layer) shadow-xl
        "
        onClick={(e) => e.stopPropagation()}
      >
        <div
          id={heroId}
          className="
            relative overflow-hidden rounded-t-[0.85rem] border-b border-(--light-green)/25
            bg-linear-to-br from-(--light-green-bg) via-(--background-first-layer) to-(--background-second-layer)
            px-6 pt-6 pb-5 sm:px-8 sm:pt-8
          "
        >
          <div
            className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-(--light-green)/15 blur-2xl"
            aria-hidden
          />
          <div className="relative flex gap-4">
            <div
              className="
                flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl
                border border-(--light-green)/35 bg-(--background-second-layer)/80 shadow-sm
              "
              aria-hidden
            >
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--green-title)"
                strokeWidth="1.75"
              >
                <path
                  d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="min-w-0 pt-0.5">
              <p className="text-xs font-semibold uppercase tracking-wider text-(--light-green)">
                Conquista do abrigo
              </p>
              <h2 id={titleId} className="mt-1 text-xl font-bold text-(--green-title) leading-tight">
                Nova adoção
              </h2>
              <p className="mt-1.5 text-sm text-(--text-secondary) leading-snug">
                Registrar uma adoção celebra o cuidado da equipe e abre espaço para novos resgates.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4 p-6 sm:p-8 sm:pt-6">
          {loadError && (
            <AppAlert variant="error" compact>
              {loadError}
            </AppAlert>
          )}

          <label className="block">
            <span className="form-label">Animal adotado</span>
            <select
              ref={firstFieldRef}
              required
              value={animalId}
              onChange={(e) => setAnimalId(e.target.value)}
              disabled={!!loadError || animaisDisponiveis.length === 0}
              className="mt-1 form-control"
            >
              <option value="">
                {animaisDisponiveis.length === 0 && !loadError
                  ? "Nenhum animal disponível para adoção"
                  : "Selecione o animal…"}
              </option>
              {animaisDisponiveis.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nome} — {a.especie} ({a.estado.nome})
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="form-label">Adotante</span>
            <select
              required
              value={adotanteId}
              onChange={(e) => setAdotanteId(e.target.value)}
              disabled={!!loadError || adotantes.length === 0}
              className="mt-1 form-control"
            >
              <option value="">
                {adotantes.length === 0 && !loadError ? "Nenhum adotante cadastrado" : "Selecione o adotante…"}
              </option>
              {adotantes.map((d) => (
                <option key={d.id} value={String(d.id)}>
                  {d.nome}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="form-label">Data da adoção</span>
            <input
              required
              type="date"
              value={dataAdocao}
              onChange={(e) => setDataAdocao(e.target.value)}
              disabled={!!loadError}
              className="mt-1 form-control"
            />
          </label>

          {formError && (
            <AppAlert variant="error" compact className="pt-0.5">
              {formError}
            </AppAlert>
          )}

          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="
                w-full sm:w-auto px-6 py-2.5 rounded-full border border-(--light-gray)/50
                text-(--text-primary) text-sm font-medium
                hover:bg-(--background-first-layer) transition-all duration-200
                active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100
                focus:outline-none focus-visible:ring-2 focus-visible:ring-(--highlighted-text)
              "
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting || !!loadError || animaisDisponiveis.length === 0 || adotantes.length === 0}
              className="
                w-full sm:flex-1 px-6 py-2.5 rounded-full
                bg-(--light-green) text-white font-medium text-sm
                hover:opacity-90 transition-all duration-200
                active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100
                focus:outline-none focus-visible:ring-2 focus-visible:ring-(--highlighted-text)
              "
            >
              {submitting ? "Registrando…" : "Confirmar adoção"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
