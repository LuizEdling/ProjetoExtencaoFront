/** Cores alinhadas à paleta em index.css (badges de estado). */
const ESTADO_BADGE: Record<
  string,
  { border: string; bg: string; text: string; dot: string }
> = {
  "Esperando consulta": {
    border: "border-(--orange)/45",
    bg: "bg-(--orange-bg)",
    text: "text-[color:var(--orange)]",
    dot: "bg-[color:var(--orange)]",
  },
  Consultado: {
    border: "border-(--blue)/40",
    bg: "bg-(--blue-bg)",
    text: "text-[color:var(--blue)]",
    dot: "bg-[color:var(--blue)]",
  },
  "Em cirurgia": {
    border: "border-(--red)/40",
    bg: "bg-(--red-bg)",
    text: "text-[color:var(--red)]",
    dot: "bg-[color:var(--red)]",
  },
  "Esperando adoção": {
    border: "border-(--light-green)/50",
    bg: "bg-(--light-green-bg)",
    text: "text-[color:var(--green-title)]",
    dot: "bg-[color:var(--light-green)]",
  },
  Adotado: {
    border: "border-(--green)/45",
    bg: "bg-(--green-bg)",
    text: "text-[color:var(--green)]",
    dot: "bg-[color:var(--green)]",
  },
};

const FALLBACK = {
  border: "border-(--light-gray)/40",
  bg: "bg-(--background-first-layer)",
  text: "text-(--text-secondary)",
  dot: "bg-(--text-secondary)",
};

export function getEstadoBadgeTokens(nome: string) {
  return ESTADO_BADGE[nome] ?? FALLBACK;
}

export function estadoBadgeClass(nome: string): string {
  const t = getEstadoBadgeTokens(nome);
  return `inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${t.border} ${t.bg} ${t.text}`;
}

export function estadoDotClass(nome: string): string {
  const t = getEstadoBadgeTokens(nome);
  return `size-2 shrink-0 rounded-full ${t.dot}`;
}

/** Borda alinhada ao estado (ex.: botão de ação no card, igual ao de editar). */
export function estadoBorderClass(nome: string): string {
  const t = getEstadoBadgeTokens(nome);
  return t.border;
}
