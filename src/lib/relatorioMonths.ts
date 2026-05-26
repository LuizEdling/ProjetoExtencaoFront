/** Retorna o primeiro dia do mês como YYYY-MM. */
export function yearMonthFromDate(d: Date): string {
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  return `${y}-${String(m).padStart(2, "0")}`;
}

/** Mês atual (YYYY-MM). */
export function currentYearMonth(): string {
  return yearMonthFromDate(new Date());
}

/** Soma `delta` meses a YYYY-MM (delta pode ser negativo). */
export function addMonthsToYearMonth(ym: string, delta: number): string {
  const [ys, ms] = ym.split("-");
  const y = Number(ys);
  const m = Number(ms);
  if (!Number.isFinite(y) || !Number.isFinite(m)) return ym;
  const d = new Date(y, m - 1 + delta, 1);
  return yearMonthFromDate(d);
}

/** Inclusive: [start, end] com start <= end em ordem cronológica. */
export function clampYearMonthOrder(start: string, end: string): { start: string; end: string } {
  if (start <= end) return { start, end };
  return { start: end, end: start };
}

const MESES_CURTOS = [
  "jan",
  "fev",
  "mar",
  "abr",
  "mai",
  "jun",
  "jul",
  "ago",
  "set",
  "out",
  "nov",
  "dez",
] as const;

/** Ex.: 2026-05 -> "mai/2026" */
export function formatAnoMesPt(anoMes: string): string {
  const [ys, ms] = anoMes.split("-");
  const y = Number(ys);
  const m = Number(ms);
  if (!Number.isFinite(y) || m < 1 || m > 12) return anoMes;
  return `${MESES_CURTOS[m - 1]}/${y}`;
}

/** Rótulo para `<select>`: ex. "mai 2026" (mês abreviado + ano). */
export function formatMesAnoSelectLabel(anoMes: string): string {
  const [ys, ms] = anoMes.split("-");
  const y = Number(ys);
  const m = Number(ms);
  if (!Number.isFinite(y) || m < 1 || m > 12) return anoMes;
  return `${MESES_CURTOS[m - 1]} ${y}`;
}

/** Lista inclusiva de YYYY-MM de `inicio` até `fim` (ordem cronológica). */
export function listYearMonthsInRange(inicioYm: string, fimYm: string): string[] {
  const { start, end } = clampYearMonthOrder(inicioYm, fimYm);
  const out: string[] = [];
  let cur = start;
  while (cur <= end) {
    out.push(cur);
    cur = addMonthsToYearMonth(cur, 1);
  }
  return out;
}

/**
 * Meses para selects: ancorado em `anchorYm`, `mesesPassado` atrás e `mesesFuturo` à frente (inclusive).
 */
export function listYearMonthsAround(anchorYm: string, mesesPassado: number, mesesFuturo: number): string[] {
  const inicio = addMonthsToYearMonth(anchorYm, -Math.max(0, mesesPassado));
  const fim = addMonthsToYearMonth(anchorYm, Math.max(0, mesesFuturo));
  return listYearMonthsInRange(inicio, fim);
}
