# Arquitetura Geral

Visão da arquitetura da aplicação como um todo. Detalhes por camada em [09-arquitetura-backend.md](09-arquitetura-backend.md) e [10-arquitetura-frontend.md](10-arquitetura-frontend.md).

## Legenda de origem das decisões

- 🟩 **Requisito do desafio** — exigido pelo enunciado.
- 🟦 **Decisão de projeto** — escolha nossa, dentro do escopo; revisável.
- 🧭 **Boa prática / recomendação técnica** — validada por pesquisa de mercado.

> Diretriz transversal: **simplicidade e objetividade** — arquitetura adequada ao tamanho do projeto (2 entidades: Empresa e Produto), sem complexidade desnecessária.

## Forma geral

🟦 Aplicação dividida em **dois projetos independentes** no mesmo repositório:

```
backend/    → API REST em Laravel
frontend/   → SPA (Single Page Application) em React
```

🟦🧭 O **React (SPA)** consome o **Laravel (API REST)** via HTTP, trocando **JSON**. Os dois lados têm responsabilidades separadas:

| Camada | Responsabilidade |
|---|---|
| **Front-end (React)** | Interface, interação, estados de UI, validação de formulário (UX), consumo da API, exibição de erros. **Não** contém regra de negócio autoritativa. |
| **Back-end (Laravel)** | Fonte de verdade: regras de negócio, **validação server-side**, persistência, consistência (cascatas/transações), padronização de respostas. |

🟩 As **validações e regras são autoritativas no servidor** — validação apenas no front não é considerada válida. O front replica validações somente para melhorar a UX.

## Comunicação front ↔ back

- 🟦 **Protocolo:** HTTP + JSON, API REST.
- 🧭 **CORS:** a API habilita CORS (`config/cors.php`) apenas para a origem do front-end (ambiente de desenvolvimento), com os métodos e cabeçalhos necessários.
- 🟦 **Sem autenticação:** o desafio define que **autenticação não é necessária**; portanto não há login, tokens ou sessão. Ver [11-seguranca.md](11-seguranca.md) para o que isso implica e o que permanece como responsabilidade de segurança.
- 🧭 **Respostas padronizadas:** formato de resposta consistente para sucesso e erro, para que o front tenha um contrato previsível. Detalhe em [09-arquitetura-backend.md](09-arquitetura-backend.md#padronização-de-respostas).

## Fluxo de uma requisição (visão macro)

```
[React] axios → [Laravel] Route → Middleware → Controller → Form Request (validação)
                                       → Service (regra de negócio + transação)
                                       → Eloquent Model (dados)
                                       → API Resource (formata resposta)
        ← JSON padronizado ←───────────────────────────────────────────────
```

> O fluxo detalhado e a responsabilidade de cada camada estão em [09-arquitetura-backend.md](09-arquitetura-backend.md).

## Stack e ferramentas

| Item | Escolha | Origem |
|---|---|---|
| Back-end | **Laravel** | 🟩 |
| Front-end | **React** | 🟩 |
| Build front-end | **Vite** | 🧭 Padrão moderno para SPA React. |
| Linguagem front-end | **TypeScript** | 🟦🧭 Recomendado por tipagem/legibilidade (apoia o critério de qualidade); JavaScript seria aceitável. |
| Estado de servidor (front) | **TanStack Query (React Query)** | 🧭 Padrão atual para dados de API (cache, invalidação, loading/erro). Ver [10-arquitetura-frontend.md](10-arquitetura-frontend.md). |
| Cliente HTTP | **axios** | 🧭 Instância central com interceptors. |
| Banco de dados | **MySQL** (padrão); SQLite aceitável para execução local rápida | 🟦 A unicidade "incluindo excluídos" funciona em ambos. |
| Autenticação | **Nenhuma** | 🟩 Fora de escopo. |

## Como o material de referência do Sênior foi tratado

As orientações do dev Sênior ([references/](../references/)) foram avaliadas à luz do escopo. Resumo do que foi **adotado**, **adaptado** ou **não adotado** (detalhes nos documentos de cada camada):

| Recomendação do Sênior | Tratamento neste projeto |
|---|---|
| Camada **Service** (trabalho fora do banco) | **Adotada** — concentra regras de negócio, cascatas e transações. |
| Camada **Repository** (acesso a dados) | **Não adotada** — decisão de projeto: usar **Eloquent direto no Service**. Para 2 entidades, um Repository sobre o Eloquent seria over-engineering (validado na pesquisa). |
| **DTO** para padronizar todo objeto | **Adaptado** — padronização feita por **Form Requests** (entrada) e **API Resources** (saída), sem uma camada de DTO dedicada. |
| **Controllers finos** que só orquestram | **Adotada** — coincide com boa prática de mercado. |
| Segurança com **JWT/sessão/Middleware de auth (401/403)** | **Não adotada** — autenticação está fora de escopo (🟩). **Adotado o princípio** de respostas de erro padronizadas. Ver [11-seguranca.md](11-seguranca.md). |
| Performance: **índices, PK/FK, paginação, atenção ao Lazy Loading** | **Adotada** — ver [12-performance.md](12-performance.md). |

> Detalhamento das justificativas em cada documento específico.
