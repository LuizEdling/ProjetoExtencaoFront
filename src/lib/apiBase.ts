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
