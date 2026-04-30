import { getApiBase } from "../lib/apiBase";
import { apiClient } from "../lib/apiClient";
import type { Lembrete } from "../types/lembrete";

function getLembretesEndpoint(): string {
  const base = getApiBase();

  if (!base) {
    throw new Error("Configure VITE_APP_URL no arquivo .env (raiz do projeto).");
  }

  return `${base}/api/lembretes`;
}

export async function fetchLembretes() {
  const { data } = await apiClient.get<Lembrete[]>(getLembretesEndpoint());
  return data;
}

export async function createLembrete(payload: Partial<Lembrete>) {
  await apiClient.post(getLembretesEndpoint(), payload);
}

export async function updateLembrete(id: number, payload: Partial<Lembrete>) {
  await apiClient.put(`${getLembretesEndpoint()}/${id}`, payload);
}

export async function deleteLembrete(id: number) {
  await apiClient.delete(`${getLembretesEndpoint()}/${id}`);
}