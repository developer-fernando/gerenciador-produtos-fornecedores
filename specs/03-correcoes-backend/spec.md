# Spec — Correções de Back-end (hardening)

| Campo | Valor |
|---|---|
| **Status** | Concluído (todos os tickets; suíte verde) |
| **Funcionalidade** | 03-correcoes-backend |
| **PRD relacionado** | [prd.md](./prd.md) · [validation.md](./validation.md) |

## 1. Abordagem técnica

Correções pontuais e de baixo risco, sem tocar nas regras de negócio já validadas. Foco em endurecer o tratamento de erros, restringir CORS, garantir atomicidade no `ProdutoService`, adicionar o índice faltante e alinhar a documentação. A suíte existente (39 testes) é a rede de segurança contra regressões; novos testes cobrem os pontos antes não testados (404/erro).

## 2. Origem dos itens (achados da validação)

Referência: auditoria da implementação registrada em [validation.md](./validation.md). Achados: #1 erro vaza detalhes internos (crítico), #2 CORS aberto (médio), #3 falta de transação no `ProdutoService` (médio), #4 índice `deleted_at` ausente (baixo), #5 imprecisão de documentação (obs).

## 3. Mudanças por camada

**Back-end (Laravel):**
- **Handler de exceções** (`bootstrap/app.php`, `->withExceptions`):
  - Render para `Symfony\Component\HttpKernel\Exception\NotFoundHttpException` → `404 { "message": "Registro não encontrado." }`. **Observação técnica:** a `ModelNotFoundException` do route-model-binding/`findOrFail` já é **convertida** pelo framework em `NotFoundHttpException` antes dos callbacks de render (`prepareException`), então tratar `NotFoundHttpException` cobre os dois casos; um callback tipado em `ModelNotFoundException` seria código morto e **não** deve ser registrado.
  - Render genérico para as demais exceções **apenas** em requisições `api/*`/`expectsJson`. Este callback **deve deferir** (retornar `null`) para `Illuminate\Validation\ValidationException` (preserva o 422 com `errors`), `Illuminate\Http\Exceptions\HttpResponseException` e `Illuminate\Auth\AuthenticationException`. A `RegraDeNegocioException` não passa por aqui (tem `render()` próprio, que o framework resolve antes dos callbacks). Para uma `Symfony\...\HttpExceptionInterface` (ex.: 405), usar o status dela com mensagem genérica; para as demais, `500 { "message": "Ocorreu um erro inesperado. Tente novamente." }`.
  - Em nenhum caso as respostas incluem `trace`/`exception`/`file`, independentemente de `APP_DEBUG` (o `APP_DEBUG` segue valendo só para logs internos, não para o corpo da resposta da API).
- **CORS** (`config/cors.php`): publicar/definir com `paths => ['api/*']`, `allowed_methods => ['*']`, `allowed_origins => [env('FRONTEND_URL', 'http://localhost:5173')]`, `allowed_headers => ['*']`, `supports_credentials => false`.
- **`ProdutoService`**: envolver `excluir()` e `restaurar()` em `DB::transaction`; em `restaurar()`, resetar `excluido_em_cascata => false` após o `restore()` (simetria com `excluir()` e com `EmpresaService`).
- **Migration** `add_deleted_at_index_...`: `Schema::table('empresas'|'produtos', fn ($t) => $t->index('deleted_at'))`.

**Documentação:**
- **`docs/15`**: ajustar a linha da tabela de `acoes_permitidas` (Produto) para refletir que `editar` exige empresa apta; incluir `produtos_count` no exemplo de payload de Empresa.

**Front-end:** nenhuma mudança.

## 4. Regras e validações

Não introduz regra nova. Preserva o contrato de erros de negócio (409/422 com `code`) e de validação (422 com `errors`).

| Item | Origem |
|---|---|
| Erros sem detalhes internos; 404/500 padronizados | [docs/11](../../docs/11-seguranca.md) · [docs/15 §Erros](../../docs/15-contrato-api.md#tratamento-de-erros--formatos-padronizados) |
| CORS restrito à origem do front | [docs/11](../../docs/11-seguranca.md) |
| Operações multi-escrita transacionais (consistência de dados) | [docs/11 §Consistência de dados como segurança](../../docs/11-seguranca.md#consistência-de-dados-como-segurança) · [AGENTS §6](../../AGENTS.md) |
| Índice `deleted_at` | [docs/13 §Índices (resumo)](../../docs/13-persistencia-e-banco.md#índices-resumo) |

## 5. Estratégia de testes

- **404 limpo:** `getJson('/api/empresas/999999')` e `/api/produtos/999999` → 404 com `message` e **sem** as chaves `exception`/`trace`/`file` (`assertJsonMissingPath`).
- **500 limpo:** registrar uma rota **apenas de teste** que lança uma `\RuntimeException` genérica e assertar `getJson(...)->assertStatus(500)` com `message` genérico e **sem** `trace`/`exception`/`file`. (Alternativa: forçar a exceção via mock de Service.)
- **Regressão do 422/409:** teste garantindo que uma entrada inválida (`POST /api/empresas` sem `nome`) **continua** retornando **422** com `errors` (não 500) após o novo handler; 409 de regra de negócio inalterado. A suíte completa (39) permanece verde.
- **CORS:** teste de feature que envia o cabeçalho `Origin` igual ao `FRONTEND_URL` e assere `assertHeader('Access-Control-Allow-Origin', 'http://localhost:5173')` (o middleware `HandleCors` roda no ciclo de teste); complementado por verificação `curl` no ticket.
- **Transação:** revisão de código + suíte de produtos permanece verde (comportamento inalterado, apenas atomicidade).
- **Índice:** `SHOW INDEX FROM empresas/produtos` mostra `deleted_at`.

## 6. Tickets

- [x] **03-T1** — Handler global de exceções (404/500 padronizados sem detalhes; defere 422/409) + testes (404 limpo, 500 limpo sem vazar, regressão 422 e 409) — 4 passed; 404 vivo confirmado.
- [x] **03-T2** — `config/cors.php` restrito ao `FRONTEND_URL` (sem `*`) + testes de feature (2 passed) e verificação por curl (header vivo = http://localhost:5173).
- [x] **03-T3** — `DB::transaction` em `ProdutoService::excluir()`/`restaurar()` + reset de `excluido_em_cascata` na restauração — suíte de produtos verde (14), 2 transações confirmadas.
- [x] **03-T4** — Migration de índice `deleted_at` em `empresas` e `produtos` — aplicada e confirmada (empresas_deleted_at_index, produtos_deleted_at_index).
- [x] **03-T5** — Ajustes em `docs/15` (produto: `editar` exige empresa apta na tabela de derivação; empresa: `produtos_count` no exemplo de payload).
- [x] **03-T6** — Validação executável final: `php artisan test` verde (45 passed / 171 asserções); 404/CORS/índice verificados.

## 7. Definition of Done

- [x] Todos os tickets concluídos.
- [x] 404/500 padronizados sem vazar detalhes; 422/409 preservados.
- [x] CORS restrito ao `FRONTEND_URL`.
- [x] `ProdutoService` atômico em exclusão/restauração; `excluido_em_cascata` resetado na restauração.
- [x] Índice `deleted_at` presente em ambas as tabelas.
- [x] `docs/15` alinhado ao comportamento real.
- [x] `php artisan test` verde (45 passed / 171 asserções; sem regressões).
- [x] Critérios de aceite do PRD atendidos.

## 8. Decisões e riscos locais

- **Risco: catch-all quebrar o 422.** Um render tipado em `Throwable` capturaria a `ValidationException` **antes** do 422 nativo do Laravel (os callbacks rodam antes do `match` interno do Handler). Mitigação obrigatória: o callback genérico **defere** (`return null`) para `ValidationException`, `HttpResponseException` e `AuthenticationException`; e há **teste de regressão** garantindo que a validação continua 422. Sem isso, ~8 testes existentes quebrariam.
- **Risco: caminho 500 não verificado.** O 500 é o ponto mais crítico do achado original; portanto há **teste dedicado** (rota de teste que lança exceção) — não basta o 404.
- **`ModelNotFoundException`:** é convertida em `NotFoundHttpException` antes dos callbacks; registrar apenas o render de `NotFoundHttpException` (evitar código morto).
- **Renders de erro sempre limpos:** os renders de 404/500 retornam JSON fixo independentemente de `APP_DEBUG`, garantindo que nem em `local` haja vazamento pela API. `APP_DEBUG` continua útil para logs internos, não para o corpo da resposta.
- **CORS default de origem:** usa `FRONTEND_URL` com fallback `http://localhost:5173` (porta do Vite definida no ambiente Docker — [docs/16](../../docs/16-ambiente-docker.md)).
- **Migration aditiva:** apenas adiciona índice; não altera dados nem colunas. Corrige o gap "F5" herdado da 00 sem reabrir aquelas migrations.
- **CORS testável:** o middleware `HandleCors` roda no ciclo de request dos testes, então há **teste de feature** com `assertHeader('Access-Control-Allow-Origin', ...)`, complementado por verificação `curl` no ticket 03-T2.
