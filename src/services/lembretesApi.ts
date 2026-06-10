import { getApiBase } from "../lib/apiBase";
import { apiClient } from "../lib/apiClient";
import type { Lembrete, LembreteFormPayload, TipoRecorrencia } from "../types/lembrete";

function getLembretesEndpoint(): string {
  const base = getApiBase();

  if (!base) {
    throw new Error("Configure VITE_APP_URL no arquivo .env (raiz do projeto).");
  }

  return `${base}/api/lembretes`;
}

interface LembreteApi {
  id: number;
  nome: string;
  descricao: string;
  data: string;
  hora: string | null;
  tipo_recorrencia: TipoRecorrencia;
  intervalo_dias: number | null;
  dia_semana: number | null;
  dia_mes: number | null;
  data_fim: string | null;
  ativo: boolean;
  visualizado: boolean;
  proxima_data: string | null;
  dias_restantes: number | null;
  em_alerta: boolean;
  mensagem_alerta: string | null;
}

function mapLembrete(row: LembreteApi): Lembrete {
  return {
    id: row.id,
    nome: row.nome,
    descricao: row.descricao ?? "",
    data: row.data,
    hora: row.hora,
    tipoRecorrencia: row.tipo_recorrencia ?? "once",
    intervaloDias: row.intervalo_dias,
    diaSemana: row.dia_semana,
    diaMes: row.dia_mes,
    dataFim: row.data_fim,
    ativo: row.ativo ?? true,
    visualizado: row.visualizado ?? false,
    proximaData: row.proxima_data,
    diasRestantes: row.dias_restantes,
    emAlerta: row.em_alerta ?? false,
    mensagemAlerta: row.mensagem_alerta,
  };
}

function toApiPayload(payload: LembreteFormPayload): Record<string, unknown> {
  return {
    nome: payload.nome,
    descricao: payload.descricao || null,
    data: payload.data,
    hora: payload.hora || null,
    tipo_recorrencia: payload.tipoRecorrencia,
    intervalo_dias: payload.intervaloDias,
    dia_semana: payload.diaSemana,
    dia_mes: payload.diaMes,
    data_fim: payload.dataFim || null,
  };
}

function unwrapLembretesResponse(body: unknown): LembreteApi[] {
  if (Array.isArray(body)) {
    return body;
  }

  if (
    body &&
    typeof body === "object" &&
    "data" in body &&
    Array.isArray((body as { data: unknown }).data)
  ) {
    return (body as { data: LembreteApi[] }).data;
  }

  return [];
}

export async function fetchLembretes(): Promise<Lembrete[]> {
  const { data } = await apiClient.get<unknown>(getLembretesEndpoint());
  return unwrapLembretesResponse(data).map(mapLembrete);
}

export async function createLembrete(payload: LembreteFormPayload): Promise<void> {
  await apiClient.post(getLembretesEndpoint(), toApiPayload(payload));
}

export async function updateLembrete(id: number, payload: LembreteFormPayload): Promise<void> {
  await apiClient.put(`${getLembretesEndpoint()}/${id}`, toApiPayload(payload));
}

export async function deleteLembrete(id: number): Promise<void> {
  await apiClient.delete(`${getLembretesEndpoint()}/${id}`);
}
