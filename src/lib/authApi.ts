import { getApiBase } from "./apiBase";
import { apiClient, clearStoredToken, setStoredToken } from "./apiClient";

export interface AuthUser {
  id: string;
  email: string;
}

export async function loginRequest(email: string, password: string): Promise<AuthUser> {
  const base = getApiBase();
  if (!base) {
    throw new Error("Configure VITE_APP_URL no arquivo .env (raiz do projeto).");
  }
  const { data } = await apiClient.post<{ token: string; user: AuthUser }>(`${base}/api/login`, {
    email,
    password,
  });
  setStoredToken(data.token);
  return data.user;
}

export async function logoutRequest(): Promise<void> {
  const base = getApiBase();
  if (!base) {
    clearStoredToken();
    return;
  }
  try {
    await apiClient.post(`${base}/api/logout`);
  } finally {
    clearStoredToken();
  }
}
