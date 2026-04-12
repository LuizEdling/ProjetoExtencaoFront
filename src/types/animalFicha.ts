export type SexoAnimal = "Macho" | "Fêmea";

export const SEXOS_ANIMAL: readonly SexoAnimal[] = ["Macho", "Fêmea"];

export interface AnimalFicha {
  id: string;
  nome: string;
  raca: string;
  /** ISO Y-m-d (API); formatar na UI para exibição */
  data: string;
  especie: string;
  sexo: SexoAnimal;
  idade: number;
  peso: number;
  cor: string;
  dataEntrada: string;
  observacoes: string;
}
