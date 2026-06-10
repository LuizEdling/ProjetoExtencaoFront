export type QuickAction = {
  id: string;
  label: string;
  path: string;
  keywords: string[];
};

export const QUICK_ACTIONS: QuickAction[] = [
  {
    id: "cadastrar-animal",
    label: "Cadastrar animal",
    path: "/fichas",
    keywords: ["cadastrar", "animal", "ficha", "novo"],
  },
  {
    id: "cadastrar-adotante",
    label: "Cadastrar adotante",
    path: "/adotantes",
    keywords: ["cadastrar", "adotante", "novo"],
  },
  {
    id: "adicionar-adocao",
    label: "Adicionar adoção",
    path: "/adocoes",
    keywords: ["adicionar", "adoção", "adocao", "nova"],
  },
];

export function normalizeSearchText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function filterQuickActions(query: string): QuickAction[] {
  const normalized = normalizeSearchText(query);
  if (!normalized) {
    return QUICK_ACTIONS;
  }

  return QUICK_ACTIONS.filter((action) => {
    const haystack = normalizeSearchText(`${action.label} ${action.keywords.join(" ")}`);
    return haystack.includes(normalized) || action.keywords.some((kw) => kw.includes(normalized));
  });
}
