# Spec — Empresas (API)

| Campo | Valor |
|---|---|
| **Status** | Aprovado (validação autônoma, rodada 3) |
| **Funcionalidade** | 01-empresas-api |
| **PRD relacionado** | [prd.md](./prd.md) · [validation.md](./validation.md) |

## 1. Abordagem técnica

Implementar o domínio Empresa seguindo a arquitetura em camadas ([docs/09](../../docs/09-arquitetura-backend.md)): **Controller fino** → **Form Request** (validação) → **EmpresaService** (regras + cascatas + transações) → **Eloquent** → **EmpresaResource** (saída). Erros de regra de negócio via **exceção dedicada** convertida em resposta padronizada. Sem alterações de schema (usa a fundação da 00).

## 2. Modelo de dados

Sem novas migrations. Usa `empresas` e `produtos` da 00 ([docs/13 §4](../../docs/13-persistencia-e-banco.md#4-schema-definido)). As cascatas manipulam `produtos.status`, `produtos.deleted_at` e `produtos.excluido_em_cascata`.

## 3. Contrato da API

Conforme [docs/15 §Endpoints — Empresas](../../docs/15-contrato-api.md#endpoints--empresas), [§Derivação de `acoes_permitidas`](../../docs/15-contrato-api.md#derivação-de-acoes_permitidas), [§Padrão de listagem](../../docs/15-contrato-api.md#padrão-de-listagem-paginação--filtros) e [§Tratamento de erros](../../docs/15-contrato-api.md#tratamento-de-erros--formatos-padronizados).

Endpoints: `GET /api/empresas`, `POST /api/empresas`, `GET /api/empresas/{id}`, `PUT|PATCH /api/empresas/{id}`, `PATCH /api/empresas/{id}/inativar`, `PATCH /api/empresas/{id}/reativar`, `DELETE /api/empresas/{id}`, `POST /api/empresas/{id}/restaurar`, `DELETE /api/empresas/{id}/forcar`.

## 4. Mudanças por camada

**Back-end (Laravel):**
- **Regra de validação:** `app/Rules/CnpjValido.php` — valida os dígitos verificadores do CNPJ.
- **Form Requests:** `app/Http/Requests/StoreEmpresaRequest.php`, `UpdateEmpresaRequest.php` — normalizam `cnpj`/`telefone` (apenas dígitos) em `prepareForValidation()`; validam campos; unicidade de `cnpj`/`email` **incluindo excluídos** (`Rule::unique` sem `withoutTrashed`), com `ignore($id)` no update; mensagens em português.
- **Resource:** `app/Http/Resources/EmpresaResource.php` — payload de [docs/15 §Empresa](../../docs/15-contrato-api.md#representação-dos-recursos), com `excluido`, `produtos_count` e `acoes_permitidas` (derivadas do estado + contagem de produtos).
- **Service:** `app/Services/EmpresaService.php` — CRUD, listagem com filtros, status, exclusão lógica/restauração e exclusão física; cascatas em `DB::transaction()`.
- **Exceção + render:** `app/Exceptions/RegraDeNegocioException.php` (mensagem + `code` + status HTTP) convertida em JSON padronizado no `bootstrap/app.php` (`->withExceptions`).
- **Controller:** `app/Http/Controllers/Api/EmpresaController.php` — fino, orquestra Service e retorna Resource.
- **Rotas:** criar `routes/api.php` **e** registrar o grupo de API no `bootstrap/app.php` — no Laravel 11+/13 (bootstrap slim) o `routes/api.php` **não é carregado automaticamente**; é preciso adicionar `api: __DIR__.'/../routes/api.php'` (prefixo padrão `api`) ao `withRouting()`.
- **Mensagens:** validação em português (via `messages()`/`attributes()` nos Form Requests).

**Front-end:** nenhuma mudança.

## 5. Regras e validações a implementar

| Regra/validação | Origem |
|---|---|
| Nome 3–150; telefone com DDD; status ∈ {Ativo, Inativo} | [docs/03 §Empresa](../../docs/03-modelagem.md#empresa-fornecedor) |
| CNPJ válido (dígitos verificadores) | [docs/03 §Empresa](../../docs/03-modelagem.md#empresa-fornecedor) |
| CNPJ e e-mail únicos **incluindo excluídos**; ignora o próprio no update | [docs/02 §6](../../docs/02-regras-de-negocio.md#6-unicidade) |
| Inativar empresa → produtos inativos (cascata) | [docs/02 §4](../../docs/02-regras-de-negocio.md#4-cascatas-e-consistência) |
| Reativar empresa → produtos não reativados | [docs/02 §4](../../docs/02-regras-de-negocio.md#4-cascatas-e-consistência) |
| Excluir empresa (lógico) → produtos excluídos, `excluido_em_cascata = true` | [docs/02 §3.2](../../docs/02-regras-de-negocio.md#32-exclusão-lógica-soft-delete) |
| Restaurar empresa → restaura só os `excluido_em_cascata = true` (limpando a marca) | [docs/02 §4](../../docs/02-regras-de-negocio.md#4-cascatas-e-consistência) |
| Exclusão física bloqueada havendo produto vinculado (incl. excluído) | [docs/02 §3.3](../../docs/02-regras-de-negocio.md#33-exclusão-física-hard-delete) |
| Exclusão definitiva só de registro já excluído logicamente | [docs/02 §2](../../docs/02-regras-de-negocio.md#2-regras-de-uso-obrigatórias) |
| Listagem sem excluídos por padrão; filtro de excluídos = somente excluídos | [docs/04 §Listagens](../../docs/04-requisitos.md#listagens-paginação-e-filtros) |
| Cascatas transacionais (sem estado inconsistente) | [docs/02 §7](../../docs/02-regras-de-negocio.md#7-mecânicas-obrigatórias) |

**Padronização de erros:** 422 (validação, padrão Laravel) e 409 (regra de negócio, ex.: `code = empresa_com_produtos_vinculados`, `registro_nao_excluido`) — [docs/15 §Tratamento de erros](../../docs/15-contrato-api.md#tratamento-de-erros--formatos-padronizados).

## 6. Estratégia de testes

Feature tests (Pest + `RefreshDatabase`, MySQL de testes) — [docs/14](../../docs/14-estrategia-de-testes.md):
- Criação válida (201) e inválida (422 por campo); CNPJ inválido rejeitado.
- Unicidade de CNPJ/e-mail **incluindo** registros excluídos; update ignora o próprio.
- Inativar empresa → produtos inativos; reativar → produtos permanecem inativos.
- Excluir lógico → empresa e produtos excluídos (`excluido_em_cascata` = true); restaurar → volta só os da cascata, mantém excluídos os individuais.
- Exclusão física: **409** (`registro_nao_excluido`) se a empresa não estiver excluída logicamente; **409** (`empresa_com_produtos_vinculados`) se houver produto vinculado (mesmo excluído); sucesso **apenas** quando excluída logicamente **e** sem produtos.
- Listagem: paginação 10/página; filtro por nome (parcial), status e excluídos (somente excluídos); padrão sem excluídos.
- Estado combinado **Inativa + Excluída**: uma empresa excluída logicamente retorna `acoes_permitidas` com `inativar`/`reativar` = false (independe do `status`), coerente com [docs/15 §Derivação](../../docs/15-contrato-api.md#derivação-de-acoes_permitidas).
- **Servidor revalida**: tentar `inativar`/`reativar`/editar uma empresa já excluída retorna **409** (não apenas escondido na UI).
- Unit test do `CnpjValido` (aceita válidos, rejeita inválidos).

## 7. Tickets

- [x] **01-T1** — Regra `CnpjValido` (dígitos verificadores) + teste unitário (3 passed).
- [x] **01-T2** — Form Requests `StoreEmpresaRequest`/`UpdateEmpresaRequest` (normalização cnpj/telefone, validações, unicidade incl. excluídos com `ignore` no update, mensagens em pt) — verificado via tinker (inválido falha nos 5 campos; válido passa).
- [x] **01-T3** — `EmpresaResource` (payload padronizado + `excluido` + `produtos_count` + `acoes_permitidas` derivadas do estado) — verificado nos 4 estados via tinker, incluindo excluída com/sem produtos.
- [x] **01-T4** — `EmpresaService`: create/update/show/list (paginação 10 + filtros nome/status/excluídos; `produtos_count`/`produtos_total`; editar empresa excluída → 409) — verificado via tinker.
- [ ] **01-T5** — `EmpresaService`: inativar (cascata nos produtos) / reativar (sem cascata) — transacional.
- [ ] **01-T6** — `EmpresaService`: exclusão lógica (cascata + `excluido_em_cascata`) / restauração (seletiva) — transacional.
- [ ] **01-T7** — `EmpresaService`: exclusão física — permitida **apenas** quando a empresa está **excluída logicamente** (senão 409 `registro_nao_excluido`) **e** sem produto vinculado, incl. excluído (senão 409 `empresa_com_produtos_vinculados`).
- [x] **01-T8** — Padronização de erros de regra de negócio: `RegraDeNegocioException` com método `render()` retornando `{message, code}` + status (aproveita o `shouldRenderJsonWhen` já existente no `bootstrap/app.php`); factories `registroNaoExcluido`/`empresaComProdutosVinculados`/`registroExcluido` (verificado via tinker: 409 + JSON).
- [ ] **01-T9** — `EmpresaController` (fino) + `routes/api.php` + **registro do grupo `api` no `bootstrap/app.php`** (`withRouting(api: ...)`); smoke test de que os endpoints respondem (não 404).
- [ ] **01-T10** — Testes de feature cobrindo todas as regras acima (inclui estado Inativa+Excluída e revalidação 409 em empresa já excluída).

## 8. Definition of Done

- [ ] Todos os tickets concluídos.
- [ ] Endpoints respondem conforme o contrato ([docs/15](../../docs/15-contrato-api.md)); respostas padronizadas (Resource + `acoes_permitidas`; erros 422/409).
- [ ] Validação server-side completa; mensagens em português, sem detalhes internos.
- [ ] Cascatas transacionais corretas (inativar/excluir/restaurar) e bloqueio de exclusão física.
- [ ] `php artisan test` verde (incluindo os testes da 01 e os da 00).
- [ ] Sem credenciais/segredos no código.
- [ ] Critérios de aceite do PRD atendidos.

## 9. Decisões e riscos locais

- **Cascatas na 01:** as cascatas disparadas pela empresa (inativar/excluir/restaurar) são implementadas aqui (não na 02), pois são comportamento inseparável dos endpoints de empresa e a tabela `produtos` já existe (00). A 02 fará os endpoints e regras do lado do produto. (Recorte atualizado em [specs/README.md](../README.md#recorte-das-funcionalidades).)
- **Unicidade incluindo excluídos:** usar `Rule::unique('empresas','cnpj')` (que já considera soft-deleted) + `->ignore($id)` no update; **não** usar `withoutTrashed`.
- **Filtro por nome:** `LIKE %termo%`; a collation padrão do MySQL (`utf8mb4_unicode_ci`) já é case-insensitive.
- **`acoes_permitidas.excluir_definitivamente` (empresa):** só `true` quando a empresa está excluída logicamente **e** não possui nenhum produto vinculado (incl. excluído) — coerente com o bloqueio de exclusão física.
- **Mensagens de validação:** fornecidas nos Form Requests (pt), evitando dependência externa de pacote de tradução.
- **Roteamento (Laravel 13):** o bootstrap slim não carrega `routes/api.php` sozinho; a 01 registra `api:` no `withRouting()` do `bootstrap/app.php` (prefixo `api`). **Não** usar `install:api` (instalaria Sanctum, fora de escopo — sem autenticação).
- **Revalidação de estado (ambiguidade sinalizada):** o desafio/docs não detalham explicitamente a resposta ao tentar inativar/reativar/editar uma empresa **já excluída**. Decisão de projeto: o Service **rejeita com 409** nesses casos (a UI já esconde via `acoes_permitidas`, mas o servidor é a autoridade e revalida — [docs/15 §Derivação](../../docs/15-contrato-api.md#derivação-de-acoes_permitidas)).
- **Exclusão física (dupla condição):** o endpoint `forcar` só remove fisicamente quando a empresa está **excluída logicamente** (regra 8 — [docs/02 §2](../../docs/02-regras-de-negocio.md#2-regras-de-uso-obrigatórias)) **e** não possui produto vinculado, incl. excluído ([docs/02 §3.3](../../docs/02-regras-de-negocio.md#33-exclusão-física-hard-delete)). Caso contrário, 409 com `registro_nao_excluido` ou `empresa_com_produtos_vinculados`. Coerente com a derivação de `acoes_permitidas.excluir_definitivamente`.
- **Gap herdado (F5, não corrigido aqui):** as migrations da 00 não criaram índice em `deleted_at`, embora [docs/13 §Índices (resumo)](../../docs/13-persistencia-e-banco.md#índices-resumo) o preveja. Fora do escopo da 01 (que não altera schema); registrado para correção em manutenção da 00. Não afeta a corretude funcional desta entrega.
