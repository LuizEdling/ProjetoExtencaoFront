import { useCallback, useEffect, useMemo, useState } from "react";
import { getApiErrorMessage } from "../../lib/apiErrorMessage";
import type { Lembrete } from "../../types/lembrete";
import { fetchLembretes, deleteLembrete } from "../../services/lembretesApi";
import {
  formatarDataHora,
  labelRecorrencia,
  mensagemAlerta,
  temAlerta,
} from "../../lib/lembreteAlertas";
import FlashBanner, { type FlashPayload } from "../FlashBanner";
import LembreteModal from "./LembreteModal";
import { useAppDialog } from "../../hooks/useAppDialog";

function BellIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M10.27 21a2 2 0 0 0 3.46 0" />
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
    </svg>
  );
}

export default function LembretesPage() {
  const { confirm, alert } = useAppDialog();
  const [data, setData] = useState<Lembrete[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [alertasOpen, setAlertasOpen] = useState(false);
  const [selected, setSelected] = useState<Lembrete | null>(null);
  const [flash, setFlash] = useState<FlashPayload | null>(null);

  const dismissFlash = useCallback(() => setFlash(null), []);

  const lembretesComAlerta = useMemo(() => {
    return data.filter(temAlerta);
  }, [data]);

  async function load() {
    const res = await fetchLembretes();
    setData(res);
  }

  useEffect(() => {
    let isMounted = true;

    fetchLembretes()
      .then((res) => {
        if (isMounted) {
          setData(res);
        }
      })
      .catch((err) => {
        console.error(err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleDelete(id: number) {
    const ok = await confirm({
      title: "Excluir lembrete",
      message: "Excluir lembrete?",
      destructive: true,
      confirmLabel: "Excluir",
    });
    if (!ok) return;

    try {
      await deleteLembrete(id);
      await load();
      setFlash({ variant: "success", message: "Lembrete excluído com sucesso." });
    } catch (err) {
      await alert({
        title: "Erro ao excluir",
        message: getApiErrorMessage(err, { fallback: "Não foi possível excluir o lembrete." }),
        variant: "error",
      });
    }
  }

  async function handleSaved() {
    const wasEdit = selected !== null;
    await load();
    setFlash({
      variant: "success",
      message: wasEdit ? "Lembrete atualizado com sucesso." : "Lembrete cadastrado com sucesso.",
    });
  }

  function handleOpenCreate() {
    setSelected(null);
    setModalOpen(true);
  }

  function handleOpenEdit(lembrete: Lembrete) {
    setSelected(lembrete);
    setModalOpen(true);
    setAlertasOpen(false);
  }

  function handleCloseModal() {
    setModalOpen(false);
    setSelected(null);
  }

  return (
    <div className="relative p-6">
      {flash && <FlashBanner flash={flash} onDismiss={dismissFlash} />}

      <button
        type="button"
        onClick={() => setAlertasOpen(true)}
        className="
          absolute left-6 top-6
          flex h-11 w-11 items-center justify-center
          rounded-full border border-(--light-gray)/25
          bg-(--background-second-layer)
          text-(--green-title)
          transition hover:bg-(--background-first-layer)
        "
        aria-label="Abrir notificacoes de lembretes"
      >
        <BellIcon />

        {lembretesComAlerta.length > 0 && (
          <span
            className="
              absolute -right-1 -top-1
              flex h-5 min-w-5 items-center justify-center
              rounded-full bg-(--error-advice)
              px-1 text-xs font-bold text-white
            "
          >
            {lembretesComAlerta.length}
          </span>
        )}
      </button>

      <div className="mb-6 flex items-center justify-between gap-4 pl-14">
        <div>
          <h1 className="text-2xl font-bold text-(--green-title)">Lembretes</h1>
          <p className="text-sm text-(--text-secondary)">
            Gerencie seus lembretes e pendencias
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="rounded-full bg-(--light-green) px-4 py-2 text-white"
        >
          Novo
        </button>
      </div>

      <div className="space-y-3">
        {data.length === 0 ? (
          <div className="text-(--text-secondary)">Nenhum lembrete cadastrado</div>
        ) : (
          data.map((l) => {
            const alerta = temAlerta(l);
            const recorrencia = labelRecorrencia(l);

            return (
              <div
                key={l.id}
                className="
                  rounded-xl border border-(--light-gray)/25
                  bg-(--background-second-layer)
                  p-4
                "
              >
                <div className="flex justify-between gap-4">
                  <div>
                    <strong className="text-(--text-primary)">{l.nome}</strong>
                    <p className="text-sm text-(--text-secondary)">{l.descricao}</p>
                    <p className="mt-1 text-xs text-(--text-secondary)">
                      Próxima: {formatarDataHora(l)}
                    </p>
                    {recorrencia && (
                      <span
                        className="
                          mt-2 inline-flex rounded-full bg-(--background-first-layer)
                          px-2 py-0.5 text-xs text-(--text-secondary)
                        "
                      >
                        {recorrencia}
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenEdit(l)}
                      className="rounded-full px-3 py-1 hover:bg-(--background-first-layer)"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDelete(l.id)}
                      className="rounded-full px-3 py-1 hover:bg-(--background-first-layer)"
                    >
                      Excluir
                    </button>
                  </div>
                </div>

                {alerta && (
                  <p className="mt-2 text-sm font-medium text-(--error-advice)">
                    {mensagemAlerta(l)}
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>

      {alertasOpen && (
        <div className="fixed inset-0 z-20 flex items-start justify-center p-4 pt-20">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            onClick={() => setAlertasOpen(false)}
            aria-label="Fechar notificacoes"
          />

          <div
            className="
              relative z-10 w-full max-w-lg
              rounded-2xl border border-(--light-gray)/25
              bg-(--background-second-layer)
              p-6 shadow-lg
            "
          >
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="text-xl font-bold text-(--green-title)">Notificacoes</h2>

              <button
                type="button"
                onClick={() => setAlertasOpen(false)}
                className="rounded-full px-3 py-1 hover:bg-(--background-first-layer)"
              >
                Fechar
              </button>
            </div>

            {lembretesComAlerta.length === 0 ? (
              <p className="text-sm text-(--text-secondary)">
                Nenhum lembrete dentro dos prazos de alerta.
              </p>
            ) : (
              <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-1">
                {lembretesComAlerta.map((lembrete) => (
                  <div
                    key={lembrete.id}
                    className="
                      rounded-xl border border-(--light-gray)/25
                      bg-(--background-first-layer)
                      p-4
                    "
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-(--text-primary)">
                          {lembrete.nome}
                        </h3>
                        <p className="text-sm text-(--text-secondary)">
                          {lembrete.descricao}
                        </p>
                        <p className="mt-1 text-xs text-(--text-secondary)">
                          Próxima: {formatarDataHora(lembrete)}
                        </p>
                        <p className="mt-2 text-sm font-medium text-(--error-advice)">
                          {mensagemAlerta(lembrete)}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleOpenEdit(lembrete)}
                        className="rounded-full px-3 py-1 hover:bg-(--background-second-layer)"
                      >
                        Editar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <LembreteModal
        open={modalOpen}
        onClose={handleCloseModal}
        onSaved={handleSaved}
        lembreteToEdit={selected}
      />
    </div>
  );
}
