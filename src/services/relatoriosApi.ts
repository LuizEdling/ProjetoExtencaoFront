import { isAxiosError } from "axios";
import { getRelatoriosEndpoint } from "../lib/apiBase";
import { apiClient } from "../lib/apiClient";
import { messageFromErrorBlob, triggerPdfDownload } from "../lib/pdfBlob";
import type {
  RelatorioDashboardData,
  RelatorioDashboardQuery,
  RelatorioExportBody,
} from "../types/relatorios";

interface CadastroPorMesApi {
  ano_mes: string;
  total: number;
}

interface EstadosClinicaApi {
  esperando_consulta: number;
  consultado: number;
  em_cirurgia: number;
}

interface AbrigadosAdotadosMesApi {
  ano_mes: string;
  abrigados: number;
  adotados: number;
}

interface RelatorioDashboardApiResponse {
  cadastros_por_mes?: CadastroPorMesApi[];
  estados_clinica?: EstadosClinicaApi;
  abrigados_adotados_por_mes?: AbrigadosAdotadosMesApi[];
}

function toQueryParams(q: RelatorioDashboardQuery): Record<string, string | number> {
  return {
    cadastro_de: q.cadastro_de,
    cadastro_ate: q.cadastro_ate,
    serie_de: q.serie_de,
    serie_ate: q.serie_ate,
    apenas_mes_atual: q.apenas_mes_atual ? 1 : 0,
  };
}

function toExportBody(q: RelatorioExportBody): Record<string, string | number> {
  return toQueryParams(q);
}

function mapDashboard(body: unknown): RelatorioDashboardData {
  const data =
    body !== null &&
    typeof body === "object" &&
    "data" in body &&
    body.data !== null &&
    typeof body.data === "object" &&
    ("cadastros_por_mes" in (body.data as object) || "estados_clinica" in (body.data as object))
      ? (body as { data: RelatorioDashboardApiResponse }).data
      : (body as RelatorioDashboardApiResponse);
  const ec = data.estados_clinica;
  return {
    cadastrosPorMes: Array.isArray(data.cadastros_por_mes)
      ? data.cadastros_por_mes.map((row) => ({
          anoMes: row.ano_mes,
          total: Number(row.total) || 0,
        }))
      : [],
    estadosClinica: {
      esperandoConsulta: Number(ec?.esperando_consulta) || 0,
      consultado: Number(ec?.consultado) || 0,
      emCirurgia: Number(ec?.em_cirurgia) || 0,
    },
    abrigadosAdotadosPorMes: Array.isArray(data.abrigados_adotados_por_mes)
      ? data.abrigados_adotados_por_mes.map((row) => ({
          anoMes: row.ano_mes,
          abrigados: Number(row.abrigados) || 0,
          adotados: Number(row.adotados) || 0,
        }))
      : [],
  };
}

export async function fetchRelatoriosDashboard(
  params: RelatorioDashboardQuery,
): Promise<RelatorioDashboardData> {
  const url = `${getRelatoriosEndpoint()}/dashboard`;
  const { data } = await apiClient.get<RelatorioDashboardApiResponse>(url, {
    params: toQueryParams(params),
  });
  return mapDashboard(data);
}

async function fetchRelatorioPdfBlob(body: RelatorioExportBody): Promise<Blob> {
  const url = `${getRelatoriosEndpoint()}/export`;
  try {
    const response = await apiClient.post<Blob>(url, toExportBody(body), {
      responseType: "blob",
      headers: { Accept: "application/pdf" },
    });
    const blob = response.data;
    const contentType = String(response.headers["content-type"] ?? "");
    if (!contentType.includes("application/pdf")) {
      const msg = await messageFromErrorBlob(blob);
      throw new Error(msg ?? "Não foi possível gerar o relatório (resposta inesperada).");
    }
    return blob;
  } catch (err: unknown) {
    if (isAxiosError(err) && err.response?.data instanceof Blob) {
      const ct = String(err.response.headers["content-type"] ?? "");
      if (ct.includes("application/json")) {
        const msg = await messageFromErrorBlob(err.response.data);
        throw new Error(msg ?? "Não foi possível gerar o relatório.");
      }
      const msg = await messageFromErrorBlob(err.response.data);
      if (msg) throw new Error(msg);
    }
    if (err instanceof Error) throw err;
    throw new Error("Não foi possível gerar o relatório.");
  }
}

export async function openRelatorioPdfInNewTab(body: RelatorioExportBody): Promise<void> {
  const blob = await fetchRelatorioPdfBlob(body);
  const typed = blob.type && blob.type.includes("pdf") ? blob : new Blob([blob], { type: "application/pdf" });
  const objectUrl = URL.createObjectURL(typed);
  window.open(objectUrl, "_blank", "noopener,noreferrer");

  window.setTimeout(() => {
    URL.revokeObjectURL(objectUrl);
  }, 120_000);
}

export async function downloadRelatorioPdf(body: RelatorioExportBody): Promise<void> {
  const blob = await fetchRelatorioPdfBlob(body);
  const stamp = new Date().toISOString().slice(0, 10);
  triggerPdfDownload(blob, `relatorio_${stamp}.pdf`);
}
