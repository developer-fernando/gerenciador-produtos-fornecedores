# Frontend — SPA React

Interface do Gerenciador de Produtos e Fornecedores: listagens, formulários e ações condicionais de **Empresas** e **Produtos**, consumindo a API Laravel.

A forma prevista de subir o projeto é o **Docker na raiz do repositório**. Instruções completas (clone-and-run, portas, `VITE_API_URL`) estão no [README da raiz](../README.md).

## Como rodar (via Docker)

Na raiz:

```bash
cp .env.example .env
docker compose up --build
```

App em http://localhost:5173. A API precisa estar no ar (http://localhost:8000/api).

## Testes e lint

```bash
docker compose exec frontend npm run test    # Vitest
docker compose exec frontend npm run lint    # oxlint
docker compose exec frontend npm run build   # tsc + Vite
```

Vitest + React Testing Library + MSW. Estratégia em [`docs/14-estrategia-de-testes.md`](../docs/14-estrategia-de-testes.md).

## Estrutura

```
src/
├── app/         → Header (logotipo), providers, rotas
├── assets/      → horizon-logo.jpg
├── lib/         → axios, queryClient, helpers de erro
├── features/
│   ├── empresas/
│   └── produtos/
├── shared/      → Table, FiltrosBar, Modal, icons, formatadores
└── styles/      → tema Horizon
```

Arquitetura: [`docs/10-arquitetura-frontend.md`](../docs/10-arquitetura-frontend.md). UX: [`docs/05-ux-e-interface.md`](../docs/05-ux-e-interface.md).
