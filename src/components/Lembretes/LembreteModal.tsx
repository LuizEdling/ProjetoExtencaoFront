import { useState } from "react";
import { isAxiosError } from "axios";
import { createLembrete, updateLembrete } from "../../services/lembretesApi";
import type { Lembrete } from "../../types/lembrete";

type Props = {
  open: boolean;
  onClose: () => void;
  onSaved: () => Promise<void>;
  lembreteToEdit: Lembrete | null;
};

type FormData = {
  nome: string;
  descricao: string;
  data: string;
};

function getInitialForm(lembrete: Lembrete | null): FormData {
  return {
    nome: lembrete?.nome ?? "",
    descricao: lembrete?.descricao ?? "",
    data: lembrete?.data ? String(lembrete.data).slice(0, 10) : "",
  };
}

function getTodayInputValue() {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, "0");
  const dia = String(hoje.getDate()).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}

function LembreteModalContent({
  onClose,
  onSaved,
  lembreteToEdit,
}: Omit<Props, "open">) {
  const [form, setForm] = useState<FormData>(() =>
    getInitialForm(lembreteToEdit)
  );

  const [error, setError] = useState<string | null>(null);
  const isEdit = !!lembreteToEdit;
  const today = getTodayInputValue();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (form.data < today) {
      setError("A data do lembrete nao pode ser anterior a hoje.");
      return;
    }

    try {
      if (isEdit && lembreteToEdit) {
        await updateLembrete(lembreteToEdit.id, form);
      } else {
        await createLembrete(form);
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

      <div className="relative z-10 w-full max-w-md rounded-2xl border border-(--light-gray)/25 bg-(--background-second-layer) p-6">
        <h2 className="text-xl font-bold text-(--green-title)">
          {isEdit ? "Editar lembrete" : "Novo lembrete"}
        </h2>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <input
            placeholder="Nome"
            value={form.nome}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, nome: e.target.value }))
            }
            className="form-control"
          />

          <textarea
            placeholder="Descrição"
            value={form.descricao}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, descricao: e.target.value }))
            }
            className="form-control"
          />

          <input
            type="date"
            min={today}
            value={form.data}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, data: e.target.value }))
            }
            className="form-control"
          />

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
