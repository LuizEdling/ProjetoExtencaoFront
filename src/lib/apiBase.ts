export function getApiBase(): string {
  const raw = import.meta.env.VITE_APP_URL?.trim() ?? "";
  return raw.replace(/\/$/, "");
}

export function getAnimalsEndpoint(): string {
  const base = getApiBase();
  if (!base) {
    throw new Error("Configure VITE_APP_URL no arquivo .env (raiz do projeto).");
  }
  return `${base}/api/animals`;
}

export function getCatalogEndpoint(): string {
  const base = getApiBase();
  if (!base) {
    throw new Error("Configure VITE_APP_URL no arquivo .env (raiz do projeto).");
  }
  return `${base}/api/catalog`;
}

export function getAnimalStatesEndpoint(): string {
  const base = getApiBase();
  if (!base) {
    throw new Error("Configure VITE_APP_URL no arquivo .env (raiz do projeto).");
  }
  return `${base}/api/animal-states`;
}

export function getAnimalByIdEndpoint(id: string): string {
  const base = getApiBase();
  if (!base) {
    throw new Error("Configure VITE_APP_URL no arquivo .env (raiz do projeto).");
  }
  return `${base}/api/animals/${encodeURIComponent(id)}`;
}

export function getPainelEndpoint(): string {
  const base = getApiBase();
  if (!base) {
    throw new Error("Configure VITE_APP_URL no arquivo .env (raiz do projeto).");
  }
  return `${base}/api/painel`;
}

export function getAdocoesEndpoint(): string {
  const base = getApiBase();
  if (!base) {
    throw new Error("Configure VITE_APP_URL no arquivo .env (raiz do projeto).");
  }
  return `${base}/api/adocoes`;
}
