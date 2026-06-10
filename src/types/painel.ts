export type LegendaVariant = "success" | "warning" | "neutral";

export type ResumoIcon = "paw" | "dog" | "heart" | "home";

export interface ResumoCardData {
  id: string;
  titulo: string;
  valor: string;
  legenda: string;
  legendaVariant: LegendaVariant;
  icon: ResumoIcon;
}

export interface AnimalFila {
  id: string;
  nome: string;
  especie: string;
  estadoNome: string;
  /** ISO 8601 da API */
  estadoAlteradoEm: string | null;
  /** Y-m-d */
  dataEntrada: string;
}

export interface CadastroMesItem {
  id: string;
  nome: string;
  tipoRaca: string;
  data: string;
}

export interface PainelDashboardData {
  resumos: ResumoCardData[];
  filaAtendimento: AnimalFila[];
  cadastrosMes: CadastroMesItem[];
}
