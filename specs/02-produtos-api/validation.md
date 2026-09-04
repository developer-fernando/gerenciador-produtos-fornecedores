# Validação — Produtos (API)

| Campo | Valor |
|---|---|
| **Funcionalidade** | 02-produtos-api |
| **Artefatos avaliados** | [prd.md](./prd.md) · [spec.md](./spec.md) |
| **Veredito atual** | **Aprovado** |
| **Rodadas** | 2 |
| **Verificador** | subagente independente em contexto novo · modelo: Sonnet (diferente do autor) |

## Rodada 1 — REPROVADO

### Bloqueantes
- [x] **F1** — A decisão de "vínculo imutável" na edição **contradizia** o `docs/02 §5` (que permite alterar o vínculo para empresa apta, revalidando o código interno no destino), sobrescrevendo a fonte de verdade sem atualizá-la. → Corrigido: a Spec passou a **implementar** a troca de vínculo conforme o doc (unicidade escopada ao `empresa_id` enviado, revalidando no destino) em §4/§5/§6/§9, ticket 02-T2 e PRD §6/§8.

### Não-bloqueantes
- [x] **F2** — `registro_excluido` citado ao `docs/15` mas ausente da tabela de códigos. → Corrigido: código adicionado à tabela do `docs/15`.
- [x] **F3** — `acoes_permitidas.editar` deve ser false sempre que a empresa não estiver apta. → Explicitado no ticket do Resource (§4).
- [x] **F4** — Tratamento do `empresa_id` no update não especificado. → Resolvido pela decisão de troca de vínculo (empresa_id validado e usado como escopo da unicidade).
- [x] **F5** — Status 204 do `forcar` não explícito no PRD. → Adicionado.

## Rodada 2 — APROVADO

Re-auditoria completa em novo contexto: **zero findings bloqueantes**; F1–F5 confirmados resolvidos; rubrica PASS.

Dois achados **cosméticos/não-bloqueantes** corrigidos após a aprovação:
- **D1** — trecho `<empresa_id enviado>` (ilustrativo) disparava o grep de placeholder → reescrito como `$this->input('empresa_id')`.
- **D2** — simetria de ticket: 02-T5 passou a explicitar a revalidação 409 `registro_excluido` ao editar produto excluído.

| # | Critério | Veredito |
|---|---|---|
| 1 | Completude | PASS |
| 2 | Consistência com `docs/` | PASS |
| 3 | Arquitetura | PASS |
| 4 | Modelagem/schema & contrato de API | PASS |
| 5 | Rastreabilidade | PASS |
| 6 | Fundamentação | PASS |
| 7 | Escopo | PASS |
| 8 | Contradições internas | PASS |
| 9 | Verificabilidade | PASS |
| 10 | Riscos/lacunas | PASS |

## Verificação manual necessária

Nenhuma nesta fase (pré-implementação) — backend, tudo coberto por testes automatizados. A verificação executável ocorrerá na implementação.

## Histórico de rodadas

| Rodada | Veredito | Bloqueantes | Observação |
|---|---|---|---|
| 1 | Reprovado | 1 (F1) | + F2/F3/F4/F5 não-bloqueantes |
| 2 | **Aprovado** | 0 | + D1/D2 cosméticos corrigidos |
