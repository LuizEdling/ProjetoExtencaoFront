import { useState } from "react";
import { isAxiosError } from "axios";
import { createLembrete, updateLembrete } from "../../services/lembretesApi";
import type { Lembrete, LembreteFormPayload, TipoRecorrencia } from "../../types/lembrete";

type Props = {
  open: boolean;
  onClose: () => void;
  onSaved: () => Promise<void>;
  lembreteToEdit: Lembrete | null;
};

type FormData = LembreteFormPayload & {
  recorrente: boolean;
};

function getTodayInputValue() {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, "0");
  const dia = String(hoje.getDate()).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}

function getInitialForm(lembrete: Lembrete | null): FormData {
  const tipo = lembrete?.tipoRecorrencia ?? "once";

  return {
    nome: lembrete?.nome ?? "",
    descricao: lembrete?.descricao ?? "",
    data: lembrete?.data ? String(lembrete.data).slice(0, 10) : "",
    hora: lembrete?.hora ?? "",
    recorrente: tipo !== "once",
    tipoRecorrencia: tipo === "once" ? "every_n_days" : tipo,
    intervaloDias: lembrete?.intervaloDias ?? 7,
    diaSemana: lembrete?.diaSemana ?? new Date().getDay(),
    diaMes: lembrete?.diaMes ?? new Date().getDate(),
    dataFim: lembrete?.dataFim ? String(lembrete.dataFim).slice(0, 10) : "",
  };
}

function LembreteModalContent({
  onClose,
  onSaved,
  lembreteToEdit,
}: Omit<Props, "open">) {
  const [form, setForm] = useState<FormData>(() => getInitialForm(lembreteToEdit));
  const [error, setError] = useState<string | null>(null);
  const isEdit = !!lembreteToEdit;
  const today = getTodayInputValue();

  function handleRecorrenteChange(recorrente: boolean) {
    setForm((prev) => ({
      ...prev,
      recorrente,
      tipoRecorrencia: recorrente ? "every_n_days" : "once",
    }));
  }

  function handleTipoChange(tipo: TipoRecorrencia) {
    setForm((prev) => ({ ...prev, tipoRecorrencia: tipo }));
  }

  function validateForm(): string | null {
    if (!form.nome.trim()) {
      return "Informe o nome do lembrete.";
    }

    if (!form.data) {
      return "Informe a data de início.";
    }

    if (!isEdit && form.data < today) {
      return "A data do lembrete não pode ser anterior a hoje.";
    }

    if (form.recorrente) {
      if (form.tipoRecorrencia === "every_n_days" && (!form.intervaloDias || form.intervaloDias < 1)) {
        return "Informe o intervalo em dias (mínimo 1).";
      }

      if (form.tipoRecorrencia === "weekday" && form.diaSemana === null) {
        return "Selecione o dia da semana.";
      }

      if (form.tipoRecorrencia === "day_of_month" && (!form.diaMes || form.diaMes < 1)) {
        return "Selecione o dia do mês.";
      }
    }

    if (form.dataFim && form.dataFim < form.data) {
      return "A data fim deve ser igual ou posterior à data de início.";
    }

    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    const payload: LembreteFormPayload = {
      nome: form.nome.trim(),
      descricao: form.descricao.trim(),
      data: form.data,
      hora: form.hora || null,
      tipoRecorrencia: form.recorrente ? form.tipoRecorrencia : "once",
      intervaloDias: form.recorrente && form.tipoRecorrencia === "every_n_days" ? form.intervaloDias : null,
      diaSemana: form.recorrente && form.tipoRecorrencia === "weekday" ? form.diaSemana : null,
      diaMes: form.recorrente && form.tipoRecorrencia === "day_of_month" ? form.diaMes : null,
      dataFim: form.dataFim || null,
    };

    try {
      if (isEdit && lembreteToEdit) {
        await updateLembrete(lembreteToEdit.id, payload);
      } else {
        await createLembrete(payload);
      }

      await onSaved();
      onClose();
    } catch (err) {
      if (isAxiosError(err)) {
        setError("Erro ao salvar.");
      }
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative z-10 max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-(--light-gray)/25 bg-(--background-second-layer) p-6">
        <h2 className="text-xl font-bold text-(--green-title)">
          {isEdit ? "Editar lembrete" : "Novo lembrete"}
        </h2>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <input
            placeholder="Nome"
            value={form.nome}
            onChange={(e) => setForm((prev) => ({ ...prev, nome: e.target.value }))}
            className="form-control"
          />

          <textarea
            placeholder="Descrição"
            value={form.descricao}
            onChange={(e) => setForm((prev) => ({ ...prev, descricao: e.target.value }))}
            className="form-control"
          />

          <label className="flex items-center gap-2 text-sm text-(--text-secondary)">
            <input
              type="checkbox"
              checked={form.recorrente}
              onChange={(e) => handleRecorrenteChange(e.target.checked)}
            />
            Lembrete recorrente
          </label>

          {form.recorrente && (
            <div className="space-y-3 rounded-xl border border-(--light-gray)/20 p-3">
              <label className="block text-sm text-(--text-secondary)">
                Tipo de recorrência
                <select
                  value={form.tipoRecorrencia}
                  onChange={(e) => handleTipoChange(e.target.value as TipoRecorrencia)}
                  className="form-control mt-1"
                >
                  <option value="every_n_days">A cada N dias</option>
                  <option value="weekday">Dia da semana</option>
                  <option value="day_of_month">Dia do mês</option>
                </select>
              </label>

              {form.tipoRecorrencia === "every_n_days" && (
                <label className="block text-sm text-(--text-secondary)">
                  Intervalo (dias)
                  <input
                    type="number"
                    min={1}
                    value={form.intervaloDias ?? ""}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        intervaloDias: e.target.value ? Number(e.target.value) : null,
                      }))
                    }
                    className="form-control mt-1"
                  />
                </label>
              )}

              {form.tipoRecorrencia === "weekday" && (
                <label className="block text-sm text-(--text-secondary)">
                  Dia da semana
                  <select
                    value={form.diaSemana ?? 0}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, diaSemana: Number(e.target.value) }))
                    }
                    className="form-control mt-1"
                  >
                    <option value={0}>Domingo</option>
                    <option value={1}>Segunda</option>
                    <option value={2}>Terça</option>
                    <option value={3}>Quarta</option>
                    <option value={4}>Quinta</option>
                    <option value={5}>Sexta</option>
                    <option value={6}>Sábado</option>
                  </select>
                </label>
              )}

              {form.tipoRecorrencia === "day_of_month" && (
                <label className="block text-sm text-(--text-secondary)">
                  Dia do mês
                  <select
                    value={form.diaMes ?? 1}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, diaMes: Number(e.target.value) }))
                    }
                    className="form-control mt-1"
                  >
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((dia) => (
                      <option key={dia} value={dia}>
                        Dia {dia}
                      </option>
                    ))}
                  </select>
                </label>
              )}
            </div>
          )}

          <label className="block text-sm text-(--text-secondary)">
            Data de início
            <input
              type="date"
              min={isEdit ? undefined : today}
              value={form.data}
              onChange={(e) => setForm((prev) => ({ ...prev, data: e.target.value }))}
              className="form-control mt-1"
            />
          </label>

          <label className="block text-sm text-(--text-secondary)">
            Hora (opcional)
            <input
              type="time"
              value={form.hora ?? ""}
              onChange={(e) => setForm((prev) => ({ ...prev, hora: e.target.value }))}
              className="form-control mt-1"
            />
          </label>

          <label className="block text-sm text-(--text-secondary)">
            Data fim (opcional)
            <input
              type="date"
              min={form.data || today}
              value={form.dataFim ?? ""}
              onChange={(e) => setForm((prev) => ({ ...prev, dataFim: e.target.value }))}
              className="form-control mt-1"
            />
          </label>

          {error && <p className="text-(--error-advice)">{error}</p>}

          <button className="w-full rounded-full bg-(--light-green) py-2 text-white">
            Salvar
          </button>
        </form>
      </div>
    </div>
  );
}

export default function LembreteModal({
  open,
  onClose,
  onSaved,
  lembreteToEdit,
}: Props) {
  if (!open) return null;

  return (
    <LembreteModalContent
      key={lembreteToEdit?.id ?? "new"}
      onClose={onClose}
      onSaved={onSaved}
      lembreteToEdit={lembreteToEdit}
    />
  );
}
