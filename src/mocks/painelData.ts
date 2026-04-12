export type ProcedimentoTipo = "cirurgia" | "vacina" | "consulta" | "observacao";
export type PrioridadeTipo = "alta" | "media" | "baixa";

export interface ResumoCardData {
  id: string;
  titulo: string;
  valor: string;
  legenda: string;
  /** destaque positivo (verde), alerta (laranja) ou neutro */
  legendaVariant: "success" | "warning" | "neutral";
  icon: "paw" | "dog" | "heart" | "home";
}

export interface AnimalFila {
  id: string;
  nome: string;
  especie: string;
  procedimento: ProcedimentoTipo;
  prioridade: PrioridadeTipo;
  entrada: string;
}

export interface CadastroHojeItem {
  id: string;
  nome: string;
  tipoRaca: string;
  horario: string;
}

export interface PainelDashboardData {
  resumos: ResumoCardData[];
  filaAtendimento: AnimalFila[];
  cadastrosHoje: CadastroHojeItem[];
}

export const MOCK_RESUMOS: ResumoCardData[] = [
  {
    id: "1",
    titulo: "Cadastrados Hoje",
    valor: "12",
    legenda: "+25% vs ontem",
    legendaVariant: "success",
    icon: "paw",
  },
  {
    id: "2",
    titulo: "Aguardando Atendimento",
    valor: "4",
    legenda: "2 urgentes",
    legendaVariant: "warning",
    icon: "dog",
  },
  {
    id: "3",
    titulo: "Adoções do Mês",
    valor: "9",
    legenda: "+40% vs mês passado",
    legendaVariant: "success",
    icon: "heart",
  },
  {
    id: "4",
    titulo: "Total Abrigados",
    valor: "92",
    legenda: "52 cães, 40 gatos",
    legendaVariant: "neutral",
    icon: "home",
  },
];

export const MOCK_FILA: AnimalFila[] = [
  {
    id: "a1",
    nome: "Thor",
    especie: "Cão",
    procedimento: "cirurgia",
    prioridade: "alta",
    entrada: "08:15",
  },
  {
    id: "a2",
    nome: "Mia",
    especie: "Gato",
    procedimento: "vacina",
    prioridade: "media",
    entrada: "08:42",
  },
  {
    id: "a3",
    nome: "Bob",
    especie: "Cão",
    procedimento: "consulta",
    prioridade: "baixa",
    entrada: "09:05",
  },
  {
    id: "a4",
    nome: "Luna",
    especie: "Gato",
    procedimento: "observacao",
    prioridade: "alta",
    entrada: "09:18",
  },
  {
    id: "a5",
    nome: "Rex",
    especie: "Cão",
    procedimento: "consulta",
    prioridade: "media",
    entrada: "09:30",
  },
];

export const MOCK_CADASTROS_HOJE: CadastroHojeItem[] = [
  { id: "c1", nome: "Mel", tipoRaca: "Cão — Vira-lata", horario: "07:50" },
  { id: "c2", nome: "Simba", tipoRaca: "Gato — SRD", horario: "08:10" },
  { id: "c3", nome: "Nina", tipoRaca: "Cão — Labrador", horario: "08:35" },
  { id: "c4", nome: "Fred", tipoRaca: "Gato — Persa", horario: "09:02" },
];

export function buildPainelMock(): PainelDashboardData {
  return {
    resumos: MOCK_RESUMOS,
    filaAtendimento: MOCK_FILA,
    cadastrosHoje: MOCK_CADASTROS_HOJE,
  };
}
