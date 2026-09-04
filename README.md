# Gerenciador de Produtos e Fornecedores

Sistema web para **cadastro e manutenção de Empresas (Fornecedores) e seus Produtos**, com um ciclo de vida de registros bem definido: status operacional (**Ativo/Inativo**), **exclusão lógica com restauração** (soft delete) e **exclusão física** quando permitida — sempre preservando a consistência dos dados.

A aplicação é dividida em uma **API REST em Laravel** (back-end) e uma **SPA em React** (front-end), executadas de forma integrada via Docker.

> **Contribuindo com assistência de IA?** O estado atual do desenvolvimento e o próximo passo estão em [`ESTADO.md`](ESTADO.md); o protocolo para assumir o projeto está em [`AGENTS.md` §0](AGENTS.md#0-continuidade--comece-aqui).

---

## Índice

- [O que o projeto faz](#o-que-o-projeto-faz)
- [Stack](#stack)
- [Arquitetura](#arquitetura)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Requisitos](#requisitos)
- [Instalação e execução local](#instalação-e-execução-local)
- [Testes](#testes)
- [Padrões e convenções](#padrões-e-convenções)
- [Documentação](#documentação)

## O que o projeto faz

Gerencia dois recursos relacionados — **Empresas (Fornecedores)** e **Produtos** (uma empresa possui vários produtos; um produto pertence a uma empresa).

Principais capacidades:

- **CRUD** de empresas e produtos.
- **Status operacional** (Ativo/Inativo) independente da exclusão.
- **Exclusão lógica** (soft delete) com **restauração**, e **exclusão física** apenas quando as regras permitem.
- **Regras de negócio e consistência**, com destaque para:
  - Produto sempre vinculado a uma empresa **ativa e não excluída**.
  - Inativar uma empresa **inativa seus produtos em cascata**; reativar a empresa **não** reativa os produtos automaticamente.
  - Excluir uma empresa logicamente **exclui seus produtos em cascata**; ao restaurar a empresa, retornam apenas os produtos excluídos pela cascata.
  - **Exclusão física de empresa bloqueada** se houver qualquer produto vinculado (mesmo excluído logicamente).
  - **Exclusão definitiva** apenas de registros já excluídos logicamente, com confirmação.
  - **Unicidade** de CNPJ e e-mail (empresa) e de código interno por empresa (produto), considerando inclusive registros excluídos logicamente.
- **Listagens** com paginação e filtros por nome, status e registros excluídos.
- **Validação server-side** e **respostas de erro padronizadas** para consumo previsível pelo front-end.

Detalhes completos das regras em [`docs/02-regras-de-negocio.md`](docs/02-regras-de-negocio.md).

## Stack

| Camada | Tecnologias |
|---|---|
| **Back-end** | Laravel 13 · PHP 8.4 · API REST |
| **Front-end** | React 19 · Vite 8 · TypeScript · TanStack Query · axios |
| **Banco de dados** | MySQL 8 |
| **Testes** | Pest (back-end) · Vitest + React Testing Library (front-end) |
| **Ambiente** | Docker + Docker Compose |

## Arquitetura

Dois projetos independentes no mesmo repositório; o **React (SPA)** consome o **Laravel (API REST)** via HTTP/JSON. O back-end é a fonte de verdade: regras de negócio e validações são autoritativas no servidor.

Fluxo de uma requisição no back-end:

```
Route → Controller (fino) → Form Request (validação)
      → Service (regra de negócio + transação)
      → Eloquent Model (dados)
      → API Resource (resposta JSON padronizada)
```

- **Controllers finos** — apenas orquestram.
- **Services** concentram regras de negócio, **cascatas** e **transações**.
- **Eloquent** como camada de dados (sem camada Repository — adequado ao escopo).
- **API Resources** padronizam a saída; **Form Requests** padronizam e validam a entrada.

Visão completa em [`docs/08-arquitetura-geral.md`](docs/08-arquitetura-geral.md), [`docs/09-arquitetura-backend.md`](docs/09-arquitetura-backend.md) e [`docs/10-arquitetura-frontend.md`](docs/10-arquitetura-frontend.md).

## Estrutura do projeto

```
.
├── backend/            # API Laravel
│   ├── app/
│   │   ├── Http/Controllers/   # controllers finos
│   │   ├── Http/Requests/      # validação de entrada
│   │   ├── Http/Resources/     # formatação de saída
│   │   ├── Services/           # regras de negócio e cascatas
│   │   └── Models/             # Empresa, Produto
│   └── database/migrations/    # schema versionado
├── frontend/           # SPA React (Vite)
│   └── src/
│       ├── app/                # providers e rotas
│       ├── lib/                # cliente axios, query client
│       ├── features/           # empresas/, produtos/ (por domínio)
│       └── shared/             # componentes e utilitários reutilizáveis
├── docker/             # scripts de apoio (init do banco)
├── docs/               # documentação do projeto
├── docker-compose.yml
└── .env.example
```

## Requisitos

- **Docker** e **Docker Compose** instalados.
- Portas livres no host: **8000** (API), **5173** (front-end) e **3306** (MySQL) — ajustáveis no `.env`.

Não é necessário ter PHP, Composer ou Node instalados no host: tudo roda em containers.

## Instalação e execução local

```bash
git clone https://github.com/developer-fernando/gerenciador-produtos-fornecedores.git
cd gerenciador-produtos-fornecedores
cp .env.example .env
docker compose up --build
```

Na primeira subida o ambiente faz o bootstrap automático (instala dependências, gera a `APP_KEY`, aguarda o banco e executa as migrations e seeders).

Ao final:

- **API:** http://localhost:8000 (health check em `/up`)
- **Front-end:** http://localhost:5173

Comandos úteis:

```bash
docker compose up -d        # sobe em segundo plano
docker compose logs -f      # acompanha os logs
docker compose down         # para os containers
```

## Testes

```bash
docker compose exec backend php artisan test     # back-end (Pest)
docker compose exec frontend npm run test        # front-end (Vitest)
```

Os testes do back-end usam um banco de dados MySQL de testes dedicado, criado automaticamente pelo ambiente. Estratégia e cobertura mínima em [`docs/14-estrategia-de-testes.md`](docs/14-estrategia-de-testes.md).

## Padrões e convenções

- **Separação de responsabilidades** por camada (Controller → Service → Model; Resources/Requests).
- **Idioma:** aplicação, mensagens ao usuário e documentação em **português**; moeda em Real (R$).
- **Respostas da API padronizadas:**
  - `200/201/204` para sucesso; `422` para validação (com `errors` por campo); `409` para conflito de regra de negócio; `404`/`500` para não encontrado/erro interno.
  - Mensagens de erro claras ao usuário, **sem expor detalhes internos**.
- **Persistência:** migrations nativas versionadas; relacionamentos por PK/FK; índices em chaves, unicidades e colunas de filtro; **soft delete** e campo de rastreio para restauração em cascata.
- **Performance:** paginação server-side (10 por página); **eager loading** para evitar N+1; cache de dados no front com TanStack Query.
- **Segurança:** validação sempre no servidor; sem credenciais no repositório (`.env` ignorado; use `.env.example`); CORS restrito à origem do front.
- **Simplicidade:** soluções adequadas ao escopo, evitando complexidade desnecessária.
- **Git:** commits organizados e descritivos.

O guia central para desenvolvimento (inclusive assistido por IA) está em [`AGENTS.md`](AGENTS.md).

## Documentação

A pasta [`docs/`](docs/README.md) contém a documentação detalhada:

| Documento | Assunto |
|---|---|
| [01-visao-geral](docs/01-visao-geral.md) | Objetivo, escopo e módulos |
| [02-regras-de-negocio](docs/02-regras-de-negocio.md) | Regras, status × exclusão lógica, cascatas |
| [03-modelagem](docs/03-modelagem.md) | Entidades, campos, validações e índices |
| [04-requisitos](docs/04-requisitos.md) | Requisitos funcionais e não funcionais |
| [05-ux-e-interface](docs/05-ux-e-interface.md) | Fluxos e requisitos de interface |
| [06-requisitos-tecnicos](docs/06-requisitos-tecnicos.md) | Requisitos técnicos e convenções |
| [07-criterios-de-avaliacao](docs/07-criterios-de-avaliacao.md) | Prioridades de qualidade do projeto |
| [08–10 arquitetura](docs/08-arquitetura-geral.md) | Arquitetura geral, back-end e front-end |
| [11-seguranca](docs/11-seguranca.md) · [12-performance](docs/12-performance.md) | Segurança e performance |
| [13-persistencia-e-banco](docs/13-persistencia-e-banco.md) | Banco, ORM e migrations |
| [14-estrategia-de-testes](docs/14-estrategia-de-testes.md) | Estratégia de testes |
| [15-contrato-api](docs/15-contrato-api.md) | Contrato REST da API |
| [16-ambiente-docker](docs/16-ambiente-docker.md) | Ambiente Docker |
