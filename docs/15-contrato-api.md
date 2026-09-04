# Contrato da API

Contrato de comunicação entre o front-end (React) e o back-end (Laravel). Consistente com [09-arquitetura-backend.md](09-arquitetura-backend.md), as regras de [02-regras-de-negocio.md](02-regras-de-negocio.md), os campos de [03-modelagem.md](03-modelagem.md)/[13-persistencia-e-banco.md](13-persistencia-e-banco.md) e os filtros de [04-requisitos.md](04-requisitos.md). Legenda em [08-arquitetura-geral.md](08-arquitetura-geral.md#legenda-de-origem-das-decisões).

> 🟦 Os nomes/rotas podem sofrer ajustes finos na implementação, mantendo estes padrões. Endpoints, formatos e códigos abaixo são a referência.

## Convenções gerais

- **Base URL:** `/api` (ex.: `http://localhost:8000/api`). 🟦
- **Formato:** JSON em requisição e resposta. Cabeçalhos: `Accept: application/json`, `Content-Type: application/json`.
- **Autenticação:** nenhuma (🟩 fora de escopo) — sem tokens/sessão. Ver [11-seguranca.md](11-seguranca.md).
- **CORS:** liberado apenas para a origem do front-end. 🧭
- **Idioma:** mensagens ao usuário em **português**, sem detalhes internos. 🟩
- **Datas:** ISO 8601 (UTC), ex.: `2026-09-04T12:00:00Z`.
- **Verbos:** REST — `GET` (ler), `POST` (criar/ação), `PUT/PATCH` (atualizar/estado), `DELETE` (excluir). Ações de ciclo de vida (inativar, reativar, restaurar, excluir definitivamente) usam sub-rotas explícitas. 🟦🧭

## Representação dos recursos

Saída padronizada por **API Resource** (ver [09](09-arquitetura-backend.md#padronização-de-respostas)).

### Empresa
```json
{
  "id": 1,
  "nome": "Fornecedor Exemplo Ltda",
  "cnpj": "12345678000199",
  "email": "contato@exemplo.com",
  "telefone": "11912345678",
  "status": "Ativo",
  "excluido": false,
  "produtos_count": 3,
  "created_at": "2026-09-04T12:00:00Z",
  "updated_at": "2026-09-04T12:00:00Z",
  "deleted_at": null,
  "acoes_permitidas": {
    "editar": true, "inativar": true, "reativar": false,
    "excluir": true, "restaurar": false, "excluir_definitivamente": false
  }
}
```

### Produto
```json
{
  "id": 10,
  "empresa_id": 1,
  "empresa": { "id": 1, "nome": "Fornecedor Exemplo Ltda", "status": "Ativo" },
  "nome": "Produto A",
  "descricao": "Descrição opcional",
  "preco": "99.90",
  "codigo_interno": "SKU-001",
  "status": "Ativo",
  "excluido": false,
  "created_at": "2026-09-04T12:00:00Z",
  "updated_at": "2026-09-04T12:00:00Z",
  "deleted_at": null,
  "acoes_permitidas": {
    "editar": true, "inativar": true, "reativar": false,
    "excluir": true, "restaurar": false, "excluir_definitivamente": false
  }
}
```

- 🟦 **`cnpj`/`telefone`** retornam **normalizados** (apenas dígitos); a formatação para exibição é responsabilidade do front ([10](10-arquitetura-frontend.md)).
- 🟦 **`preco`** como string decimal com 2 casas (evita imprecisão de float).
- 🟦 **`excluido`** é um booleano derivado de `deleted_at != null`, para conveniência do front.
- 🟦 **`acoes_permitidas`** é calculado **no servidor** a partir do estado do registro e das regras — a UI usa isso para exibir só as ações permitidas (🟩 requisito de UX; nunca oferecer ação que a regra recusaria). Ver [derivação](#derivação-de-acoes_permitidas).
- Em Produto, **`empresa`** é um resumo carregado via eager loading (evita N+1 — [12](12-performance.md)).

## Padrão de listagem (paginação + filtros)

🟩🟦 Todas as listagens são paginadas no servidor (**10 itens/página**) e aceitam filtros.

**Query params** (Empresas e Produtos):

| Param | Tipo | Descrição | Default |
|---|---|---|---|
| `page` | int | Página atual. | 1 |
| `nome` | string | Filtro por nome (parcial, case-insensitive). | — |
| `status` | `Ativo`\|`Inativo` | Filtro por status. | — |
| `excluidos` | bool (`true`) | Quando `true`, retorna **somente** os registros excluídos logicamente. Sem o param, retorna **somente não excluídos**. | false |

> 🟩 Listagens **não** retornam excluídos por padrão; o filtro `excluidos=true` mostra **apenas** os excluídos (regra 9 / [decisão C1](02-regras-de-negocio.md)).
> ⚠️ Não há filtro por empresa em produtos (fora de escopo — [04](04-requisitos.md#listagens-paginação-e-filtros)).

**Resposta (200)** — envelope do `paginate()` do Laravel:
```json
{
  "data": [ { "...empresa ou produto..." } ],
  "links": { "first": "...", "last": "...", "prev": null, "next": "..." },
  "meta": {
    "current_page": 1, "per_page": 10, "total": 42, "last_page": 5,
    "from": 1, "to": 10, "path": "http://localhost:8000/api/empresas"
  }
}
```

## Endpoints — Empresas

| Método | Rota | Descrição | Sucesso |
|---|---|---|---|
| GET | `/api/empresas` | Listar (paginação + filtros). | 200 |
| POST | `/api/empresas` | Criar. | 201 |
| GET | `/api/empresas/{id}` | Detalhar. | 200 |
| PUT/PATCH | `/api/empresas/{id}` | Editar. | 200 |
| PATCH | `/api/empresas/{id}/inativar` | Inativar (cascata nos produtos). | 200 |
| PATCH | `/api/empresas/{id}/reativar` | Reativar (não reativa produtos). | 200 |
| DELETE | `/api/empresas/{id}` | Exclusão lógica (cascata nos produtos). | 200 |
| POST | `/api/empresas/{id}/restaurar` | Restaurar (traz de volta produtos excluídos pela cascata). | 200 |
| DELETE | `/api/empresas/{id}/forcar` | Exclusão física (bloqueada se houver produto vinculado). | 204 |

### Criar/editar empresa — corpo da requisição
```json
{
  "nome": "Fornecedor Exemplo Ltda",
  "cnpj": "12.345.678/0001-99",
  "email": "contato@exemplo.com",
  "telefone": "(11) 91234-5678",
  "status": "Ativo"
}
```
- 🟩 Validações: `nome` 3–150; `cnpj` válido (dígitos verificadores) e único incluindo excluídos; `email` válido e único incluindo excluídos; `telefone` com DDD; `status` ∈ {Ativo, Inativo}. Ver [03](03-modelagem.md).
- 🟦 `cnpj`/`telefone` podem chegar formatados; o back normaliza (apenas dígitos) antes de validar/persistir. Na edição, a unicidade ignora o próprio registro.

## Endpoints — Produtos

| Método | Rota | Descrição | Sucesso |
|---|---|---|---|
| GET | `/api/produtos` | Listar (paginação + filtros). | 200 |
| POST | `/api/produtos` | Criar (empresa apta obrigatória). | 201 |
| GET | `/api/produtos/{id}` | Detalhar. | 200 |
| PUT/PATCH | `/api/produtos/{id}` | Editar. | 200 |
| PATCH | `/api/produtos/{id}/inativar` | Inativar. | 200 |
| PATCH | `/api/produtos/{id}/reativar` | Reativar (exige empresa apta). | 200 |
| DELETE | `/api/produtos/{id}` | Exclusão lógica. | 200 |
| POST | `/api/produtos/{id}/restaurar` | Restaurar (exige empresa não excluída). | 200 |
| DELETE | `/api/produtos/{id}/forcar` | Exclusão física (só se já excluído logicamente). | 204 |

### Criar/editar produto — corpo da requisição
```json
{
  "empresa_id": 1,
  "nome": "Produto A",
  "descricao": "Descrição opcional",
  "preco": 99.90,
  "codigo_interno": "SKU-001",
  "status": "Ativo"
}
```
- 🟩 Validações: `empresa_id` obrigatório e de empresa **ativa e não excluída**; `nome` 3–150; `descricao` ≤ 2.000; `preco` > 0 com 2 casas; `codigo_interno` único por empresa incluindo excluídos; `status` ∈ {Ativo, Inativo}.

### Seleção de empresa apta (formulário de produto)
🟦 O front popula o seletor com **empresas aptas** (ativas e não excluídas) usando a própria listagem: `GET /api/empresas?status=Ativo` (não excluídas por padrão). Sem endpoint novo (fora de escopo criar um dedicado).

## Códigos HTTP

| Código | Uso |
|---|---|
| **200** OK | Leitura e ações concluídas (editar, inativar, reativar, restaurar, exclusão lógica). |
| **201** Created | Criação de recurso. |
| **204** No Content | Exclusão física concluída (sem corpo). |
| **404** Not Found | Recurso inexistente (ou excluído, quando não acessível). |
| **409** Conflict | Violação de regra de estado (ex.: excluir fisicamente empresa com produtos; excluir definitivamente registro que não está excluído). |
| **422** Unprocessable Entity | Falha de validação de entrada e regras de negócio de dados. |
| **500** Internal Server Error | Erro inesperado (mensagem genérica, sem detalhes internos). |

> Como não há autenticação, **401/403 não fazem parte** deste contrato.

## Tratamento de erros — formatos padronizados

### 422 — Validação (padrão Laravel)
```json
{
  "message": "Os dados informados são inválidos.",
  "errors": {
    "cnpj": ["Este CNPJ já está cadastrado."],
    "preco": ["O preço deve ser maior que zero."]
  }
}
```
- O front mapeia `errors[campo]` para o campo correspondente do formulário. 🟩

### 409 — Regra de negócio (conflito de estado)
```json
{
  "message": "Não é possível excluir definitivamente a empresa: há produtos vinculados.",
  "code": "empresa_com_produtos_vinculados"
}
```
- `message`: texto ao usuário (português, sem jargão). `code` (🟦 opcional): identificador estável para o front tratar programaticamente.

### 404 / 500
```json
{ "message": "Registro não encontrado." }
{ "message": "Ocorreu um erro inesperado. Tente novamente." }
```

### Códigos de regra de negócio (`code`) previstos 🟦
| `code` | Situação | HTTP |
|---|---|---|
| `empresa_inativa_ou_excluida` | Criar/editar/reativar produto com empresa não apta. | 422 |
| `empresa_com_produtos_vinculados` | Exclusão física de empresa com produtos (mesmo excluídos). | 409 |
| `registro_nao_excluido` | Exclusão definitiva de registro que não está excluído logicamente. | 409 |
| `empresa_excluida` | Restaurar produto cuja empresa está excluída. | 409 |
| `registro_excluido` | Operação (inativar/reativar/editar) sobre um registro já excluído logicamente. | 409 |

## Derivação de `acoes_permitidas`

🟦 Calculada no servidor conforme o estado (base para a UI condicional). Resumo:

**Empresa**
| Estado | editar | inativar | reativar | excluir | restaurar | excluir_definitivamente |
|---|:--:|:--:|:--:|:--:|:--:|:--:|
| Ativa, não excluída | ✅ | ✅ | — | ✅ | — | — |
| Inativa, não excluída | ✅ | — | ✅ | ✅ | — | — |
| Excluída logicamente | — | — | — | — | ✅ | ✅ **só se** sem produtos vinculados |

**Produto**
| Estado | editar | inativar | reativar | excluir | restaurar | excluir_definitivamente |
|---|:--:|:--:|:--:|:--:|:--:|:--:|
| Ativo, não excluído | ✅ *(se empresa apta)* | ✅ | — | ✅ | — | — |
| Inativo, não excluído | ✅ *(se empresa apta)* | — | ✅ *(se empresa apta)* | ✅ | — | — |
| Excluído logicamente | — | — | — | — | ✅ *(se empresa não excluída)* | ✅ |

> **`editar` e `reativar` de produto exigem empresa apta** (ativa e não excluída) — [docs/02 §5](02-regras-de-negocio.md#5-regras-por-operação-sobre-produto). Estas regras derivam de [02-regras-de-negocio.md](02-regras-de-negocio.md). A UI usa `acoes_permitidas`, mas o **servidor revalida** a regra ao executar a ação (a UI não é autoridade).

## Comportamento das ações de ciclo de vida

| Ação | Efeito (servidor, transacional) |
|---|---|
| Inativar empresa | Empresa → Inativo; **todos os produtos** → Inativo (cascata). |
| Reativar empresa | Empresa → Ativo; produtos **inalterados**. |
| Excluir empresa (lógica) | Empresa e produtos → `deleted_at`; produtos afetados recebem `excluido_em_cascata = true`. |
| Restaurar empresa | Empresa restaurada; restaura **apenas** produtos com `excluido_em_cascata = true`, limpando a marca. |
| Forçar empresa | **409** se houver qualquer produto vinculado (mesmo excluído); senão remove fisicamente. |
| Inativar/Reativar produto | Produto muda de status (reativar exige empresa apta, senão **422**). |
| Excluir produto (lógica) | Produto → `deleted_at`, `excluido_em_cascata = false`. |
| Restaurar produto | Restaura se a empresa não estiver excluída (senão **409**); pode voltar como Inativo se necessário. |
| Forçar produto | **409** se não estiver excluído logicamente; senão remove fisicamente. |

> Todas as operações em cascata são executadas em **transação** para nunca deixar estado inconsistente (regra 12).
