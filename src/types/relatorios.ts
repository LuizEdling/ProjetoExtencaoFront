/** Parâmetros de query para GET /api/relatorios/dashboard (snake_case no fio). */
export type RelatorioDashboardQuery = {
  cadastro_de: string;
  cadastro_ate: string;
  serie_de: string;
  serie_ate: string;
  /** Compatibilidade com a API; a tela envia sempre `false` / `0`. */
  apenas_mes_atual?: boolean;
};

/** Corpo de POST /api/relatorios/export — mesmos filtros da tela. */
export type RelatorioExportBody = RelatorioDashboardQuery;

export type CadastroPorMes = {
  anoMes: string;
  total: number;
};

export type EstadosClinica = {
  esperandoConsulta: number;
  consultado: number;
  emCirurgia: number;
};

export type AbrigadosAdotadosMes = {
  anoMes: string;
  abrigados: number;
  adotados: number;
};

export type RelatorioDashboardData = {
  cadastrosPorMes: CadastroPorMes[];
  estadosClinica: EstadosClinica;
  abrigadosAdotadosPorMes: AbrigadosAdotadosMes[];
};
