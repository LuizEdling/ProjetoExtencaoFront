import { getCatalogEndpoint } from "../lib/apiBase";
import { apiClient } from "../lib/apiClient";

export type CatalogKind = "raca" | "especie" | "cor";

export async function fetchCatalog(kind: CatalogKind): Promise<string[]> {
  const url = getCatalogEndpoint();
  const { data } = await apiClient.get<string[]>(url, { params: { kind } });
  return Array.isArray(data) ? data : [];
}

export async function createCatalogEntry(kind: CatalogKind, name: string): Promise<string> {
  const url = getCatalogEndpoint();
  const { data } = await apiClient.post<{ name: string }>(url, { kind, name });
  return data.name;
}
