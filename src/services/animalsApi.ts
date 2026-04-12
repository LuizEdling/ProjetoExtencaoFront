import axios from "axios";
import type { AnimalFicha, SexoAnimal } from "../types/animalFicha";
import { getAnimalsEndpoint } from "../lib/apiBase";

export interface AnimalFichaApi {
  id?: string | number;
  nome: string;
  raca: string;
  data_ficha: string;
  especie: string;
  sexo: SexoAnimal | string;
  idade: number | string;
  peso: number | string;
  cor: string;
  data_entrada: string;
  observacoes: string;
}

export interface CreateAnimalPayload {
  nome: string;
  raca: string;
  data_ficha: string;
  especie: string;
  sexo: SexoAnimal;
  idade: number;
  peso: number;
  cor: string;
  data_entrada: string;
  observacoes: string;
}

function parseIdade(value: unknown): number {
  const n = typeof value === "number" ? value : parseInt(String(value ?? "").trim(), 10);
  return Number.isFinite(n) ? n : 0;
}

function parsePeso(value: unknown): number {
  const s = String(value ?? "").trim().replace(",", ".");
  const n = typeof value === "number" ? value : parseFloat(s);
  return Number.isFinite(n) ? n : 0;
}

function parseSexo(value: unknown): SexoAnimal {
  const s = String(value ?? "").trim();
  if (s === "Macho" || s === "Fêmea") return s;
  return "Macho";
}

export function mapApiToFicha(row: AnimalFichaApi): AnimalFicha {
  return {
    id: row.id != null ? String(row.id) : "",
    nome: row.nome ?? "",
    raca: row.raca ?? "",
    data: row.data_ficha ?? "",
    especie: row.especie ?? "",
    sexo: parseSexo(row.sexo),
    idade: parseIdade(row.idade),
    peso: parsePeso(row.peso),
    cor: row.cor ?? "",
    dataEntrada: row.data_entrada ?? "",
    observacoes: row.observacoes ?? "",
  };
}

export async function fetchAnimals(): Promise<AnimalFicha[]> {
  const url = getAnimalsEndpoint();
  const { data } = await axios.get<AnimalFichaApi[]>(url);
  const list = Array.isArray(data) ? data : [];
  return list.map((row, index) => {
    const mapped = mapApiToFicha(row);
    if (!mapped.id) {
      return { ...mapped, id: `temp-${index}-${mapped.nome}` };
    }
    return mapped;
  });
}

export async function createAnimal(body: CreateAnimalPayload): Promise<void> {
  const url = getAnimalsEndpoint();
  await axios.post(url, body);
}
