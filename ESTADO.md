# ESTADO — estado vivo do projeto

> **Este é o ponto de partida.** Ele diz onde o desenvolvimento está **agora** e qual o **próximo passo**. Se você é uma LLM/assistente assumindo o projeto, leia este arquivo primeiro e siga o protocolo de cold-start em [`AGENTS.md` §0](AGENTS.md#0-continuidade--comece-aqui).
>
> **Autoridade (em caso de divergência, a fonte prevalece):** `docs/` > `AGENTS.md` > `specs/` > **este arquivo**. Este arquivo *deriva* das specs; ele nunca é a fonte única de nenhuma informação.

## Snapshot

| Campo | Valor |
|---|---|
| **Fase atual** | Front-end |
| **Feature em andamento** | Processo — Continuidade entre LLMs (em finalização) |
| **Próxima feature** | 05 — Front: Produtos |
| **Backend** | ✅ Completo e no ar (features 00–03; 45 testes) |
| **Último commit relevante** | `e2ee10d` — PRD + Spec da continuidade (aprovado) |
| **Atualizado em** | 2026-09-04 |

## Onde paramos

O backend (00–03) e o front de Empresas (04) estão concluídos, testados (45 + 39 testes) e **rodando integrados** via Docker (`http://localhost:5173` consumindo `http://localhost:8000/api`). A integração ponta a ponta foi verificada com dados reais (seed). Estamos **implementando a camada de continuidade entre LLMs** (plano aprovado em `specs/continuidade-entre-llms/`), para que qualquer LLM assuma o projeto sem perder contexto.

## Próximo passo

Concluir os tickets da camada de continuidade (`specs/continuidade-entre-llms/spec.md §7`): **C-T2** (§0 no `AGENTS.md` + ponteiro no `README.md`) → **C-T3** (mecânica tool-agnóstica nos 3 arquivos) → **C-T4** (verificação de cold-start). Depois, iniciar a **Feature 05 — Front: Produtos** pelo fluxo padrão (PRD → Spec → validação autônoma → implementação).

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
| — | Processo — Continuidade entre LLMs | 🔄 Em andamento |

## Como retomar

1. Leia o protocolo de cold-start em [`AGENTS.md` §0](AGENTS.md#0-continuidade--comece-aqui) (ordem de leitura + regras).
2. Abra a spec da feature atual/próxima em `specs/` e continue pelo próximo ticket não marcado.
3. Ao concluir cada ticket: commit `[NN-TX]` + **atualize este `ESTADO.md`** + marque o checkbox na spec (e o `validation.md` quando aplicável).

## Como rodar (dev)

```bash
cp .env.example .env && docker compose up --build
```
Front em `http://localhost:5173`, API em `http://localhost:8000/api`. Para dados de exemplo: `docker compose exec backend php artisan migrate:fresh --seed`. Detalhes em [`docs/16-ambiente-docker.md`](docs/16-ambiente-docker.md).
