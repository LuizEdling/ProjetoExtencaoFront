export type TipoRecorrencia = "once" | "every_n_days" | "weekday" | "day_of_month";

export type Lembrete = {
  id: number;
  nome: string;
  descricao: string;
  data: string;
  hora: string | null;
  tipoRecorrencia: TipoRecorrencia;
  intervaloDias: number | null;
  diaSemana: number | null;
  diaMes: number | null;
  dataFim: string | null;
  ativo: boolean;
  visualizado: boolean;
  proximaData: string | null;
  diasRestantes: number | null;
  emAlerta: boolean;
  mensagemAlerta: string | null;
};

export type LembreteFormPayload = {
  nome: string;
  descricao: string;
  data: string;
  hora: string | null;
  tipoRecorrencia: TipoRecorrencia;
  intervaloDias: number | null;
  diaSemana: number | null;
  diaMes: number | null;
  dataFim: string | null;
};
