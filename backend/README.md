# Backend — API Laravel

API REST do Gerenciador de Produtos e Fornecedores: **Empresas** e **Produtos**, com status (Ativo/Inativo), exclusão lógica/restauração e exclusão física quando as regras permitem.

A forma prevista de subir o projeto é o **Docker na raiz do repositório**. Instruções completas (clone-and-run, portas, variáveis) estão no [README da raiz](../README.md).

## Como rodar (via Docker)

Na raiz:

```bash
cp .env.example .env
docker compose up --build
```

API em http://localhost:8000 — health check em `/up`, recursos em `/api`.

Recriar o banco com dados de exemplo:

```bash
docker compose exec backend php artisan migrate:fresh --seed
```

## Testes

```bash
docker compose exec backend php artisan test
```

Pest + factories + RefreshDatabase, em um MySQL de testes (`horizon_testing`) criado pelo ambiente. Estratégia em [`docs/14-estrategia-de-testes.md`](../docs/14-estrategia-de-testes.md). Contrato da API em [`docs/15-contrato-api.md`](../docs/15-contrato-api.md).

## Estrutura

```
app/
├── Exceptions/            → RegraDeNegocioException (409)
├── Http/
│   ├── Controllers/Api/   → controllers finos
│   ├── Requests/          → validação de entrada
│   └── Resources/         → formatação JSON
├── Models/                → Empresa, Produto
└── Services/              → regras, cascatas e transações
bootstrap/app.php          → rotas, withExceptions (404/500 padronizados)
database/                  → migrations, factories, seeders
routes/api.php
```

Arquitetura: [`docs/09-arquitetura-backend.md`](../docs/09-arquitetura-backend.md).
