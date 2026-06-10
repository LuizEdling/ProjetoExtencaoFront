import type { Lembrete } from "../types/lembrete";

const DIAS_SEMANA = [
  "domingo",
  "segunda",
  "terça",
  "quarta",
  "quinta",
  "sexta",
  "sábado",
];

export function temAlerta(lembrete: Lembrete): boolean {
  return lembrete.emAlerta;
}

export function mensagemAlerta(lembrete: Lembrete): string {
  return lembrete.mensagemAlerta ?? "";
}

export function labelRecorrencia(lembrete: Lembrete): string | null {
  switch (lembrete.tipoRecorrencia) {
    case "every_n_days":
      return lembrete.intervaloDias
        ? `A cada ${lembrete.intervaloDias} dia(s)`
        : null;
    case "weekday":
      return lembrete.diaSemana !== null
        ? `Semanal (${DIAS_SEMANA[lembrete.diaSemana]})`
        : null;
    case "day_of_month":
      return lembrete.diaMes !== null ? `Mensal (dia ${lembrete.diaMes})` : null;
    default:
      return null;
  }
}

export function formatarDataBR(isoDate: string | null): string {
  if (!isoDate) return "";
  const [ano, mes, dia] = isoDate.slice(0, 10).split("-");
  return `${dia}/${mes}/${ano}`;
}

export function formatarDataHora(lembrete: Lembrete): string {
  const data = formatarDataBR(lembrete.proximaData ?? lembrete.data);
  if (!data) return "";
  if (lembrete.hora) {
    return `${data} às ${lembrete.hora}`;
  }
  return data;
}
