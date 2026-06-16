import { isAxiosError } from "axios";

export const DEFAULT_API_ERROR_MESSAGE = "Algum erro ocorreu";

type ApiErrorBody = {
  message?: string;
  errors?: Record<string, string[] | string>;
};

function messageFromApiBody(data: ApiErrorBody | undefined): string | null {
  if (!data) return null;

  if (typeof data.message === "string" && data.message.trim() !== "") {
    return data.message.trim();
  }

  const errors = data.errors;
  if (errors && typeof errors === "object") {
    for (const value of Object.values(errors)) {
      if (Array.isArray(value) && value.length > 0 && typeof value[0] === "string") {
        return value[0];
      }
      if (typeof value === "string" && value.trim() !== "") {
        return value.trim();
      }
    }
  }

  return null;
}

export function isNetworkError(error: unknown): boolean {
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    return true;
  }

  if (isAxiosError(error)) {
    if (!error.response) return true;

    const code = error.code ?? "";
    if (code === "ERR_NETWORK" || code === "ECONNABORTED" || code === "ERR_INTERNET_DISCONNECTED") {
      return true;
    }

    const msg = (error.message ?? "").toLowerCase();
    if (msg.includes("network error") || msg.includes("network request failed")) {
      return true;
    }
  }

  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    if (msg.includes("network error") || msg.includes("network request failed")) {
      return true;
    }
  }

  return false;
}

export function getApiErrorMessage(
  error: unknown,
  options?: { fallback?: string },
): string {
  const fallback = options?.fallback ?? DEFAULT_API_ERROR_MESSAGE;

  if (isNetworkError(error)) {
    return DEFAULT_API_ERROR_MESSAGE;
  }

  if (isAxiosError(error) && error.response) {
    const fromBody = messageFromApiBody(error.response.data as ApiErrorBody | undefined);
    if (fromBody) return fromBody;
  }

  if (error instanceof Error && error.message.trim() !== "") {
    return error.message;
  }

  return fallback;
}
