import { getApiBase } from "../lib/apiBase";
import { apiClient } from "../lib/apiClient";
import type { Adotante } from "../types/adotante";

function getAdotantesEndpoint(): string {
  const base = getApiBase();

  if (!base) {
    throw new Error("Configure VITE_APP_URL no arquivo .env (raiz do projeto).");
  }

  return `${base}/api/adotantes`;
}

/** CPF para query: só dígitos (o campo na tela pode ter pontuação). */
function cpfQueryDigits(value: string | undefined): string | undefined {
  if (value == null) return undefined;
  const digits = value.replace(/\D/g, "");
  return digits === "" ? undefined : digits;
}

export async function fetchAdotantes(params?: { nome?: string; cpf?: string }) {
  const query: Record<string, string> = {};
  const nome = params?.nome?.trim();
  if (nome) query.nome = nome;
  const cpf = cpfQueryDigits(params?.cpf);
  if (cpf) query.cpf = cpf;

  const { data } = await apiClient.get<Adotante[]>(getAdotantesEndpoint(), {
    params: query,
  });

  return data;
}

export async function createAdotante(data: Omit<Adotante, "id">) {
  const response = await apiClient.post<{ data: Adotante }>(
    getAdotantesEndpoint(),
    data
  );

  return response.data.data;
}

export async function updateAdotante(id: number, data: Omit<Adotante, "id">) {
  const response = await apiClient.put<{ data: Adotante }>(
    `${getAdotantesEndpoint()}/${id}`,
    data
  );

  return response.data.data;
}

export async function deleteAdotante(id: number) {
  await apiClient.delete(`${getAdotantesEndpoint()}/${id}`);
}
