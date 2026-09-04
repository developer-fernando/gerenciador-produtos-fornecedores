# PRD — Front: Produtos

| Campo | Valor |
|---|---|
| **Status** | Aprovado (validação estática — pronto para implementar) |
| **Funcionalidade** | 05-front-produtos |
| **Spec relacionada** | [spec.md](./spec.md) · [validation.md](./validation.md) |

## 1. Contexto e problema

Com o backend completo e o front de Empresas pronto e integrado (feature 04), falta a segunda metade da interface: as **telas de Produtos**. Um produto pertence a uma empresa e só pode ser vinculado a uma empresa **apta** (ativa e não excluída). Esta feature entrega o CRUD de Produtos com seu ciclo de vida, o **seletor de empresa apta** no formulário, e a **navegação** entre as áreas de Empresas e Produtos (que ainda não existe). Reaproveita toda a base do front (cliente HTTP, tratamento de erros, componentes compartilhados, TanStack Query, formatadores).

## 2. Objetivo / resultado esperado

Uma área de Produtos funcional, consumindo a API real (`/api/produtos`), que:
- Lista produtos com **paginação, filtros** (nome, status, excluídos) e estados de loading/vazio/erro.
- Permite **criar/editar** produto com validação por campo, exibindo o **preço formatado** e oferecendo no formulário **apenas empresas aptas** para vínculo.
- Exibe **somente as ações permitidas** por registro (via `acoes_permitidas`), com confirmações e avisos, tratando as regras do lado do produto (reativar/restaurar exigem empresa apta/não excluída).
- Após qualquer ação, a lista reflete o novo estado **sem reload**.
- Oferece **navegação** clara entre Empresas e Produtos.

## 3. Escopo

**Dentro do escopo:**
- **Navegação** entre Empresas e Produtos (no cabeçalho/layout) + rota `/produtos`.
- **Camada de dados de Produtos**: tipos, cliente de API, hooks (query + mutações com invalidação) e um hook de **empresas aptas** para o seletor (`GET /api/empresas?status=Ativo`).
- **Listagem de Produtos**: paginação (10/pág), filtros (nome, status, excluídos), estados, badge de status, **empresa vinculada** e **preço formatado (BRL)** por linha.
- **Formulário criar/editar**: seletor de empresa apta, `nome`, `descricao`, `preco`, `codigo_interno`, `status`; validação por campo + mapeamento de 422; na edição, permitir **trocar o vínculo** para outra empresa apta.
- **Ações de ciclo de vida**: inativar, reativar, excluir (lógica), restaurar, excluir definitivamente — condicionais por `acoes_permitidas`, com confirmações/avisos e tratamento de 409/422 (ex.: restaurar com empresa excluída → 409).

**Fora do escopo:**
- Alterações no backend; qualquer entidade/tela não especificada.
- **Filtro de produtos por empresa** (fora de escopo — [docs/04](../../docs/04-requisitos.md#listagens-paginação-e-filtros)).
- Tela de detalhe dedicada de produto.

## 4. Atores e fluxos de uso

Usuário operador (sem login). Fluxos exigidos em [docs/05 §Fluxos](../../docs/05-ux-e-interface.md#fluxos-de-uso-exigidos) que incidem aqui:
- **Cadastro de produto:** o seletor de empresa oferece **apenas empresas aptas** (ativas e não excluídas).
- Ações por registro exibidas **somente quando permitidas**.
- **Confirmação antes de excluir**, com aviso de **irreversibilidade** na exclusão definitiva.
- Após cada ação, a listagem reflete o novo estado **sem reload**.

## 5. Requisitos funcionais

Referência: [docs/04 §Produto](../../docs/04-requisitos.md#produto).
- Listagem paginada (10/pág) com filtro por nome (parcial), status (Ativo/Inativo) e de excluídos (só por filtro explícito).
- Criar/editar produto com validação por campo; **empresa apta obrigatória**; erros de regra de negócio em linguagem compreensível.
- Ações conforme `acoes_permitidas`: editar, inativar, reativar, excluir, restaurar, excluir definitivamente — exibidas só quando permitidas.
- Exibir a **empresa vinculada** e o **preço** formatado; distinção visual Ativo/Inativo/Excluído.
- Estados de loading/vazio/erro e **feedback** por ação.

## 6. Regras de negócio aplicáveis

A UI reflete o estado e o `acoes_permitidas`; o **servidor revalida** (a UI não é autoridade).
- **Vínculo só com empresa apta** (criar/editar/reativar) — [docs/02 §5](../../docs/02-regras-de-negocio.md#5-regras-por-operação-sobre-produto). O seletor mostra só empresas aptas — [docs/05 §Fluxos 2](../../docs/05-ux-e-interface.md#fluxos-de-uso-exigidos).
- **Editar** exige empresa apta; **trocar o vínculo** só para empresa apta (revalida unicidade do código interno na destino) — [docs/02 §5](../../docs/02-regras-de-negocio.md#5-regras-por-operação-sobre-produto).
- **Restaurar** só se a empresa não estiver excluída (senão 409 `empresa_excluida`); pode voltar como Inativo — [docs/02 §5](../../docs/02-regras-de-negocio.md#5-regras-por-operação-sobre-produto).
- **Excluir definitivamente** só se já excluído logicamente + confirmação — [docs/02 §5](../../docs/02-regras-de-negocio.md#5-regras-por-operação-sobre-produto).
- **Ações condicionais** por `acoes_permitidas` (editar/reativar exigem empresa apta) — [docs/15 §Derivação](../../docs/15-contrato-api.md#derivação-de-acoes_permitidas).
- **Não conflar Status × Exclusão** (item eliminatório) — o badge segue a mesma precedência da feature 04 — [docs/02 §1](../../docs/02-regras-de-negocio.md#1-as-duas-dimensões-status--exclusão-lógica).

## 7. Requisitos não-funcionais relevantes

- Usabilidade/acessibilidade (foco de teclado visível, responsivo), identidade Horizon — [docs/05](../../docs/05-ux-e-interface.md#requisitos-de-interface). Reaproveita o tema e os componentes da feature 04.
- Estado de servidor via TanStack Query com **invalidação** após mutações — [docs/10 §Estado](../../docs/10-arquitetura-frontend.md#gerenciamento-de-estado).
- Performance: `empresa` vem por eager loading no recurso de produto (sem N+1) — o front só consome — [docs/12](../../docs/12-performance.md).

## 8. Critérios de aceite

- [ ] `GET /api/produtos` é consumido: listagem paginada (10/pág), com navegação entre páginas.
- [ ] Filtros por nome, status e excluídos funcionam e combinam; sem o filtro de excluídos, nenhum excluído aparece.
- [ ] O formulário de produto oferece **apenas empresas aptas** no seletor (via `GET /api/empresas?status=Ativo`).
- [ ] Criar produto: erros 422 aparecem **no campo** (ex.: `codigo_interno`, `preco`); sucesso fecha o form e a lista reflete sem reload.
- [ ] Editar permite **trocar a empresa** para outra apta; erros mapeados por campo.
- [ ] Cada linha exibe **apenas** as ações de `acoes_permitidas`; a **empresa vinculada** e o **preço formatado** aparecem.
- [ ] Excluir definitivamente exige **confirmação** com aviso de irreversibilidade; um 409 (ex.: restaurar com `empresa_excluida`) é exibido em linguagem compreensível.
- [ ] Há **navegação** entre Empresas e Produtos; estados de loading/vazio/erro e **feedback** por ação.
- [ ] `npm run build`, `npm run test` (Vitest) e `npm run lint` verdes.
