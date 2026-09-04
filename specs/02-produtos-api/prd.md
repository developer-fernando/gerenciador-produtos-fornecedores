# PRD — Produtos (API)

| Campo | Valor |
|---|---|
| **Status** | Concluído |
| **Funcionalidade** | 02-produtos-api |
| **Spec relacionada** | [spec.md](./spec.md) · [validation.md](./validation.md) |

## 1. Contexto e problema

Com a API de Empresas concluída (01), falta expor a **API REST de Produtos**, que é o segundo recurso do sistema e depende de uma empresa válida. Esta entrega implementa o back-end do domínio Produto e as **regras do lado do produto** (vínculo com empresa apta, status, exclusão lógica/restauração individuais e exclusão física). As cascatas disparadas pela empresa já foram implementadas na 01.

## 2. Objetivo / resultado esperado

Uma API REST de Produtos funcional e consistente com as regras, com **validação server-side** e **respostas padronizadas**, cobrindo: criar (vinculado a empresa apta), editar, listar (paginação + filtros), detalhar, inativar/reativar, excluir logicamente/restaurar e excluir definitivamente.

## 3. Escopo

**Dentro do escopo:**
- Endpoints REST de Produto conforme [docs/15 §Endpoints — Produtos](../../docs/15-contrato-api.md#endpoints--produtos).
- Validação server-side (Form Requests) de todos os campos de Produto, incluindo **empresa apta** e **código interno único por empresa** (incl. excluídos).
- Regras do lado do produto: criar/editar apenas com **empresa ativa e não excluída**; **reativar** exige empresa apta; **restaurar** exige empresa não excluída.
- Exclusão lógica **individual** (`excluido_em_cascata = false`), restauração e **exclusão física** (apenas quando já excluído logicamente).
- Listagem com **paginação (10/página)** e filtros por **nome, status e excluídos**.
- **Respostas padronizadas** (Resource + `acoes_permitidas`; erros 422/409).
- Testes de feature cobrindo as regras acima.

**Fora do escopo:**
- Endpoints/regras de **Empresa** (funcionalidade 01) e as cascatas disparadas pela empresa.
- Filtro de produtos por empresa (não especificado — [docs/04](../../docs/04-requisitos.md#listagens-paginação-e-filtros)).
- Front-end (03/04) e autenticação.

## 4. Atores e fluxos de uso

Consumidor é o front-end (04). O seletor de empresa no cadastro de produto deve oferecer apenas empresas aptas — o back-end **rejeita** vínculo com empresa não apta ([docs/05](../../docs/05-ux-e-interface.md)).

## 5. Requisitos funcionais

Conforme [docs/04 §Produto](../../docs/04-requisitos.md#produto) e [docs/15 §Endpoints — Produtos](../../docs/15-contrato-api.md#endpoints--produtos): criar, editar, listar (paginação + filtros), detalhar, inativar/reativar, excluir logicamente/restaurar, excluir definitivamente.

## 6. Regras de negócio aplicáveis

Origem em [docs/02-regras-de-negocio.md](../../docs/02-regras-de-negocio.md):
- **Validações de Produto** (empresa obrigatória e apta; nome 3–150; descrição opcional ≤ 2.000; preço > 0 com 2 casas; código interno obrigatório; status Ativo/Inativo) — [docs/03 §Produto](../../docs/03-modelagem.md#produto).
- **Código interno único por empresa**, incluindo excluídos; ignora o próprio no update — [docs/02 §6](../../docs/02-regras-de-negocio.md#6-unicidade).
- **Criar/editar produto** apenas com **empresa ativa e não excluída** — [docs/02 §5](../../docs/02-regras-de-negocio.md#5-regras-por-operação-sobre-produto).
- **Reativar produto** apenas se a empresa estiver apta — [docs/02 §5](../../docs/02-regras-de-negocio.md#5-regras-por-operação-sobre-produto).
- **Restaurar produto** apenas se a empresa não estiver excluída; ao restaurar, o produto volta como **Inativo** se a empresa estiver inativa (respeita a regra de que produto de empresa não apta não pode estar ativo) — [docs/02 §5](../../docs/02-regras-de-negocio.md#5-regras-por-operação-sobre-produto).
- **Exclusão física de produto** apenas quando já excluído logicamente — [docs/02 §3.3](../../docs/02-regras-de-negocio.md#33-exclusão-física-hard-delete).
- **Exclusão lógica individual** marca `excluido_em_cascata = false` (não é cascata da empresa) — [docs/03](../../docs/03-modelagem.md#rastreio-da-origem-da-exclusão-regra-6).
- **Listagens** sem excluídos por padrão; filtro de excluídos = somente excluídos — [docs/04 §Listagens](../../docs/04-requisitos.md#listagens-paginação-e-filtros).

## 7. Requisitos não-funcionais relevantes

- **Validação server-side**; mensagens em português, ao usuário, sem detalhes internos — [docs/11](../../docs/11-seguranca.md).
- **Padronização de respostas** e códigos de erro (`empresa_inativa_ou_excluida` 422; `empresa_excluida` 409; `registro_nao_excluido` 409; `registro_excluido` 409) — [docs/15 §Tratamento de erros](../../docs/15-contrato-api.md#tratamento-de-erros--formatos-padronizados).
- **Performance:** eager loading da empresa nas listagens para evitar N+1 — [docs/12](../../docs/12-performance.md).
- **Arquitetura:** Controllers finos, regras no Service, Form Requests, Resources; reaproveitar `RegraDeNegocioException` — [docs/09](../../docs/09-arquitetura-backend.md).

## 8. Critérios de aceite

- [x] `POST /api/produtos` cria produto válido vinculado a empresa apta (201) e rejeita dados inválidos (422 por campo).
- [x] Criar/editar produto com **empresa inativa ou excluída** é rejeitado (422 `empresa_inativa_ou_excluida`).
- [x] Código interno é único **por empresa**, inclusive contra excluídos; na edição, ignora o próprio; o mesmo código é permitido em empresas diferentes.
- [x] Editar pode alterar o `empresa_id` para outra empresa apta, revalidando o código interno na empresa destino ([docs/02 §5](../../docs/02-regras-de-negocio.md#5-regras-por-operação-sobre-produto)).
- [x] Preço deve ser > 0 com 2 casas; nome 3–150; descrição ≤ 2.000.
- [x] `PATCH /api/produtos/{id}/inativar` inativa; `reativar` só é permitido se a empresa estiver apta (senão 422 `empresa_inativa_ou_excluida`).
- [x] `DELETE /api/produtos/{id}` exclui logicamente (individual, `excluido_em_cascata = false`); `restaurar` só se a empresa não estiver excluída (senão 409 `empresa_excluida`), retornando o produto Inativo quando a empresa estiver inativa.
- [x] `DELETE /api/produtos/{id}/forcar` retorna 409 (`registro_nao_excluido`) se não estiver excluído; remove fisicamente (204) caso contrário.
- [x] `GET /api/produtos` retorna paginado (10/página) com filtros nome/status/excluídos e a empresa vinculada (resumo), sem N+1; por padrão sem excluídos.
- [x] Respostas padronizadas (Resource + `acoes_permitidas`); operar produto excluído revalida no servidor (409 `registro_excluido`).
- [x] Todos os testes de feature da 02 passam (`php artisan test`).
