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
docs/ + AGENTS.md  ──►  PRD (o quê/por quê)  ──►  Spec (o como + tickets)  ──►  Implementação  ──►  DoD ✔
                                     └──── rastreabilidade: PRD ↔ Spec ↔ tickets ↔ commits ────┘
```

1. **PRD** — define o problema, o escopo e os critérios de aceite da funcionalidade.
2. **Spec** — define a abordagem técnica, as mudanças por camada e a lista de **tickets**.
3. **Implementação** — cada ticket é feito e marcado como concluído; o commit referencia o ticket.
4. **DoD** — a funcionalidade é dada como concluída quando os critérios objetivos são atendidos.

> PRD pode ser enxuto em entregas puramente técnicas (ex.: fundação de dados). Specs são sempre necessárias, pois carregam os tickets.

## Convenções

- **Numeração da pasta:** `NN-nome-curto` (ex.: `01-empresas`), na ordem de execução.
- **Status** (no cabeçalho do PRD/Spec): `Rascunho` · `Aprovado` · `Em andamento` · `Concluído`.
- **Ticket:** identificado por `NN-Tk` (número da funcionalidade + `T` + sequência), ex.: `01-T3`. Cada ticket tem título, descrição curta e critério de conclusão.
- **Commits:** referenciam o ticket no final da mensagem, ex.: `feat(empresas): valida CNPJ único incluindo excluídos [01-T3]`.
- **Links:** sempre relativos, apontando para a seção específica de `docs/` que fundamenta a regra.

## Recorte das funcionalidades

| Nº | Funcionalidade | Abrange |
|---|---|---|
| 00 | **Fundação de dados** | Migrations + Models de `empresas` e `produtos` (schema, FK, índices, soft delete, `excluido_em_cascata`). |
| 01 | **Empresas (API)** | CRUD + status + exclusão lógica/restauração + exclusão física (bloqueio) + listagem/filtros. |
| 02 | **Produtos (API)** | CRUD + vínculo com empresa apta + status + exclusão lógica/restauração + exclusão física + **cascatas** Empresa→Produtos. |
| 03 | **Front — base + Empresas** | Shell da SPA (layout, cliente API, TanStack Query) + telas de Empresas. |
| 04 | **Front — Produtos** | Telas de Produtos + seletor de empresa apta + ações condicionais. |

> O recorte pode ser ajustado conforme avançamos; a tabela reflete o plano atual.
