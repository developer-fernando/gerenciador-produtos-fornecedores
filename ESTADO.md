# ESTADO — estado vivo do projeto

> **Este é o ponto de partida.** Ele diz onde o desenvolvimento está **agora** e qual o **próximo passo**. Se você é uma LLM/assistente assumindo o projeto, leia este arquivo primeiro e siga o protocolo de cold-start em [`AGENTS.md` §0](AGENTS.md#0-continuidade--comece-aqui).
>
> **Autoridade (em caso de divergência, a fonte prevalece):** `docs/` > `AGENTS.md` > `specs/` > **este arquivo**. Este arquivo *deriva* das specs; ele nunca é a fonte única de nenhuma informação.

## Snapshot

| Campo | Valor |
|---|---|
| **Fase atual** | Front-end |
| **Feature em andamento** | 05 — Front: Produtos (Spec aprovada; implementando) |
| **Próxima feature** | — (05 é a última do recorte) |
| **Backend** | ✅ Completo e no ar (features 00–03; 45 testes) |
| **Último commit relevante** | `e2ee10d`+ — base da 05 aprovada |
| **Atualizado em** | 2026-09-04 |

## Onde paramos

Backend (00–03) e front de Empresas (04) concluídos, testados (45 + 39 testes) e **rodando integrados** via Docker (verificados com dados reais). Camada de continuidade entre LLMs concluída. A **Feature 05 (Front: Produtos)** teve PRD + Spec **aprovados** na validação autônoma (2 rodadas; F1 = seletor de empresa apta que truncava em 10 empresas, corrigido). Implementação prestes a começar.

## Próximo passo

Implementar a **Feature 05** pelos tickets de [`specs/05-front-produtos/spec.md §7`](specs/05-front-produtos/spec.md). Feito: **05-T1** (navegação), **05-T2** (dados de produtos + `AcoesPermitidas` em `shared/`), **05-T3** (listagem: página/filtros/tabela/estados; 45 testes; verificado no navegador). **Próximo: 05-T4** (formulário criar/editar: `ProdutoFormModal` + `EmpresaAptaSelect` — todas as aptas via iteração de páginas, `empresaVinculada` na edição, vazio bloqueia submit; validação por campo + 422; botão "Novo produto" na página) → 05-T5 (ações de ciclo de vida + invalidação) → 05-T6 (validação final). Commit por ticket `[05-TX]`; atualizar este `ESTADO.md` + checkbox a cada um. Após a 05: fechamento (README de execução, foco de teclado, logo real).

## Progresso

Espelha a coluna **Status** do [recorte em `specs/README.md`](specs/README.md#recorte-das-funcionalidades) (fonte). Só a chave e o status — o detalhe ("Abrange") vive lá.

| Nº | Funcionalidade | Status |
|---|---|---|
| 00 | Fundação de dados | ✅ Concluído |
| 01 | Empresas (API) | ✅ Concluído |
| 02 | Produtos (API) | ✅ Concluído |
| 03 | Correções de back-end (hardening) | ✅ Concluído |
| 04 | Front — base + Empresas | ✅ Concluído |
| 05 | Front — Produtos | 🔄 Em andamento |
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
