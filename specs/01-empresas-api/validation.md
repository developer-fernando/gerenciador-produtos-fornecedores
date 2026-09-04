# Validação — Empresas (API)

| Campo | Valor |
|---|---|
| **Funcionalidade** | 01-empresas-api |
| **Artefatos avaliados** | [prd.md](./prd.md) · [spec.md](./spec.md) |
| **Veredito atual** | **Aprovado** |
| **Rodadas** | 3 |
| **Verificador** | subagente independente em contexto novo · modelo: Sonnet (diferente do autor) |

## Rodada 1 — REPROVADO

### Bloqueantes
- [x] **F1** — Laravel 13 (bootstrap slim) não carrega `routes/api.php` automaticamente; a Spec não exigia registrar `api:` no `withRouting()` do `bootstrap/app.php`. → Corrigido (§4, §9, ticket 01-T9).

### Não-bloqueantes
- [x] **F3** — Faltava teste do estado combinado Inativa+Excluída (ações suprimidas). → Corrigido (§6, 01-T3/T10).
- [x] **F4** — Ambiguidade não sinalizada: resposta ao inativar/reativar/editar empresa já excluída. → Corrigido: Service rejeita com 409 (§9, §6, PRD §8).
- [x] **F5** — Índice `deleted_at` ausente nas migrations da 00 (defeito herdado da 00). → Registrado como gap fora de escopo (§9).

## Rodada 2 — REPROVADO

### Bloqueantes
- [x] **D1** — Precondição incompleta do `DELETE /forcar`: exigia apenas "sem produtos", mas a regra 8 exige também estar **já excluída logicamente** (dupla condição). Introduzido/omitido nas correções da rodada 1. → Corrigido: PRD §8 e Spec §5/§6/§7/§9 passam a exigir as duas condições (409 `registro_nao_excluido` / `empresa_com_produtos_vinculados`).

### Não-bloqueantes
- [x] **D2** — Âncora quebrada no rodapé do F5 (`docs/13#índices-e-unicidade-nível-de-banco` — anchor pertence ao docs/03). → Corrigido para `docs/13#índices-resumo`.
- [x] **D3** — `validation.md` referenciado antes de existir. → Este arquivo (produzido pela própria validação).

## Rodada 3 — APROVADO

Re-auditoria completa em novo contexto: **zero findings bloqueantes**; D1/D2 confirmados resolvidos; F1/F3/F4/F5 intactos; rubrica 100% PASS com evidência.

| # | Critério | Veredito |
|---|---|---|
| 1 | Completude | PASS |
| 2 | Consistência com `docs/` | PASS |
| 3 | Arquitetura (Service/Requests/Resources, sem Repository) | PASS |
| 4 | Modelagem/schema & contrato de API | PASS |
| 5 | Rastreabilidade | PASS |
| 6 | Fundamentação | PASS |
| 7 | Escopo | PASS |
| 8 | Contradições internas | PASS |
| 9 | Verificabilidade | PASS |
| 10 | Riscos/lacunas | PASS |

## Verificação manual necessária

Nenhuma nesta fase (pré-implementação) — tudo verificável por grep/leitura contra `docs/` e o backend real. A verificação executável ocorrerá na implementação (testes de feature).

## Observação (fora do escopo desta dupla)

O verificador notou que as tabelas-resumo do `docs/15` descrevem o `forçar` de forma enxuta (só "409 se houver produtos"), omitindo a precondição de já estar excluída — que consta na tabela de derivação de `acoes_permitidas` e no `docs/02 §2 (regra 8)`. É imprecisão de redação do `docs/15`, não da Spec; anotado para eventual ajuste do doc.

## Histórico de rodadas

| Rodada | Veredito | Bloqueantes | Observação |
|---|---|---|---|
| 1 | Reprovado | 1 (F1) | + F3/F4/F5 não-bloqueantes |
| 2 | Reprovado | 1 (D1) | + D2/D3 não-bloqueantes |
| 3 | **Aprovado** | 0 | rubrica integral PASS |
