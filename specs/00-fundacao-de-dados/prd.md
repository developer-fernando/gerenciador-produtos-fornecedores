# PRD — Fundação de dados

| Campo | Valor |
|---|---|
| **Status** | Aprovado (validação autônoma, rodada 2) |
| **Funcionalidade** | 00-fundacao-de-dados |
| **Spec relacionada** | [spec.md](./spec.md) · [validation.md](./validation.md) |

## 1. Contexto e problema

Nenhuma regra de negócio ou endpoint pode ser implementado antes de existir a estrutura de dados. Esta é uma entrega **técnica e habilitadora**: cria o schema versionado, os modelos Eloquent das duas entidades (`Empresa` e `Produto`), os dados de desenvolvimento/teste (factories + seeders) e a **infraestrutura de testes** (Pest sobre o banco de testes MySQL), servindo de base para as funcionalidades seguintes (01 Empresas, 02 Produtos).

## 2. Objetivo / resultado esperado

Ao final:
- O banco possui as tabelas `empresas` e `produtos` com os campos, relacionamentos, índices e soft delete definidos.
- Existem os modelos `Empresa` e `Produto` (relacionamento 1—N, `SoftDeletes`, casts, atributos atribuíveis).
- Existem **factories** (dados válidos + states) e **seeders** que populam o ambiente de desenvolvimento (`migrate:fresh --seed`).
- A **infraestrutura de testes** está funcional: Pest instalado e configurado para rodar no banco de testes **MySQL** (`horizon_testing`), com um teste de fundação passando.
- O schema é **reproduzível** (`migrate:fresh`) e roda no ambiente Docker.

## 3. Escopo

**Dentro do escopo:**
- Migrations de `empresas` e `produtos` (schema completo: campos, FK, índices, unicidades, soft delete, `excluido_em_cascata`).
- Models `Empresa` e `Produto` (relacionamento, `SoftDeletes`, casts, `$fillable`).
- Factories `EmpresaFactory` e `ProdutoFactory` (dados válidos + states relevantes).
- **Seeders** que populam o ambiente de desenvolvimento com empresas e produtos de exemplo.
- **Configuração da infraestrutura de testes**: instalar/configurar Pest e apontar o ambiente de testes para o banco MySQL de testes (`.env.testing` + `phpunit.xml`), conforme [docs/13 §Banco de testes](../../docs/13-persistencia-e-banco.md#banco-de-testes) e [docs/14](../../docs/14-estrategia-de-testes.md).

**Fora do escopo:**
- Regras de negócio de aplicação, cascatas e transações (funcionalidades 01/02).
- Validações de entrada (Form Requests), endpoints, controllers, resources (funcionalidades 01/02).
- Qualquer parte de front-end.
- Suíte de testes de regras/endpoints — aqui apenas o **teste de fundação** (schema/relacionamento/soft delete); os testes de regras vêm em 01/02.

## 4. Atores e fluxos de uso

Sem ator de usuário final — entrega técnica. Habilita os fluxos das funcionalidades 01 e 02 ([docs/05](../../docs/05-ux-e-interface.md)).

## 5. Requisitos funcionais

Não há requisito funcional de usuário. Requisitos técnicos verificáveis:
- Tabelas criadas conforme o schema de [docs/03-modelagem.md](../../docs/03-modelagem.md) e [docs/13-persistencia-e-banco.md](../../docs/13-persistencia-e-banco.md#4-schema-definido).
- Models mapeando corretamente as tabelas e o relacionamento 1—N.
- Ambiente de desenvolvimento populável via `migrate:fresh --seed`.
- Ambiente de testes executável via `php artisan test` (Pest) sobre o banco de testes MySQL.

## 6. Regras de negócio aplicáveis (nível de schema)

Somente as que o schema garante nesta entrega (as regras de aplicação vêm depois):
- **Produto nunca sem empresa** — FK `empresa_id` obrigatória (não-nula). [docs/02 §2](../../docs/02-regras-de-negocio.md#2-regras-de-uso-obrigatórias) · [docs/03 §Relacionamentos](../../docs/03-modelagem.md#relacionamentos)
- **Unicidade incluindo excluídos** — índices únicos de `cnpj`, `email` e `(empresa_id, codigo_interno)`. [docs/02 §6](../../docs/02-regras-de-negocio.md#6-unicidade)
- **Exclusão lógica** — coluna `deleted_at` (soft delete) em ambas. [docs/02 §1](../../docs/02-regras-de-negocio.md#1-as-duas-dimensões-status--exclusão-lógica)
- **Rastreio da cascata** — coluna `produtos.excluido_em_cascata`. [docs/03](../../docs/03-modelagem.md#rastreio-da-origem-da-exclusão-regra-6)

## 7. Requisitos não-funcionais relevantes

- **Integridade referencial** (FK) e **índices** de chave/unicidade/filtro. [docs/12](../../docs/12-performance.md)
- **Portabilidade** MySQL/SQLite (ex.: `status` como string, sem ENUM de banco). [docs/13](../../docs/13-persistencia-e-banco.md)
- **Reprodutibilidade** do schema via migrations versionadas.
- **Paridade de engine nos testes** — testes rodam em MySQL (não sqlite), conforme [docs/13 §Banco de testes](../../docs/13-persistencia-e-banco.md#banco-de-testes).

## 8. Critérios de aceite

- [ ] `php artisan migrate:fresh` executa sem erros no ambiente Docker.
- [ ] Tabela `empresas` possui todos os campos e os índices únicos de `cnpj` e `email`.
- [ ] Tabela `produtos` possui FK `empresa_id`, `preco` decimal(12,2), `excluido_em_cascata` e índice único composto `(empresa_id, codigo_interno)`.
- [ ] Ambas as tabelas possuem `deleted_at` (soft delete) e timestamps.
- [ ] `Empresa->produtos` e `Produto->empresa` retornam o relacionamento corretamente.
- [ ] As factories geram registros válidos e persistíveis.
- [ ] `php artisan migrate:fresh --seed` popula empresas e produtos de exemplo sem erro.
- [ ] `php artisan test` executa o teste de fundação (Pest) no banco de testes MySQL e passa.
