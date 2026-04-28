import { isAxiosError } from "axios";

const CREDENTIALS_MESSAGE =
  "Não foi possível entrar. Verifique se o e-mail e a senha estão corretos.";

const SERVER_OR_UNKNOWN_MESSAGE = "Algum erro ocorreu";

export function getLoginErrorMessage(error: unknown): string {
  if (isAxiosError(error) && error.response?.status === 422) {
    return CREDENTIALS_MESSAGE;
  }
  return SERVER_OR_UNKNOWN_MESSAGE;
}
