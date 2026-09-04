# Validação — <Nome da funcionalidade>

| Campo | Valor |
|---|---|
| **Funcionalidade** | NN-nome |
| **Artefatos avaliados** | [prd.md](./prd.md) · [spec.md](./spec.md) |
| **Veredito atual** | Pendente · Reprovado (há bloqueantes) · **Aprovado** |
| **Rodadas** | <n> |
| **Verificador** | subagente em contexto novo · modelo: <modelo> |

## Rubrica (rodada <n>)

| # | Critério | Veredito | Evidência | Severidade |
|---|---|---|---|---|
| 1 | Completude (sem placeholders) | PASS/FAIL | <grep / referência> | — / bloqueante |
| 2 | Consistência com `docs/` | PASS/FAIL | <link docs#âncora> | — / bloqueante |
| 3 | Consistência com a arquitetura | PASS/FAIL | <ref> | — / bloqueante |
| 4 | Consistência com modelagem/schema | PASS/FAIL | <ref> | — / bloqueante |
| 5 | Rastreabilidade | PASS/FAIL | <ref> | — / bloqueante |
| 6 | Fundamentação (sem decisão inventada) | PASS/FAIL | <ref> | — / bloqueante |
| 7 | Escopo | PASS/FAIL | <ref> | — / bloqueante |
| 8 | Contradições internas | PASS/FAIL | <ref> | — / bloqueante |
| 9 | Verificabilidade | PASS/FAIL | <ref> | — / bloqueante |
| 10 | Riscos/lacunas | PASS/FAIL | <ref> | — / bloqueante |

## Findings (rodada <n>)

### Bloqueantes
- [ ] **F1** — <descrição do problema> — _evidência_ — _correção proposta_

### Não-bloqueantes
- [ ] **N1** — <observação> — _evidência_

## Correções aplicadas

<Resumo do que foi alterado no PRD/Spec entre as rodadas, com referência aos findings.>

## Verificação manual necessária

<Comportamentos que só podem ser confirmados por uma pessoa (ex.: UI/identidade visual, fluxo no navegador). Listar como passos objetivos.>
- [ ] <passo de teste manual>

## Histórico de rodadas

| Rodada | Veredito | Bloqueantes | Observação |
|---|---|---|---|
| 1 | <...> | <n> | <...> |
