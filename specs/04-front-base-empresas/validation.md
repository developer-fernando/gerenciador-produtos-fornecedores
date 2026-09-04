# Validação — Front: base + Empresas

| Campo | Valor |
|---|---|
| **Funcionalidade** | 04-front-base-empresas |
| **Artefatos avaliados** | [prd.md](./prd.md) · [spec.md](./spec.md) |
| **Veredito atual** | **Concluído** — validação estática aprovada (4 rodadas) + camada executável verde (39 testes); manuais restantes listados abaixo |
| **Rodadas** | 4 estáticas (3 + 1 confirmação) + camada executável |
| **Verificador** | subagente independente em contexto novo · modelo: Sonnet (diferente do autor) |

> A camada **executável** (Vitest/MSW + build/lint) e a **verificação manual** de UI são registradas na conclusão dos tickets.

## Rodada 1 — REPROVADO (3 bloqueantes)

Auditoria adversarial completa (rubrica de 10 itens). Contrato, escopo, versões e o risco do logo ausente confirmados corretos; os bloqueantes foram todos de **cobertura de teste/rastreabilidade**:

### Bloqueantes
- [x] **F1** — Nenhum teste da **invalidação de cache pós-mutação** ("listagem reflete sem reload"), apesar de ser objetivo/critério do PRD e regra central de [docs/10 §Estado](../../docs/10-arquitetura-frontend.md#gerenciamento-de-estado). → Adicionado cenário de teste (Spec §6) e amarrado ao ticket 04-T8 + DoD.
- [x] **F2** — `StatusBadge` sem teste, embora [docs/14](../../docs/14-estrategia-de-testes.md) exija testar o badge de status. → Teste do `StatusBadge` adicionado (Spec §6) e amarrado ao 04-T4.
- [x] **F3** — **Combinação de filtros** (nome+status+excluídos) sem verificação. → Teste de filtros combinados adicionado (Spec §6) e amarrado ao 04-T6.

### Não-bloqueantes (corrigidos)
- [x] **N1** — `Content-Type: application/json` também exigido por [docs/15](../../docs/15-contrato-api.md#convenções-gerais) → registrado no `lib/http.ts` (Spec §4).
- [x] **N2** — Links do PRD sem âncora de seção → âncoras adicionadas (docs/02 §4, docs/03 §Validações, docs/11 §Front-end).
- [x] **N3** — `formatarPreco` sem uso em Empresas → justificado como base reutilizável pela 05 (Spec §9).
- [x] **N4** — Aviso de impacto ao inativar deve usar `produtos_count` → explicitado na Spec §6 e no ticket 04-T8.

## Rodada 2 — REPROVADO (1 bloqueante novo)

F1 e F3 confirmados resolvidos com evidência; F2 resolvido, porém a correção expôs um bloqueante novo:

### Bloqueantes
- [x] **F4** (F-novo-1) — O `StatusBadge` e os critérios não definiam a **precedência visual quando `status='Inativo'` e `excluido=true` coexistem** ([docs/02 §1](../../docs/02-regras-de-negocio.md#1-as-duas-dimensões-status--exclusão-lógica)). Uma implementação ingênua exibiria "Inativo" para um registro excluído — **conflando as duas dimensões**, erro classificado como **eliminatório** ([docs/02 §7](../../docs/02-regras-de-negocio.md#7-mecânicas-obrigatórias)). → Definida a regra de **precedência "Excluído"** (Spec §4, §5, §9) e estendido o teste do `StatusBadge` para o caso combinado.

### Não-bloqueantes (corrigidos)
- [x] **N5** — `validation.md` não registrava a trilha das rodadas → este arquivo passou a registrar rodada a rodada.
- [x] **N6** — Teste de `AcoesEmpresa` não cobria `excluir_definitivamente=false` (empresa excluída **com** produtos) → caso adicionado (Spec §6).
- [x] **N7** — Mistura de `react-router`/`react-router-dom` → padronizado para `react-router-dom` (Spec §1).

## Rodada 3 — REPROVADO (1 bloqueante novo)

Re-auditoria em novo contexto: **F1–F4 confirmados resolvidos**. Surgiu 1 bloqueante marginal:

### Bloqueantes
- [x] **F5** — A ação **`reativar`** (só `true` no estado "Inativa, não excluída" — [docs/15 §Derivação](../../docs/15-contrato-api.md#derivação-de-acoes_permitidas)) não estava coberta por nenhum caso de teste do `AcoesEmpresa` (os casos cobriam ativa e as duas variações de excluída). → Adicionado o caso "inativa não excluída" (editar/reativar/excluir) e reforçada a invalidação para cobrir criar/inativar/reativar/excluir (Spec §6).

### Não-bloqueantes (corrigidos)
- [x] **N8/N10** — Invalidação nomeava só excluir/inativar → cenário agora cobre criar (nova linha) e reativar (Spec §6).
- [x] **N9** — `GET /empresas/{id}` sem consumidor → marcado **opcional** (edição reaproveita dados da linha; sem tela de detalhe) na Spec §3.
- [x] **N11** — `AGENTS.md` dizia "logo disponível" → corrigido para "pendente, com fallback textual".

### Bound de rodadas → escalonamento
A mecânica ([specs/README.md](../README.md#loop-limitado-com-escape)) fixa **máx. 3 rodadas**; ao não fechar em 3, o processo manda **parar e escalar ao humano** em vez de forçar aprovação. Os findings **convergiram** (bloqueantes 3 → 1 → 1, cada vez mais marginais — de segurança de contrato/erro para completude da lista de casos de teste). O autor humano foi consultado e **autorizou uma 4ª rodada de confirmação** (em vez de autoaprovação), registrada abaixo.

## Rodada 4 (confirmação) — APROVADO

Re-auditoria em novo contexto após correções de F5 e N8–N11: **F1–F5 confirmados resolvidos** com evidência `arquivo:linha`; rubrica completa em PASS; **zero findings bloqueantes**. Três não-bloqueantes cosméticos, corrigidos em seguida: redação "três estados → três estados/quatro casos" (`AcoesEmpresa`); nota de que o padrão de invalidação cobre as seis mutações; e `docs/05-ux-e-interface.md` alinhado ao estado real da logo (pendente/fallback).

| # | Critério | Veredito |
|---|---|---|
| 1 | Completude | PASS |
| 2 | Consistência com `docs/` | PASS |
| 3 | Consistência com a arquitetura | PASS |
| 4 | Consistência com contrato/modelagem | PASS |
| 5 | Rastreabilidade | PASS |
| 6 | Fundamentação | PASS |
| 7 | Escopo | PASS |
| 8 | Contradições internas | PASS |
| 9 | Verificabilidade | PASS |
| 10 | Riscos/lacunas | PASS |

## Camada executável (conclusão — 04-T9)

Implementação validada por **ground truth executável** (`frontend/`):
- **`npm run build`** (tsc + vite) — verde.
- **`npm run test`** (Vitest + RTL + user-event + MSW) — **39 passed / 7 arquivos**, cobrindo: normalização de erros (10), formatadores (8), `StatusBadge` incl. caso combinado F4 (4), shell (1), listagem via MSW — loading/vazio/erro, paginação `page=2`, filtros combinados, invalidação pós-ação F1 (7), formulário — 422→campo/validação de UX/sucesso (3), ações condicionais nos 3 estados + impacto + 409 irreversível (6).
- **`npm run lint`** (oxlint) — sem erros nem warnings.

Verificação visual no navegador (dev server, sem backend): identidade Horizon (header preto/amarelo, marca, botão de ação amarelo), estados de carregamento e erro, modal "Nova empresa" com marcadores de obrigatório, **validação de UX por campo** (erros em vermelho + borda), e **responsividade mobile** (375px, filtros empilhados). Evidência capturada nos screenshots do ticket.

## Verificação manual necessária

Comportamentos que dependem da API real (rodar via Docker: `docker compose up --build`) ou de uma pessoa:
- [x] **Identidade visual Horizon** — verificada no dev server (paleta, texto preto sobre amarelo).
- [x] **Responsividade** — verificada a 375px e desktop.
- [x] **Validação de formulário por campo** — verificada visualmente.
- [ ] **Logo no cabeçalho:** substituir o fallback textual pelo arquivo real (dependência: usuário fornece a logo) e conferir que não há distorção/recoloração.
- [ ] **Acessibilidade — foco de teclado visível:** navegar por Tab em filtros, tabela, formulário e diálogos (o CSS `:focus-visible` está aplicado; falta a conferência manual).
- [ ] **Fluxo ponta a ponta com dados reais (via Docker):** listar (paginação/filtros) → criar → editar → inativar (ver aviso de impacto) → excluir → restaurar → excluir definitivamente, observando que a lista atualiza **sem reload** e o feedback (toast) aparece a cada ação.

## Histórico de rodadas

| Rodada | Veredito | Bloqueantes | Observação |
|---|---|---|---|
| 1 | Reprovado | 3 (F1 invalidação, F2 StatusBadge, F3 filtros) | + 4 não-bloqueantes (N1–N4) |
| 2 | Reprovado | 1 (F4 precedência Status×Exclusão) | + 3 não-bloqueantes (N5–N7) |
| 3 | Reprovado | 1 (F5 `reativar` sem teste) | + N8–N11; **teto de 3 rodadas → escalado ao humano** |
| 4 (confirmação) | **Aprovado** | 0 | autorizada pelo autor; F1–F5 resolvidos; rubrica completa em PASS |
