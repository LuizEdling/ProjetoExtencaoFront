import { getAnimalStatesEndpoint } from "../lib/apiBase";
import { apiClient } from "../lib/apiClient";

export interface AnimalEstadoApiRow {
  id: number;
  nome: string;
}

export async function fetchAnimalStates(): Promise<AnimalEstadoApiRow[]> {
  const url = getAnimalStatesEndpoint();
  const { data } = await apiClient.get<AnimalEstadoApiRow[]>(url);
  return Array.isArray(data) ? data : [];
}
