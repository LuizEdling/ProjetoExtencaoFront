export function formatDateBR(iso: string): string {
  const head = iso.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(head)) {
    return iso;
  }
  const [y, m, d] = head.split("-");
  return `${d}/${m}/${y}`;
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
