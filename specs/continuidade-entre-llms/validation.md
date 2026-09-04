# Validação — Continuidade do projeto entre diferentes LLMs

| Campo | Valor |
|---|---|
| **Funcionalidade** | continuidade-entre-llms |
| **Artefatos avaliados** | [prd.md](./prd.md) · [spec.md](./spec.md) |
| **Veredito atual** | **Concluído** — validação estática aprovada (3 rodadas) + verificação de cold-start (C-T4) bem-sucedida |
| **Rodadas** | 3 estáticas + 1 verificação de cold-start |
| **Verificador** | passada de verificação independente em contexto novo · modelo: Sonnet (diferente do autor) |

> Camada de **processo** — verificação documental (não executável). Portão estático libera a implementação das 3 peças.

## Rodada 1 — REPROVADO (2 bloqueantes)

- [x] **F1** — A generalização tool-agnóstica do verificador cobria só `specs/README.md`; `AGENTS.md:162` também diz "subagente" e tem autoridade maior → contradição permaneceria. → Corrigido: §4/§1 e ticket C-T3 passam a incluir `AGENTS.md`.
- [x] **F2** — A tabela "Progresso" do `ESTADO.md` incluiria uma linha "processo" inexistente no recorte de `specs/README.md` (viola "aponta, não recopia"); faltava regra de autoridade autocontida. → Corrigido: C-T1 adiciona a linha ao recorte (fonte única) + o `ESTADO.md` espelha o recorte + linha de autoridade autocontida.

Não-bloqueantes N1 (nome da pasta sem `NN-`), N2 (ponto concreto de deriva), N3 (C-T4 misturava responsabilidades), N4 (dependência C-T3→C-T4), N5 (justificar escopo cold-start) — todos endereçados (§9 e tickets).

## Rodada 2 — REPROVADO (2 bloqueantes novos)

F1 e F2 confirmados resolvidos; surgiram dois na mesma classe (locais esquecidos / escopo):

- [x] **A** — `specs/_templates/validation.md:9` também diz "subagente" e é o template copiado por toda spec futura → reintroduziria a pressuposição. → Corrigido: incluído como terceiro arquivo em §1/§4 e no ticket C-T3.
- [x] **B** — Escopo do PRD (`prd.md:26`) e DoD (`spec.md`) citavam só `specs/README.md` para a mecânica tool-agnóstica → contradiziam §4/C-T3 e permitiriam "concluir" sem corrigir o `AGENTS.md`. → Corrigido: escopo do PRD e DoD reescritos para exigir os três arquivos (grep por "subagente" como critério).
- [x] **N6** — C-T1 não dizia se o Progresso espelhava a coluna "Abrange" → esclarecido: espelha só chave (Nº/nome) + status.
- [x] **N7** — Este `validation.md` não registrava a trilha das rodadas → passou a registrar (este arquivo).

## Rodada 3 — APROVADO (0 bloqueantes)

Reverificação em contexto novo com **grep** confirmando os **três** locais reais de "subagente" (`AGENTS.md:162`, `specs/README.md:56`, `specs/_templates/validation.md:9`) e nenhum quarto. F1/F2/A/B/N6 resolvidos com evidência `arquivo:linha`; rubrica completa em PASS. Cinco não-bloqueantes de clareza (N8 §Loop já tool-agnóstico; N9 valor da coluna Nº; N10 exceção de ID `C-Tx`; N11 dependência C-T1→C-T2; N12 disciplina sem enforcement) — todos incorporados à Spec após a aprovação.

| # | Critério | Veredito |
|---|---|---|
| 1 | Completude | PASS |
| 2 | Diagnóstico correto | PASS |
| 3 | Não-duplicação | PASS |
| 4 | Suficiência para cold-start | PASS |
| 5 | Independência de LLM/ferramenta | PASS |
| 6 | Rastreabilidade | PASS |
| 7 | Escopo | PASS |
| 8 | Contradições internas | PASS |
| 9 | Riscos/lacunas | PASS |
| 10 | Aderência a boas práticas de handoff | PASS |

## Verificação de cold-start (C-T4) — APROVADO

Após implementar C-T1..C-T3, uma **verificação em contexto novo** simulou uma LLM assumindo o projeto do zero, recebendo **apenas o repositório** e instruída a descobrir sozinha (seguindo o protocolo do próprio projeto) onde o desenvolvimento parou e o próximo passo. Resultado:

- **Ponto de entrada óbvio:** abriu `ESTADO.md` primeiro (auto-referência em `ESTADO.md:3` + ponteiro no `README.md`), sem adivinhar.
- **Ordem de leitura seguida:** `ESTADO.md` → `AGENTS.md §0` → `docs/README.md` → `specs/README.md` → spec da feature.
- **Estado identificado corretamente:** backend 00–03 e front 04 concluídos; continuidade em andamento com C-T1/C-T2/C-T3 feitos e **C-T4 pendente**; próxima feature de produto = 05.
- **Próximo passo concreto correto**, com fonte citada; fluxo, convenção de commit `[NN-TX]`, regra de atualização e hierarquia de autoridade todos localizados.
- **Sem trava:** concluiu que continuaria o desenvolvimento **sem precisar de ajuda humana**.

Fricções (não-bloqueantes, registradas): (a) o formato exato do registro de C-T4 no `validation.md` não estava pré-modelado — resolvido por analogia com as rodadas anteriores (e por esta própria seção); (b) a Feature 05 ainda não tem PRD/Spec (estado real esperado); (c) sem enforcement automático da regra de atualização (risco N12 já aceito). As `validation.md` históricas das features 00–04 ainda citam "subagente" — correto, são **atas** do que ocorreu, não regra vigente.

**Conclusão:** a camada de continuidade cumpre o objetivo — uma LLM diferente assume o projeto lendo só o repositório. Tickets C-T1..C-T4 concluídos.

## Histórico de rodadas

| Rodada | Veredito | Bloqueantes | Observação |
|---|---|---|---|
| 1 | Reprovado | 2 (F1 AGENTS.md, F2 ESTADO×recorte) | + N1–N5 |
| 2 | Reprovado | 2 (A template, B escopo/DoD) | + N6, N7 |
| 3 | **Aprovado** | 0 | + N8–N12 (clareza, incorporados) |
