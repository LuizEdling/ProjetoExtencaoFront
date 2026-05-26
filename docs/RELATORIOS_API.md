# API de Relatórios (contrato front ↔ Laravel)

Este documento descreve o que o front em [`src/services/relatoriosApi.ts`](../src/services/relatoriosApi.ts) espera do backend. Implemente no projeto Laravel (API) com rotas autenticadas como as demais (`/api/...`).

## `GET /api/relatorios/dashboard`

Agrega os dados da tela em **uma** resposta JSON (recomendado usar um **API Resource** ou **Transformer** dedicado para serializar só números e chaves estáveis).

### Query parameters (todos obrigatórios no contrato atual do front)

| Parâmetro           | Tipo   | Descrição |
|---------------------|--------|-----------|
| `cadastro_de`       | string | Primeiro mês do intervalo de **cadastros** (`YYYY-MM`). |
| `cadastro_ate`      | string | Último mês do intervalo (`YYYY-MM`). |
| `serie_de`          | string | Primeiro mês da série **Abrigados x Adotados** (`YYYY-MM`). |
| `serie_ate`         | string | Último mês da série (`YYYY-MM`). |
| `apenas_mes_atual`  | `0` ou `1` | O front da tela de relatórios envia sempre `0`. Reservado para compatibilidade; o período da série usa só `serie_de` / `serie_ate`. |

O front da página de relatórios chama o dashboard com uma **janela ampla** (cadastro e série alinhados aos últimos 12 meses até o mês atual) e recorta **no cliente** os gráficos com os intervalos escolhidos pelo usuário; o PDF usa exatamente os intervalos enviados no corpo da exportação.

O front ordena `cadastro_de`/`cadastro_ate` e `serie_de`/`serie_ate` se o usuário inverter as datas.

O front aceita o JSON **na raiz** (`cadastros_por_mes`, …) ou, por compatibilidade, dentro de `{ "data": { ... } }` (wrapper padrão do Laravel `JsonResource`).

### Corpo JSON de resposta (snake_case)

```json
{
  "cadastros_por_mes": [
    { "ano_mes": "2026-01", "total": 12 }
  ],
  "estados_clinica": {
    "esperando_consulta": 3,
    "consultado": 5,
    "em_cirurgia": 1
  },
  "abrigados_adotados_por_mes": [
    { "ano_mes": "2026-01", "abrigados": 40, "adotados": 2 }
  ]
}
```

- **`cadastros_por_mes`**: total de animais por mês no intervalo `[cadastro_de, cadastro_ate]` (inclusive), agrupados pela **`data_ficha`** do animal (mesma data exibida na coluna “Data ficha” do sistema), alinhado ao fuso em `APP_TIMEZONE` / `config('app.timezone')`.
- **`estados_clinica`**: contagens atuais (snapshot) de animais cujo estado é um dos três: esperando consulta, consultado, em cirurgia — alinhado aos nomes usados no catálogo de estados do sistema.
- **`abrigados_adotados_por_mes`**: uma linha por mês no intervalo `[serie_de, serie_ate]` (inclusive).
  - **Adotados**: contagem de adoções no mês (agrupar por `data_adocao` na tabela de adoções).
  - **Abrigados**: animais cuja **`data_ficha`** cai naquele mês e cujo estado **atual** não é “Adotado”.

Arrays podem ser vazios; contagens podem ser zero.

---

## `POST /api/relatorios/export`

Gera um **PDF** com os mesmos filtros da tela. **Não persiste** arquivo nem registro no banco (apenas gera e devolve o stream).

### Corpo (JSON)

Mesmos campos que o query string do dashboard:

```json
{
  "cadastro_de": "2025-12",
  "cadastro_ate": "2026-05",
  "serie_de": "2025-12",
  "serie_ate": "2026-05",
  "apenas_mes_atual": 0
}
```

### Resposta

- `Content-Type: application/pdf`
- Corpo: bytes do PDF.

O PDF inclui uma linha **Total** no rodapé das tabelas numéricas (cadastros por mês e abrigados x adotados por mês); a seção de estados clínicos permanece apenas como resumo em três colunas, sem linha de total agregada.

Em caso de erro, o front aceita JSON dentro de uma resposta não-PDF (mesmo padrão dos contratos): `{ "message": "..." }` ou `{ "mensagem": "..." }`.

---

## Laravel: otimização

- Preferir **consultas agregadas** (`selectRaw`, `groupBy`, subqueries) em vez de carregar coleções completas.
- Expor o JSON via **Resource** (`RelatorioDashboardResource`) ou **Transformer** para manter o contrato estável e evoluir o domínio sem expor o modelo cru.
- **Fuso:** definir `APP_TIMEZONE` no `.env` do Laravel (padrão sugerido `America/Sao_Paulo`). Após mudar, executar `php artisan config:clear`. O painel e os relatórios usam `config('app.timezone')` para “hoje” e limites de mês.

---

## Rotas no front

- Base: `VITE_APP_URL` + `/api/relatorios`
- Dashboard: `GET .../dashboard`
- Export: `POST .../export`

---

## Nota: versão do Recharts (Vite)

O projeto usa **Recharts 2.15.x** (e `react-is` alinhado ao React 19). A série **Recharts 3** depende de `es-toolkit/compat`, cujos arquivos CommonJS podem ser empacotados pelo Vite de forma que apareça o erro em runtime `require_isUnsafeProperty is not a function`. Até haver correção estável upstream ou aliases ESM no `vite.config`, mantenha Recharts 2.x na tela de relatórios.
