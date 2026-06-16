import { isAxiosError } from "axios";
import { getApiErrorMessage } from "./apiErrorMessage";

const CREDENTIALS_MESSAGE =
  "Não foi possível entrar. Verifique se o e-mail e a senha estão corretos.";

export function getLoginErrorMessage(error: unknown): string {
  if (isAxiosError(error) && error.response?.status === 422) {
    return CREDENTIALS_MESSAGE;
  }
  return getApiErrorMessage(error);
}
