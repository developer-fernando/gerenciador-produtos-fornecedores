# Critérios de Avaliação

Como o projeto será avaliado e onde concentrar esforço.

## Critérios e pesos

🟩 Quatro critérios, com peso explícito, somando **100 pontos**.

| # | Critério | Peso | O que será observado |
|---|---|:---:|---|
| 1 | **Regras de uso, status e exclusão lógica** | **30** | Cumprimento integral das regras obrigatórias e **consistência dos dados**. |
| 2 | **Validações e tratamento de erros** | **25** | Cobertura das validações exigidas e **clareza das respostas de erro**. |
| 3 | **Arquitetura e qualidade de código** | **25** | Organização, legibilidade e boas práticas. |
| 4 | **Fluxo de uso e UI/UX** | **20** | Clareza entre inativar e excluir, ações coerentes com as regras, estados tratados, responsividade e identidade visual. |

## Itens eliminatórios

🟩 Qualquer um destes reprova a solução:

- Criar **produto sem empresa vinculada**.
- Empresa com produtos vinculados **excluída fisicamente**.
- **Exclusão lógica ausente** ou usada como **substituto do campo status**.
- **Ausência de validação no servidor.**
- **Credenciais reais no repositório.**
- **Ausência de README.**

## Mapa de prioridades (🟦)

Derivado dos pesos e dos eliminatórios.

| Prioridade | Foco | Peso | Por quê |
|---|---|:---:|---|
| **1 — Máxima** | Regras/status/exclusão + eliminatórios (critério 1) | 30% | Maior peso e maioria dos eliminatórios. Ver [02-regras-de-negocio.md](02-regras-de-negocio.md). |
| **2 — Alta** | Validações server-side + erros claros (critério 2) | 25% | Cobertura das validações ([03-modelagem.md](03-modelagem.md)); eliminatório se ausente. |
| **3 — Alta** | Arquitetura e qualidade (critério 3) | 25% | Transversal; sustenta a percepção dos demais. Ver [06-requisitos-tecnicos.md](06-requisitos-tecnicos.md). |
| **4 — Relevante** | Fluxo e UI/UX (critério 4) | 20% | Coerência com as regras, estados e identidade visual. Ver [05-ux-e-interface.md](05-ux-e-interface.md). |
| **Transversal** | Segurança (sem credenciais, validação no servidor) + README | — | Eliminatórios; não deixar por último. |

**Leitura:** o bloco de lógica de negócio (critérios 1 + 2) representa **55%** da nota. É onde a solução se ganha ou se perde.

### Pontos de maior impacto na nota
1. Consistência de dados nas cascatas (critérios 1 e 4; eliminatório).
2. Validação server-side completa (critério 2; eliminatório se ausente).
3. Bloqueio da exclusão física de empresa com produtos (eliminatório).
4. Separação status × exclusão lógica (eliminatório; núcleo do critério 1).
5. README presente e detalhado (eliminatório se ausente).

## Relação critério ↔ implementação (🟦)

| Critério | Decisões de implementação relacionadas |
|---|---|
| 1 (30%) | Soft delete + status separados; cascatas transacionais; bloqueio de exclusão física de empresa com produtos; unicidade incluindo excluídos; regras em Services. |
| 2 (25%) | Form Requests cobrindo todas as validações; respostas de erro por campo em português; erros de regra de negócio ao usuário; sem vazar detalhes internos. |
| 3 (25%) | Controller → Service → Model; Migrations; estrutura de pastas clara no front; Clean Code; commits organizados; README detalhado. |
| 4 (20%) | Distinção visual Ativo/Inativo/Excluído; ações condicionais; confirmações e avisos; estados de loading/vazio/erro; responsividade; atualização sem reload; identidade Horizon. |

⚠️ Requisitos não funcionais **não exigidos** (não avaliados como obrigatórios): performance, escalabilidade e testes automatizados.
