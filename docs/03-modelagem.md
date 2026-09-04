# Modelagem e Validações

Entidades, campos, validações de campo, relacionamentos e índices. Comportamentos e regras de negócio em [02-regras-de-negocio.md](02-regras-de-negocio.md).

## Entidades

🟩 O desafio define **exatamente duas entidades**: `Empresa` e `Produto`. Nenhuma outra deve ser criada.

### Empresa (Fornecedor)

| Campo | Tipo | Validação / regra |
|---|---|---|
| ID | identificador | — |
| Nome | texto | 🟩 Obrigatório, 3 a 150 caracteres. |
| CNPJ | texto | 🟩 Obrigatório, **válido** (dígitos verificadores), **único incluindo excluídos**. 🟦 Armazenado normalizado (apenas dígitos). |
| Email | texto | 🟩 Obrigatório, formato válido. 🟦 Único **incluindo excluídos**. |
| Telefone | texto | 🟩 Obrigatório, com DDD. 🟦 Armazenado normalizado (apenas dígitos); aceita fixo e celular. |
| Status | string curta | 🟩 Restrito a `Ativo` / `Inativo` (validado na aplicação). 🟦 Default `Ativo` na criação. Ver [13](13-persistencia-e-banco.md#4-schema-definido). |
| Data de criação | timestamp | `created_at`. |
| Data de atualização | timestamp | `updated_at`. |
| Data de exclusão | timestamp (nullable) | `deleted_at` — exclusão lógica (soft delete). |

### Produto

| Campo | Tipo | Validação / regra |
|---|---|---|
| ID | identificador | — |
| Nome | texto | 🟩 Obrigatório, 3 a 150 caracteres. |
| Descrição | texto | 🟩 Opcional, até 2.000 caracteres. |
| Preço | decimal(…, 2) | 🟩 Obrigatório, **maior que zero**, duas casas decimais. 🟦 Moeda Real (R$). |
| Código interno | texto | 🟩 Obrigatório, **único dentro da empresa**. 🟦 Unicidade **incluindo produtos excluídos** da empresa. |
| Empresa vinculada | FK (`empresa_id`) | 🟩 **Relacionamento obrigatório** — produto nunca sem empresa; empresa deve estar **ativa e não excluída** ao criar/editar. |
| Status | string curta | 🟩 Restrito a `Ativo` / `Inativo` (validado na aplicação). 🟦 Default `Ativo` na criação. Ver [13](13-persistencia-e-banco.md#4-schema-definido). |
| Data de criação | timestamp | `created_at`. |
| Data de atualização | timestamp | `updated_at`. |
| Data de exclusão | timestamp (nullable) | `deleted_at` — exclusão lógica (soft delete). |
| Origem da exclusão | `excluido_em_cascata` (boolean) | 🟦 Rastreio para a regra 6 (restauração seletiva). |

## Rastreio da origem da exclusão (regra 6)

🟦 Para restaurar corretamente os produtos junto com a empresa (regra 6), o produto registra **se foi excluído individualmente ou pela cascata da empresa**. Ao restaurar a empresa, retornam apenas os produtos marcados como excluídos **pela cascata**; os excluídos individualmente permanecem excluídos.

**Mecanismo concreto (definido):** coluna `produtos.excluido_em_cascata` (boolean, default `false`) — marcada `true` quando o produto é excluído pela cascata da empresa e `false` quando excluído individualmente; ao restaurar a empresa, apenas os `true` (e com `deleted_at` preenchido) retornam. Detalhe em [13-persistencia-e-banco.md](13-persistencia-e-banco.md#rastreio-da-exclusão-em-cascata-regra-6--mecanismo-concreto).

## Relacionamentos

🟩
- Uma **Empresa** possui **vários Produtos**; um **Produto** pertence a **uma Empresa** (1—N).
- **Não é permitido produto sem empresa vinculada.**
- Inativar empresa → produtos inativos (cascata).
- Excluir logicamente a empresa → produtos excluídos logicamente (cascata).

## Índices e unicidade (nível de banco)

🟦 Além da validação na aplicação, reforçar no banco:

| Índice | Escopo |
|---|---|
| Único `cnpj` | Global, incluindo soft-deleted. |
| Único `email` | Global, incluindo soft-deleted. |
| Único composto `(empresa_id, codigo_interno)` | Por empresa, incluindo soft-deleted. |
| Índice em `empresa_id` | Suporte ao relacionamento e filtros. |
| Índice em `deleted_at` / `status` | Suporte às listagens e filtros. |

> A unicidade "incluindo excluídos" e as decisões de projeto correspondentes estão explicadas em [02-regras-de-negocio.md](02-regras-de-negocio.md#6-unicidade). No Laravel, `Rule::unique()` já considera soft-deleted por padrão (não usar `withoutTrashed`).

## Validações — princípios

🟩
- Validações **obrigatórias no servidor**; validação apenas na interface **não é considerada válida**.
- Mensagens de erro claras, **em português**, voltadas ao usuário final, **sem expor detalhes internos**.
- 🟦 Na edição, unicidade ignora o próprio registro.
