/** Normaliza valor da API para `YYYY-MM-DD` (ex.: `<input type="date">`). */
export function toIsoDateOnly(raw: string | null | undefined): string {
  const s = String(raw ?? "").trim();
  if (!s) return "";
  const head = s.slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(head)) return head;
  const br = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(s);
  if (br) {
    const [, d, m, y] = br;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  const d = new Date(s);
  if (!Number.isNaN(d.getTime())) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }
  return "";
}

/** Data local em `YYYY-MM-DD` (ex.: valor inicial de `<input type="date">`). */
export function toIsoDateLocal(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function formatDateBR(iso: string): string {
  const head = iso.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(head)) {
    return iso;
  }
  const [y, m, d] = head.split("-");
  return `${d}/${m}/${y}`;
}

/** ISO 8601 ou similar → data e hora em pt-BR */
export function formatDateTimeBR(iso: string | null | undefined): string {
  if (iso == null || String(iso).trim() === "") return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function formatPesoKg(peso: number): string {
  if (!Number.isFinite(peso)) {
    return "—";
  }
  const txt = new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(peso);
  return `${txt} kg`;
}

export function formatBRL(valor: number): string {
  if (!Number.isFinite(valor)) {
    return "—";
  }
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);
}
