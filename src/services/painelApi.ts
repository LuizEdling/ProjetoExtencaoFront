import { getPainelEndpoint } from "../lib/apiBase";
import { apiClient } from "../lib/apiClient";
import type {
  AnimalFila,
  CadastroHojeItem,
  LegendaVariant,
  PainelDashboardData,
  ResumoCardData,
  ResumoIcon,
} from "../types/painel";

interface PainelResumoApi {
  id: string;
  titulo: string;
  valor: string;
  legenda: string;
  legenda_variant: string;
  icon: string;
}

interface PainelFilaApi {
  id: string;
  nome: string;
  especie: string;
  estado_nome: string;
  estado_alterado_em: string | null;
  data_entrada: string;
}

interface PainelCadastroApi {
  id: string;
  nome: string;
  tipo_raca: string;
  horario: string;
}

interface PainelApiResponse {
  resumos: PainelResumoApi[];
  fila_atendimento: PainelFilaApi[];
  cadastros_hoje: PainelCadastroApi[];
}

function parseLegendaVariant(v: string): LegendaVariant {
  if (v === "success" || v === "warning" || v === "neutral") return v;
  return "neutral";
}

function parseIcon(v: string): ResumoIcon {
  if (v === "paw" || v === "dog" || v === "heart" || v === "home") return v;
  return "paw";
}

function mapResumo(row: PainelResumoApi): ResumoCardData {
  return {
    id: row.id,
    titulo: row.titulo,
    valor: row.valor,
    legenda: row.legenda,
    legendaVariant: parseLegendaVariant(row.legenda_variant),
    icon: parseIcon(row.icon),
  };
}

function mapFila(row: PainelFilaApi): AnimalFila {
  return {
    id: row.id,
    nome: row.nome,
    especie: row.especie,
    estadoNome: row.estado_nome,
    estadoAlteradoEm: row.estado_alterado_em,
    dataEntrada: row.data_entrada,
  };
}

function mapCadastro(row: PainelCadastroApi): CadastroHojeItem {
  return {
    id: row.id,
    nome: row.nome,
    tipoRaca: row.tipo_raca,
    horario: row.horario,
  };
}

export async function fetchPainel(): Promise<PainelDashboardData> {
  const url = getPainelEndpoint();
  const { data } = await apiClient.get<PainelApiResponse>(url);
  return {
    resumos: Array.isArray(data.resumos) ? data.resumos.map(mapResumo) : [],
    filaAtendimento: Array.isArray(data.fila_atendimento) ? data.fila_atendimento.map(mapFila) : [],
    cadastrosHoje: Array.isArray(data.cadastros_hoje) ? data.cadastros_hoje.map(mapCadastro) : [],
  };
}
