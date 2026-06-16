export type SexoAnimal = "Macho" | "Fêmea";

export const SEXOS_ANIMAL: readonly SexoAnimal[] = ["Macho", "Fêmea"];

export interface AnimalEstadoInfo {
  id: string;
  nome: string;
}

export interface AnimalFicha {
  id: string;
  /** Formato 1000/2026; vazio se não informado */
  numeroProtocolo: string;
  nome: string;
  raca: string;
  /** Apenas dígitos, até 15 caracteres; vazio se não informado */
  microchip: string;
  /** ISO Y-m-d (API); formatar na UI para exibição */
  data: string;
  especie: string;
  sexo: SexoAnimal;
  idade: number;
  peso: number;
  cor: string;
  dataEntrada: string;
  observacoes: string;
  bairroResgate: string;
  ruaResgate: string;
  estado: AnimalEstadoInfo;
  vermifugado: boolean;
  vacinado: boolean;
  castrado: boolean;
}
