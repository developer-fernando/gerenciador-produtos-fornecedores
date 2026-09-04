# Persistência, Banco de Dados e Migrations

Decisões sobre ORM, banco, migrations e schema. Modelo de dados em [03-modelagem.md](03-modelagem.md). Legenda em [08-arquitetura-geral.md](08-arquitetura-geral.md#legenda-de-origem-das-decisões).

## 1. ORM — Eloquent (nativo do Laravel)

🟦🧭 **Decisão: usar o Eloquent**, o ORM nativo do Laravel, com **Query Builder** para consultas de leitura mais próximas do SQL quando trouxer benefício.

### Alternativas avaliadas
| Opção | Avaliação |
|---|---|
| **Eloquent** (Active Record) | Nativo, simples, rápido de desenvolver, integração total com migrations/factories/testes. **Escolhido.** |
| **Doctrine** (Data Mapper) | Mais robusto para domínios complexos, porém **adiciona complexidade** desnecessária para 2 entidades; fora do padrão Laravel. **Descartado.** |
| **Query Builder** (puro) | Mais próximo do SQL; será usado **pontualmente** dentro dos Services quando uma leitura exigir controle fino/performance. |
| ORMs do ecossistema JS (Prisma/Drizzle) | **Não se aplicam** — são para Node/TypeScript, não para PHP/Laravel. |

### Sobre os critérios do enunciado
- **Simples, leve, fácil de manter, com migrations e controle de schema:** ✔ atendidos por Eloquent + migrations nativas.
- **Próximo do SQL:** o Eloquent é fluente (não SQL puro); onde for necessário ficar próximo do SQL, usa-se o **Query Builder**.
- **Type safety:** o Eloquent é Active Record e o PHP tem tipagem limitada. Mitigações 🧭: **casts** de atributos, **propriedades tipadas**/PHPDoc nos Models e, opcionalmente, **PHPStan/Larastan** para análise estática (não obrigatório).
- **Sem complexidade desnecessária:** ✔ por isso não há Repository nem Doctrine (ver [09-arquitetura-backend.md](09-arquitetura-backend.md)).

## 2. Banco de dados — MySQL

🟦🧭 **Decisão: MySQL** para desenvolvimento e produção.

### Justificativa
- **Compatibilidade total** com Laravel e Eloquent; suporte nativo a migrations, FKs, índices e integridade referencial.
- Fácil de configurar; adequado ao tamanho do projeto.
- **SQLite** poderá ser usado para execução local rápida, pois o schema será mantido **portável** (ver §4).

### Banco de testes
🧭 A recomendação de mercado é **testar no mesmo engine da produção** para evitar falsos positivos (SQLite não suporta alguns recursos do MySQL como ENUM/UNSIGNED/JSON operators, podendo mascarar erros). Decisão:
- **Testes rodam em MySQL** (base de teste dedicada), com o trait `RefreshDatabase`.
- O schema é mantido **portável** (§4), de modo que **SQLite em memória** permaneça um fallback rápido válido para quem quiser — com a ressalva de que a fidelidade é maior no MySQL.

## 3. Migrations e versionamento do schema

🟦🧭 **Decisão: migrations nativas do Laravel** como única fonte de definição/versionamento do schema.

- Uma migration por tabela: `empresas` e `produtos`.
- O schema fica **versionado no Git** e **reproduzível** via:
  - `php artisan migrate` — aplica as migrations.
  - `php artisan migrate:fresh --seed` — recria do zero com dados de exemplo.
- **Relacionamentos:** FK `produtos.empresa_id` via `foreignId('empresa_id')->constrained()`; produto nunca sem empresa (coluna não-nula).
- **Chaves:** PK autoincremental (`id`) em ambas; FK em `produtos.empresa_id`.
- **Soft delete:** `softDeletes()` (`deleted_at`) em ambas as tabelas.
- **Timestamps:** `timestamps()` (`created_at`, `updated_at`).

## 4. Schema definido

> Portável entre MySQL e SQLite (evita ENUM/tipos específicos): **status** como `string` curta validada na aplicação (Ativo/Inativo), em vez de ENUM de banco.

### `empresas`
| Coluna | Tipo | Notas |
|---|---|---|
| id | bigint PK | auto-increment |
| nome | string(150) | |
| cnpj | string | **único** (incl. soft-deleted) — índice único |
| email | string | **único** (incl. soft-deleted) — índice único |
| telefone | string | normalizado (dígitos) |
| status | string(10) | `Ativo`/`Inativo`, validado na app; default `Ativo` |
| created_at / updated_at | timestamp | |
| deleted_at | timestamp null | soft delete; indexado |

### `produtos`
| Coluna | Tipo | Notas |
|---|---|---|
| id | bigint PK | auto-increment |
| empresa_id | bigint FK | `constrained()`, indexado, **obrigatório** |
| nome | string(150) | |
| descricao | text null | até 2.000 chars (validação na app) |
| preco | decimal(12,2) | > 0 |
| codigo_interno | string | **único por empresa** (incl. soft-deleted) — índice único composto `(empresa_id, codigo_interno)` |
| status | string(10) | `Ativo`/`Inativo`; default `Ativo` |
| excluido_em_cascata | boolean | 🟦 default `false`; marca produto excluído **pela cascata da empresa** (regra 6) |
| created_at / updated_at | timestamp | |
| deleted_at | timestamp null | soft delete; indexado |

### Rastreio da exclusão em cascata (regra 6) — mecanismo concreto
🟦 Coluna `produtos.excluido_em_cascata`:
- Ao **excluir logicamente a empresa**: marca `excluido_em_cascata = true` nos produtos que forem excluídos pela cascata.
- Ao **excluir um produto individualmente**: `excluido_em_cascata = false`.
- Ao **restaurar a empresa**: restaura **apenas** os produtos com `deleted_at` preenchido **e** `excluido_em_cascata = true`, limpando a marca. Os excluídos individualmente (`false`) permanecem excluídos.

Isso substitui a "lacuna" que estava registrada em [03-modelagem.md](03-modelagem.md#rastreio-da-origem-da-exclusão-regra-6).

### Índices (resumo)
`empresas`: único `cnpj`, único `email`, índice `deleted_at`, índice `status`, índice `nome` (filtro).
`produtos`: FK/índice `empresa_id`, único composto `(empresa_id, codigo_interno)`, índice `deleted_at`, `status`, `nome`.

> As unicidades usam índice **simples** (não parcial), pois a regra é "único incluindo excluídos" — funciona igual em MySQL e SQLite. Ver [02-regras-de-negocio.md](02-regras-de-negocio.md#6-unicidade).

## 5. Dados de desenvolvimento e testes

🧭 **Factories** (`EmpresaFactory`, `ProdutoFactory`) e **Seeders**:
- Factories geram dados válidos (CNPJ válido, etc.) e **states** para variações (inativo, excluído, excluído-em-cascata).
- Seeders populam o banco de desenvolvimento (`migrate:fresh --seed`).
- Nos testes, as factories criam registros de forma isolada e reproduzível (com `RefreshDatabase`).
