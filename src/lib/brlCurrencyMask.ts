/** Quantidade máxima de dígitos (centavos como inteiro) para evitar valores absurdos no input. */
const MAX_CENT_DIGITS = 14;

/** Converte valor em reais para sequência de dígitos (centavos), ex.: 10,5 → `"1050"`. */
export function brlAmountToDigitSequence(amount: number): string {
  if (!Number.isFinite(amount) || amount < 0) return "";
  const cents = Math.round(amount * 100 + Number.EPSILON);
  if (cents <= 0) return "";
  return String(cents);
}

/** Formata sequência de dígitos como moeda pt-BR (sem símbolo R$), ex. `"1234"` → `"12,34"`. */
export function formatBrlDigitSequence(digits: string): string {
  const clean = digits.replace(/\D/g, "").slice(0, MAX_CENT_DIGITS);
  if (clean === "") return "";
  const n = Number(clean);
  if (!Number.isFinite(n)) return "";
  return (n / 100).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Interpreta a sequência de dígitos como reais ou `null` se vazio / inválido. */
export function parseBrlDigitSequence(digits: string): number | null {
  const clean = digits.replace(/\D/g, "");
  if (clean === "") return null;
  const n = Number(clean);
  if (!Number.isFinite(n)) return null;
  return n / 100;
}

/** Extrai apenas dígitos e aplica o teto de tamanho (para `onChange`). */
export function sanitizeBrlDigitInput(raw: string): string {
  return raw.replace(/\D/g, "").slice(0, MAX_CENT_DIGITS);
}
