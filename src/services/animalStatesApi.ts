import axios from "axios";
import { getAnimalStatesEndpoint } from "../lib/apiBase";

export interface AnimalEstadoApiRow {
  id: number;
  nome: string;
}

export async function fetchAnimalStates(): Promise<AnimalEstadoApiRow[]> {
  const url = getAnimalStatesEndpoint();
  const { data } = await axios.get<AnimalEstadoApiRow[]>(url);
  return Array.isArray(data) ? data : [];
}
