# Specs — PRD + Spec por funcionalidade

Esta pasta organiza a **execução da implementação** em funcionalidades pequenas e rastreáveis (tickets), seguindo a abordagem **Spec-Driven Development**.

## Papéis (quem é fonte de quê)

| Camada | Papel | Estabilidade |
|---|---|---|
| [`AGENTS.md`](../AGENTS.md) | **Constitution** — princípios e convenções que guiam o desenvolvimento. | Estável |
| [`docs/`](../docs/README.md) | **Fonte de verdade** — regras de negócio, arquitetura, modelagem, contrato de API. | Estável |
| `specs/` | **Execução por funcionalidade** — PRD (o quê/por quê) + Spec (o como + tickets). | Evolui na implementação |

> As specs **referenciam** `docs/` e `AGENTS.md` — não recopiam conteúdo. Se uma regra mudar, muda em `docs/`; a spec apenas aponta.

## Estrutura

```
specs/
├── README.md            # este guia
├── _templates/
│   ├── prd.md           # template de PRD
│   └── spec.md          # template de Spec (com tickets + DoD)
└── NN-nome/             # uma pasta por funcionalidade
    ├── prd.md
    └── spec.md
```

## Fluxo de trabalho

```
docs/ + AGENTS.md ─► PRD + Spec ─► Validação autônoma ⟳ ─► Implementação ─► Verificação executável ─► DoD ✔
                              └──── rastreabilidade: PRD ↔ Spec ↔ tickets ↔ commits ────┘
```

1. **PRD** — define o problema, o escopo e os critérios de aceite da funcionalidade.
2. **Spec** — define a abordagem técnica, as mudanças por camada e a lista de **tickets**.
3. **Validação autônoma** — um verificador independente audita o PRD/Spec por rubrica e evidência; corrige-se e re-valida até **zero findings bloqueantes**. Só então libera a implementação. Ver [Validação autônoma](#validação-autônoma-de-prdspec).
4. **Implementação** — cada ticket é feito e marcado como concluído; o commit referencia o ticket.
5. **DoD** — a funcionalidade é concluída quando os critérios objetivos são atendidos e a **verificação executável** (testes/migrations) passa.

> PRD pode ser enxuto em entregas puramente técnicas (ex.: fundação de dados). Specs são sempre necessárias, pois carregam os tickets.

## Validação autônoma de PRD/Spec

A validação de cada PRD/Spec é **autônoma** (sem depender de aprovação humana), porém **ancorada em evidência** — nunca em autoafirmação. A participação humana fica restrita a **testes manuais específicos**, apenas para comportamentos que não podem ser verificados automaticamente.

### Princípio

Uma Spec **não** é válida porque a IA afirmou que está. Ela só é válida quando **passa em uma rubrica objetiva, com evidência anexada a cada item**, auditada por um **verificador independente**, e (na implementação) confirmada por **testes executáveis**. O portão é **rubrica + evidência + execução**, não opinião.

### Papéis (produtor × verificador)

| Papel | Quem | Contexto |
|---|---|---|
| **Autor** | sessão principal | escreve/corrige o PRD + Spec |
| **Verificador** | uma **verificação independente em contexto novo** — uma sessão/chat separada, preferencialmente em **modelo diferente** (um **subagente** é *uma* implementação possível; onde não houver subagentes, abrir outra sessão/chat e colar Spec + rubrica cumpre o mesmo papel) | audita sem herdar o raciocínio do autor |

O **contexto novo** (independentemente da ferramenta) evita "pontos cegos compartilhados" entre autor e verificador.

### Fontes de evidência

`docs/`, `AGENTS.md`, os **arquivos reais do repositório** (migrations, models, `composer.json`/`package.json`, versões) e **saída de comandos** (grep, `artisan`, testes) quando aplicável.

### Rubrica (cada item: PASS/FAIL + evidência obrigatória + severidade)

1. **Completude** — todas as seções preenchidas; sem placeholders `<...>` (checagem por grep).
2. **Consistência com `docs/`** — cada regra/decisão citada bate com a fonte.
3. **Consistência com a arquitetura** — respeita as decisões (Service+Eloquent, sem Repository, Form Requests, Resources).
4. **Consistência com modelagem/schema** — campos/tipos/índices batem com `docs/03`, `docs/13` e as migrations reais.
5. **Rastreabilidade** — regra→origem; ticket→requisito; critério de aceite→verificável.
6. **Fundamentação** — nenhuma decisão inventada; toda decisão local justificada e sem contradizer `docs/`.
7. **Escopo** — nada fora de escopo; nada essencial faltando.
8. **Contradições internas** — PRD × Spec × tickets coerentes.
9. **Verificabilidade** — critérios de aceite e DoD objetivos e, de preferência, expressos como teste.
10. **Riscos/lacunas** — dependências e ambiguidades sinalizadas.

Um PASS **sem evidência** vira FAIL. Findings são classificados em **bloqueante** / **não-bloqueante**.

### Guardrails anti-autocomplacência

- Verificador em **contexto novo** e **modelo diferente**.
- **Evidência obrigatória** por item (link `docs/…#âncora` ou `arquivo:linha`).
- **Postura adversarial** (assumir que há problema e tentar quebrar a Spec).
- **Checagens determinísticas**: grep de placeholders, existência das âncoras citadas, existência de arquivos/versões referenciados.
- Aprovação exige **zero findings bloqueantes com evidência** — não uma opinião favorável.

### Duas camadas

| Camada | Quando | Ground truth | Libera |
|---|---|---|---|
| **Estática** | ao fim do PRD/Spec | docs + arquivos + rubrica | iniciar a implementação |
| **Executável** | na implementação | **testes + migrations rodando** | marcar ticket/DoD como concluído |

### Loop (limitado, com escape)

```
Autor escreve → Verificador (contexto novo, adversarial, por evidência) → findings
   há bloqueante? sim → corrige → re-valida (novo contexto)   [máx. 3 rodadas]
                  não → APROVADO → implementação
   não convergiu em 3 rodadas → PARA e escala para o humano (não força aprovação)
```

### Participação humana

Restrita a **testes manuais específicos** de comportamentos não verificáveis automaticamente (ex.: conferência visual de UI/identidade, um fluxo de ponta a ponta no navegador). Esses casos são listados explicitamente no `validation.md` como **"verificação manual necessária"**.

### Artefato

Cada funcionalidade registra o resultado em `specs/NN-.../validation.md` (rubrica preenchida, evidências, findings, correções e veredito por rodada) — a trilha de auditoria da validação. Template em [`_templates/validation.md`](_templates/validation.md).

## Convenções

- **Numeração da pasta:** `NN-nome-curto` (ex.: `01-empresas`), na ordem de execução.
- **Status** (no cabeçalho do PRD/Spec): `Rascunho` · `Aprovado` · `Em andamento` · `Concluído`.
- **Ticket:** identificado por `NN-Tk` (número da funcionalidade + `T` + sequência), ex.: `01-T3`. Cada ticket tem título, descrição curta e critério de conclusão.
- **Commits:** referenciam o ticket no final da mensagem, ex.: `feat(empresas): valida CNPJ único incluindo excluídos [01-T3]`.
- **Links:** sempre relativos, apontando para a seção específica de `docs/` que fundamenta a regra.

## Recorte das funcionalidades

| Nº | Funcionalidade | Status | Abrange |
|---|---|---|---|
| 00 | **Fundação de dados** | ✅ Concluído | Migrations + Models de `empresas` e `produtos` (schema, FK, índices, soft delete, `excluido_em_cascata`). |
| 01 | **Empresas (API)** | ✅ Concluído | CRUD + status + exclusão lógica/restauração + exclusão física (bloqueio) + listagem/filtros + **cascatas disparadas pela empresa** (inativar/excluir/restaurar → produtos). |
| 02 | **Produtos (API)** | ✅ Concluído | CRUD + vínculo com empresa apta + status + exclusão lógica/restauração + exclusão física + regras do lado do produto (reativação/restauração exigem empresa apta). |
| 03 | **Correções de back-end (hardening)** | ✅ Concluído | Achados da validação da implementação: handler de erros padronizado (404/500 sem vazar detalhes), CORS restrito, transações no `ProdutoService`, índice `deleted_at`, ajustes de documentação. |
| 04 | **Front — base + Empresas** | ✅ Concluído | Shell da SPA (layout, cliente API, TanStack Query) + telas de Empresas. |
| 05 | **Front — Produtos** | ✅ Concluído | Telas de Produtos + seletor de empresa apta + ações condicionais. |
| — | **Processo — Continuidade entre LLMs** | ✅ Concluído | Camada de continuidade (não é feature de produto): `ESTADO.md` vivo, protocolo de cold-start no `AGENTS.md`, mecânica tool-agnóstica. Ver [`continuidade-entre-llms/`](continuidade-entre-llms/spec.md). |

> Recorte **encerrado**: 00–05 e a camada de continuidade estão concluídos. A coluna **Status** é a fonte que o [`ESTADO.md`](../ESTADO.md) espelha.
