import { useEffect, useId, useRef, useState } from "react";
import { isAxiosError } from "axios";
import { getApiErrorMessage } from "../../lib/apiErrorMessage";
import {
  brlAmountToDigitSequence,
  formatBrlDigitSequence,
  parseBrlDigitSequence,
  sanitizeBrlDigitInput,
} from "../../lib/brlCurrencyMask";
import { toIsoDateLocal } from "../../lib/formatFicha";
import { createGasto, updateGasto } from "../../services/gastosApi";
import AppAlert from "../ui/AppAlert";
import type { Gasto } from "../../types/gasto";

type Props = {
  open: boolean;
  onClose: () => void;
  onSaved: () => Promise<void>;
  gastoToEdit: Gasto | null;
};

type FormState = {
  valorDigits: string;
  doacao: boolean;
  data: string;
  descricao: string;
};

function emptyForm(): FormState {
  return {
    valorDigits: "",
    doacao: false,
    data: toIsoDateLocal(),
    descricao: "",
  };
}

function getInitialForm(g: Gasto | null): FormState {
  if (!g) return emptyForm();
  return {
    valorDigits: brlAmountToDigitSequence(g.valor),
    doacao: g.doacao,
    data: g.data,
    descricao: g.descricao,
  };
}

function GastoModalContent({ onClose, onSaved, gastoToEdit }: Omit<Props, "open">) {
  const titleId = useId();
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<FormState>(() => getInitialForm(gastoToEdit));
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const isEdit = gastoToEdit != null;

  useEffect(() => {
    const t = setTimeout(() => firstFieldRef.current?.focus(), 0);
    return () => clearTimeout(t);
  }, []);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    const valorNum = parseBrlDigitSequence(form.valorDigits);
    if (valorNum === null) {
      setFormError("Informe um valor válido.");
      return;
    }
    if (!form.doacao && valorNum < 0.01) {
      setFormError("Informe um valor válido (mínimo R$ 0,01).");
      return;
    }
    if (form.doacao && valorNum < 0) {
      setFormError("O valor não pode ser negativo.");
      return;
    }

    const data = form.data.trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) {
      setFormError("Informe a data da saída.");
      return;
    }

    const descricao = form.descricao.trim();
    if (descricao === "") {
      setFormError("Informe a descrição.");
      return;
    }
    if (descricao.length > 2000) {
      setFormError("Descrição: no máximo 2000 caracteres.");
      return;
    }

    const payload = {
      valor: valorNum,
      doacao: form.doacao,
      data,
      descricao,
    };

    setSubmitting(true);
    try {
      if (isEdit && gastoToEdit) {
        await updateGasto(gastoToEdit.id, payload);
      } else {
        await createGasto(payload);
      }
      await onSaved();
      onClose();
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        const dataErr = err.response?.data as
          | { message?: string; errors?: Record<string, string[]> }
          | undefined;
        if (dataErr?.errors) {
          const first = Object.values(dataErr.errors).flat()[0];
          if (first) {
            setFormError(first);
            return;
          }
        }
      }
      setFormError(getApiErrorMessage(err, { fallback: "Erro ao salvar." }));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-black/40" aria-label="Fechar" onClick={onClose} />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="
          relative z-10 w-full max-w-md max-h-[90vh] overflow-y-auto
          rounded-2xl border border-(--light-gray)/25 border-t-4 border-t-(--light-green)
          bg-(--background-second-layer) shadow-xl p-6
        "
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id={titleId} className="text-xl font-bold text-(--green-title)">
          {isEdit ? "Editar saída" : "Nova saída"}
        </h2>
        <p className="text-sm text-(--text-secondary) mt-1">Registre o valor, a data e o que foi gasto.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-3">
          <label className="flex items-start gap-3 cursor-pointer rounded-lg border border-(--light-gray)/30 bg-(--background-first-layer)/40 px-3 py-2.5">
            <input
              type="checkbox"
              checked={form.doacao}
              onChange={(e) => update("doacao", e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-(--light-gray)/60 text-(--light-green) focus:ring-(--highlighted-text)"
            />
            <span>
              <span className="block text-sm font-medium text-(--text-primary)">É doação</span>
              <span className="mt-0.5 block text-xs text-(--text-secondary)">
                Doações podem ser registradas com valor R$ 0,00.
              </span>
            </span>
          </label>

          <label className="block">
            <span className="form-label">Valor (R$)</span>
            <input
              ref={firstFieldRef}
              type="text"
              inputMode="numeric"
              autoComplete="off"
              placeholder={form.doacao ? "0,00" : "0,00"}
              value={formatBrlDigitSequence(form.valorDigits)}
              onChange={(e) => update("valorDigits", sanitizeBrlDigitInput(e.target.value))}
              className="mt-1 form-control"
            />
            {form.doacao && (
              <span className="mt-1 block text-xs text-(--text-secondary)">
                Opcional para doações — use 0,00 se não houver valor monetário.
              </span>
            )}
          </label>

          <label className="block">
            <span className="form-label">Data</span>
            <input
              required
              type="date"
              value={form.data}
              onChange={(e) => update("data", e.target.value)}
              className="mt-1 form-control"
            />
          </label>

          <label className="block">
            <span className="form-label">Descrição</span>
            <textarea
              required
              rows={4}
              maxLength={2000}
              value={form.descricao}
              onChange={(e) => update("descricao", e.target.value)}
              className="mt-1 form-control resize-y"
            />
          </label>

          {formError && (
            <AppAlert variant="error" compact>
              {formError}
            </AppAlert>
          )}

          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="
                w-full sm:w-auto px-6 py-2.5 rounded-full
                border border-(--light-gray)/50
                text-(--text-primary) text-sm font-medium
                hover:bg-(--background-first-layer)
                transition-all duration-200
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
              "
            >
              {submitting ? "Salvando…" : isEdit ? "Atualizar" : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function GastoModal({ open, onClose, onSaved, gastoToEdit }: Props) {
  if (!open) return null;

  return (
    <GastoModalContent key={gastoToEdit?.id ?? "new"} onClose={onClose} onSaved={onSaved} gastoToEdit={gastoToEdit} />
  );
}
