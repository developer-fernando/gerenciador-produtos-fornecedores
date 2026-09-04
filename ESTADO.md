# ESTADO — estado vivo do projeto

> **Este é o ponto de partida.** Ele diz onde o desenvolvimento está **agora** e qual o **próximo passo**. Se você é uma LLM/assistente assumindo o projeto, leia este arquivo primeiro e siga o protocolo de cold-start em [`AGENTS.md` §0](AGENTS.md#0-continuidade--comece-aqui).
>
> **Autoridade (em caso de divergência, a fonte prevalece):** `docs/` > `AGENTS.md` > `specs/` > **este arquivo**. Este arquivo *deriva* das specs; ele nunca é a fonte única de nenhuma informação.

## Snapshot

| Campo | Valor |
|---|---|
| **Fase atual** | Entrega concluída |
| **Feature em andamento** | — (00–05 concluídas) |
| **Próxima feature** | — (recorte de produto encerrado) |
| **Backend** | ✅ Completo (features 00–03; Pest no ambiente Docker) |
| **Frontend** | ✅ Completo (features 04–05; 59 testes Vitest) |
| **Último commit relevante** | neste commit — README/docs/AGENTS alinhados; pasta `references/` removida |
| **Atualizado em** | 2026-09-04 |

## Onde paramos

Backend (00–03), front de Empresas (04) e front de Produtos (05) concluídos. Recorte das funcionalidades de produto **encerrado**. Fechamento da entrega: README raiz revisado, READMEs de `backend/` e `frontend/` alinhados ao projeto, pasta `references/` removida, `docs/` / `AGENTS.md` / specs atualizados ao código.

## Próximo passo

Nada pendente no recorte 00–05. A entrega está pronta para avaliação (`cp .env.example .env && docker compose up --build`).

## Progresso

Espelha a coluna **Status** do [recorte em `specs/README.md`](specs/README.md#recorte-das-funcionalidades) (fonte). Só a chave e o status — o detalhe ("Abrange") vive lá.

| Nº | Funcionalidade | Status |
|---|---|---|
| 00 | Fundação de dados | ✅ Concluído |
| 01 | Empresas (API) | ✅ Concluído |
| 02 | Produtos (API) | ✅ Concluído |
| 03 | Correções de back-end (hardening) | ✅ Concluído |
| 04 | Front — base + Empresas | ✅ Concluído |
| 05 | Front — Produtos | ✅ Concluído |
| — | Processo — Continuidade entre LLMs | ✅ Concluído |

## Como retomar

1. Leia o protocolo de cold-start em [`AGENTS.md` §0](AGENTS.md#0-continuidade--comece-aqui) (ordem de leitura + regras).
2. Se houver trabalho novo, abra a spec correspondente em `specs/` e continue pelo próximo ticket não marcado.
3. Ao concluir cada ticket: commit `[NN-TX]` + **atualize este `ESTADO.md`** + marque o checkbox na spec (e o `validation.md` quando aplicável).

## Como rodar (dev)

```bash
cp .env.example .env && docker compose up --build
```
Front em `http://localhost:5173`, API em `http://localhost:8000/api`. Para dados de exemplo: `docker compose exec backend php artisan migrate:fresh --seed`. Detalhes em [`docs/16-ambiente-docker.md`](docs/16-ambiente-docker.md).
