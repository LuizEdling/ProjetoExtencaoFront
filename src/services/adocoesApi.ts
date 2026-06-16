import { isAxiosError } from "axios";
import { getAdocoesEndpoint } from "../lib/apiBase";
import { messageFromErrorBlob, triggerPdfDownload } from "../lib/pdfBlob";
import { apiClient } from "../lib/apiClient";
import type { AdocaoListItem, CreateAdocaoPayload } from "../types/adocao";

export interface PaginatedAdocoes {
  data: AdocaoListItem[];
  currentPage: number;
  lastPage: number;
  perPage: number;
  total: number;
}

interface LaravelAdocaoPaginator {
  current_page: number;
  data: AdocaoListItem[];
  last_page: number;
  per_page: number;
  total: number;
}

export async function fetchAdocoesPage(params: {
  page: number;
  perPage?: number;
}): Promise<PaginatedAdocoes> {
  const { data } = await apiClient.get<LaravelAdocaoPaginator>(getAdocoesEndpoint(), {
    params: {
      page: params.page,
      per_page: params.perPage ?? 10,
    },
  });

  const rows = Array.isArray(data.data) ? data.data : [];

  return {
    data: rows,
    currentPage: data.current_page,
    lastPage: data.last_page,
    perPage: data.per_page,
    total: data.total,
  };
}

export async function createAdocao(body: CreateAdocaoPayload): Promise<AdocaoListItem> {
  const { data } = await apiClient.post<{ data: AdocaoListItem }>(getAdocoesEndpoint(), body);
  return data.data;
}

export async function deleteAdocao(adocaoId: number): Promise<void> {
  await apiClient.delete(`${getAdocoesEndpoint()}/${encodeURIComponent(String(adocaoId))}`);
}

async function fetchContratoPdfBlob(adocaoId: number): Promise<Blob> {
  const url = `${getAdocoesEndpoint()}/${encodeURIComponent(String(adocaoId))}/contrato`;
  try {
    const response = await apiClient.post<Blob>(url, null, {
      responseType: "blob",
      headers: { Accept: "application/pdf" },
    });
    const blob = response.data;
    const contentType = String(response.headers["content-type"] ?? "");
    if (!contentType.includes("application/pdf")) {
      const msg = await messageFromErrorBlob(blob);
      throw new Error(msg ?? "Não foi possível gerar o contrato (resposta inesperada).");
    }
    return blob;
  } catch (err: unknown) {
    if (isAxiosError(err) && err.response?.data instanceof Blob) {
      const ct = String(err.response.headers["content-type"] ?? "");
      if (ct.includes("application/json")) {
        const msg = await messageFromErrorBlob(err.response.data);
        throw new Error(msg ?? "Não foi possível gerar o contrato.");
      }
      const msg = await messageFromErrorBlob(err.response.data);
      if (msg) throw new Error(msg);
    }
    if (err instanceof Error) throw err;
    throw new Error("Não foi possível gerar o contrato.");
  }
}

/** Gera o contrato no servidor, persiste o HTML e abre o PDF em nova aba para leitura. */
export async function openContratoPdfInNewTab(adocaoId: number): Promise<void> {
  const blob = await fetchContratoPdfBlob(adocaoId);
  const typed = blob.type && blob.type.includes("pdf") ? blob : new Blob([blob], { type: "application/pdf" });
  const objectUrl = URL.createObjectURL(typed);
  window.open(objectUrl, "_blank", "noopener,noreferrer");

  window.setTimeout(() => {
    URL.revokeObjectURL(objectUrl);
  }, 120_000);
}

/** Gera o contrato no servidor, persiste o HTML e inicia o download do PDF. */
export async function downloadContratoPdf(adocaoId: number): Promise<void> {
  const blob = await fetchContratoPdfBlob(adocaoId);
  triggerPdfDownload(blob, `contrato_adocao_${adocaoId}.pdf`);
}
