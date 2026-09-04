# Ambiente de Desenvolvimento (Docker)

Ambiente containerizado — simples, reproduzível e com **paridade entre desenvolvimento e avaliação**. Legenda em [08-arquitetura-geral.md](08-arquitetura-geral.md#legenda-de-origem-das-decisões).

## Objetivos

🟦 O ambiente permite:
- Desenvolver e **testar** o projeto localmente (back, front e banco integrados).
- **Clone-and-run:** o avaliador clona e executa com **mínima configuração** (copiar `.env` e um comando).
- **Paridade:** todos usam as **mesmas imagens/versões** → o ambiente do avaliador é igual ao do desenvolvimento.
- **Simplicidade** — sem complexidade desnecessária para o tamanho do projeto.

## Decisão: docker-compose próprio (não Laravel Sail)

🟦🧭 **docker-compose customizado na raiz do repositório**, orquestrando três serviços.

| Opção | Avaliação |
|---|---|
| **docker-compose próprio** | Orquestra **backend + frontend + banco** num único `docker compose up`. Controle explícito de versões; cobre os dois projetos. **Escolhido.** |
| **Laravel Sail** | Ótimo, porém **centrado no Laravel** — não orquestra naturalmente o projeto React separado. Adicionaria um wrapper sem cobrir o front. **Não adotado.** |

## Serviços

🟦🧭 Três serviços, imagens com **versão fixada** (reprodutibilidade):

| Serviço | Base | Papel | Porta (host) |
|---|---|---|---|
| **db** | `mysql:8.0` | Banco de dados; volume nomeado para persistência; healthcheck. `docker/mysql/init.sql` cria o banco de testes. | 3306 |
| **backend** | `php:8.4-cli` (+ Composer, extensões `pdo_mysql`, `mbstring`, `bcmath`, `zip`) | API Laravel via `php artisan serve --host=0.0.0.0 --port=8000`. | 8000 |
| **frontend** | `node:22-alpine` | SPA React (Vite) via `npm run dev -- --host 0.0.0.0 --port 5173`. | 5173 |

🟦 **Servidor do back-end:** `php artisan serve` em um único container — simples e suficiente para o escopo. (Nginx + PHP-FPM seria mais "produção", porém complexidade desnecessária aqui.)

## Estrutura de arquivos do ambiente

```
/ (raiz do repositório)
├── docker-compose.yml         → orquestra db, backend, frontend
├── .env.example               → variáveis do compose (DB, portas, URLs)  [copiar p/ .env]
├── backend/
│   ├── Dockerfile             → imagem PHP 8.4 + Composer + extensões
│   ├── .dockerignore
│   ├── .env.example           → env do Laravel
│   └── (aplicação Laravel)
├── frontend/
│   ├── Dockerfile             → imagem Node 22 (Vite)
│   ├── .dockerignore
│   ├── .env.example           → VITE_API_URL etc.
│   └── (aplicação React)
└── docker/mysql/init.sql      → cria o banco `horizon_testing` na primeira subida do MySQL
```

## Fluxo clone-and-run

🟦 Passos do avaliador (mínimos):
```bash
git clone <repo> && cd <repo>
cp .env.example .env                 # variáveis do compose
docker compose up --build            # sobe db + backend + frontend
```
- 🟦 **Bootstrap automático** (via entrypoint do backend, na subida): `composer install` → `php artisan key:generate` (se necessário) → aguardar o db (healthcheck) → `php artisan migrate --seed`.
- 🟦 **Frontend:** o container roda `npm install` e sobe o Vite.
- Ao final: **API** em `http://localhost:8000` (health em `/up`), **App** em `http://localhost:5173`.

Recriar o banco com dados de exemplo:

```bash
docker compose exec backend php artisan migrate:fresh --seed
```

> Objetivo: nenhum passo manual além de copiar o `.env` e subir o compose.

## Persistência, hot reload e volumes

🧭
- **Bind mounts** de `backend/` e `frontend/` para os containers → alterações refletem sem rebuild (hot reload do Vite e do Laravel).
- **Volumes nomeados** para `vendor/` e `node_modules/` (evita conflito host↔container) e para os **dados do MySQL** (persistem entre reinícios).

## Rede, portas e variáveis

🟦🧭
- Rede interna do compose: os serviços se enxergam pelo nome (`backend`, `db`, `frontend`).
- O **navegador** (host) acessa a API por `http://localhost:8000/api`; portanto o front usa `VITE_API_URL=http://localhost:8000/api`.
- O **backend** conecta ao banco pelo host `db` (nome do serviço), porta 3306.
- **CORS** do Laravel libera a origem do front (`http://localhost:5173`). Ver [11-seguranca.md](11-seguranca.md).
- Variáveis sensíveis (credenciais do MySQL, `APP_KEY`) ficam no `.env` (fora do Git); apenas `.env.example` é versionado. 🟩 (sem credenciais no repositório)
- 🟦 Portas podem ser remapeadas no `.env` se houver conflito no host (ex.: `3307:3306`).

## Testes dentro do Docker

🧭 Reprodutíveis no mesmo ambiente:
```bash
docker compose exec backend php artisan test     # Pest (usa base de teste MySQL)
docker compose exec frontend npm run test        # Vitest
docker compose exec frontend npm run lint        # oxlint
```
Ver [14-estrategia-de-testes.md](14-estrategia-de-testes.md). A base de teste do MySQL roda no mesmo serviço `db` (banco dedicado `horizon_testing`) para manter a paridade de engine.

## Git e versionamento

🟩🟦
- Projeto versionado no **Git** desde o início; `backend/` e `frontend/` no mesmo repositório.
- **`.gitignore`** deve ignorar: `vendor/`, `node_modules/`, `.env` (todos), `storage/` gerado, build do front (`dist/`), e artefatos locais.
- Versionar `.env.example` (back, front e compose), Dockerfiles, `docker-compose.yml` e o README com as instruções de execução (🟩 README obrigatório).

## Fora de escopo (evitar complexidade desnecessária)

⚠️ Não fazem parte deste ambiente: Redis, filas/workers, Nginx+PHP-FPM separados, imagens multi-stage de produção, orquestração (Kubernetes), CI/CD. Podem ser mencionados como evolução, mas **não** serão implementados.
