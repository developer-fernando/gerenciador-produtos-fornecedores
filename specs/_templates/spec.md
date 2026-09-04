# Spec — <Nome da funcionalidade>

| Campo | Valor |
|---|---|
| **Status** | Rascunho · Aprovado · Em andamento · Concluído |
| **Funcionalidade** | NN-nome |
| **PRD relacionado** | [prd.md](./prd.md) |

## 1. Abordagem técnica

<Visão geral da solução: como será implementada, seguindo a arquitetura definida.>

## 2. Modelo de dados

<Tabelas/campos/índices afetados. Referenciar [docs/03-modelagem.md](../../docs/03-modelagem.md) e [docs/13-persistencia-e-banco.md](../../docs/13-persistencia-e-banco.md).>

## 3. Contrato da API

<Endpoints/payloads/erros afetados. Referenciar [docs/15-contrato-api.md](../../docs/15-contrato-api.md).>

## 4. Mudanças por camada

**Back-end (Laravel):**
- Migration / Model / Service / Form Request / Resource / Controller / Rota — <o que muda>

**Front-end (React):**
- Feature / hooks / componentes / cliente API — <o que muda>

## 5. Regras e validações a implementar

<Mapear cada regra/validação para a sua origem em docs/.>

| Regra/validação | Origem |
|---|---|
| <ex.: CNPJ único incluindo excluídos> | [docs/02 §6](../../docs/02-regras-de-negocio.md#6-unicidade) |

## 6. Estratégia de testes

<O que será testado (back/front). Referenciar [docs/14-estrategia-de-testes.md](../../docs/14-estrategia-de-testes.md).>

## 7. Tickets

> Cada ticket é uma unidade pequena e verificável. Marcar ao concluir; o commit referencia o ID.

- [ ] **NN-T1** — <título> — _critério de conclusão_
- [ ] **NN-T2** — <título> — _critério de conclusão_
- [ ] **NN-T3** — <título> — _critério de conclusão_

## 8. Definition of Done

- [ ] Todos os tickets concluídos.
- [ ] Regras e validações implementadas conforme a origem.
- [ ] Testes previstos passando.
- [ ] Sem credenciais/segredos no código; erros sem detalhes internos.
- [ ] Critérios de aceite do PRD atendidos.

## 9. Decisões e riscos locais

<Decisões tomadas durante a entrega e riscos/observações. Se algo alterar uma regra, atualizar docs/ e referenciar aqui.>
