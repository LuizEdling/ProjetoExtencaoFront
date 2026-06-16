export type Gasto = {
  id: number;
  valor: number;
  doacao: boolean;
  /** ISO Y-m-d */
  data: string;
  descricao: string;
};
