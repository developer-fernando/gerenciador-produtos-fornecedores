# PRD — Empresas (API)

| Campo | Valor |
|---|---|
| **Status** | Aprovado (validação autônoma, rodada 3) |
| **Funcionalidade** | 01-empresas-api |
| **Spec relacionada** | [spec.md](./spec.md) · [validation.md](./validation.md) |

## 1. Contexto e problema

Com a fundação de dados pronta (funcionalidade 00), é preciso expor a **API REST de Empresas (Fornecedores)** para que o front-end possa cadastrar e manter fornecedores. Esta entrega implementa o back-end completo do domínio Empresa, incluindo as regras de status, exclusão lógica/restauração, exclusão física e as **cascatas disparadas por ações da empresa** sobre seus produtos.

## 2. Objetivo / resultado esperado

Uma API REST de Empresas funcional e consistente com as regras do sistema, com **validação server-side** e **respostas padronizadas**, cobrindo: criar, editar, listar (paginação + filtros), detalhar, inativar/reativar, excluir logicamente/restaurar e excluir definitivamente — respeitando as cascatas e os bloqueios definidos.

## 3. Escopo

**Dentro do escopo:**
- Endpoints REST de Empresa (listar, criar, detalhar, editar, inativar, reativar, excluir lógico, restaurar, forçar) conforme [docs/15](../../docs/15-contrato-api.md#endpoints--empresas).
- Validação server-side (Form Requests) de todos os campos de Empresa.
- **Cascatas disparadas pela empresa:** inativar → produtos inativos; excluir lógico → produtos excluídos (marcando `excluido_em_cascata`); restaurar → restaura apenas os produtos excluídos pela cascata; reativar → **não** reativa produtos.
- **Exclusão física** de empresa bloqueada havendo qualquer produto vinculado (inclusive excluídos logicamente).
- Listagem com **paginação (10/página)** e filtros por **nome, status e excluídos**.
- **Respostas padronizadas** (sucesso via Resource; erros de validação 422 e de regra de negócio 409/422).
- Testes de feature cobrindo as regras acima.

**Fora do escopo:**
- Endpoints e regras do **Produto** (criar/editar/reativar/restaurar/excluir produto individualmente) — funcionalidade 02.
- Qualquer parte de **front-end** — funcionalidades 03/04.
- Autenticação (fora de escopo do projeto).

## 4. Atores e fluxos de uso

Consumidor da API é o front-end (funcionalidade 03). Fluxos de uso e requisitos de interface correspondentes em [docs/05](../../docs/05-ux-e-interface.md) — em especial: ações exibidas somente quando permitidas (o back-end informa via `acoes_permitidas`) e aviso de impacto ao inativar.

## 5. Requisitos funcionais

Conforme [docs/04](../../docs/04-requisitos.md#empresa) e [docs/15](../../docs/15-contrato-api.md#endpoints--empresas):
- Criar empresa (validações completas).
- Editar empresa (mantendo unicidades, ignorando o próprio registro).
- Listar empresas com paginação e filtros (nome parcial/case-insensitive, status, excluídos).
- Detalhar empresa.
- Inativar e reativar empresa.
- Excluir logicamente e restaurar empresa.
- Excluir definitivamente empresa (quando permitido).

## 6. Regras de negócio aplicáveis

Origem em [docs/02-regras-de-negocio.md](../../docs/02-regras-de-negocio.md):
- **Validações de Empresa** (nome 3–150; CNPJ válido e único incl. excluídos; e-mail válido e único incl. excluídos; telefone com DDD; status Ativo/Inativo) — [docs/03 §Empresa](../../docs/03-modelagem.md#empresa-fornecedor) e [docs/02 §6](../../docs/02-regras-de-negocio.md#6-unicidade).
- **Inativar empresa** → todos os produtos ficam inativos (cascata) — [docs/02 §2](../../docs/02-regras-de-negocio.md#2-regras-de-uso-obrigatórias) / [§4](../../docs/02-regras-de-negocio.md#4-cascatas-e-consistência).
- **Reativar empresa** → produtos **não** são reativados — [docs/02 §4](../../docs/02-regras-de-negocio.md#4-cascatas-e-consistência).
- **Excluir empresa logicamente** → produtos excluídos em cascata (`excluido_em_cascata = true`) — [docs/02 §3.2](../../docs/02-regras-de-negocio.md#32-exclusão-lógica-soft-delete).
- **Restaurar empresa** → restaura apenas os produtos excluídos pela cascata; os excluídos individualmente permanecem — [docs/02 §4](../../docs/02-regras-de-negocio.md#4-cascatas-e-consistência).
- **Exclusão física de empresa** proibida havendo qualquer produto vinculado (mesmo excluído) — [docs/02 §3.3](../../docs/02-regras-de-negocio.md#33-exclusão-física-hard-delete).
- **Exclusão definitiva** só para registro já excluído logicamente + confirmação — [docs/02 §2](../../docs/02-regras-de-negocio.md#2-regras-de-uso-obrigatórias).
- **Listagens** não retornam excluídos por padrão; filtro de excluídos mostra **somente** excluídos — [docs/04 §Listagens](../../docs/04-requisitos.md#listagens-paginação-e-filtros).
- **Todas as operações em cascata são transacionais** (nenhum estado inconsistente) — [docs/02 §7](../../docs/02-regras-de-negocio.md#7-mecânicas-obrigatórias).

## 7. Requisitos não-funcionais relevantes

- **Validação server-side** obrigatória; mensagens em português, ao usuário, sem detalhes internos — [docs/11](../../docs/11-seguranca.md), [docs/03 §Validações](../../docs/03-modelagem.md#validações--princípios).
- **Padronização de respostas** e códigos HTTP — [docs/09 §Padronização](../../docs/09-arquitetura-backend.md#padronização-de-respostas), [docs/15 §Erros](../../docs/15-contrato-api.md#tratamento-de-erros--formatos-padronizados).
- **Performance:** eager loading para evitar N+1 nas listagens; paginação server-side — [docs/12](../../docs/12-performance.md).
- **Arquitetura:** Controllers finos, regras no Service, Form Requests, Resources — [docs/09](../../docs/09-arquitetura-backend.md).

## 8. Critérios de aceite

- [ ] `POST /api/empresas` cria empresa válida (201) e rejeita dados inválidos (422 com erro por campo).
- [ ] Unicidade de CNPJ e e-mail é barrada **inclusive** contra registros excluídos logicamente; na edição, ignora o próprio registro.
- [ ] CNPJ inválido (dígitos verificadores) é rejeitado.
- [ ] `PATCH /api/empresas/{id}/inativar` inativa a empresa **e** seus produtos; `reativar` **não** reativa os produtos.
- [ ] `DELETE /api/empresas/{id}` exclui logicamente a empresa e seus produtos (com `excluido_em_cascata = true`); `restaurar` traz de volta apenas esses produtos, mantendo excluídos os que já estavam excluídos individualmente.
- [ ] `DELETE /api/empresas/{id}/forcar` retorna **409** (`registro_nao_excluido`) se a empresa **não** estiver excluída logicamente, e **409** (`empresa_com_produtos_vinculados`) se houver qualquer produto vinculado (mesmo excluído); remove fisicamente **apenas** quando a empresa está excluída logicamente **e** sem produtos vinculados.
- [ ] `GET /api/empresas` retorna paginado (10/página), com filtros por nome (parcial), status e excluídos (somente excluídos); por padrão, não retorna excluídos.
- [ ] As respostas seguem o formato padronizado (Resource + `acoes_permitidas`; erros 422/409).
- [ ] Uma empresa excluída logicamente retorna `acoes_permitidas` com `inativar`/`reativar` = false; tentar inativar/reativar/editar uma empresa já excluída retorna **409** (servidor revalida).
- [ ] Os endpoints estão acessíveis (grupo de API registrado no `bootstrap/app.php`; não retornam 404 por rota ausente).
- [ ] Todos os testes de feature da 01 passam (`php artisan test`).
