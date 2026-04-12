import axios from "axios";
import { useEffect, useId, useRef, useState } from "react";
import { createAnimal } from "../../services/animalsApi";
import { SEXOS_ANIMAL, type SexoAnimal } from "../../types/animalFicha";
import CreatableCatalogCombobox from "./CreatableCatalogCombobox";

const ESPECIES_PADRAO = ["Gato", "Cachorro"] as const;

const IDADE_MIN = 0;
const IDADE_MAX = 50;
const PESO_MIN = 0.01;
const PESO_MAX = 200;

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated: () => Promise<void>;
};

type FormState = {
  nome: string;
  raca: string;
  data_ficha: string;
  especie: string;
  sexo: "" | SexoAnimal;
  idade: string;
  peso: string;
  cor: string;
  data_entrada: string;
  observacoes: string;
};

function emptyForm(): FormState {
  return {
    nome: "",
    raca: "",
    data_ficha: "",
    especie: "",
    sexo: "",
    idade: "",
    peso: "",
    cor: "",
    data_entrada: "",
    observacoes: "",
  };
}

function validateForm(form: FormState): string | null {
  const dataFicha = form.data_ficha.trim();
  if (!dataFicha) {
    return "Informe a data da ficha.";
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dataFicha)) {
    return "Data da ficha inválida. Use o seletor de data.";
  }

  const dataEntrada = form.data_entrada.trim();
  if (!dataEntrada) {
    return "Informe a data de entrada.";
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dataEntrada)) {
    return "Data de entrada inválida. Use o seletor de data.";
  }

  if (form.sexo !== "Macho" && form.sexo !== "Fêmea") {
    return "Selecione o sexo (Macho ou Fêmea).";
  }

  const idadeRaw = form.idade.trim();
  if (idadeRaw === "") {
    return "Informe a idade.";
  }
  const idadeNum = parseInt(idadeRaw, 10);
  if (!Number.isInteger(idadeNum) || idadeNum < IDADE_MIN || idadeNum > IDADE_MAX) {
    return `A idade deve ser um número inteiro entre ${IDADE_MIN} e ${IDADE_MAX}.`;
  }

  const pesoRaw = form.peso.trim().replace(",", ".");
  if (pesoRaw === "") {
    return "Informe o peso em kg.";
  }
  const pesoNum = parseFloat(pesoRaw);
  if (!Number.isFinite(pesoNum) || pesoNum < PESO_MIN || pesoNum > PESO_MAX) {
    return `O peso deve ser um número entre ${PESO_MIN} e ${PESO_MAX} kg.`;
  }

  return null;
}

function fieldError(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { message?: string } | undefined;
    return data?.message ?? err.message ?? "Não foi possível salvar.";
  }
  if (err instanceof Error) return err.message;
  return "Não foi possível salvar.";
}

export default function FichaAdicionarModal({ open, onClose, onCreated }: Props) {
  const titleId = useId();
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setForm(emptyForm());
    setFormError(null);
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

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    const validationError = validateForm(form);
    if (validationError) {
      setFormError(validationError);
      return;
    }

    const idadeNum = parseInt(form.idade.trim(), 10);
    const pesoNum = parseFloat(form.peso.trim().replace(",", "."));

    setSubmitting(true);
    try {
      await createAnimal({
        nome: form.nome.trim(),
        raca: form.raca.trim(),
        data_ficha: form.data_ficha.trim(),
        especie: form.especie.trim(),
        sexo: form.sexo as SexoAnimal,
        idade: idadeNum,
        peso: pesoNum,
        cor: form.cor.trim(),
        data_entrada: form.data_entrada.trim(),
        observacoes: form.observacoes.trim(),
      });
      await onCreated();
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
        className="
          modal-panel-enter relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto
          rounded-2xl border border-(--light-gray)/25 border-t-4 border-t-(--light-green)
          bg-(--background-second-layer) shadow-xl p-6 sm:p-8
        "
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id={titleId} className="text-xl font-bold text-(--green-title)">
          Adicionar ficha
        </h2>
        <p className="mt-1 text-sm text-(--text-secondary)">
          Preencha os dados do animal.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="block sm:col-span-2">
              <span className="form-label">Nome</span>
              <input
                ref={firstFieldRef}
                required
                value={form.nome}
                onChange={(e) => update("nome", e.target.value)}
                className="mt-1 form-control"
              />
            </label>
            <CreatableCatalogCombobox
              label="Raça"
              kind="raca"
              required
              value={form.raca}
              onChange={(v) => update("raca", v)}
            />
            <label className="block">
              <span className="form-label">Data da ficha</span>
              <input
                required
                type="date"
                value={form.data_ficha}
                onChange={(e) => update("data_ficha", e.target.value)}
                className="mt-1 form-control"
              />
            </label>
            <CreatableCatalogCombobox
              label="Espécie"
              kind="especie"
              required
              value={form.especie}
              onChange={(v) => update("especie", v)}
              defaultOptions={[...ESPECIES_PADRAO]}
            />
            <label className="block">
              <span className="form-label">Sexo</span>
              <select
                required
                value={form.sexo}
                onChange={(e) =>
                  update("sexo", e.target.value === "" ? "" : (e.target.value as SexoAnimal))
                }
                className="mt-1 form-control"
              >
                <option value="" disabled>
                  Selecione…
                </option>
                {SEXOS_ANIMAL.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="form-label">Idade (anos)</span>
              <input
                required
                type="number"
                min={IDADE_MIN}
                max={IDADE_MAX}
                step={1}
                inputMode="numeric"
                value={form.idade}
                onChange={(e) => update("idade", e.target.value)}
                className="mt-1 form-control"
              />
            </label>
            <label className="block">
              <span className="form-label">Peso (kg)</span>
              <input
                required
                type="number"
                min={PESO_MIN}
                max={PESO_MAX}
                step={0.01}
                inputMode="decimal"
                aria-label="Peso em quilogramas"
                value={form.peso}
                onChange={(e) => update("peso", e.target.value)}
                className="mt-1 form-control"
              />
            </label>
            <CreatableCatalogCombobox
              label="Cor"
              kind="cor"
              required
              value={form.cor}
              onChange={(v) => update("cor", v)}
            />
            <label className="block sm:col-span-2">
              <span className="form-label">Data de entrada</span>
              <input
                required
                type="date"
                value={form.data_entrada}
                onChange={(e) => update("data_entrada", e.target.value)}
                className="mt-1 form-control"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="form-label">Observações</span>
              <textarea
                required
                rows={3}
                value={form.observacoes}
                onChange={(e) => update("observacoes", e.target.value)}
                className="mt-1 form-control resize-y"
              />
            </label>
          </div>

          {formError && (
            <p className="form-alert-enter text-sm text-(--error-advice) pt-1" role="alert">
              {formError}
            </p>
          )}

          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
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
              disabled={submitting}
              className="
                w-full sm:flex-1 px-6 py-2.5 rounded-full
                bg-(--light-green) text-white font-medium text-sm
                hover:opacity-90 transition-all duration-200
                active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100
                focus:outline-none focus-visible:ring-2 focus-visible:ring-(--highlighted-text)
              "
            >
              {submitting ? "Salvando…" : "Salvar ficha"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
