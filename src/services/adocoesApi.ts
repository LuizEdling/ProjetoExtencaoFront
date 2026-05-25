import { getAdocoesEndpoint } from "../lib/apiBase";
import { apiClient } from "../lib/apiClient";
import type { AdocaoListItem, CreateAdocaoPayload } from "../types/adocao";

export async function fetchAdocoes(): Promise<AdocaoListItem[]> {
  const { data } = await apiClient.get<AdocaoListItem[]>(getAdocoesEndpoint());
  return Array.isArray(data) ? data : [];
}

export async function createAdocao(body: CreateAdocaoPayload): Promise<AdocaoListItem> {
  const { data } = await apiClient.post<{ data: AdocaoListItem }>(getAdocoesEndpoint(), body);
  return data.data;
}
