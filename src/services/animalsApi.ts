import { getAnimalByIdEndpoint, getAnimalsEndpoint } from "../lib/apiBase";
import { apiClient } from "../lib/apiClient";
import { toIsoDateOnly } from "../lib/formatFicha";
import type { AnimalEstadoInfo, AnimalFicha, SexoAnimal } from "../types/animalFicha";

export interface AnimalFichaApi {
  id?: string | number;
  numero_protocolo?: string | null;
  nome: string;
  raca: string;
  microchip?: string | null;
  data_ficha: string;
  especie: string;
  sexo: SexoAnimal | string;
  idade: number | string;
  peso: number | string;
  cor: string;
  data_entrada: string;
  observacoes: string;
  bairro_resgate?: string | null;
  rua_resgate?: string | null;
  animal_state_id?: number;
  animal_state?: {
    id: number;
    nome: string;
  };
  vermifugado?: boolean | number | string | null;
  vacinado?: boolean | number | string | null;
  castrado?: boolean | number | string | null;
}

export interface CreateAnimalPayload {
  numero_protocolo?: string | null;
  nome: string;
  raca: string;
  microchip?: string | null;
  data_ficha: string;
  especie: string;
  sexo: SexoAnimal;
  idade: number;
  peso: number;
  cor: string;
  data_entrada: string;
  observacoes: string;
  bairro_resgate?: string | null;
  rua_resgate?: string | null;
  /** Se omitido no POST, o backend define o estado padrão (ex.: Esperando adoção). */
  animal_state_id?: number;
  vermifugado?: boolean;
  vacinado?: boolean;
  castrado?: boolean;
}

/** Corpo completo para PATCH ao editar ficha (ativa validação “edição completa” na API). */
export type UpdateAnimalPayload = CreateAnimalPayload & { animal_state_id: number };

function parseBool(value: unknown): boolean {
  if (value === true || value === 1 || value === "1") return true;
  if (value === false || value === 0 || value === "0") return false;
  if (typeof value === "string") {
    const s = value.trim().toLowerCase();
    if (s === "true") return true;
    if (s === "false") return false;
  }
  return false;
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

function parseEstado(row: AnimalFichaApi): AnimalEstadoInfo {
  const s = row.animal_state;
  if (s?.id != null && s.nome) {
    return { id: String(s.id), nome: s.nome };
  }
  if (row.animal_state_id != null) {
    return { id: String(row.animal_state_id), nome: "—" };
  }
  return { id: "0", nome: "—" };
}

export function mapApiToFicha(row: AnimalFichaApi): AnimalFicha {
  const chip = row.microchip;
  const microchip =
    chip == null || String(chip).trim() === "" ? "" : String(chip).replace(/\D/g, "").slice(0, 15);

  return {
    id: row.id != null ? String(row.id) : "",
    numeroProtocolo:
      row.numero_protocolo == null || String(row.numero_protocolo).trim() === ""
        ? ""
        : String(row.numero_protocolo).trim(),
    nome: row.nome ?? "",
    raca: row.raca ?? "",
    microchip,
    data: toIsoDateOnly(row.data_ficha),
    especie: row.especie ?? "",
    sexo: parseSexo(row.sexo),
    idade: parseIdade(row.idade),
    peso: parsePeso(row.peso),
    cor: row.cor ?? "",
    dataEntrada: toIsoDateOnly(row.data_entrada),
    observacoes: row.observacoes ?? "",
    bairroResgate:
      row.bairro_resgate == null || String(row.bairro_resgate).trim() === ""
        ? ""
        : String(row.bairro_resgate).trim(),
    ruaResgate:
      row.rua_resgate == null || String(row.rua_resgate).trim() === ""
        ? ""
        : String(row.rua_resgate).trim(),
    estado: parseEstado(row),
    vermifugado: parseBool(row.vermifugado),
    vacinado: parseBool(row.vacinado),
    castrado: parseBool(row.castrado),
  };
}

export async function fetchAnimals(): Promise<AnimalFicha[]> {
  const url = getAnimalsEndpoint();
  const { data } = await apiClient.get<AnimalFichaApi[]>(url, {
    params: { all: 1 },
  });
  const list = Array.isArray(data) ? data : [];
  return list.map((row, index) => {
    const mapped = mapApiToFicha(row);
    if (!mapped.id) {
      return { ...mapped, id: `temp-${index}-${mapped.nome}` };
    }
    return mapped;
  });
}

/** Resposta paginada de `GET /api/animals?page=…` (Laravel). */
export interface PaginatedAnimals {
  data: AnimalFicha[];
  currentPage: number;
  lastPage: number;
  perPage: number;
  total: number;
}

interface LaravelAnimalPaginator {
  current_page: number;
  data: AnimalFichaApi[];
  last_page: number;
  per_page: number;
  total: number;
}

function unwrapPaginator(body: unknown): LaravelAnimalPaginator | null {
  if (body === null || typeof body !== "object") return null;
  const root = body as Record<string, unknown>;
  if (Array.isArray(root.data) && ("current_page" in root || "total" in root)) {
    return root as unknown as LaravelAnimalPaginator;
  }
  const nested = root.data;
  if (nested !== null && typeof nested === "object") {
    const inner = nested as Record<string, unknown>;
    if (Array.isArray(inner.data) && ("current_page" in inner || "total" in inner)) {
      return inner as unknown as LaravelAnimalPaginator;
    }
  }
  return null;
}

export async function fetchAnimalsPage(params: {
  page: number;
  perPage?: number;
  q?: string;
  animal_state_id?: number;
  bairro_resgate?: string;
  rua_resgate?: string;
}): Promise<PaginatedAnimals> {
  const url = getAnimalsEndpoint();
  const { data: raw } = await apiClient.get<unknown>(url, {
    params: {
      page: params.page,
      per_page: params.perPage ?? 10,
      ...(params.q && params.q.trim() !== "" ? { q: params.q.trim() } : {}),
      ...(params.animal_state_id != null ? { animal_state_id: params.animal_state_id } : {}),
      ...(params.bairro_resgate && params.bairro_resgate.trim() !== ""
        ? { bairro_resgate: params.bairro_resgate.trim() }
        : {}),
      ...(params.rua_resgate && params.rua_resgate.trim() !== ""
        ? { rua_resgate: params.rua_resgate.trim() }
        : {}),
    },
  });

  const data = unwrapPaginator(raw);
  if (!data) {
    throw new Error("Resposta de animais em formato inesperado (paginação).");
  }

  const rows = Array.isArray(data.data) ? data.data : [];
  const mapped = rows.map((row, index) => {
    const m = mapApiToFicha(row);
    if (!m.id) {
      return { ...m, id: `temp-${index}-${m.nome}` };
    }
    return m;
  });

  return {
    data: mapped,
    currentPage: Number(data.current_page) || 1,
    lastPage: Math.max(1, Number(data.last_page) || 1),
    perPage: Number(data.per_page) || 10,
    total: Number(data.total) || mapped.length,
  };
}

export async function createAnimal(body: CreateAnimalPayload): Promise<void> {
  const url = getAnimalsEndpoint();
  await apiClient.post(url, body);
}

async function patchAnimalRaw(animalId: string, body: Record<string, unknown>): Promise<AnimalFicha> {
  const url = getAnimalByIdEndpoint(animalId);
  const { data } = await apiClient.patch<AnimalFichaApi>(url, body);
  return mapApiToFicha(data);
}

export async function updateAnimal(animalId: string, body: UpdateAnimalPayload): Promise<AnimalFicha> {
  return patchAnimalRaw(animalId, { ...body });
}

export async function deleteAnimal(animalId: string): Promise<void> {
  const url = getAnimalByIdEndpoint(animalId);
  await apiClient.delete(url);
}

export async function patchAnimalState(animalId: string, animalStateId: number): Promise<AnimalFicha> {
  return patchAnimalRaw(animalId, { animal_state_id: animalStateId });
}

export type AnimalCuidadosPatch = Partial<
  Pick<AnimalFicha, "vermifugado" | "vacinado" | "castrado">
>;

export async function patchAnimalCuidados(
  animalId: string,
  body: AnimalCuidadosPatch,
): Promise<AnimalFicha> {
  const payload: Record<string, unknown> = {};
  if (Object.prototype.hasOwnProperty.call(body, "vermifugado")) {
    payload.vermifugado = body.vermifugado;
  }
  if (Object.prototype.hasOwnProperty.call(body, "vacinado")) {
    payload.vacinado = body.vacinado;
  }
  if (Object.prototype.hasOwnProperty.call(body, "castrado")) {
    payload.castrado = body.castrado;
  }
  return patchAnimalRaw(animalId, payload);
}

export async function fetchProximoProtocolo(dataFicha: string): Promise<string> {
  const base = getAnimalsEndpoint();
  const { data } = await apiClient.get<{ numero_protocolo?: string }>(`${base}/proximo-protocolo`, {
    params: { data_ficha: dataFicha },
  });
  const raw = data?.numero_protocolo;
  return raw == null ? "" : String(raw).trim();
}
