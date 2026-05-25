/** Resposta do GET /api/adocoes (item com relações carregadas). */
export type AdocaoListItem = {
  id: number;
  animal_id: number;
  adotante_id: number;
  data_adocao: string;
  doc_adocao?: string | null;
  contratacao?: {
    id: number;
    adocao_id: number;
    created_at?: string;
    updated_at?: string;
  } | null;
  animal: {
    id: number;
    nome: string;
    animal_state?: { id: number; nome: string };
  };
  adotante: {
    id: number;
    nome: string;
    cpf?: string;
  };
};

export type CreateAdocaoPayload = {
  animal_id: number;
  adotante_id: number;
  /** YYYY-MM-DD; se omitido, o backend usa a data atual. */
  data_adocao?: string;
};
