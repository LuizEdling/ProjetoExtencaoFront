import axios from "axios";

export const AUTH_TOKEN_KEY = "auth_token";

export function getStoredToken(): string | null {
  return sessionStorage.getItem(AUTH_TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  sessionStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function clearStoredToken(): void {
  sessionStorage.removeItem(AUTH_TOKEN_KEY);
}

export const apiClient = axios.create();

apiClient.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      clearStoredToken();
      window.location.assign("/");
    }
    return Promise.reject(error);
  },
);
