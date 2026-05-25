import { useEffect, useId, useRef, useState } from "react";
import { isAxiosError } from "axios";
import { createAdotante, updateAdotante } from "../../services/adotantesApi";
import type { Adotante } from "../../types/adotante";

type Props = {
  open: boolean;
  onClose: () => void;
  onSaved: () => Promise<void>;
  adotanteToEdit: Adotante | null;
};

type FormState = {
  nome: string;
  cpf: string;
  telefone: string;
  rg: string;
  endereco: string;
  bairro: string;
  cidade: string;
  uf: string;
};

function emptyForm(): FormState {
  return {
    nome: "",
    cpf: "",
    telefone: "",
    rg: "",
    endereco: "",
    bairro: "",
    cidade: "",
    uf: "",
  };
}

function str(v: string | null | undefined): string {
  return v == null ? "" : String(v);
}

function getInitialForm(adotante: Adotante | null): FormState {
  if (!adotante) {
    return emptyForm();
  }

  return {
    nome: adotante.nome,
    cpf: adotante.cpf,
    telefone: adotante.telefone,
    rg: str(adotante.rg),
    endereco: str(adotante.endereco),
    bairro: str(adotante.bairro),
    cidade: str(adotante.cidade),
    uf: str(adotante.uf),
  };
}

function AdotanteModalContent({
  onClose,
  onSaved,
  adotanteToEdit,
}: Omit<Props, "open">) {
  const titleId = useId();
  const firstFieldRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<FormState>(() =>
    getInitialForm(adotanteToEdit)
  );
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const isEdit = adotanteToEdit != null;

  useEffect(() => {
    const t = setTimeout(() => firstFieldRef.current?.focus(), 0);
    return () => clearTimeout(t);
  }, []);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function formatCPF(value: string) {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
      .slice(0, 14);
  }

  function formatTelefone(value: string) {
    return value
      .replace(/\D/g, "")
      .replace(/^(\d{2})(\d)/g, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .slice(0, 15);
  }

  function formatUF(value: string) {
    return value.replace(/[^a-zA-Z]/g, "").toUpperCase().slice(0, 2);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    const payload = {
      nome: form.nome.trim(),
      cpf: form.cpf.replace(/\D/g, ""),
      telefone: form.telefone.replace(/\D/g, ""),
      rg: form.rg.trim(),
      endereco: form.endereco.trim(),
      bairro: form.bairro.trim(),
      cidade: form.cidade.trim(),
      uf: formatUF(form.uf),
    };

    setSubmitting(true);

    try {
      if (isEdit && adotanteToEdit) {
        await updateAdotante(adotanteToEdit.id, payload);
      } else {
        await createAdotante(payload);
      }

      await onSaved();
      onClose();
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        const errors = err.response?.data?.errors;

        if (errors?.cpf) {
          setFormError("CPF já cadastrado.");
          return;
        }

        if (errors?.nome) {
          setFormError("Informe o nome.");
          return;
        }

        if (errors?.telefone) {
          setFormError("Informe o telefone.");
          return;
        }

        if (errors?.rg) {
          setFormError("Informe o RG.");
          return;
        }

        if (errors?.endereco) {
          setFormError("Informe o endereço.");
          return;
        }

        if (errors?.bairro) {
          setFormError("Informe o bairro.");
          return;
        }

        if (errors?.cidade) {
          setFormError("Informe a cidade.");
          return;
        }

        if (errors?.uf) {
          setFormError("Informe a UF com 2 letras.");
          return;
        }

        setFormError("Erro ao salvar. Verifique os dados.");
      } else {
        setFormError("Erro inesperado.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* OVERLAY */}
      <button
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* MODAL */}
      <div
        className="
          relative z-10 w-full max-w-xl max-h-[90vh] overflow-y-auto
          rounded-2xl border border-(--light-gray)/25 border-t-4 border-t-(--light-green)
          bg-(--background-second-layer) shadow-xl p-6
        "
      >
        <h2 id={titleId} className="text-xl font-bold text-(--green-title)">
          {isEdit ? "Editar adotante" : "Novo adotante"}
        </h2>

        <p className="text-sm text-(--text-secondary)">
          Preencha os dados do adotante
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

            <label className="block">
              <span className="form-label">CPF</span>
              <input
                required
                value={form.cpf}
                onChange={(e) => update("cpf", formatCPF(e.target.value))}
                className="mt-1 form-control"
              />
            </label>

            <label className="block">
              <span className="form-label">Telefone</span>
              <input
                required
                value={form.telefone}
                onChange={(e) => update("telefone", formatTelefone(e.target.value))}
                className="mt-1 form-control"
              />
            </label>

            <label className="block sm:col-span-2">
              <span className="form-label">RG</span>
              <input
                required
                maxLength={20}
                value={form.rg}
                onChange={(e) => update("rg", e.target.value)}
                className="mt-1 form-control"
              />
            </label>

            <label className="block sm:col-span-2">
              <span className="form-label">Endereço</span>
              <input
                required
                maxLength={255}
                value={form.endereco}
                onChange={(e) => update("endereco", e.target.value)}
                className="mt-1 form-control"
              />
            </label>

            <label className="block sm:col-span-2">
              <span className="form-label">Bairro</span>
              <input
                required
                maxLength={120}
                value={form.bairro}
                onChange={(e) => update("bairro", e.target.value)}
                className="mt-1 form-control"
              />
            </label>

            <label className="block sm:col-span-1">
              <span className="form-label">Cidade</span>
              <input
                required
                maxLength={120}
                value={form.cidade}
                onChange={(e) => update("cidade", e.target.value)}
                className="mt-1 form-control"
              />
            </label>

            <label className="block sm:col-span-1">
              <span className="form-label">UF</span>
              <input
                required
                maxLength={2}
                placeholder="Ex.: SP"
                value={form.uf}
                onChange={(e) => update("uf", formatUF(e.target.value))}
                className="mt-1 form-control uppercase"
                autoComplete="address-level1"
              />
            </label>
          </div>

          {formError && (
            <p className="text-sm text-(--error-advice)">
              {formError}
            </p>
          )}

          {/* BOTÕES */}
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
              {submitting ? "Salvando..." : isEdit ? "Atualizar" : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdotanteModal({
  open,
  onClose,
  onSaved,
  adotanteToEdit,
}: Props) {
  if (!open) return null;

  return (
    <AdotanteModalContent
      key={adotanteToEdit?.id ?? "new"}
      onClose={onClose}
      onSaved={onSaved}
      adotanteToEdit={adotanteToEdit}
    />
  );
}
