# PRD — Front: base + Empresas

| Campo | Valor |
|---|---|
| **Status** | Concluído (implementação validada; manuais restantes no validation.md) |
| **Funcionalidade** | 04-front-base-empresas |
| **Spec relacionada** | [spec.md](./spec.md) · [validation.md](./validation.md) |

## 1. Contexto e problema

O back-end está concluído e endurecido (features 00–03): API REST de Empresas e Produtos, contrato padronizado, erros sem vazamento e CORS restrito. Falta a interface. Esta é a **primeira entrega de front-end**: além das telas de Empresas, ela estabelece a **fundação da SPA** (shell, cliente HTTP, cache de servidor, roteamento, tema/identidade e componentes compartilhados) que a feature 05 (Produtos) reutiliza.

## 2. Objetivo / resultado esperado

Uma SPA React funcional, servida pelo Docker existente, que:
- Consome a API real de Empresas (`/api/empresas`) com **paginação, filtros e ações de ciclo de vida**.
- Trata **loading, vazio e erro** em todas as listagens e dá **feedback visual** a cada ação.
- Exibe **somente as ações permitidas** por registro (a partir de `acoes_permitidas` do servidor) e **avisa o impacto** ao inativar e a **irreversibilidade** ao excluir definitivamente.
- Aplica a **identidade visual Horizon** (paleta, logo no cabeçalho, contraste e foco de teclado visível), com layout **responsivo**.
- Após qualquer ação, a listagem **reflete o novo estado sem recarregar a página** (invalidação de cache).

## 3. Escopo

**Dentro do escopo:**
- **Fundação da SPA:** providers (QueryClient + Router), definição de rotas, layout com cabeçalho (logo Horizon), tema centralizado (paleta), limpeza do boilerplate do Vite.
- **Camada de API/erros:** instância axios central com `baseURL` de `VITE_API_URL` e interceptors que **normalizam** os erros (422/409/404/500) para um formato único e extraem erros por campo.
- **Componentes compartilhados:** tabela com paginação, badge de status (Ativo/Inativo/Excluído), diálogo de confirmação, modal, campo de formulário com erro, feedback (toast); formatadores (CNPJ, telefone, preço).
- **Empresas — telas completas:** listagem (paginação server-side 10/pág, filtro por nome, por status e de excluídos), criar/editar (validação por campo + mapeamento de erros do servidor), e ações de ciclo de vida (inativar com aviso de impacto, reativar, excluir logicamente, restaurar, excluir definitivamente com confirmação de irreversibilidade).

**Fora do escopo:**
- Telas de **Produtos** (feature 05), incluindo o seletor de empresa apta.
- Autenticação (não há no projeto), temas alternativos, i18n, qualquer filtro/coluna não exigido (ex.: filtro de produtos por empresa).
- Alterações no back-end.

## 4. Atores e fluxos de uso

Usuário operador da aplicação (sem login). Fluxos exigidos em [docs/05 §Fluxos de uso](../../docs/05-ux-e-interface.md#fluxos-de-uso-exigidos) que incidem aqui:
- Listar empresas com paginação e filtros (nome, status, excluídos por filtro explícito).
- Criar/editar empresa com validação de formulário.
- Inativar empresa **informando o impacto** nos produtos vinculados.
- Excluir com **confirmação** e aviso de **irreversibilidade** na exclusão definitiva.
- Após cada ação, a lista reflete o novo estado **sem reload manual**.

## 5. Requisitos funcionais

Referência: [docs/04 §Empresa](../../docs/04-requisitos.md#empresa) e [§Listagens](../../docs/04-requisitos.md#listagens-paginação-e-filtros).
- Listagem paginada (10/pág, server-side) com filtro por nome (parcial, case-insensitive), por status (Ativo/Inativo) e de excluídos (apenas por filtro explícito; sem o filtro, não exibe excluídos).
- Criar e editar empresa (nome, CNPJ, e-mail, telefone, status), com validação exibida **no campo** e erros de regra de negócio em **linguagem compreensível**.
- Ações por registro conforme `acoes_permitidas`: editar, inativar, reativar, excluir, restaurar, excluir definitivamente — **exibidas somente quando permitidas**.
- Exibir `produtos_count` e a distinção visual entre Ativo, Inativo e Excluído.
- Estados de **loading, vazio e erro** e **feedback** de sucesso/erro por ação.

## 6. Regras de negócio aplicáveis

A UI **não** é autoridade: apenas reflete o estado e o `acoes_permitidas` retornados; o servidor revalida. Regras que a UI deve respeitar visualmente:
- **Nunca oferecer ação que a regra recusaria** — [docs/05 §Princípio geral](../../docs/05-ux-e-interface.md#princípio-geral); base em `acoes_permitidas` — [docs/15 §Derivação](../../docs/15-contrato-api.md#derivação-de-acoes_permitidas).
- **Distinção inativar × excluir** evidente — [docs/05](../../docs/05-ux-e-interface.md#princípio-geral).
- **Aviso de impacto ao inativar** (cascata nos produtos) — [docs/02 §4](../../docs/02-regras-de-negocio.md#4-cascatas-e-consistência) via [docs/05 §4](../../docs/05-ux-e-interface.md#fluxos-de-uso-exigidos).
- **Confirmação + irreversibilidade** na exclusão definitiva — [docs/05 §5](../../docs/05-ux-e-interface.md#fluxos-de-uso-exigidos).
- **Unicidades e validações** de entrada refletidas por UX, mas autoritativas no servidor — [docs/03 §Validações](../../docs/03-modelagem.md#validações--princípios).

## 7. Requisitos não-funcionais relevantes

- **Usabilidade/acessibilidade:** contraste e legibilidade adequados, **foco de teclado visível**, responsividade — [docs/05 §Requisitos de interface](../../docs/05-ux-e-interface.md#requisitos-de-interface).
- **Identidade visual Horizon:** paleta oficial, logo no cabeçalho sem distorção/recoloração, texto preto sobre amarelo — [docs/05 §Identidade](../../docs/05-ux-e-interface.md#identidade-visual-horizon).
- **Segurança de front:** sem segredos no bundle; React escapa saída por padrão (evitar `dangerouslySetInnerHTML`) — [docs/11 §Front-end](../../docs/11-seguranca.md#front-end-react).
- **Estado de servidor** via TanStack Query, com **invalidação** após mutações — [docs/10 §Estado](../../docs/10-arquitetura-frontend.md#gerenciamento-de-estado).

## 8. Critérios de aceite

- [x] `GET /api/empresas` é consumido: a listagem mostra dados paginados (10/pág) e navega entre páginas.
- [x] Filtro por nome (parcial), por status e de excluídos funcionam e podem ser combinados; sem o filtro de excluídos, nenhum registro excluído aparece.
- [x] Criar empresa: erros de validação do servidor (422) aparecem **no campo** correspondente; sucesso fecha o formulário e a lista reflete o novo registro **sem reload**.
- [x] Editar empresa mantém as unicidades (o back ignora o próprio registro); erros mapeados por campo.
- [x] Cada linha exibe **apenas** as ações de `acoes_permitidas` (ex.: empresa ativa não mostra "reativar"; empresa não excluída não mostra "restaurar").
- [x] Inativar empresa mostra **aviso do impacto** nos produtos antes de confirmar.
- [x] Excluir definitivamente exige **confirmação** com aviso de **irreversibilidade**; um 409 (`empresa_com_produtos_vinculados`) é exibido em linguagem compreensível.
- [x] Estados de **loading, vazio e erro** são tratados na listagem; toda ação dá **feedback** (sucesso/erro).
- [x] Identidade visual e layout responsivo aplicados (verificados no navegador); logo real e foco de teclado ficam na verificação manual do `validation.md`.
- [x] `npm run build` (tsc + vite) e `npm run test` (Vitest, 39) verdes; `npm run lint` sem erros.
