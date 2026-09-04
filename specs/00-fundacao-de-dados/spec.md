# Spec — Fundação de dados

| Campo | Valor |
|---|---|
| **Status** | Aprovado (validação autônoma, rodada 2) |
| **Funcionalidade** | 00-fundacao-de-dados |
| **PRD relacionado** | [prd.md](./prd.md) · [validation.md](./validation.md) |

## 1. Abordagem técnica

Usar **migrations nativas** do Laravel para criar o schema versionado e **models Eloquent** com `SoftDeletes`, casts e `$fillable`, seguindo a arquitetura (Eloquent como camada de dados — [docs/09](../../docs/09-arquitetura-backend.md)). Sem regra de negócio nesta entrega: apenas o que o schema e o mapeamento garantem. Factories + seeders para dados válidos; e a **infraestrutura de testes** (Pest sobre o banco MySQL de testes) para viabilizar o teste de fundação e os testes das próximas funcionalidades.

## 2. Modelo de dados

Conforme [docs/13-persistencia-e-banco.md §4](../../docs/13-persistencia-e-banco.md#4-schema-definido).

**`empresas`**: `id`, `nome` (string 150), `cnpj` (string, único incl. excluídos), `email` (string, único incl. excluídos), `telefone` (string), `status` (string 10, default `Ativo`), `deleted_at`, timestamps.

**`produtos`**: `id`, `empresa_id` (FK → empresas, obrigatória), `nome` (string 150), `descricao` (text, nullable), `preco` (decimal 12,2), `codigo_interno` (string), `status` (string 10, default `Ativo`), `excluido_em_cascata` (boolean, default `false`), `deleted_at`, timestamps. Único composto `(empresa_id, codigo_interno)` incl. excluídos.

Índices: únicos `empresas.cnpj`, `empresas.email`, `produtos (empresa_id, codigo_interno)`; índice FK `produtos.empresa_id`; índices de apoio a filtros/soft delete (`status`, `deleted_at`, `nome`).

## 3. Contrato da API

Não se aplica nesta entrega (sem endpoints). Endpoints entram em 01/02 — [docs/15](../../docs/15-contrato-api.md).

## 4. Mudanças por camada

**Back-end (Laravel):**
- **Migrations:** `create_empresas_table`, `create_produtos_table`.
- **Models:** `app/Models/Empresa.php`, `app/Models/Produto.php` (SoftDeletes, `$fillable`, `$casts`, relacionamentos `hasMany`/`belongsTo`).
- **Factories:** `database/factories/EmpresaFactory.php`, `ProdutoFactory.php`.
- **Seeders:** `database/seeders/DatabaseSeeder.php` — popular empresas e produtos de exemplo via factories (`migrate:fresh --seed`).
- **Infra de testes:** instalar **Pest** (`pestphp/pest` + plugin Laravel) no `composer.json` (require-dev); apontar o ambiente de testes para o **MySQL de testes** ajustando `backend/phpunit.xml` (que hoje usa sqlite `:memory:`) para `DB_CONNECTION=mysql` / `DB_DATABASE=horizon_testing` com `force="true"`. Host/usuário/senha vêm do ambiente do container (não se commita segredo).

**Front-end:** nenhuma mudança.

## 5. Regras e validações a implementar (nível de schema/model)

| Item | Origem |
|---|---|
| FK `empresa_id` obrigatória (produto nunca sem empresa) | [docs/02 §2](../../docs/02-regras-de-negocio.md#2-regras-de-uso-obrigatórias) · [docs/03 §Relacionamentos](../../docs/03-modelagem.md#relacionamentos) |
| Índices únicos incl. excluídos (cnpj, email, código interno por empresa) | [docs/02 §6](../../docs/02-regras-de-negocio.md#6-unicidade) |
| Soft delete (`deleted_at`) nas duas tabelas | [docs/02 §1](../../docs/02-regras-de-negocio.md#1-as-duas-dimensões-status--exclusão-lógica) |
| `excluido_em_cascata` para restauração seletiva (regra 6) | [docs/03](../../docs/03-modelagem.md#rastreio-da-origem-da-exclusão-regra-6) |
| `status` como string (portabilidade), default `Ativo` | [docs/13 §4](../../docs/13-persistencia-e-banco.md#4-schema-definido) |
| `preco` decimal(12,2) | [docs/03](../../docs/03-modelagem.md) |

> Observação: as **validações de entrada** (formato de CNPJ, faixas de tamanho, preço > 0, etc.) e as **regras de aplicação** (cascatas, empresa apta) NÃO entram aqui — são das funcionalidades 01/02.

## 6. Estratégia de testes

Referência: [docs/14-estrategia-de-testes.md](../../docs/14-estrategia-de-testes.md).

- **Pré-requisito (nesta entrega):** o Pest e o banco de testes MySQL precisam ser configurados (ver ticket 00-T1) — o `phpunit.xml` do scaffold aponta hoje para sqlite `:memory:` e o Pest ainda não está instalado.
- **Teste de fundação** (Pest), rodando no banco de testes MySQL:
  - Cria empresa com produtos via factory e verifica o relacionamento (`empresa->produtos`, `produto->empresa`).
  - Verifica soft delete básico (registro sai das consultas padrão e continua com `withTrashed`).

## 7. Tickets

- [x] **00-T1** — Infra de testes (Pest + banco MySQL) — _Pest 4 instalado (require-dev) e inicializado (`tests/Pest.php`); `phpunit.xml` forçado para `DB_CONNECTION=mysql` / `DB_DATABASE=horizon_testing` (`force="true"`, para nunca usar o banco de desenvolvimento); `php artisan test` verde._
- [x] **00-T2** — Migration `empresas` — _tabela criada com campos, índices únicos (`cnpj`, `email`), `status`, `softDeletes` e timestamps; `migrate` roda (verificado via `SHOW COLUMNS`/`SHOW INDEX`)._
- [ ] **00-T3** — Migration `produtos` — _tabela criada com FK `empresa_id` (constrained), `preco` decimal(12,2), `codigo_interno`, `excluido_em_cascata`, único composto `(empresa_id, codigo_interno)`, `status`, `softDeletes`, índices; `migrate` roda._
- [ ] **00-T4** — Model `Empresa` — _`SoftDeletes`, `$fillable`, `$casts`, `hasMany(Produto)`._
- [ ] **00-T5** — Model `Produto` — _`SoftDeletes`, `$fillable`, `$casts` (`preco` decimal, `excluido_em_cascata` bool), `belongsTo(Empresa)`._
- [ ] **00-T6** — Factories `EmpresaFactory` e `ProdutoFactory` — _geram dados válidos; states: inativo, excluído, excluído-em-cascata._
- [ ] **00-T7** — Seeders — _`DatabaseSeeder` popula empresas e produtos de exemplo via factories; `migrate:fresh --seed` roda sem erro._
- [ ] **00-T8** — Teste de fundação (Pest) — _relacionamento 1—N e soft delete básicos passando no banco de testes MySQL._

## 8. Definition of Done

- [ ] Todos os tickets concluídos.
- [ ] `php artisan migrate:fresh --seed` roda no Docker sem erros e popula dados de exemplo.
- [ ] Índices/unicidades e FK criados conforme o schema.
- [ ] Models e factories funcionando.
- [ ] Pest configurado no banco de testes MySQL; `php artisan test` verde (teste de fundação passando).
- [ ] Critérios de aceite do PRD atendidos.

## 9. Decisões e riscos locais

- Unicidade "incluindo excluídos" usa **índice único simples** (não parcial), coerente com a regra do projeto. Risco: um registro soft-deleted mantém o valor "ocupado" até a exclusão física — comportamento **desejado** (ver [docs/02 §6](../../docs/02-regras-de-negocio.md#6-unicidade)).
- `status` como `string(10)` em vez de ENUM para portabilidade MySQL/SQLite; a restrição a `Ativo`/`Inativo` é garantida na camada de aplicação (01/02).
- `excluido_em_cascata` é preenchido pela lógica de cascata da funcionalidade 02; nesta entrega apenas a coluna e o default `false` são criados.
- **Infra de testes:** o scaffold do Laravel veio com **PHPUnit** e `phpunit.xml` apontando para **sqlite `:memory:`**. Como o projeto define testes em **Pest** sobre **MySQL** ([docs/14](../../docs/14-estrategia-de-testes.md), [docs/13](../../docs/13-persistencia-e-banco.md#banco-de-testes)), o ticket 00-T1 instala o Pest e reaponta o ambiente de testes para o banco `horizon_testing` (já provisionado pelo `docker/mysql/init.sql`). O reapontamento é feito no **`phpunit.xml` versionado** (com `force="true"`), e **não** em `.env.testing` — que é ignorado pelo Git e conteria credenciais; host/usuário/senha vêm do ambiente do container. Isso mantém a config de testes **reprodutível e sem segredos**. Sem esse ticket, 00-T8 não é executável.
- **Seeders** entram nesta entrega por fazerem parte da fundação de dados de desenvolvimento ([docs/13 §5](../../docs/13-persistencia-e-banco.md#5-dados-de-desenvolvimento-e-testes), [AGENTS §7.1](../../AGENTS.md)).
