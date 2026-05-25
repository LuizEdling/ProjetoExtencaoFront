import { getApiBase } from "../lib/apiBase";
import { apiClient } from "../lib/apiClient";
import { toIsoDateOnly } from "../lib/formatFicha";
import type { Gasto } from "../types/gasto";

function getGastosEndpoint(): string {
  const base = getApiBase();

  if (!base) {
    throw new Error("Configure VITE_APP_URL no arquivo .env (raiz do projeto).");
  }

  return `${base}/api/gastos`;
}

export interface GastoApiRow {
  id: number;
  valor: number | string;
  data: string;
  descricao: string;
}

function mapRow(row: GastoApiRow): Gasto {
  const v = typeof row.valor === "number" ? row.valor : parseFloat(String(row.valor).replace(",", "."));
  return {
    id: row.id,
    valor: Number.isFinite(v) ? v : 0,
    data: toIsoDateOnly(row.data),
    descricao: row.descricao ?? "",
  };
}

export async function fetchGastos(params?: { data?: string }): Promise<Gasto[]> {
  const { data } = await apiClient.get<GastoApiRow[]>(getGastosEndpoint(), {
    params: params?.data ? { data: params.data } : undefined,
  });

  const list = Array.isArray(data) ? data : [];
  return list.map(mapRow);
}

export type GastoPayload = Omit<Gasto, "id">;

export async function createGasto(body: GastoPayload): Promise<Gasto> {
  const { data } = await apiClient.post<GastoApiRow>(getGastosEndpoint(), body);
  return mapRow(data);
}

export async function updateGasto(id: number, body: GastoPayload): Promise<Gasto> {
  const { data } = await apiClient.put<GastoApiRow>(`${getGastosEndpoint()}/${id}`, body);
  return mapRow(data);
}

export async function deleteGasto(id: number): Promise<void> {
  await apiClient.delete(`${getGastosEndpoint()}/${id}`);
}
