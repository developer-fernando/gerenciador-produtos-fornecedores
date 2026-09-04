# AGENTS.md — Guia de Desenvolvimento Assistido por IA

Guia central para qualquer IA (ou pessoa) que trabalhe neste projeto. Consolida contexto, arquitetura, regras e decisões já definidas. **Leia este arquivo antes de qualquer alteração.**

A documentação completa vive em [`docs/`](docs/README.md) e é a **fonte de verdade**; este arquivo resume o essencial e aponta para o detalhe. Decisões de arquitetura, segurança e performance estão em [`docs/08`](docs/08-arquitetura-geral.md)–[`12`](docs/12-performance.md).

**Legenda:** 🟩 requisito do desafio · 🟦 decisão de projeto · 🧭 boa prática/recomendação técnica · ⚠️ fora de escopo.

---

## 0. Continuidade — comece aqui

> Esta seção existe para que **qualquer LLM ou ferramenta** (não só a que iniciou o projeto) consiga assumir o desenvolvimento **sem perder contexto, organização ou padrão**. A fonte da verdade é o **repositório** (markdown + git), nunca uma conversa específica.

**Se você está assumindo o projeto agora, leia nesta ordem:**

1. [`ESTADO.md`](ESTADO.md) — estado vivo: fase atual, feature em andamento, **próximo passo**, progresso.
2. **Este `AGENTS.md`** — constituição: contexto, stack, arquitetura, regras e este protocolo.
3. [`docs/README.md`](docs/README.md) — índice da **fonte de verdade** (regras, modelagem, contrato de API). Ler sob demanda.
4. [`specs/README.md`](specs/README.md) — a **mecânica de execução** (PRD + Spec + validação autônoma + tickets).
5. A **spec da feature atual/próxima** (indicada no `ESTADO.md`), em `specs/NN-.../spec.md`.

**Como retomar o trabalho:**
- Siga o **"Próximo passo"** do [`ESTADO.md`](ESTADO.md) e continue pelo **próximo ticket não marcado** da spec correspondente.
- Respeite o fluxo: **PRD → Spec → validação autônoma → implementação → validação executável** ([specs/README.md](specs/README.md#fluxo-de-trabalho)).
- **Commit por ticket**, referenciando o ID no final (ex.: `feat(...): ... [05-T2]`).
- Rode o **portão de validação** antes de concluir (ver §8.1 e specs/README).

**Regra de atualização de estado (obrigatória):** ao concluir **cada ticket**, no **mesmo commit**, atualize:
- [`ESTADO.md`](ESTADO.md) (snapshot + próximo passo + progresso),
- o **checkbox** do ticket na `spec.md`,
- o `validation.md` quando aplicável.

Assim o estado **nunca vive apenas numa conversa** — a próxima LLM o encontra no repositório.

**Fonte única da verdade (hierarquia, em caso de divergência):** `docs/` > `AGENTS.md` > `specs/` > `ESTADO.md` > histórico git (event-log dos commits `[NN-TX]`).

---

## 1. Contexto e objetivo

- **Projeto:** Sistema de Gerenciamento de **Produtos e Fornecedores** (Empresas). Teste técnico Horizon — Full Stack Pleno.
- **Objetivo:** cadastrar e manter **Empresas (Fornecedores)** e seus **Produtos**, com ciclo de vida controlado: criação, edição, **status (Ativo/Inativo)**, **exclusão lógica com restauração** e **exclusão física quando permitida**.
- **Entrega:** repositório GitHub com `backend/` (Laravel) + `frontend/` (React) e **README detalhado** (como rodar + estrutura). Prazo: 1 dia corrido.
- **Escopo:** apenas as entidades **Empresa** e **Produto**. Ver [docs/01-visao-geral.md](docs/01-visao-geral.md).
- ⚠️ **Fora de escopo:** autenticação (o desafio dispensa), qualquer entidade/funcionalidade não especificada, metas de performance/escalabilidade e testes automatizados (não exigidos). **Regra: se não está no escopo, não se implementa.**

## 2. Stack

| Camada | Tecnologia | Origem |
|---|---|---|
| Back-end | **Laravel** (API REST) | 🟩 |
| Front-end | **React** + **Vite** + **TypeScript** | 🟩 / 🧭 |
| Estado de servidor (front) | **TanStack Query (React Query)** | 🧭 |
| Cliente HTTP | **axios** (instância central) | 🧭 |
| Banco de dados | **MySQL** (SQLite aceitável p/ rodar local) | 🟦 |
| ORM / persistência | **Eloquent** + migrations nativas (sem Repository/Doctrine) | 🟦 |
| Testes back-end | **Pest** (sobre PHPUnit) + Factories + RefreshDatabase | 🟦 |
| Testes front-end | **Vitest** + React Testing Library + user-event + MSW | 🟦 |
| Ambiente | **Docker** (docker-compose: backend + frontend + db) | 🟦 |
| Autenticação | **Nenhuma** | 🟩 (fora de escopo) |
| Idioma | Português (UI, mensagens, docs) · Moeda: **R$** | 🟦 |

## 3. Arquitetura

Dois projetos separados no mesmo repositório; **React (SPA)** consome **Laravel (API REST)** via HTTP/JSON. Detalhe em [docs/08-arquitetura-geral.md](docs/08-arquitetura-geral.md).

- **Back-end é a fonte de verdade:** regras de negócio e **validação server-side** são autoritativas. O front valida só para UX. 🟩
- **Comunicação:** REST/JSON, **CORS** restrito à origem do front, **respostas padronizadas** (contrato previsível). Contrato completo em [docs/15-contrato-api.md](docs/15-contrato-api.md).
- **Camadas Laravel (fluxo):**
  `Route → Controller (fino) → Form Request (validação) → Service (regra + transação) → Eloquent Model → API Resource (saída) → JSON`
- **Responsabilidades:**
  - **Controller:** orquestra, ~3–5 linhas; não valida, não faz query, não contém regra.
  - **Form Request:** validação de entrada (server-side).
  - **Service:** regras de negócio, **cascatas** e **transações** (`DB::transaction`).
  - **Model (Eloquent):** dados, relacionamentos, `SoftDeletes`.
  - **API Resource:** formata a resposta JSON.
  - **Exceções:** `bootstrap/app.php` (`withExceptions`) converte exceções em erros padronizados; `RegraDeNegocioException` para conflito de regra (409).
- **Princípios a respeitar:** separação de responsabilidades; controllers finos; regra de negócio no Service; **consistência transacional**; **simplicidade** (sem over-engineering).

Detalhes: [docs/09-arquitetura-backend.md](docs/09-arquitetura-backend.md) · [docs/10-arquitetura-frontend.md](docs/10-arquitetura-frontend.md).

## 4. Estrutura do projeto

### Decisão sobre camadas (importante)
🟦 **Não há camada Repository** — o **Eloquent é a camada de dados**, usado diretamente pelo Service (decisão tomada para o escopo de 2 entidades; Repository seria over-engineering). 🟦 **Não há camada de DTO dedicada** — a padronização de objetos é feita por **Form Requests** (entrada) e **API Resources** (saída). *(As referências do Sênior citam Repository e DTO; foram adaptadas — ver [docs/08](docs/08-arquitetura-geral.md#como-o-material-de-referência-do-sênior-foi-tratado).)*

### Back-end (Laravel)
```
backend/app/
├── Http/
│   ├── Controllers/Api/   → EmpresaController, ProdutoController (finos)
│   ├── Requests/          → Store/Update Empresa e Produto Requests
│   └── Resources/         → EmpresaResource, ProdutoResource
├── Services/              → EmpresaService, ProdutoService (regras + cascatas)
├── Models/                → Empresa, Produto
└── Exceptions/            → RegraDeNegocioException
bootstrap/app.php          → withExceptions (404/500 padronizados)
database/migrations/       → empresas, produtos (índices + soft delete)
routes/api.php · config/cors.php
```

### Front-end (React) — feature-based, profundidade rasa
```
frontend/src/
├── app/       → Header (logo), providers (QueryClient, Router), rotas
├── assets/    → horizon-logo.jpg
├── lib/       → cliente axios, queryClient, helpers de erro
├── features/
│   ├── empresas/  → components/, hooks/, api.ts, types.ts
│   └── produtos/  → components/, hooks/, api.ts, types.ts
├── shared/    → Table, FiltrosBar, Modal, StatusBadge, ConfirmDialog, FormField, icons.tsx, formatadores
└── styles/    → tema/paleta Horizon
```

### Ambiente (Docker)
🟦 `docker-compose.yml` na raiz orquestra **db** (MySQL 8), **backend** (Laravel 13 / PHP 8.4 / `artisan serve`, porta 8000) e **frontend** (React 19 / Node 22 / Vite 8, porta 5173). Clone-and-run: `cp .env.example .env && docker compose up --build`. Detalhe em [docs/16-ambiente-docker.md](docs/16-ambiente-docker.md).

## 5. Regras de desenvolvimento

- **Simplicidade e objetividade** — solução adequada ao escopo; evitar complexidade desnecessária. 🟦
- **Separação de responsabilidades** — cada camada faz o seu papel (seção 3).
- **Clean Code**, boa nomenclatura, **commits organizados**. 🟩
- **Não inventar** requisitos, regras ou funcionalidades; **não implementar fora do escopo**. 🟩
- **Consistência** — código novo deve seguir os padrões do restante do projeto.
- **Validação sempre no servidor**; front replica para UX. 🟩
- **Mensagens ao usuário** em português, sem jargão nem detalhes internos. 🟩
- **Termos de domínio** em português (Empresa, Produto), seguindo convenções do framework.

## 6. Segurança

Ver [docs/11-seguranca.md](docs/11-seguranca.md). Autenticação **fora de escopo** (sem login/JWT/401/403). Permanecem obrigatórios:

- **Validação server-side** (eliminatório se ausente). 🟩
- **Sem credenciais no repositório** — `.env` fora do versionamento, apenas `.env.example` (eliminatório). 🟩
- **Erros sem detalhes internos**; mensagens ao usuário. 🟩
- **SQL Injection:** usar Eloquent/bindings, nunca concatenar entrada. 🧭
- **Mass assignment:** definir `$fillable`. 🧭
- **CORS** restrito à origem do front. 🧭
- **Front:** React escapa saída por padrão (evitar `dangerouslySetInnerHTML`); nenhum segredo no bundle. 🧭
- **Consistência de dados** como segurança: transações nas cascatas, integridade referencial, regras de exclusão aplicadas no servidor.

## 7. Performance

Ver [docs/12-performance.md](docs/12-performance.md). Boas práticas com bom senso (sem otimização prematura):

- **Índices** em `empresa_id`, colunas de unicidade (`cnpj`, `email`, `(empresa_id, codigo_interno)`) e de filtro (`status`, `deleted_at`, `nome`). 🧭
- **Relacionamentos** por PK/FK; produto → empresa via `empresa_id`. 🧭
- **Evitar N+1:** usar **eager loading** (`with`, `withCount`); cuidado ao tocar relacionamentos dentro de API Resources em listas. 🧭
- **Paginação server-side, 10 itens** (`paginate()` → `limit`/`offset`). 🟩🟦
- **ORM/Lazy Loading:** ao escrever consultas, verificar como os relacionamentos são carregados para evitar N+1.
- **Front:** cache/invalidização com TanStack Query; buscar só a página atual.
- ⚠️ Fora de escopo: Redis, filas, tuning avançado.

## 7.1. Persistência e testes

**Persistência** ([docs/13](docs/13-persistencia-e-banco.md)): Eloquent (Query Builder pontual); MySQL (schema portável, SQLite como fallback); migrations nativas versionadas (`empresas`, `produtos`) com FK, índices, `softDeletes()` e a coluna `produtos.excluido_em_cascata` (regra 6); factories + seeders.

**Testes** ([docs/14](docs/14-estrategia-de-testes.md)) — mínimos, porém significativos:
- **Back (Pest):** Feature tests dos endpoints + regras críticas (produto exige empresa apta; cascatas de inativação/exclusão/restauração; bloqueio de exclusão física; unicidade incluindo excluídos; validações 422; paginação; filtro de excluídos). `php artisan test`.
- **Front (Vitest + RTL):** formulários (erros por campo), seletor de empresa apta, ações condicionais por registro, confirmações/avisos, estados loading/vazio/erro. `npm run test`.
- Testar comportamento (não implementação); dados reprodutíveis (factories/RefreshDatabase; MSW no front).

## 8. Critérios e requisitos do desafio

Ver [docs/07-criterios-de-avaliacao.md](docs/07-criterios-de-avaliacao.md). Pesos (total 100):

| Peso | Critério |
|:---:|---|
| **30** | Regras de uso, status e exclusão lógica (consistência dos dados). |
| **25** | Validações e tratamento de erros. |
| **25** | Arquitetura e qualidade de código. |
| **20** | Fluxo de uso e UI/UX. |

**Itens eliminatórios:** produto sem empresa; empresa com produtos excluída fisicamente; exclusão lógica ausente ou usada como substituto do status; ausência de validação no servidor; credenciais reais no repositório; ausência de README.

**Regras de negócio críticas** (detalhe em [docs/02-regras-de-negocio.md](docs/02-regras-de-negocio.md)):
- Produto **sempre** vinculado a empresa **ativa e não excluída** (criar/editar/reativar).
- Inativar empresa → produtos inativos (cascata); **reativar não** reativa produtos.
- Excluir empresa logicamente → produtos excluídos (cascata); restaurar empresa → volta só o que caiu **pela cascata** (rastrear origem da exclusão — regra 6).
- **Exclusão física de empresa proibida** se houver qualquer produto vinculado (mesmo excluído).
- **Exclusão definitiva** só de registros já excluídos logicamente + confirmação.
- Listagens **não** retornam excluídos por padrão; filtro de excluídos mostra **somente** excluídos.
- **Unicidade incluindo excluídos:** CNPJ (🟩), email e código interno por empresa (🟦). Na edição, ignorar o próprio registro.
- **Status × exclusão lógica** são dimensões **independentes** — nunca confundir.

Campos e validações: [docs/03-modelagem.md](docs/03-modelagem.md).

## 8.1. Execução via PRD + Specs

A implementação é organizada em funcionalidades pequenas e rastreáveis em [`specs/`](specs/README.md): cada funcionalidade tem um **PRD** (o quê/por quê) e uma **Spec** (o como + **tickets**). As specs referenciam `docs/` e este guia — não recopiam. Commits referenciam o ticket (ex.: `[01-T3]`). Antes de implementar uma funcionalidade, consultar/atualizar sua Spec.

Cada PRD/Spec passa por **validação autônoma** antes da implementação: uma **verificação independente em contexto novo** (uma sessão/chat separada, de preferência outro modelo — um subagente é *uma* forma de fazer isso, não a única) audita os artefatos por rubrica e evidência; só avança com **zero findings bloqueantes**, registrados em `specs/NN-.../validation.md`. A camada executável (testes/migrations) valida a conclusão. A participação humana fica restrita a testes manuais específicos. Ver [`specs/README.md`](specs/README.md#validação-autônoma-de-prdspec).

## 9. Diretrizes para utilização de IA

Antes de alterar qualquer coisa, a IA deve:

1. **Ler e respeitar este `AGENTS.md`** e a `docs/` correspondente ao que for mexer.
2. **Seguir a arquitetura definida** (seções 3 e 4) e os padrões existentes.
3. **Não modificar decisões arquiteturais** sem justificativa explícita e registro na `docs/`.
4. **Pesquisar na web** quando houver dúvida técnica relevante (Laravel, React, libs, versões, boas práticas), **priorizando documentação oficial** e boas práticas atuais — não decidir por suposição.
5. **Não inventar** requisitos, regras ou entidades; **não implementar fora do escopo**.
6. **Diferenciar as fontes** ao registrar decisões: 🟩 desafio · 🟦 decisão · 🧭 boa prática.
7. **Manter consistência** de estilo, nomenclatura e organização com o restante do projeto.
8. **Atualizar a documentação** quando uma decisão nova for tomada, evitando duplicidade (cada informação tem um documento responsável).
9. Ao encontrar uma **lacuna** (informação não definida), **sinalizar** em vez de assumir arbitrariamente.

## Lacunas conhecidas (a definir na implementação, não assumir agora)

_(Nenhuma pendência aberta.)_

> Resolvidos: o mecanismo de rastreio da exclusão em cascata (regra 6) — coluna `produtos.excluido_em_cascata` ([docs/13](docs/13-persistencia-e-banco.md#rastreio-da-exclusão-em-cascata-regra-6--mecanismo-concreto)); o **contrato da API** ([docs/15](docs/15-contrato-api.md)); e o **logotipo Horizon** no cabeçalho (`frontend/src/assets/horizon-logo.jpg`, importado no `Header` — [docs/05](docs/05-ux-e-interface.md)).
