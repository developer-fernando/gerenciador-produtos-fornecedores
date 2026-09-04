# Spec — Front: base + Empresas

| Campo | Valor |
|---|---|
| **Status** | Aprovado (validação estática — pronta para implementação) |
| **Funcionalidade** | 04-front-base-empresas |
| **PRD relacionado** | [prd.md](./prd.md) · [validation.md](./validation.md) |

## 1. Abordagem técnica

SPA React 19 + Vite 8 + TypeScript, organizada **por funcionalidade** com profundidade rasa, conforme [docs/10](../../docs/10-arquitetura-frontend.md#organização-de-pastas--feature-based) e [AGENTS §Front](../../AGENTS.md). Estado de servidor em **TanStack Query**; HTTP via **instância axios central** com interceptors que normalizam erros; roteamento com **react-router-dom**. Estilo com **CSS + design tokens** (paleta Horizon) centralizados em `styles/` — sem framework de CSS (mantém simples e sob controle da identidade). Nesta feature entra a **fundação** (shell/lib/shared) e as **telas de Empresas**; a feature 05 reaproveita tudo para Produtos.

Estrutura alvo:
```
frontend/src/
├── app/        → providers.tsx (QueryClient+Router), routes.tsx, App.tsx
├── lib/        → http.ts (axios), errors.ts (normalização), queryClient.ts
├── features/empresas/ → types.ts, api.ts, hooks.ts, components/
├── shared/     → components/ (Table, Pagination, StatusBadge, Modal, ConfirmDialog,
│                 FormField, Toast), format.ts (cnpj/telefone/preco), types.ts (paginação/erro)
└── styles/     → tokens.css (paleta), global.css
```

## 2. Modelo de dados

Sem banco no front. Tipos TypeScript espelham o contrato ([docs/15 §Empresa](../../docs/15-contrato-api.md#empresa) e [§Padrão de listagem](../../docs/15-contrato-api.md#padrão-de-listagem-paginação--filtros)):
- `Empresa` = `{ id, nome, cnpj, email, telefone, status: 'Ativo'|'Inativo', excluido, produtos_count, created_at, updated_at, deleted_at, acoes_permitidas }`.
- `AcoesPermitidas` = `{ editar, inativar, reativar, excluir, restaurar, excluir_definitivamente: boolean }`.
- `Paginated<T>` = `{ data: T[], links, meta: { current_page, per_page, total, last_page, from, to, path } }`.
- `EmpresaFiltros` = `{ page?, nome?, status?, excluidos? }`.
- `ApiError` (normalizado) = `{ status: number, message: string, code?: string, fieldErrors?: Record<string,string> }`.

`cnpj`/`telefone` chegam **só com dígitos** e o `preco` como string — formatação é do front ([docs/15](../../docs/15-contrato-api.md), nota).

## 3. Contrato da API

Endpoints consumidos ([docs/15 §Endpoints — Empresas](../../docs/15-contrato-api.md#endpoints--empresas)):

| Ação | Método/rota | Sucesso |
|---|---|---|
| Listar | `GET /empresas?page&nome&status&excluidos` | 200 (envelope paginado) |
| Detalhar | `GET /empresas/{id}` | 200 |
| Criar | `POST /empresas` | 201 |
| Editar | `PUT /empresas/{id}` | 200 |
| Inativar | `PATCH /empresas/{id}/inativar` | 200 |
| Reativar | `PATCH /empresas/{id}/reativar` | 200 |
| Excluir (lógica) | `DELETE /empresas/{id}` | 200 |
| Restaurar | `POST /empresas/{id}/restaurar` | 200 |
| Excluir definitivamente | `DELETE /empresas/{id}/forcar` | 204 |

Erros normalizados a partir dos formatos padronizados ([docs/15 §Tratamento de erros](../../docs/15-contrato-api.md#tratamento-de-erros--formatos-padronizados)): **422** → `fieldErrors` (de `errors`) + `message`; **409** → `message` + `code`; **404/500** → `message` genérico. Envio com `Accept: application/json`.

> `GET /empresas/{id}` (detalhar) é **opcional** nesta feature: o formulário de edição reaproveita os dados já presentes na linha da listagem. `api.ts` pode expô-lo, mas as telas da 04 não dependem dele — não criar tela de detalhe (fora de escopo).

## 4. Mudanças por camada

**Front-end (React):**
- **Tooling/deps (`package.json`):** adicionar `@tanstack/react-query`, `axios`, `react-router-dom`; dev: `vitest`, `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`, `jsdom`, `msw`. Script `test: vitest run`. Config de teste no `vite.config.ts` (`test: { environment: 'jsdom', setupFiles }`). Remover boilerplate do Vite (`App.css`, hero/react/vite assets, conteúdo demo de `App.tsx`, `public/icons.svg` se não usado).
- **`styles/`**: `tokens.css` com a paleta ([docs/05](../../docs/05-ux-e-interface.md#identidade-visual-horizon)) como CSS variables (`--amarelo #FBE509`, `--preto #000`, `--grafite #141414`, `--cinza-claro #F7F7F7`, `--branco #fff`) + tokens de espaçamento/raio/foco; `global.css` (reset leve, tipografia, `:focus-visible` visível).
- **`lib/http.ts`**: instância axios (`baseURL: import.meta.env.VITE_API_URL`, headers `Accept: application/json` e `Content-Type: application/json` — ambos exigidos por [docs/15 §Convenções](../../docs/15-contrato-api.md#convenções-gerais)), interceptor de resposta que converte qualquer erro em `ApiError` via `lib/errors.ts`.
- **`lib/errors.ts`**: `normalizarErro(error): ApiError` — mapeia 422 (`errors`→`fieldErrors`), 409 (`code`), 404/500, e falha de rede (sem `response`) para mensagem genérica; `helper` para saber se é erro de campo.
- **`lib/queryClient.ts`**: `QueryClient` com defaults sensatos (retry moderado, `staleTime` curto).
- **`app/`**: `providers.tsx` (QueryClientProvider + BrowserRouter), `routes.tsx` (rota `/` → lista de empresas; base para 05), `App.tsx` (layout: `Header` com logo Horizon + `main`).
- **`shared/components/`**: `Table` + `Pagination` (recebe `meta`, dispara mudança de página), `StatusBadge` (Ativo/Inativo/Excluído com cores distintas — **precedência:** `excluido=true` exibe sempre "Excluído"; `status` (Ativo/Inativo) só é exibido quando o registro **não** está excluído — ver §5), `Modal`, `ConfirmDialog` (título, mensagem, variante destrutiva, texto de confirmação), `FormField` (label + input + erro), `Toast`/`ToastProvider` (feedback sucesso/erro).
- **`shared/format.ts`**: `formatarCnpj`, `formatarTelefone`, `formatarPreco` (BRL) — entrada só-dígitos/string → exibição.
- **`features/empresas/`**:
  - `api.ts`: funções por endpoint (usam `lib/http`).
  - `hooks.ts`: `useEmpresas(filtros)` (query), `useEmpresaMutations()` (criar/editar/inativar/reativar/excluir/restaurar/forcar), cada uma das **seis** mutações de ciclo de vida (mais criar/editar) **invalida** a query de listagem ([docs/10 §Padrão de mutação](../../docs/10-arquitetura-frontend.md#padrão-de-mutação-ciclo-de-vida)) — o padrão de invalidação é único e cobre todas, não só as exemplificadas nos testes.
  - `components/`: `EmpresasPage` (orquestra filtros + tabela + modais), `EmpresasFiltros` (nome, status, excluídos), `EmpresasTabela` (linhas + `AcoesEmpresa`), `EmpresaFormModal` (criar/editar), `AcoesEmpresa` (botões condicionais por `acoes_permitidas`), diálogos de inativar (com impacto) e excluir definitivamente (irreversível).

**Back-end:** nenhuma mudança.

## 5. Regras e validações a implementar

| Regra/validação (UX) | Origem |
|---|---|
| Exibir só ações de `acoes_permitidas` (nunca oferecer ação recusável) | [docs/05 §Princípio](../../docs/05-ux-e-interface.md#princípio-geral) · [docs/15 §Derivação](../../docs/15-contrato-api.md#derivação-de-acoes_permitidas) |
| Distinção visual Ativo/Inativo/Excluído | [docs/05 §Requisitos de interface](../../docs/05-ux-e-interface.md#requisitos-de-interface) |
| **Status × Exclusão são dimensões independentes** (não conflar — item eliminatório): um registro pode ser `Inativo` **e** `excluido=true`. O badge dá **precedência a "Excluído"** e só mostra `status` quando não excluído; assim a UI nunca chama um registro inativo de "excluído" nem vice-versa | [docs/02 §1](../../docs/02-regras-de-negocio.md#1-as-duas-dimensões-status--exclusão-lógica) · [docs/02 §7](../../docs/02-regras-de-negocio.md#7-mecânicas-obrigatórias) |
| Aviso de impacto ao inativar (cascata) | [docs/05 §Fluxos 4](../../docs/05-ux-e-interface.md#fluxos-de-uso-exigidos) |
| Confirmação + irreversibilidade na exclusão definitiva | [docs/05 §Fluxos 5](../../docs/05-ux-e-interface.md#fluxos-de-uso-exigidos) |
| Erro 422 mapeado por campo; 409 em linguagem compreensível | [docs/15 §Erros](../../docs/15-contrato-api.md#tratamento-de-erros--formatos-padronizados) · [docs/10 §Tratamento de erros](../../docs/10-arquitetura-frontend.md#tratamento-de-erros-e-estados) |
| Paginação server-side 10/pág + filtros (nome/status/excluídos) | [docs/04 §Listagens](../../docs/04-requisitos.md#listagens-paginação-e-filtros) · [docs/15 §Padrão de listagem](../../docs/15-contrato-api.md#padrão-de-listagem-paginação--filtros) |
| Lista reflete estado após ação (invalidação) | [docs/10 §Estado](../../docs/10-arquitetura-frontend.md#gerenciamento-de-estado) |
| Validação de front só para UX (servidor é autoridade) | [AGENTS §Princípios](../../AGENTS.md) |

**Validação de formulário (front, UX):** controlada, por campo — `nome` 3–150; `cnpj` obrigatório (formatável, comprimento de 14 dígitos após limpar); `email` formato válido; `telefone` com DDD (10–11 dígitos); `status` ∈ {Ativo, Inativo}. Erros de front são substituídos/complementados pelos `fieldErrors` do 422 quando o servidor recusa (o servidor é autoritativo). **Decisão:** sem biblioteca de formulário (react-hook-form/zod) — um único formulário simples; controlados + helper de validação evitam dependência não documentada e sobre-engenharia.

## 6. Estratégia de testes

Camada executável ([AGENTS §Testes front](../../AGENTS.md) — Vitest + RTL + user-event + MSW; [docs/14 §Front](../../docs/14-estrategia-de-testes.md)):
- **Unit — `lib/errors.ts`:** 422→`fieldErrors`; 409→`code`+`message`; 404/500→`message` genérico; erro de rede→genérico.
- **Unit — `shared/format.ts`:** CNPJ, telefone (10 e 11 dígitos), preço BRL; entradas de borda.
- **Componente — `StatusBadge`** (exigido por [docs/14](../../docs/14-estrategia-de-testes.md)): dado o estado da empresa, renderiza o **rótulo e a classe/cor distintos** — Ativo (não excluído), Inativo (não excluído), e **Excluído com precedência** no caso combinado `status='Inativo'` **e** `excluido=true` (nunca exibe "Inativo" para um registro excluído — não conflar as dimensões, [docs/02 §1](../../docs/02-regras-de-negocio.md#1-as-duas-dimensões-status--exclusão-lógica)).
- **Componente — `AcoesEmpresa`:** dado `acoes_permitidas`, renderiza **exatamente** os botões permitidos e nenhum a mais — os três estados de [docs/15 §Derivação](../../docs/15-contrato-api.md#derivação-de-acoes_permitidas) em **quatro casos**: ativa não excluída (editar/inativar/excluir), **inativa não excluída (editar/reativar/excluir — cobre `reativar=true`)**, excluída **sem** produtos (restaurar/excluir_definitivamente) e excluída **com** produtos (`excluir_definitivamente=false` → só restaurar).
- **Componente — `EmpresaFormModal`:** com MSW retornando 422, o erro aparece **no campo** (`cnpj`); submit válido chama sucesso.
- **Componente — `EmpresasPage` (estados + paginação):** MSW lista → loading→dados; lista vazia → estado vazio; erro → estado de erro; troca de página refaz a query com `page=2`.
- **Componente — filtros combinados:** selecionar nome + status + excluídos dispara a query com os **params combinados corretos** (`nome`, `status`, `excluidos=true`), inspecionando a request no MSW ([docs/04 §Listagens](../../docs/04-requisitos.md#listagens-paginação-e-filtros)).
- **Componente — invalidação (sem reload):** após uma mutação bem-sucedida via MSW, a query de listagem é **refeita** e a tabela reflete o novo estado **sem** recarregar a página — verifica o requisito central de [docs/10 §Estado](../../docs/10-arquitetura-frontend.md#gerenciamento-de-estado). Cobrir mais de um tipo de mutação para exercitar o padrão comum (ex.: **criar** → nova linha aparece; **inativar/reativar** → status muda; **excluir** → linha some), não apenas uma.
- **Componente — fluxos destrutivos:** inativar exibe **aviso de impacto** (com a contagem de produtos afetados via `produtos_count`); excluir definitivamente exige **confirmação** com aviso de irreversibilidade; um 409 exibe a `message` em linguagem compreensível.
- **Executável de build:** `npm run build` (tsc + vite) e `npm run lint` (oxlint) sem erros.

**Verificação manual** (não automatizável) — listada no `validation.md`: identidade visual/logo, responsividade, foco de teclado visível, e um fluxo ponta a ponta contra a API real (Docker).

## 7. Tickets

> Cada ticket é pequeno e verificável. Marcar ao concluir; o commit referencia o ID.

- [ ] **04-T1** — Deps + tooling: adicionar libs (runtime e teste), script `test`, config Vitest/jsdom/setup, remover boilerplate do Vite — _`npm install` ok; `npm run build` e `npm run test` (vazio) verdes; app sobe limpo._
- [ ] **04-T2** — `styles/` (tokens da paleta + global, foco visível) + `app/` (providers Query+Router, rota `/`, layout com `Header`/logo) — _app renderiza o shell com identidade Horizon; verificação visual._
- [ ] **04-T3** — `lib/`: `http.ts` (axios + baseURL), `errors.ts` (normalização), `queryClient.ts` + testes de `errors.ts` (422/409/404/500/rede) — _testes verdes._
- [ ] **04-T4** — `shared/`: `format.ts` (+ testes) e componentes base (`Table`/`Pagination`, `StatusBadge`, `Modal`, `ConfirmDialog`, `FormField`, `Toast`) — _formatters testados; **teste do `StatusBadge`** (Ativo/Inativo/Excluído distintos) verde; componentes renderizam._
- [ ] **04-T5** — `features/empresas` camada de dados: `types.ts`, `api.ts`, `hooks.ts` (query + mutações com invalidação) — _tipos compilam; hooks montam queries/mutações corretas._
- [ ] **04-T6** — Empresas listagem: `EmpresasPage`+`EmpresasFiltros`+`EmpresasTabela`, paginação, filtros (nome/status/excluídos), estados loading/vazio/erro, `produtos_count`, badges — _testes de página (loading/vazio/erro/paginação) e de **filtros combinados** (params corretos) verdes._
- [ ] **04-T7** — Empresas formulário (criar/editar): `EmpresaFormModal` com validação por campo + mapeamento de 422, feedback de sucesso, invalidação — _teste de erro por campo + sucesso verdes._
- [ ] **04-T8** — Empresas ações de ciclo de vida: `AcoesEmpresa` condicional + inativar (aviso de impacto com `produtos_count`), reativar, excluir, restaurar, excluir definitivamente (confirmação/irreversível), tratamento de 409 — _testes de ações condicionais, fluxos destrutivos e **invalidação pós-mutação (sem reload)** verdes._
- [ ] **04-T9** — Validação executável final + verificação manual: `build`+`lint`+`test` verdes; checklist manual (identidade, responsivo, foco, fluxo E2E via Docker) registrado — _DoD atendido._

## 8. Definition of Done

- [ ] Todos os tickets concluídos.
- [ ] Regras/validações de UX implementadas conforme a origem (ações condicionais, avisos, filtros, invalidação).
- [ ] Invalidação verificada: após mutação, a listagem reflete o novo estado **sem reload** (teste em 04-T8).
- [ ] Testes Vitest previstos passando; `npm run build` e `npm run lint` verdes.
- [ ] Sem segredos no bundle; sem `dangerouslySetInnerHTML`; erros exibidos sem detalhes internos.
- [ ] Critérios de aceite do PRD atendidos (os manuais confirmados no `validation.md`).

## 9. Decisões e riscos locais

- **Logo Horizon (dependência):** os docs afirmam que a logo "já existe" ([docs/05 §Identidade](../../docs/05-ux-e-interface.md#identidade-visual-horizon)), mas **não há arquivo no repositório**. Decisão: o `Header` referencia a logo por um único ponto (`shared` ou `assets`), com **fallback textual** ("Horizon", preto sobre amarelo, respeitando as regras da paleta) até o arquivo ser fornecido. Trocar o asset não muda o restante. Item de **verificação manual**.
- **CSS sem framework:** paleta e layout via CSS + tokens, para controle total da identidade e simplicidade (evitar dependência de UI kit). Componentes acessíveis à mão (foco visível, `aria` em modais/diálogos).
- **Sem react-hook-form/zod:** um formulário simples de Empresa; controlados + validação manual bastam e evitam dependência fora da stack documentada.
- **Filtros na URL/estado:** filtros e página mantidos em estado local (e opcionalmente refletidos na querystring); não é requisito, então mantém-se simples em estado local.
- **`excluidos=true` + `status`:** a API decide a semântica; o front apenas repassa os params selecionados (sem lógica de negócio no front).
- **MSW nos testes:** mocka a API para testar comportamento sem back-end; nenhum teste depende de rede real (o fluxo real fica na verificação manual via Docker).
- **Precedência visual Status × Exclusão (não conflar — eliminatório):** como as duas dimensões coexistem ([docs/02 §1](../../docs/02-regras-de-negocio.md#1-as-duas-dimensões-status--exclusão-lógica)), o `StatusBadge` dá **precedência a "Excluído"** e só exibe `status` (Ativo/Inativo) quando não excluído — evitando rotular como "Inativo" um registro excluído. Testado no caso combinado `Inativo`+`excluido=true`.
- **`formatarPreco` sem uso em Empresas:** Empresa não tem `preco`; o formatador entra em `shared/format.ts` já nesta feature por ser **fundação reutilizável** pela 05 (Produtos). Fica testado unitariamente na 04 e integrado à tela na 05 — não é código morto, é base compartilhada declarada no escopo do PRD.
- **Risco — divergência de contrato:** se algum payload real divergir do documentado, ajustar os `types.ts`/normalização e **registrar** em docs/15 (fonte de verdade), não improvisar no componente.
