import type { CSSProperties } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { RELATORIO_CHART } from "../../constants/relatorioCharts";
import { getApiErrorMessage } from "../../lib/apiErrorMessage";
import {
  addMonthsToYearMonth,
  clampYearMonthOrder,
  currentYearMonth,
  formatAnoMesPt,
  formatMesAnoSelectLabel,
  listYearMonthsAround,
} from "../../lib/relatorioMonths";
import {
  downloadRelatorioPdf,
  fetchRelatoriosDashboard,
  openRelatorioPdfInNewTab,
} from "../../services/relatoriosApi";
import AppAlert from "../ui/AppAlert";
import type { RelatorioDashboardData, RelatorioDashboardQuery } from "../../types/relatorios";

function defaultCadastroRange(): { de: string; ate: string } {
  const ate = currentYearMonth();
  const de = addMonthsToYearMonth(ate, -5);
  return { de, ate };
}

function defaultSerieRange(): { de: string; ate: string } {
  const ate = currentYearMonth();
  const de = addMonthsToYearMonth(ate, -5);
  return { de, ate };
}

/** Janela única na API (cadastro + série): mesmo alcance dos selects (12 meses atrás até o mês atual). */
function wideRelatorioMesRangeForApi(): { de: string; ate: string } {
  const ate = currentYearMonth();
  const de = addMonthsToYearMonth(ate, -12);
  return { de, ate };
}

function buildQuery(params: {
  cadastroDe: string;
  cadastroAte: string;
  serieDe: string;
  serieAte: string;
}): RelatorioDashboardQuery {
  const { start: cde, end: cate } = clampYearMonthOrder(params.cadastroDe, params.cadastroAte);
  const { start: sde, end: sate } = clampYearMonthOrder(params.serieDe, params.serieAte);
  return {
    cadastro_de: cde,
    cadastro_ate: cate,
    serie_de: sde,
    serie_ate: sate,
    apenas_mes_atual: false,
  };
}

const tooltipSurface: CSSProperties = {
  backgroundColor: "var(--background-second-layer)",
  border: "1px solid color-mix(in srgb, var(--light-gray) 45%, transparent)",
  borderRadius: "0.75rem",
  color: "var(--text-primary)",
  fontSize: "0.8125rem",
};

function PdfSpinner() {
  return (
    <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

const periodoSelectClass =
  "form-control w-full min-w-[11rem] cursor-pointer appearance-none pr-10 text-[0.9375rem] font-medium text-(--text-primary)";

function SelectChevron() {
  return (
    <span
      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-(--text-secondary)"
      aria-hidden
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

export default function RelatoriosPage() {
  const initCadastro = useMemo(() => defaultCadastroRange(), []);
  const initSerie = useMemo(() => defaultSerieRange(), []);
  const [cadastroDe, setCadastroDe] = useState(initCadastro.de);
  const [cadastroAte, setCadastroAte] = useState(initCadastro.ate);
  const [serieDe, setSerieDe] = useState(initSerie.de);
  const [serieAte, setSerieAte] = useState(initSerie.ate);

  const [dashboard, setDashboard] = useState<RelatorioDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [pdfBusy, setPdfBusy] = useState<"view" | "download" | null>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);

  /** Uma busca com janela ampla; De/Até de cada gráfico só recortam no cliente (como cadastros). */
  const queryFetch = useMemo(() => {
    const wide = wideRelatorioMesRangeForApi();
    return buildQuery({
      cadastroDe: wide.de,
      cadastroAte: wide.ate,
      serieDe: wide.de,
      serieAte: wide.ate,
    });
  }, []);

  /** PDF com os intervalos escolhidos na tela. */
  const queryExport = useMemo(
    () =>
      buildQuery({
        cadastroDe,
        cadastroAte,
        serieDe,
        serieAte,
      }),
    [cadastroDe, cadastroAte, serieDe, serieAte],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await fetchRelatoriosDashboard(queryFetch);
      setDashboard(data);
    } catch (e) {
      setLoadError(getApiErrorMessage(e, { fallback: "Erro ao carregar os relatórios." }));
      setDashboard(null);
    } finally {
      setLoading(false);
    }
  }, [queryFetch]);

  useEffect(() => {
    void load();
  }, [load]);

  const mesesPeriodoOpcoes = useMemo(() => listYearMonthsAround(currentYearMonth(), 12, 0), []);

  const cadastroChartData = useMemo(() => {
    if (!dashboard) return [];
    const { start, end } = clampYearMonthOrder(cadastroDe, cadastroAte);
    return [...dashboard.cadastrosPorMes]
      .filter((row) => row.anoMes >= start && row.anoMes <= end)
      .sort((a, b) => a.anoMes.localeCompare(b.anoMes))
      .map((row) => ({
        anoMes: row.anoMes,
        label: formatAnoMesPt(row.anoMes),
        total: row.total,
      }));
  }, [dashboard, cadastroDe, cadastroAte]);

  const pieData = useMemo(() => {
    if (!dashboard) return [];
    const { esperandoConsulta, consultado, emCirurgia } = dashboard.estadosClinica;
    return [
      { name: "Esperando consulta", value: esperandoConsulta, fill: RELATORIO_CHART.esperandoConsulta },
      { name: "Consultado", value: consultado, fill: RELATORIO_CHART.consultado },
      { name: "Em cirurgia", value: emCirurgia, fill: RELATORIO_CHART.emCirurgia },
    ];
  }, [dashboard]);

  const barSerieData = useMemo(() => {
    if (!dashboard) return [];
    const { start, end } = clampYearMonthOrder(serieDe, serieAte);
    return [...dashboard.abrigadosAdotadosPorMes]
      .filter((row) => row.anoMes >= start && row.anoMes <= end)
      .sort((a, b) => a.anoMes.localeCompare(b.anoMes))
      .map((row) => ({
        anoMes: row.anoMes,
        label: formatAnoMesPt(row.anoMes),
        Abrigados: row.abrigados,
        Adotados: row.adotados,
      }));
  }, [dashboard, serieDe, serieAte]);

  function applyPresetMeses(n: 6 | 12) {
    const ate = currentYearMonth();
    const de = addMonthsToYearMonth(ate, -(n - 1));
    setCadastroDe(de);
    setCadastroAte(ate);
  }

  async function handleVerPdf() {
    setPdfError(null);
    setPdfBusy("view");
    try {
      await openRelatorioPdfInNewTab(queryExport);
    } catch (e) {
      setPdfError(getApiErrorMessage(e, { fallback: "Não foi possível abrir o relatório." }));
    } finally {
      setPdfBusy(null);
    }
  }

  async function handleBaixarPdf() {
    setPdfError(null);
    setPdfBusy("download");
    try {
      await downloadRelatorioPdf(queryExport);
    } catch (e) {
      setPdfError(getApiErrorMessage(e, { fallback: "Não foi possível baixar o relatório." }));
    } finally {
      setPdfBusy(null);
    }
  }

  const axisTick = { fill: "var(--text-secondary)", fontSize: 12 };
  const gridStroke = "var(--light-gray)";

  return (
    <div className="relative max-w-7xl mx-auto w-full space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-(--green-title) tracking-tight">Relatórios</h1>
          <p className="mt-1 text-(--text-secondary) text-sm sm:text-base">
            Indicadores de cadastros, estados clínicos e abrigo x adoção
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={pdfBusy !== null || loading}
            onClick={() => {
              void handleVerPdf();
            }}
            title="Visualizar PDF"
            aria-label="Visualizar relatório em PDF em nova aba"
            className="
              inline-flex items-center justify-center gap-2 rounded-full p-2
              text-(--text-secondary) border border-(--light-gray)/40 bg-(--background-second-layer)
              hover:text-(--light-green) hover:border-(--light-green)/50
              disabled:opacity-45 disabled:pointer-events-none
              focus:outline-none focus-visible:ring-2 focus-visible:ring-(--highlighted-text)
              transition-colors
            "
          >
            {pdfBusy === "view" ? <PdfSpinner /> : null}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path
                d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="hidden sm:inline text-sm font-medium pr-1">Visualizar PDF</span>
          </button>
          <button
            type="button"
            disabled={pdfBusy !== null || loading}
            onClick={() => {
              void handleBaixarPdf();
            }}
            title="Baixar PDF"
            aria-label="Baixar relatório em PDF"
            className="
              inline-flex items-center justify-center gap-2 rounded-full px-4 py-2
              text-sm font-medium text-(--text-primary)
              border border-(--light-green)/50 bg-(--light-green-bg)
              hover:border-(--light-green) hover:bg-(--background-second-layer)
              disabled:opacity-45 disabled:pointer-events-none
              focus:outline-none focus-visible:ring-2 focus-visible:ring-(--highlighted-text)
              transition-colors
            "
          >
            {pdfBusy === "download" ? <PdfSpinner /> : null}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Baixar PDF
          </button>
        </div>
      </header>

      {pdfError && (
        <AppAlert variant="error" onDismiss={() => setPdfError(null)}>
          {pdfError}
        </AppAlert>
      )}

      {loadError && (
        <AppAlert variant="error" onDismiss={() => setLoadError(null)}>
          {loadError}
        </AppAlert>
      )}

      {loading && <p className="text-center text-(--text-secondary) py-12">Carregando relatórios…</p>}

      {!loading && !loadError && dashboard && (
        <div className="space-y-8">
          <section
            className="rounded-2xl border border-(--light-gray)/25 bg-(--background-second-layer) px-5 py-5 shadow-sm"
            aria-label="Gráfico de animais cadastrados por mês"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-(--text-primary)">Animais cadastrados por mês</h2>
                <p className="mt-1 text-sm text-(--text-secondary)">
                  Período aplicado ao eixo de cadastros (e ao PDF exportado).
                </p>
              </div>
              <div
                className="
                  flex w-full max-w-3xl flex-col gap-3 rounded-2xl border border-(--light-gray)/25
                  bg-(--background-first-layer) p-3 shadow-sm sm:flex-row sm:flex-wrap sm:items-end sm:gap-4 sm:p-4
                  lg:max-w-none lg:flex-1 lg:justify-end
                "
              >
                <div className="relative min-w-[11rem] flex-1 sm:max-w-[13rem]">
                  <label className="form-label" htmlFor="cadastro-de">
                    De
                  </label>
                  <div className="relative">
                    <select
                      id="cadastro-de"
                      className={periodoSelectClass}
                      value={cadastroDe}
                      onChange={(e) => {
                        const v = e.target.value;
                        setCadastroDe(v);
                        if (v > cadastroAte) setCadastroAte(v);
                      }}
                    >
                      {mesesPeriodoOpcoes.map((ym) => (
                        <option key={ym} value={ym}>
                          {formatMesAnoSelectLabel(ym)}
                        </option>
                      ))}
                    </select>
                    <SelectChevron />
                  </div>
                </div>
                <div className="relative min-w-[11rem] flex-1 sm:max-w-[13rem]">
                  <label className="form-label" htmlFor="cadastro-ate">
                    Até
                  </label>
                  <div className="relative">
                    <select
                      id="cadastro-ate"
                      className={periodoSelectClass}
                      value={cadastroAte}
                      onChange={(e) => {
                        const v = e.target.value;
                        setCadastroAte(v);
                        if (v < cadastroDe) setCadastroDe(v);
                      }}
                    >
                      {mesesPeriodoOpcoes.map((ym) => (
                        <option key={ym} value={ym}>
                          {formatMesAnoSelectLabel(ym)}
                        </option>
                      ))}
                    </select>
                    <SelectChevron />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 sm:ml-auto sm:pb-0.5">
                  <button
                    type="button"
                    onClick={() => applyPresetMeses(6)}
                    className="
                      rounded-xl border border-(--light-green)/45 bg-(--background-second-layer)
                      px-3.5 py-2 text-xs font-semibold text-(--text-primary)
                      shadow-sm transition
                      hover:border-(--light-green) hover:bg-(--light-green-bg)/70
                      focus:outline-none focus-visible:ring-2 focus-visible:ring-(--highlighted-text)
                    "
                  >
                    Últimos 6 meses
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPresetMeses(12)}
                    className="
                      rounded-xl border border-(--light-green)/45 bg-(--background-second-layer)
                      px-3.5 py-2 text-xs font-semibold text-(--text-primary)
                      shadow-sm transition
                      hover:border-(--light-green) hover:bg-(--light-green-bg)/70
                      focus:outline-none focus-visible:ring-2 focus-visible:ring-(--highlighted-text)
                    "
                  >
                    Últimos 12 meses
                  </button>
                </div>
              </div>
            </div>
            <div className="mt-6 h-[300px] w-full min-w-0">
              {cadastroChartData.length === 0 ? (
                <p className="text-sm text-(--text-secondary)">Sem dados no período selecionado.</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={cadastroChartData} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} opacity={0.35} vertical={false} />
                    <XAxis
                      dataKey="label"
                      tick={{ ...axisTick, fontSize: 11 }}
                      interval={0}
                      angle={cadastroChartData.length > 8 ? -32 : 0}
                      textAnchor={cadastroChartData.length > 8 ? "end" : "middle"}
                      height={cadastroChartData.length > 8 ? 56 : 28}
                    />
                    <YAxis allowDecimals={false} tick={axisTick} width={36} />
                    <Tooltip
                      contentStyle={tooltipSurface}
                      formatter={(value: unknown) => [String(value ?? "—"), "Cadastros"]}
                    />
                    <Bar
                      dataKey="total"
                      name="Cadastros"
                      fill={RELATORIO_CHART.lineCadastros}
                      radius={[5, 5, 0, 0]}
                      maxBarSize={48}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </section>

          <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
            <section
              className="rounded-2xl border border-(--light-gray)/25 bg-(--background-second-layer) px-5 py-5 shadow-sm"
              aria-label="Distribuição por estado clínico"
            >
              <h2 className="text-lg font-semibold text-(--text-primary)">Estados clínicos</h2>
              <p className="mt-1 text-sm text-(--text-secondary)">Esperando consulta, consultado e em cirurgia (total atual).</p>
              <div className="mt-4 flex flex-col items-center gap-5">
                <div className="h-[240px] w-full max-w-[300px] shrink-0">
                  {pieData.every((d) => d.value === 0) ? (
                    <p className="pt-16 text-center text-sm text-(--text-secondary)">Sem animais nesses estados.</p>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie dataKey="value" data={pieData} nameKey="name" cx="50%" cy="50%" outerRadius={92} labelLine={false}>
                          {pieData.map((entry) => (
                            <Cell key={entry.name} fill={entry.fill} stroke="var(--background-second-layer)" strokeWidth={1} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={tooltipSurface} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
                <ul className="w-full max-w-lg space-y-2 text-sm">
                  {pieData.map((s) => {
                    const total = pieData.reduce((acc, x) => acc + x.value, 0);
                    const pct = total > 0 ? Math.round((s.value / total) * 1000) / 10 : 0;
                    return (
                      <li key={s.name} className="flex items-center justify-between gap-3 rounded-xl border border-(--light-gray)/20 px-3 py-2">
                        <span className="flex items-center gap-2 font-medium text-(--text-primary)">
                          <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: s.fill }} aria-hidden />
                          {s.name}
                        </span>
                        <span className="text-(--text-secondary)">
                          {s.value} <span className="text-(--text-primary)">({pct}%)</span>
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </section>

            <section
              className="rounded-2xl border border-(--light-gray)/25 bg-(--background-second-layer) px-5 py-5 shadow-sm"
              aria-label="Comparação abrigados e adotados por mês"
            >
              <div className="flex flex-col gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-(--text-primary)">Abrigados x adotados</h2>
                  <p className="mt-1 text-sm text-(--text-secondary)">
                    Totais por mês conforme regras do servidor (adoções por data de adoção). Período aplicado à série
                    abrigados/adotados (e ao PDF exportado).
                  </p>
                </div>
                <div
                  className="
                    flex w-full flex-col gap-3 rounded-2xl border border-(--light-gray)/25
                    bg-(--background-first-layer) p-3 shadow-sm sm:flex-row sm:flex-wrap sm:items-end sm:gap-4 sm:p-4
                  "
                >
                  <div className="relative min-w-[11rem] flex-1 sm:max-w-[13rem]">
                    <label className="form-label" htmlFor="serie-de">
                      De
                    </label>
                    <div className="relative">
                      <select
                        id="serie-de"
                        className={periodoSelectClass}
                        value={serieDe}
                        onChange={(e) => {
                          const v = e.target.value;
                          setSerieDe(v);
                          if (v > serieAte) setSerieAte(v);
                        }}
                      >
                        {mesesPeriodoOpcoes.map((ym) => (
                          <option key={ym} value={ym}>
                            {formatMesAnoSelectLabel(ym)}
                          </option>
                        ))}
                      </select>
                      <SelectChevron />
                    </div>
                  </div>
                  <div className="relative min-w-[11rem] flex-1 sm:max-w-[13rem]">
                    <label className="form-label" htmlFor="serie-ate">
                      Até
                    </label>
                    <div className="relative">
                      <select
                        id="serie-ate"
                        className={periodoSelectClass}
                        value={serieAte}
                        onChange={(e) => {
                          const v = e.target.value;
                          setSerieAte(v);
                          if (v < serieDe) setSerieDe(v);
                        }}
                      >
                        {mesesPeriodoOpcoes.map((ym) => (
                          <option key={ym} value={ym}>
                            {formatMesAnoSelectLabel(ym)}
                          </option>
                        ))}
                      </select>
                      <SelectChevron />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 h-[300px] w-full min-w-0">
                {barSerieData.length === 0 ? (
                  <p className="text-sm text-(--text-secondary)">Sem dados no período selecionado.</p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barSerieData} margin={{ top: 8, right: 12, left: 0, bottom: 8 }} barCategoryGap="12%">
                      <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} opacity={0.35} vertical={false} />
                      <XAxis
                        dataKey="label"
                        tick={{ ...axisTick, fontSize: 11 }}
                        interval={0}
                        angle={barSerieData.length > 8 ? -32 : 0}
                        textAnchor={barSerieData.length > 8 ? "end" : "middle"}
                        height={barSerieData.length > 8 ? 56 : 28}
                      />
                      <YAxis allowDecimals={false} tick={axisTick} width={36} />
                      <Tooltip contentStyle={tooltipSurface} />
                      <Legend
                        wrapperStyle={{ color: "var(--text-secondary)", fontSize: "0.75rem", paddingTop: 4 }}
                        formatter={(value) => <span className="text-(--text-secondary)">{value}</span>}
                      />
                      <Bar
                        dataKey="Abrigados"
                        fill={RELATORIO_CHART.abrigados}
                        radius={[5, 5, 0, 0]}
                        maxBarSize={40}
                      />
                      <Bar
                        dataKey="Adotados"
                        fill={RELATORIO_CHART.adotados}
                        radius={[5, 5, 0, 0]}
                        maxBarSize={40}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
