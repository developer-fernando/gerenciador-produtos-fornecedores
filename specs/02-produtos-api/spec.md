# Spec — Produtos (API)

| Campo | Valor |
|---|---|
| **Status** | Aprovado (validação autônoma, rodada 2) |
| **Funcionalidade** | 02-produtos-api |
| **PRD relacionado** | [prd.md](./prd.md) · [validation.md](./validation.md) |

## 1. Abordagem técnica

Mesma arquitetura da 01 ([docs/09](../../docs/09-arquitetura-backend.md)): Controller fino → Form Request → `ProdutoService` (regras + transações) → Eloquent → `ProdutoResource`. Reaproveita a `RegraDeNegocioException` (01), estendendo-a com os códigos do domínio Produto. Sem alterações de schema (usa a 00).

## 2. Modelo de dados

Sem novas migrations. Usa `produtos`/`empresas` da 00 ([docs/13 §4](../../docs/13-persistencia-e-banco.md#4-schema-definido)). "Empresa apta" = empresa com `status = Ativo` e não excluída (`deleted_at` nulo).

## 3. Contrato da API

Conforme [docs/15 §Endpoints — Produtos](../../docs/15-contrato-api.md#endpoints--produtos), [§Representação](../../docs/15-contrato-api.md#representação-dos-recursos), [§Derivação de `acoes_permitidas`](../../docs/15-contrato-api.md#derivação-de-acoes_permitidas), [§Padrão de listagem](../../docs/15-contrato-api.md#padrão-de-listagem-paginação--filtros) e [§Tratamento de erros](../../docs/15-contrato-api.md#tratamento-de-erros--formatos-padronizados).

Endpoints: `GET /api/produtos`, `POST /api/produtos`, `GET /api/produtos/{id}`, `PUT|PATCH /api/produtos/{id}`, `PATCH /api/produtos/{id}/inativar`, `PATCH /api/produtos/{id}/reativar`, `DELETE /api/produtos/{id}`, `POST /api/produtos/{id}/restaurar`, `DELETE /api/produtos/{id}/forcar`.

## 4. Mudanças por camada

**Back-end (Laravel):**
- **Regra de validação:** `app/Rules/EmpresaApta.php` — valida que `empresa_id` existe, com empresa **ativa e não excluída**.
- **Form Requests:** `StoreProdutoRequest`/`UpdateProdutoRequest` — validam campos; `empresa_id` obrigatório e via `EmpresaApta`; `codigo_interno` único por empresa **incluindo excluídos** (`Rule::unique('produtos','codigo_interno')->where('empresa_id', $this->input('empresa_id'))`, sem `withoutTrashed`), com `ignore($id)` no update; mensagens em pt. O update aceita alterar o `empresa_id` para outra empresa apta, revalidando a unicidade do código interno **na empresa destino** (conforme [docs/02 §5](../../docs/02-regras-de-negocio.md#5-regras-por-operação-sobre-produto)).
- **Resource:** `ProdutoResource` — payload de [docs/15 §Produto](../../docs/15-contrato-api.md#representação-dos-recursos) com `empresa` (resumo: id, nome, status), `excluido`, `preco` (string 2 casas) e `acoes_permitidas`. Derivação: `editar` e `reativar` exigem **empresa apta** (ativa e não excluída) — `editar` é false sempre que a empresa não estiver apta, independentemente do status do produto; `reativar` só quando produto Inativo, não excluído e empresa apta; `restaurar` só quando excluído e empresa não excluída; `excluir_definitivamente` quando excluído.
- **Service:** `ProdutoService` — CRUD, listagem (eager load `empresa`), status, exclusão lógica/restauração e exclusão física; transações onde houver mais de uma escrita.
- **Exceção:** estender `RegraDeNegocioException` com factories `empresaInativaOuExcluida()` (422), `empresaExcluida()` (409) — além das já existentes `registroNaoExcluido`/`registroExcluido`.
- **Controller:** `app/Http/Controllers/Api/ProdutoController.php` (fino).
- **Rotas:** adicionar o recurso `produtos` + ações de ciclo de vida em `routes/api.php` (grupo `api` já registrado na 01).

**Front-end:** nenhuma mudança.

## 5. Regras e validações a implementar

| Regra/validação | Origem |
|---|---|
| nome 3–150; descrição ≤ 2.000; preço > 0 (2 casas); status ∈ {Ativo, Inativo} | [docs/03 §Produto](../../docs/03-modelagem.md#produto) |
| `empresa_id` obrigatório e de empresa **ativa e não excluída** (criar/editar) | [docs/02 §5](../../docs/02-regras-de-negocio.md#5-regras-por-operação-sobre-produto) |
| Código interno único por empresa **incluindo excluídos**; ignora o próprio no update; na troca de vínculo, revalida no destino | [docs/02 §6](../../docs/02-regras-de-negocio.md#6-unicidade) · [§5](../../docs/02-regras-de-negocio.md#5-regras-por-operação-sobre-produto) |
| Inativar produto (não excluído); reativar exige empresa apta | [docs/02 §5](../../docs/02-regras-de-negocio.md#5-regras-por-operação-sobre-produto) |
| Excluir logicamente (individual → `excluido_em_cascata = false`) | [docs/03](../../docs/03-modelagem.md#rastreio-da-origem-da-exclusão-regra-6) |
| Restaurar exige empresa não excluída; volta Inativo se empresa inativa | [docs/02 §5](../../docs/02-regras-de-negocio.md#5-regras-por-operação-sobre-produto) |
| Exclusão física só de produto já excluído logicamente | [docs/02 §3.3](../../docs/02-regras-de-negocio.md#33-exclusão-física-hard-delete) |
| Listagem sem excluídos por padrão; filtro de excluídos = somente excluídos | [docs/04 §Listagens](../../docs/04-requisitos.md#listagens-paginação-e-filtros) |

**Códigos de erro:** `empresa_inativa_ou_excluida` (422, criar/editar/reativar com empresa não apta), `empresa_excluida` (409, restaurar com empresa excluída), `registro_nao_excluido` (409, forçar produto não excluído), `registro_excluido` (409, operar produto excluído) — [docs/15](../../docs/15-contrato-api.md#tratamento-de-erros--formatos-padronizados).

## 6. Estratégia de testes

Feature tests (Pest + `RefreshDatabase`, MySQL de testes) — [docs/14](../../docs/14-estrategia-de-testes.md):
- Criação válida (201) e inválida (422 por campo); preço ≤ 0, nome curto, descrição > 2000 rejeitados.
- Criar/editar com empresa inativa ou excluída → 422 `empresa_inativa_ou_excluida`.
- Código interno: duplicado na mesma empresa (incl. excluído) → 422; mesmo código em empresa diferente → OK; update ignora o próprio; trocar `empresa_id` para outra empresa apta é aceito e revalida o código no destino (colisão no destino → 422).
- Inativar; reativar com empresa apta → OK; reativar com empresa inativa/excluída → 422.
- Excluir individual (`excluido_em_cascata=false`); restaurar com empresa ativa → volta ao status anterior; restaurar com empresa inativa → volta Inativo; restaurar com empresa excluída → 409 `empresa_excluida`.
- Exclusão física: produto não excluído → 409 `registro_nao_excluido`; já excluído → 204.
- Operar (inativar/reativar/editar) produto excluído → 409 `registro_excluido`.
- Listagem: paginação 10; filtros nome/status/excluídos; empresa vinculada presente; sem N+1 (eager load).
- Unit test do `EmpresaApta`.

## 7. Tickets

- [x] **02-T1** — Regra `EmpresaApta` (empresa existe, ativa e não excluída) + teste (2 passed).
- [x] **02-T2** — Form Requests `StoreProdutoRequest`/`UpdateProdutoRequest` (validações; `EmpresaApta`; código único por empresa incl. excluídos escopado ao `empresa_id` enviado, ignore no update; mensagens pt) — verificado via tinker.
- [x] **02-T3** — Estender `RegraDeNegocioException` com `empresaInativaOuExcluida()` (422) e `empresaExcluida()` (409) — verificado via tinker.
- [x] **02-T4** — `ProdutoResource` (payload + `empresa` resumo + `excluido` + `acoes_permitidas` derivadas do produto e da aptidão da empresa) — verificado via tinker.
- [x] **02-T5** — `ProdutoService`: create/update/show/list (eager load `empresa`; paginação 10 + filtros; editar produto excluído → 409) — verificado via tinker.
- [ ] **02-T6** — `ProdutoService`: inativar / reativar (reativar exige empresa apta) — revalidação 409 em produto excluído.
- [ ] **02-T7** — `ProdutoService`: exclusão lógica individual / restauração (exige empresa não excluída; status ajustado à aptidão da empresa).
- [ ] **02-T8** — `ProdutoService`: exclusão física (só de produto já excluído) + `ProdutoController` + rotas.
- [ ] **02-T9** — Testes de feature cobrindo todas as regras acima.

## 8. Definition of Done

- [ ] Todos os tickets concluídos.
- [ ] Endpoints conforme o contrato; respostas padronizadas (Resource + `acoes_permitidas`; erros 422/409 com `code`).
- [ ] Validação server-side completa; mensagens em português, sem detalhes internos.
- [ ] Regras do lado do produto corretas (empresa apta, código único por empresa, restauração condicionada) e exclusão física só de excluído.
- [ ] `php artisan test` verde (02 + 01 + 00).
- [ ] Sem credenciais/segredos no código.
- [ ] Critérios de aceite do PRD atendidos.

## 9. Decisões e riscos locais

- **Troca de vínculo na edição:** conforme [docs/02 §5](../../docs/02-regras-de-negocio.md#5-regras-por-operação-sobre-produto), o update pode alterar o `empresa_id` para outra **empresa apta**, revalidando a unicidade do `codigo_interno` na empresa destino. A unicidade no Form Request usa o `empresa_id` enviado no payload (não o atual), garantindo a revalidação no destino.
- **Status na restauração:** ao restaurar um produto, se a empresa estiver **inativa**, o produto volta como **Inativo** (regra 4: produto de empresa não apta não pode estar ativo); se a empresa estiver **ativa**, mantém o status anterior. Restaurar com empresa **excluída** é bloqueado (409 `empresa_excluida`).
- **Empresa apta como validação (422):** criar/editar com empresa não apta é tratado como erro de validação (422 `empresa_inativa_ou_excluida`) via `EmpresaApta`; reativar (fora do Form Request) lança a mesma exceção no Service.
- **Reaproveitamento:** `RegraDeNegocioException` da 01 é estendida com novos factories; o roteamento `api` já está registrado (01), então a 02 apenas adiciona rotas.
