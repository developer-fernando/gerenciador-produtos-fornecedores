# Arquitetura do Front-end (React)

Como o React será organizado. Requisitos de UX/interface em [05-ux-e-interface.md](05-ux-e-interface.md). Legenda em [08-arquitetura-geral.md](08-arquitetura-geral.md#legenda-de-origem-das-decisões).

## Base

- 🟩 **React** como front-end. 🧭 **Vite** como build; 🟦🧭 **TypeScript** para tipagem.
- 🟩 Estrutura organizada de pastas e **separação de componentes**.
- 🟩 Consumo adequado da API; tratamento de erros e estados de loading; validação no formulário.

## Organização de pastas — feature-based

🧭 Arquitetura **por funcionalidade** (feature-based), padrão atual para apps que crescem por domínio, com **profundidade rasa** (máx. 2–3 níveis).

```
frontend/src/
├── app/            → providers (QueryClient, Router), definição de rotas
├── lib/            → cliente axios, configuração, queryClient, helpers de erro
├── features/
│   ├── empresas/   → components/, hooks/ (useEmpresas, useEmpresaMutations), api.ts, types.ts
│   └── produtos/   → components/, hooks/, api.ts, types.ts
├── shared/         → componentes de UI reutilizáveis (Table, Modal, StatusBadge, ConfirmDialog,
│                     FormField), formatadores (cnpj, telefone, preço), constantes
└── styles/         → estilos globais e tema (paleta Horizon)
```

🟦 Cada feature encapsula seus componentes, hooks e chamadas de API do próprio domínio; o que é comum vai para `shared/`.

## Comunicação com a API

🧭🟦
- **Cliente HTTP central:** instância axios em `lib/` com `baseURL` vinda de variável de ambiente (ex.: `VITE_API_URL`) e **interceptors** que **normalizam os erros** da API (422/409/404/500) num formato único para a UI, e extraem os erros por campo para os formulários.
- **Sem credenciais/token:** não há autenticação; o cliente não envia cabeçalho de auth.
- **Contrato previsível:** o front consome o formato padronizado definido em [09-arquitetura-backend.md](09-arquitetura-backend.md#padronização-de-respostas).

## Gerenciamento de estado

🧭🟦 Separar o estado por natureza:

| Tipo de estado | Ferramenta | Uso |
|---|---|---|
| **Estado de servidor** (dados da API) | **TanStack Query (React Query)** | Listagens, detalhes, cache, `loading`/`error`, paginação, e **invalidação após mutações** — é o que garante a listagem refletir o novo estado **sem reload manual** (🟩 requisito de UX). |
| **Estado de UI local** | `useState`/`useReducer` | Abertura de modais, formulário, filtros selecionados. |
| **Estado compartilhado leve** | React Context | Só se necessário (ex.: tema, toasts). |

🟦 **Não** usar Redux — desnecessário para o escopo; TanStack Query cobre o estado de servidor com muito menos boilerplate.

### Padrão de mutação (ciclo de vida)
🧭 Cada ação (criar, editar, inativar, excluir, restaurar, excluir definitivamente) é uma **mutation** que, ao concluir, **invalida** as queries de listagem afetadas → a UI atualiza sozinha. Erros da mutation são exibidos como feedback (toast) ou mapeados para os campos do formulário.

## Componentização e reutilização

🧭
- Componentes **pequenos e focados**; lógica de dados em **hooks** por feature (`useEmpresas`, `useProdutos`).
- Componentes compartilhados em `shared/`: tabela com paginação, badge de status (Ativo/Inativo/Excluído), diálogo de confirmação, campos de formulário com exibição de erro.
- 🟩 **Ações condicionais:** os botões por registro (editar, inativar, reativar, excluir, restaurar, excluir definitivamente) aparecem **somente quando permitidos** — a UI decide a partir do estado do registro retornado pela API, nunca oferecendo ação que a regra recusaria.
- 🟩 **Seletor de empresa** no cadastro de produto exibe **apenas empresas aptas** (ativas e não excluídas).

## Tratamento de erros e estados

🟩
- Estados de **loading, vazio e erro** tratados em todas as listagens (TanStack Query fornece `isLoading`/`isError`).
- **Feedback visual** para sucesso e erro de cada ação.
- **Validação de formulário:** erros apontados no campo correspondente; erros de regra de negócio (vindos do back) exibidos em linguagem compreensível.
- **Confirmações** antes de excluir, com aviso de irreversibilidade na exclusão definitiva; **aviso de impacto** ao inativar empresa.

## Identidade visual

🟩 Aplicar a paleta e o logotipo Horizon conforme [05-ux-e-interface.md](05-ux-e-interface.md) (amarelo como ação, texto preto sobre amarelo, logo no cabeçalho sem distorção). Tema centralizado em `styles/`.
