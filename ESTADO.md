# ESTADO — estado vivo do projeto

> **Este é o ponto de partida.** Ele diz onde o desenvolvimento está **agora** e qual o **próximo passo**. Se você é uma LLM/assistente assumindo o projeto, leia este arquivo primeiro e siga o protocolo de cold-start em [`AGENTS.md` §0](AGENTS.md#0-continuidade--comece-aqui).
>
> **Autoridade (em caso de divergência, a fonte prevalece):** `docs/` > `AGENTS.md` > `specs/` > **este arquivo**. Este arquivo *deriva* das specs; ele nunca é a fonte única de nenhuma informação.

## Snapshot

| Campo | Valor |
|---|---|
| **Fase atual** | Front-end |
| **Feature em andamento** | Nenhuma (próxima a iniciar: 05 — Front: Produtos) |
| **Próxima feature** | 05 — Front: Produtos |
| **Backend** | ✅ Completo e no ar (features 00–03; 45 testes) |
| **Último commit relevante** | `[C-T4]` — camada de continuidade concluída |
| **Atualizado em** | 2026-09-04 |

## Onde paramos

O backend (00–03) e o front de Empresas (04) estão concluídos, testados (45 + 39 testes) e **rodando integrados** via Docker (`http://localhost:5173` consumindo `http://localhost:8000/api`), verificados com dados reais (seed). A **camada de continuidade entre LLMs está concluída** (`ESTADO.md`, protocolo em `AGENTS.md §0`, mecânica tool-agnóstica) e teve o cold-start verificado por uma sessão independente. Não há feature em andamento.

## Próximo passo

Iniciar a **Feature 05 — Front: Produtos** pelo fluxo padrão: **PRD → Spec → validação autônoma → implementação por tickets**. Criar `specs/05-front-produtos/` a partir dos templates (`specs/_templates/`), tendo como base [`docs/04-requisitos.md`](docs/04-requisitos.md#produto), [`docs/05-ux-e-interface.md`](docs/05-ux-e-interface.md) e o contrato de produtos em [`docs/15-contrato-api.md`](docs/15-contrato-api.md#endpoints--produtos). Escopo: telas de Produtos + **seletor de empresa apta** (`GET /api/empresas?status=Ativo`) + ações condicionais. Reaproveitar a base do front (lib/http, shared/, TanStack Query, `formatarPreco` já pronto).

## Progresso

Espelha a coluna **Status** do [recorte em `specs/README.md`](specs/README.md#recorte-das-funcionalidades) (fonte). Só a chave e o status — o detalhe ("Abrange") vive lá.

| Nº | Funcionalidade | Status |
|---|---|---|
| 00 | Fundação de dados | ✅ Concluído |
| 01 | Empresas (API) | ✅ Concluído |
| 02 | Produtos (API) | ✅ Concluído |
| 03 | Correções de back-end (hardening) | ✅ Concluído |
| 04 | Front — base + Empresas | ✅ Concluído |
| 05 | Front — Produtos | ⬜ A fazer |
| — | Processo — Continuidade entre LLMs | ✅ Concluído |

## Como retomar

1. Leia o protocolo de cold-start em [`AGENTS.md` §0](AGENTS.md#0-continuidade--comece-aqui) (ordem de leitura + regras).
2. Abra a spec da feature atual/próxima em `specs/` e continue pelo próximo ticket não marcado.
3. Ao concluir cada ticket: commit `[NN-TX]` + **atualize este `ESTADO.md`** + marque o checkbox na spec (e o `validation.md` quando aplicável).

## Como rodar (dev)

```bash
cp .env.example .env && docker compose up --build
```
Front em `http://localhost:5173`, API em `http://localhost:8000/api`. Para dados de exemplo: `docker compose exec backend php artisan migrate:fresh --seed`. Detalhes em [`docs/16-ambiente-docker.md`](docs/16-ambiente-docker.md).
