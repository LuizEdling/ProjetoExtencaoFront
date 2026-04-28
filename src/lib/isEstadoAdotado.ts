/** Normaliza rótulo de estado (mesma ideia que busca em fichas). */
function normalizeEstadoLabel(s: string): string {
  return s.normalize("NFD").replace(/\p{M}/gu, "").trim().toLowerCase();
}

export function isEstadoAdotado(nome: string): boolean {
  return normalizeEstadoLabel(nome) === "adotado";
}
