# Validação — Correções de Back-end (hardening)

| Campo | Valor |
|---|---|
| **Funcionalidade** | 03-correcoes-backend |
| **Artefatos avaliados** | [prd.md](./prd.md) · [spec.md](./spec.md) |
| **Veredito atual** | **Aprovado** |
| **Rodadas** | 2 |
| **Verificador** | subagente independente em contexto novo · modelo: Sonnet (diferente do autor) |

## Origem: auditoria da implementação do back-end

Antes desta funcionalidade, uma **auditoria independente** do back-end (features 00/01/02) apontou o veredito **sólido com ressalvas** e os seguintes achados, que esta funcionalidade corrige:

- **#1 (crítico)** — Erros não tratados (404 e 500) **vazavam detalhes internos** (stack trace, caminhos, nome de classe/ID); só a `RegraDeNegocioException` tinha `render()`. Viola [docs/11](../../docs/11-seguranca.md) e [docs/15](../../docs/15-contrato-api.md#tratamento-de-erros--formatos-padronizados).
- **#2 (médio)** — **CORS aberto** (`*`): `config/cors.php` ausente; `FRONTEND_URL` não usado.
- **#3 (médio)** — `ProdutoService::excluir()`/`restaurar()` faziam duas escritas **sem `DB::transaction`** (o `EmpresaService` usa); contraria a própria Spec 02.
- **#4 (baixo)** — Índice `deleted_at` ausente nas migrations (gap "F5" herdado da 00).
- **#5 (obs)** — `docs/15` impreciso (derivação de `editar` do produto; `produtos_count` ausente do exemplo de Empresa).

## Rodada 1 — REPROVADO

### Bloqueantes
- [x] **#1** — O `render()` genérico para `Throwable` **interceptaria a `ValidationException` antes** do 422 nativo do Laravel, quebrando ~8 testes existentes. → Corrigido: o callback genérico **defere** (`return null`) para `ValidationException`/`HttpResponseException`/`AuthenticationException`, com **teste de regressão** garantindo 422 (Spec §3/§5/§8, ticket 03-T1).
- [x] **#2** — O critério de **500** não tinha caminho de teste. → Corrigido: teste dedicado com rota que lança exceção, assertando corpo limpo (Spec §5, ticket 03-T1).

### Não-bloqueantes
- [x] **#3-audit** — `ModelNotFoundException` é convertida em `NotFoundHttpException` antes dos callbacks → registrar só `NotFoundHttpException` (Spec §3).
- [x] **#4-audit** — CORS **é** testável no Pest (`assertHeader`) → teste automatizado adicionado (Spec §5).
- [x] **#5-audit** — Citação imprecisa de transações (docs/02 §7 é cascata de empresa) → corrigida para docs/11/AGENTS (Spec §4 e, na sequência, PRD §6).

## Rodada 2 — APROVADO

Re-auditoria completa em novo contexto, com verificação do **código-fonte do Laravel** (ordem de `render()` × callbacks × `ValidationException`): **zero findings bloqueantes**; #1 e #2 confirmados resolvidos; correção técnica dos handlers validada. Dois não-bloqueantes corrigidos após a aprovação: citação no PRD (§6) sincronizada com a Spec, e este `validation.md` criado.

| # | Critério | Veredito |
|---|---|---|
| 1 | Completude | PASS |
| 2 | Consistência com `docs/` | PASS |
| 3 | Arquitetura | PASS |
| 4 | Correção técnica das correções | PASS |
| 5 | Rastreabilidade | PASS |
| 6 | Fundamentação | PASS |
| 7 | Escopo (sem mudança de regra) | PASS |
| 8 | Contradições internas | PASS |
| 9 | Verificabilidade | PASS |
| 10 | Riscos/lacunas | PASS |

## Verificação manual necessária

- CORS por `curl` (complementar ao teste automatizado) e `SHOW INDEX` do `deleted_at` — ambos verificações executáveis simples nos tickets 03-T2/03-T4.

## Camada executável (conclusão)

Correções implementadas e validadas por **ground truth executável**:
- **#1** — Handler global: 404/500 padronizados sem `trace`/`exception`/`file`; 422/409 preservados. Testes: `TratamentoDeErrosTest` (4 casos) + 404 vivo confirmado limpo.
- **#2** — `config/cors.php` restrito ao `FRONTEND_URL`; `*` eliminado. Testes: `CorsTest` (2 casos) + header vivo = `http://localhost:5173`.
- **#3** — `ProdutoService::excluir()`/`restaurar()` agora em `DB::transaction` (2) + reset de `excluido_em_cascata`; suíte de produtos sem regressão.
- **#4** — Índice `deleted_at` criado em `empresas` e `produtos` (confirmado no `information_schema`).
- **#5** — `docs/15` alinhado (editar do produto exige empresa apta; `produtos_count` no exemplo).
- **Suíte completa:** `php artisan test` → **45 passed / 171 asserções** (antes 39), sem regressões.

Todos os tickets (03-T1…03-T6) concluídos e o DoD atendido. **Funcionalidade 03 concluída — back-end agora sólido, sem as ressalvas da auditoria.**

## Histórico de rodadas

| Rodada | Veredito | Bloqueantes | Observação |
|---|---|---|---|
| 1 | Reprovado | 2 (#1 Throwable/422, #2 teste do 500) | + 3 não-bloqueantes |
| 2 | **Aprovado** | 0 | citação do PRD e validation.md ajustados |
