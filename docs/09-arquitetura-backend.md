# Arquitetura do Back-end (Laravel)

Como o Laravel está organizado. Regras de negócio em [02-regras-de-negocio.md](02-regras-de-negocio.md); modelo de dados em [03-modelagem.md](03-modelagem.md). Legenda em [08-arquitetura-geral.md](08-arquitetura-geral.md#legenda-de-origem-das-decisões).

## Camadas e responsabilidades

🟦 Decisão: **Service + Eloquent**, sem camada Repository (ver justificativa em [08](08-arquitetura-geral.md#como-o-material-de-referência-do-sênior-foi-tratado)).

| Camada | Responsabilidade | Não faz |
|---|---|---|
| **Route** (`routes/api.php`) | Define endpoints REST e direciona ao Controller. | Lógica. |
| **Controller** (fino) | Orquestra: recebe o Request validado, chama o Service, retorna um Resource. ~3–5 linhas por ação. | Validação, regra de negócio, query. |
| **Form Request** | 🟩 Validação **server-side** das entradas; mensagens em português. | Regra de negócio complexa. |
| **Service** | 🟩 Regras de negócio, cascatas, **transações**, orquestração de persistência via Eloquent. | Formatar HTTP/JSON. |
| **Model (Eloquent)** | Acesso a dados, relacionamentos, `SoftDeletes`, scopes. | Regra de negócio de aplicação. |
| **API Resource** | 🧭 Transforma Model → JSON padronizado (saída). | Buscar dados / regra. |
| **Tratamento de exceções** | 🧭 `bootstrap/app.php` (`withExceptions`) converte exceções em respostas de erro padronizadas. `RegraDeNegocioException` → 409. | — |

## Fluxo de uma requisição

```
Route → (Middleware) → Controller → Form Request (valida entrada)
                                   → Service (regra + DB::transaction + Eloquent)
                                   → API Resource (formata)
                                   → JSON padronizado
```

> Em relação a um fluxo com Repository + DTO: aqui o acesso a dados fica **no Service via Eloquent** (sem Repository), e a padronização de saída é feita por **API Resource** (no lugar de um DTO de saída). Ver [08](08-arquitetura-geral.md#como-o-material-de-referência-do-sênior-foi-tratado).

## Estrutura de pastas (essencial)

```
backend/app/
├── Http/
│   ├── Controllers/Api/   → EmpresaController, ProdutoController (finos)
│   ├── Requests/          → StoreEmpresaRequest, UpdateEmpresaRequest, Store/UpdateProdutoRequest
│   └── Resources/         → EmpresaResource, ProdutoResource
├── Services/              → EmpresaService, ProdutoService (regras + cascatas)
├── Models/                → Empresa, Produto
└── Exceptions/            → RegraDeNegocioException
bootstrap/app.php          → withExceptions (404/500 padronizados; defere 422)
database/migrations/       → empresas, produtos (índices e soft delete)
routes/api.php
config/cors.php
```

## Onde cada regra vive

- 🟩 **Validação de campo** (nome, cnpj, email, preço, código interno, etc.) → **Form Requests**. Ver [03-modelagem.md](03-modelagem.md).
- 🟩 **Unicidade incluindo excluídos** (CNPJ, email, código interno) → regra `unique` (sem `withoutTrashed`) nos Form Requests + índices no banco.
- 🟩 **Regras de negócio e cascatas** (inativar/reativar, exclusão lógica/restauração, bloqueio de exclusão física, produto só em empresa apta) → **Services**, dentro de `DB::transaction()` para garantir consistência (regra 12).
- 🟩 **Rastreio da origem da exclusão** (regra 6) → tratado no `EmpresaService`/`ProdutoService` ao aplicar/restaurar cascata. Ver [03-modelagem.md](03-modelagem.md#rastreio-da-origem-da-exclusão-regra-6).

## API REST — endpoints (visão)

🧭 Recurso REST por entidade, com ações extras para o ciclo de vida. Convenção sugerida:

| Método | Rota | Ação |
|---|---|---|
| GET | `/api/empresas` | Listar (paginação, filtros nome/status/excluídos). |
| POST | `/api/empresas` | Criar. |
| GET | `/api/empresas/{id}` | Detalhar. |
| PUT/PATCH | `/api/empresas/{id}` | Editar. |
| PATCH | `/api/empresas/{id}/inativar` · `/reativar` | Status. |
| DELETE | `/api/empresas/{id}` | Exclusão lógica. |
| POST | `/api/empresas/{id}/restaurar` | Restaurar. |
| DELETE | `/api/empresas/{id}/forcar` | Exclusão física (bloqueada se houver produto vinculado). |

Rotas equivalentes para `produtos`. 🟦 Nomes finais e verbos podem ser ajustados na implementação, mantendo boas práticas REST.

## Padronização de respostas

🧭🟦 Contrato previsível para o front (princípio de padronização herdado da referência do Sênior, adaptado ao contexto sem autenticação):

**Sucesso** — via API Resource:
- Item: `{ "data": { ...campos... } }`
- Lista paginada: `{ "data": [...], "meta": { "current_page", "per_page", "total", ... } }` (padrão do `paginate()` do Laravel).

**Erro de validação** — HTTP **422** (padrão Laravel):
```json
{ "message": "Os dados informados são inválidos.", "errors": { "cnpj": ["CNPJ já cadastrado."] } }
```

**Erro de regra de negócio** — HTTP **409** (conflito de estado) ou **422**, com mensagem ao usuário:
```json
{ "message": "Não é possível excluir a empresa: há produtos vinculados." }
```

**Não encontrado** — HTTP **404**; **erro interno** — HTTP **500** com mensagem genérica (sem detalhes internos).

🟩 Todas as mensagens em **português**, voltadas ao usuário final, **sem expor detalhes internos** (regra do desafio). A conversão de exceções em respostas padronizadas fica em `bootstrap/app.php` (`withExceptions`).

> Observação: como não há autenticação, os códigos **401/403** **não fazem parte** da superfície da API. Ver [11-seguranca.md](11-seguranca.md).
