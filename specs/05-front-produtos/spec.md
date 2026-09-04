# Spec — Front: Produtos

| Campo | Valor |
|---|---|
| **Status** | Aprovado (validação estática — pronto para implementar) |
| **Funcionalidade** | 05-front-produtos |
| **PRD relacionado** | [prd.md](./prd.md) · [validation.md](./validation.md) |

## 1. Abordagem técnica

Espelhar a arquitetura da feature 04 para o domínio Produtos, **reaproveitando** toda a base já pronta: `lib/http` + `lib/errors` (cliente e normalização), `shared/` (Table, Pagination, StatusBadge, Modal, ConfirmDialog, FormField, Button, Toast), `shared/format.ts` (**`formatarPreco` já existe**), tipos `Paginated`/`Status`, e o padrão de `feature/{types,api,hooks,components}`. Novidades desta feature: **navegação** entre áreas (o layout só tinha a marca), o **seletor de empresa apta** no formulário e as regras do lado do produto (reativar/restaurar). Estado de servidor em TanStack Query com invalidação; testes em Vitest + RTL + user-event + MSW ([AGENTS §Testes](../../AGENTS.md), [docs/14](../../docs/14-estrategia-de-testes.md)).

Estrutura nova:
```
frontend/src/
├── app/            → nav no layout + rota /produtos
└── features/produtos/ → types.ts, api.ts, hooks.ts, components/
    (ProdutosPage, ProdutosFiltros, ProdutosTabela, ProdutoFormModal,
     AcoesProduto, EmpresaAptaSelect)
```

## 2. Modelo de dados

Sem banco no front. Tipos espelham o contrato ([docs/15 §Produto](../../docs/15-contrato-api.md#produto)):
- `Produto` = `{ id, empresa_id, empresa: EmpresaResumo, nome, descricao, preco: string, codigo_interno, status: Status, excluido, created_at, updated_at, deleted_at, acoes_permitidas }`.
- `EmpresaResumo` = `{ id, nome, status: Status }` (resumo carregado via eager loading).
- `ProdutoFormInput` = `{ empresa_id: number, nome, descricao, preco, codigo_interno, status }`.
- `ProdutoFiltros` = `{ page?, nome?, status?, excluidos? }`.
- Reusa `Paginated<T>` e `Status` de `shared/types.ts` e `ApiError` de `lib/errors.ts`. **`AcoesPermitidas`** hoje vive em `features/empresas/types.ts`; como agora é usado por **duas** features, será **movido para `shared/types.ts`** (comum → `shared/`, [docs/10](../../docs/10-arquitetura-frontend.md#organização-de-pastas--feature-based)) e ambas as features passam a importá-lo de lá (pequeno ajuste na 04, sem mudança de comportamento).

`preco` chega como **string decimal**; formatado com `formatarPreco` (BRL) na exibição ([docs/15](../../docs/15-contrato-api.md)).

## 3. Contrato da API

Endpoints consumidos ([docs/15 §Endpoints — Produtos](../../docs/15-contrato-api.md#endpoints--produtos)):

| Ação | Método/rota | Sucesso |
|---|---|---|
| Listar | `GET /produtos?page&nome&status&excluidos` | 200 (envelope paginado) |
| Criar | `POST /produtos` | 201 |
| Editar | `PUT /produtos/{id}` | 200 |
| Inativar | `PATCH /produtos/{id}/inativar` | 200 |
| Reativar | `PATCH /produtos/{id}/reativar` | 200 (exige empresa apta, senão 422) |
| Excluir (lógica) | `DELETE /produtos/{id}` | 200 |
| Restaurar | `POST /produtos/{id}/restaurar` | 200 (exige empresa não excluída, senão 409) |
| Excluir definitivamente | `DELETE /produtos/{id}/forcar` | 204 |
| **Empresas aptas** (seletor) | `GET /empresas?status=Ativo` | 200 (só ativas e, por padrão, não excluídas) |

Erros normalizados pelo interceptor existente: 422 → `fieldErrors`/`code`; 409 → `message`+`code` (ex.: `empresa_excluida`); 404/500 → genérico ([docs/15 §Erros](../../docs/15-contrato-api.md#tratamento-de-erros--formatos-padronizados)).

## 4. Mudanças por camada

**Front-end (React):**
- **`app/` (navegação):** adicionar uma **navegação** no layout (no `Header` ou uma barra sob ele) com links "Empresas" e "Produtos" (`NavLink` com estado ativo visível); registrar a rota `/produtos` em `routes.tsx`. O redirect base `/` → `/empresas` permanece.
- **`features/produtos/types.ts`:** os tipos do §2.
- **`features/produtos/api.ts`:** `listarProdutos(filtros)`, `criarProduto`, `atualizarProduto(id,input)`, `inativar/reativar/excluir/restaurar/forcarProduto(id)` — via `lib/http`. Reusa o padrão de `montarParams` da 04.
- **`features/produtos/hooks.ts`:** `useProdutos(filtros)` (query, `keepPreviousData`); `useProdutoMutations()` (7 mutações, cada uma invalida `['produtos']`); `useEmpresasAptas()` (query `['empresas','aptas']` → **todas as empresas aptas**, para o seletor). Como `GET /empresas` é paginado (10/pág, sem `per_page` no contrato — [docs/15](../../docs/15-contrato-api.md#padrão-de-listagem-paginação--filtros)), a `api.ts` faz `listarEmpresasAptas()` que **itera as páginas** (`?status=Ativo&page=1..meta.last_page`) e concatena, devolvendo a lista completa de aptas. O conjunto de empresas aptas é pequeno e limitado (não é a listagem de produtos), então buscar todas é aceitável e não contraria [docs/12](../../docs/12-performance.md) (que trata de não carregar listagens inteiras de dados operacionais). Evolução futura possível, se o número de aptas crescer muito: typeahead via o param `nome`.
- **`features/produtos/components/`:**
  - `ProdutosPage` — orquestra filtros + query + tabela + paginação + estados + modal + ações.
  - `ProdutosFiltros` — nome, status, excluídos (igual à 04).
  - `ProdutosTabela` — colunas: Nome, **Empresa** (`empresa.nome`), **Preço** (`formatarPreco`), Código interno, Status (`StatusBadge`), Ações (`acoesSlot`).
  - `EmpresaAptaSelect` — props `{ value, onChange, empresaVinculada?, error? }`. `<select>` populado por `useEmpresasAptas()` (lista completa, todas as páginas); trata loading/erro/**vazio** (sem empresa apta → aviso "cadastre/ative uma empresa antes" e impede o submit). Na **edição**, injeta `empresaVinculada` nas opções caso não venha na lista, garantindo que apareça selecionada.
  - `ProdutoFormModal` — criar/editar; campos: empresa (via `EmpresaAptaSelect`), nome, descrição (textarea), preço, código interno, status; validação por campo + mapeamento de 422; montado por `key` (estado inicial das props, como na 04).
  - `AcoesProduto` — botões condicionais por `acoes_permitidas`; inativar/excluir com confirmação, restaurar/reativar diretos, excluir definitivamente com aviso de irreversibilidade; 409/422 viram toast compreensível.

**Back-end / `docs/`:** nenhuma mudança.

## 5. Regras e validações a implementar

| Regra/validação (UX) | Origem |
|---|---|
| Seletor oferece só empresas aptas | [docs/05 §Fluxos 2](../../docs/05-ux-e-interface.md#fluxos-de-uso-exigidos) · [docs/15 §Seleção de empresa apta](../../docs/15-contrato-api.md#seleção-de-empresa-apta-formulário-de-produto) |
| Editar/trocar vínculo só para empresa apta | [docs/02 §5](../../docs/02-regras-de-negocio.md#5-regras-por-operação-sobre-produto) |
| Ações condicionais por `acoes_permitidas` (editar/reativar exigem empresa apta) | [docs/15 §Derivação](../../docs/15-contrato-api.md#derivação-de-acoes_permitidas) |
| Restaurar → 409 `empresa_excluida` exibido compreensível | [docs/15 §Erros](../../docs/15-contrato-api.md#códigos-de-regra-de-negócio-code-previstos-🟦) |
| Reativar sem empresa apta → 422 `empresa_inativa_ou_excluida` | [docs/15 §Erros](../../docs/15-contrato-api.md#códigos-de-regra-de-negócio-code-previstos-🟦) |
| Badge com precedência "Excluído" (não conflar dimensões) | [docs/02 §1](../../docs/02-regras-de-negocio.md#1-as-duas-dimensões-status--exclusão-lógica) |
| Paginação server-side 10/pág + filtros; sem filtro por empresa | [docs/04 §Listagens](../../docs/04-requisitos.md#listagens-paginação-e-filtros) |
| Invalidação pós-mutação (sem reload) | [docs/10 §Estado](../../docs/10-arquitetura-frontend.md#gerenciamento-de-estado) |

**Validação de UX (front, controlada):** `empresa_id` obrigatório; `nome` 3–150; `descricao` ≤ 2000; `preco` > 0 com 2 casas; `codigo_interno` obrigatório; `status` ∈ {Ativo, Inativo}. Os `fieldErrors` do 422 (autoritativos) substituem/complementam. Sem biblioteca de formulário (consistente com a 04).

## 6. Estratégia de testes

Camada executável (Vitest + RTL + user-event + MSW):
- **`EmpresaAptaSelect`:** com MSW retornando empresas aptas, popula as opções; **>10 aptas em 2 páginas → todas as opções aparecem** (confirma a iteração de páginas, F1); estado "nenhuma empresa apta" orienta o usuário e impede o submit; na edição, `empresaVinculada` fora da lista **ainda aparece** selecionada (N2); loading tratado.
- **`AcoesProduto` (condicional):** dado `acoes_permitidas`, renderiza exatamente os botões permitidos nos estados — ativo/apta (editar/inativar/excluir), inativo/apta (editar/reativar/excluir — **cobre reativar=true**), inativo/empresa não apta (`editar=false`/`reativar=false` → sem esses botões), excluído (restaurar/excluir_definitivamente).
- **`ProdutoFormModal`:** MSW 422 em `codigo_interno` **e** em `preco` → erro no campo correspondente; validação de UX barra submit inválido sem chamar a API; submit válido cria e fecha; edição permite trocar empresa.
- **`ProdutosPage`:** loading→dados; vazio; erro; paginação `page=2`; filtros combinados; **empresa e preço formatado** por linha; **invalidação** após uma ação (lista reflete sem reload).
- **Fluxos destrutivos e regras de servidor:** excluir definitivamente pede confirmação/irreversível; restaurar com `empresa_excluida` (409) mostra a `message`; **reativar com empresa não apta → 422** (`empresa_inativa_ou_excluida`) mostra a `message` (N1, simetria com o 409).
- **Build/lint:** `npm run build` e `npm run lint` sem erros.

**Verificação manual** (via Docker, dados reais): navegação Empresas↔Produtos, seletor de empresa apta com dados reais, fluxo criar→editar→inativar→excluir→restaurar, foco de teclado.

## 7. Tickets

> Cada ticket é pequeno e verificável. Commit por ticket `[05-TX]`; ao concluir, atualizar `ESTADO.md` + checkbox + `validation.md` quando aplicável.

- [x] **05-T1** — Navegação: nav "Empresas/Produtos" no layout (NavLink com estado ativo) + rota `/produtos` (placeholder) — _nav funciona (verificado no navegador: "Produtos" ativo em amarelo); build/test/lint verdes (39)._
- [ ] **05-T2** — Base + `features/produtos` camada de dados: mover `AcoesPermitidas` para `shared/types.ts` e atualizar os imports que hoje o pegam de `features/empresas/types` (ao menos `features/empresas/types.ts`, `.../components/AcoesEmpresa.test.tsx`, `test/fixtures.ts`); `types.ts`, `api.ts` (inclui `listarEmpresasAptas()` iterando páginas), `hooks.ts` (`useProdutos`, `useProdutoMutations`, `useEmpresasAptas`) — _tsc compila; suíte da 04 (39) segue verde após o move; hooks montados._
- [ ] **05-T3** — Produtos listagem: `ProdutosPage`+`ProdutosFiltros`+`ProdutosTabela` (empresa, preço formatado, badge, código), paginação, filtros, estados — _testes de página (loading/vazio/erro/paginação/filtros/invalidação) verdes._
- [ ] **05-T4** — Produto formulário: `ProdutoFormModal` + `EmpresaAptaSelect` (todas as aptas via iteração de páginas; `empresaVinculada` na edição; vazio bloqueia submit), validação por campo + 422, trocar empresa na edição — _testes do seletor (>10 aptas, empresaVinculada, vazio) e do form (422→campo, sucesso) verdes._
- [ ] **05-T5** — Produto ações de ciclo de vida: `AcoesProduto` condicional + inativar/reativar/excluir/restaurar/forcar, confirmações/avisos, 409 (`empresa_excluida`) e **422 (`empresa_inativa_ou_excluida`) no reativar** — _testes de ações condicionais e fluxos destrutivos (incl. 409 e 422) verdes._
- [ ] **05-T6** — Validação executável final + verificação manual: `build`+`lint`+`test` verdes; checklist manual (navegação, seletor apto, fluxo E2E via Docker) registrado no `validation.md` — _DoD atendido._

## 8. Definition of Done

- [ ] Todos os tickets concluídos.
- [ ] Regras/validações de UX conforme a origem (seletor apto, ações condicionais, avisos, filtros, invalidação).
- [ ] Testes Vitest previstos passando; `npm run build` e `npm run lint` verdes.
- [ ] Sem segredos no bundle; sem `dangerouslySetInnerHTML`; erros sem detalhes internos.
- [ ] Critérios de aceite do PRD atendidos (manuais restantes no `validation.md`).

## 9. Decisões e riscos locais

- **Navegação (nova):** o layout da 04 só tinha a marca; a 05 introduz a nav Empresas/Produtos. Fica no layout compartilhado (`app/`), reutilizável.
- **Seletor de empresa apta via listagem existente (paginada):** sem endpoint novo — usa `GET /empresas?status=Ativo` ([docs/15](../../docs/15-contrato-api.md#seleção-de-empresa-apta-formulário-de-produto)). **Risco corrigido (F1):** como o endpoint é paginado (10/pág), buscar só a 1ª página deixaria empresas aptas de fora — inviabilizando vincular a 11ª+ ao **criar** um produto. Decisão: `listarEmpresasAptas()` **itera todas as páginas** e devolve a lista completa. Complementarmente, `EmpresaAptaSelect` recebe a `empresaVinculada?` (do produto em edição) e a **garante nas opções** mesmo que, por algum motivo, não venha na lista (defesa em profundidade; `EmpresaResumo` já traz `{id,nome,status}`). Teste cobre `>10 empresas aptas → todas selecionáveis`.
- **Nenhuma empresa apta:** se `listarEmpresasAptas()` volta vazio, o `EmpresaAptaSelect` exibe um aviso ("Nenhuma empresa apta — cadastre/ative uma empresa antes") e o submit de criação fica bloqueado (não há vínculo possível).
- **Reativar/restaurar dependem do servidor:** a UI usa `acoes_permitidas`, mas o servidor revalida; 409/422 são exibidos como feedback compreensível.
- **`codigo_interno` único por empresa:** a UX não checa unicidade (é do servidor); o 422 é mapeado ao campo.
- **Consistência com a 04:** mesmos componentes, mesmo padrão de badge (precedência "Excluído"), mesma ausência de lib de formulário — para um front coeso.
