import { isAxiosError } from "axios";
import { useEffect, useId, useRef, useState } from "react";
import { toIsoDateLocal } from "../../lib/formatFicha";
import { isEstadoAdotado } from "../../lib/isEstadoAdotado";
import { createAnimal, updateAnimal } from "../../services/animalsApi";
import type { AnimalEstadoApiRow } from "../../services/animalStatesApi";
import { SEXOS_ANIMAL, type AnimalFicha, type SexoAnimal } from "../../types/animalFicha";
import CreatableCatalogCombobox from "./CreatableCatalogCombobox";
import AnimalCuidadosCheckboxes, { type CuidadosKey } from "./AnimalCuidadosCheckboxes";

const ESPECIES_PADRAO = ["Gato", "Cachorro"] as const;

const MICROCHIP_MAX_LEN = 15;

const IDADE_MIN = 0;
const IDADE_MAX = 50;
const PESO_MIN = 0.01;
const PESO_MAX = 200;

type Props = {
  open: boolean;
  onClose: () => void;
  onSaved: (detail: {
    action: "create" | "update";
    adoptedCelebration?: boolean;
    /** Nome do animal (só quando adoptedCelebration). */
    animalNome?: string;
  }) => Promise<void>;
  animalToEdit: AnimalFicha | null;
  estados: AnimalEstadoApiRow[];
};

type FormState = {
  nome: string;
  raca: string;
  data_ficha: string;
  microchip: string;
  especie: string;
  sexo: "" | SexoAnimal;
  idade: string;
  peso: string;
  cor: string;
  data_entrada: string;
  observacoes: string;
  animal_state_id: string;
  vermifugado: boolean;
  vacinado: boolean;
  castrado: boolean;
};

function defaultEstadoId(estados: AnimalEstadoApiRow[]): string {
  const row = estados.find((e) => e.nome === "Esperando consulta");
  if (row) return String(row.id);
  return estados[0] != null ? String(estados[0].id) : "";
}

function emptyForm(estados: AnimalEstadoApiRow[]): FormState {
  return {
    nome: "",
    raca: "",
    data_ficha: toIsoDateLocal(),
    microchip: "",
    especie: "",
    sexo: "",
    idade: "",
    peso: "",
    cor: "",
    data_entrada: "",
    observacoes: "",
    animal_state_id: defaultEstadoId(estados),
    vermifugado: false,
    vacinado: false,
    castrado: false,
  };
}

function fichaToFormState(a: AnimalFicha): FormState {
  const sid = a.estado.id && a.estado.id !== "0" ? a.estado.id : "";
  return {
    nome: a.nome,
    raca: a.raca,
    data_ficha: a.data,
    microchip: a.microchip,
    especie: a.especie,
    sexo: a.sexo,
    idade: String(a.idade),
    peso: String(a.peso),
    cor: a.cor,
    data_entrada: a.dataEntrada,
    observacoes: a.observacoes,
    animal_state_id: sid,
    vermifugado: a.vermifugado,
    vacinado: a.vacinado,
    castrado: a.castrado,
  };
}

function validateForm(form: FormState): string | null {
  const sid = form.animal_state_id.trim();
  if (!/^\d+$/.test(sid)) {
    return "Selecione o estado do animal.";
  }

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

  const chip = form.microchip.trim();
  if (chip !== "" && !/^\d+$/.test(chip)) {
    return "Microchip: use apenas números.";
  }
  if (chip.length > MICROCHIP_MAX_LEN) {
    return `Microchip: no máximo ${MICROCHIP_MAX_LEN} dígitos.`;
  }

  return null;
}

function fieldError(err: unknown): string {
  if (isAxiosError(err)) {
    const data = err.response?.data as { message?: string } | undefined;
    return data?.message ?? err.message ?? "Não foi possível salvar.";
  }
  if (err instanceof Error) return err.message;
  return "Não foi possível salvar.";
}

export default function FichaAdicionarModal({ open, onClose, onSaved, animalToEdit, estados }: Props) {
  const titleId = useId();
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<FormState>(() => emptyForm([]));
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const isEdit = animalToEdit != null;

  useEffect(() => {
    if (!open) return;
    setFormError(null);
    if (animalToEdit) {
      setForm(fichaToFormState(animalToEdit));
    } else {
      setForm(emptyForm(estados));
    }
  }, [open, animalToEdit, estados]);

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
  }, [open, animalToEdit]);

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
    const animalStateId = parseInt(form.animal_state_id.trim(), 10);
    const estadoRow = estados.find((s) => s.id === animalStateId);
    const nomeEstadoNovo = estadoRow?.nome ?? "";
    const wasAdotado = animalToEdit ? isEstadoAdotado(animalToEdit.estado.nome) : false;
    const nowAdotado = isEstadoAdotado(nomeEstadoNovo);
    const adoptedCelebration = nowAdotado && !wasAdotado;
    const animalNomeCelebration = adoptedCelebration
      ? isEdit && animalToEdit
        ? animalToEdit.nome
        : form.nome.trim()
      : undefined;

    const payload = {
      nome: form.nome.trim(),
      raca: form.raca.trim(),
      microchip: form.microchip.trim() === "" ? null : form.microchip.trim(),
      data_ficha: form.data_ficha.trim(),
      especie: form.especie.trim(),
      sexo: form.sexo as SexoAnimal,
      idade: idadeNum,
      peso: pesoNum,
      cor: form.cor.trim(),
      data_entrada: form.data_entrada.trim(),
      observacoes: form.observacoes.trim(),
      animal_state_id: animalStateId,
      vermifugado: form.vermifugado,
      vacinado: form.vacinado,
      castrado: form.castrado,
    };

    setSubmitting(true);
    try {
      if (isEdit && animalToEdit) {
        await updateAnimal(animalToEdit.id, payload);
        await onSaved({
          action: "update",
          adoptedCelebration,
          animalNome: animalNomeCelebration,
        });
      } else {
        await createAnimal(payload);
        await onSaved({
          action: "create",
          adoptedCelebration,
          animalNome: animalNomeCelebration,
        });
      }
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
          {isEdit ? "Editar ficha" : "Adicionar ficha"}
        </h2>
        <p className="mt-1 text-sm text-(--text-secondary)">
          {isEdit ? "Atualize os dados do animal." : "Preencha os dados do animal."}
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
            <label className="block sm:col-span-2">
              <span className="form-label">Estado no abrigo</span>
              <select
                required
                value={form.animal_state_id}
                onChange={(e) => update("animal_state_id", e.target.value)}
                className="mt-1 form-control"
                disabled={estados.length === 0}
              >
                {estados.length === 0 ? (
                  <option value="">Carregando estados…</option>
                ) : (
                  estados.map((s) => (
                    <option key={s.id} value={String(s.id)}>
                      {s.nome}
                    </option>
                  ))
                )}
              </select>
            </label>
            <div className="block sm:col-span-2">
              <span className="form-label">Cuidados</span>
              <div className="mt-2">
                <AnimalCuidadosCheckboxes
                  vermifugado={form.vermifugado}
                  vacinado={form.vacinado}
                  castrado={form.castrado}
                  onChange={(key: CuidadosKey, checked: boolean) => update(key, checked)}
                  disabled={submitting}
                />
              </div>
            </div>
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
              <span className="form-label">Microchip (opcional)</span>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="off"
                maxLength={MICROCHIP_MAX_LEN}
                pattern="[0-9]*"
                placeholder="Somente números, até 15 dígitos"
                value={form.microchip}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, "").slice(0, MICROCHIP_MAX_LEN);
                  update("microchip", digits);
                }}
                className="mt-1 form-control tabular-nums"
              />
            </label>
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
              {submitting ? "Salvando…" : isEdit ? "Atualizar ficha" : "Salvar ficha"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
