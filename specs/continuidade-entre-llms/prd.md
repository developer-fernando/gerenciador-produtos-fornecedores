# PRD — Continuidade do projeto entre diferentes LLMs

| Campo | Valor |
|---|---|
| **Status** | Concluído (camada implementada; cold-start verificado) |
| **Funcionalidade** | continuidade-entre-llms (camada de processo, não é feature de produto) |
| **Spec relacionada** | [spec.md](./spec.md) · [validation.md](./validation.md) |

## 1. Contexto e problema

O desenvolvimento segue um fluxo maduro (docs/ como fonte de verdade, `AGENTS.md` como constituição, `specs/` com PRD + Spec + validação autônoma + implementação por tickets). Porém, esse conhecimento de **onde o desenvolvimento está agora** e de **como retomar** vive parcialmente no contexto da conversa atual. Quando os tokens desta sessão/assistente acabam, uma **LLM diferente** (outro modelo ou outra ferramenta — Cursor, Copilot, Codex, etc.) precisa assumir **sem perder contexto, organização e padrão**.

LLMs são **stateless entre sessões**: uma sessão nova começa sem memória, tende a reler o código, refazer perguntas já respondidas e rederivar decisões. Referências: [Cline Memory Bank](https://docs.cline.bot/best-practices/memory-bank), [Tweag Agentic Handbook](https://tweag.github.io/agentic-coding-handbook/WORKFLOW_MEMORY_BANK/), [AGENTS.md](https://agents.md/), [Augment — memory vs context](https://www.augmentcode.com/guides/agent-memory-vs-context-engineering).

Diagnóstico: a base já cobre projectbrief/productContext/systemPatterns/techContext (em `docs/` + `AGENTS.md`), o fluxo (`specs/README.md`) e a trilha de validação (`validation.md`). **Faltam três peças** para a continuidade ser independente de LLM: (a) um **ponto único de estado vivo** (o "activeContext + progress"), (b) um **protocolo de cold-start** (ordem de leitura + como retomar), (c) descrever a mecânica de forma **tool-agnóstica** (o verificador não pode pressupor "subagente").

## 2. Objetivo / resultado esperado

Qualquer LLM, ao assumir o projeto, consegue — lendo apenas **arquivos versionados no repositório**, numa **ordem fixa** — identificar a arquitetura, o fluxo PRD/Spec, o **estado atual** e o **próximo passo**, e continuar no **mesmo fluxo e padrão**, sem reconstruir o contexto manualmente. A fonte da verdade é o repositório (markdown + git), não uma conversa ou ferramenta específica.

## 3. Escopo

**Dentro do escopo (as 3 peças finas):**
- **`ESTADO.md`** (raiz): o "estado vivo" (activeContext + progress) — snapshot da fase/feature/ticket, "onde paramos", "próximo passo" e tabela de progresso, **derivada** (aponta, não recopia) do recorte e das specs.
- **Protocolo de cold-start**: seção nova no topo do `AGENTS.md` ("§0 Continuidade — comece aqui") + ponteiro curto no `README.md` da raiz. Define a ordem de leitura e as regras de retomada/atualização.
- **Mecânica tool-agnóstica**: ajuste em **`specs/README.md`, `AGENTS.md` e `specs/_templates/validation.md`** (os três lugares que hoje mencionam "subagente") para definir o verificador como "uma passada de verificação em **contexto novo** (sessão/chat separada, de preferência outro modelo)", com o subagente como *uma* implementação possível. O template importa porque toda spec futura é copiada dele.

**Fora do escopo:**
- Criar um `/memory-bank` paralelo (duplicaria `docs/`); um log de atividade `activity.jsonl` (o histórico git já é o event-log); um índice de decisões `docs/17` (as decisões já têm rastreio via 🟦 e "Decisões e riscos locais").
- Alterar regras de negócio, arquitetura ou o conteúdo das features; qualquer automação/scripts.

## 4. Atores e fluxos de uso

Ator: **uma LLM (qualquer modelo/ferramenta) que assume o projeto**, e o **desenvolvedor humano** que a orienta. Fluxo de cold-start: ler `ESTADO.md` → `AGENTS.md` → `docs/README.md` → `specs/README.md` → a spec da feature atual → executar o próximo ticket no fluxo vigente → commit `[NN-TX]` + atualizar `ESTADO.md`/checkboxes/`validation.md`.

## 5. Requisitos funcionais

- `ESTADO.md` sempre reflete: fase atual, feature em andamento, ticket atual e próximo, último commit relevante, "onde paramos" e "próximo passo".
- Existe um protocolo explícito de **ordem de leitura** e de **retomada**, encontrável a partir da raiz e do `AGENTS.md`.
- A mecânica de validação é descrita sem depender de recursos exclusivos de uma ferramenta (subagente é opcional; contexto novo é o requisito real).
- Regra de disciplina: **todo ticket termina** atualizando `ESTADO.md` (junto do commit) — o estado nunca vive apenas na conversa.
- Nenhuma duplicação de conteúdo já existente em `docs/`/`AGENTS.md` — os novos artefatos **apontam** para a fonte.

## 6. Regras de negócio aplicáveis

Não altera regras de negócio do produto. Preserva e referencia o fluxo existente ([specs/README §Fluxo](../README.md#fluxo-de-trabalho) e [§Validação autônoma](../README.md#validação-autônoma-de-prdspec)) e a constituição ([AGENTS.md](../../AGENTS.md)).

## 7. Requisitos não-funcionais relevantes

- **Independência de LLM/ferramenta**: só markdown versionado; nada depende de uma conversa, plugin ou recurso proprietário.
- **Baixo atrito de manutenção**: o estado vivo é curto e objetivo; atualizar não pode ser custoso (senão fica desatualizado).
- **Fonte única da verdade**: hierarquia clara — `docs/` (verdade) > `AGENTS.md` (constituição) > `specs/` (execução) > `ESTADO.md` (ponteiro vivo) > histórico git (event-log).

## 8. Critérios de aceite

- [x] Uma LLM nova, lendo apenas os arquivos indicados, identifica em poucos minutos a **fase**, a **feature atual** e o **próximo ticket**, sem acessar a conversa anterior.
- [x] O `AGENTS.md` (e um ponteiro no `README.md`) explicita a **ordem de leitura** e as **regras de retomada e atualização**.
- [x] A descrição da mecânica de validação **não pressupõe subagente**: um verificador em contexto novo (outra sessão/modelo) é suficiente para cumprir o portão.
- [x] `ESTADO.md` contém as seções "onde paramos" e "próximo passo" e uma tabela de progresso coerente com `specs/README.md` e os checkboxes das specs.
- [x] Nenhum dos novos artefatos **duplica** conteúdo de `docs/` (checagem: apontam por link, não recopiam).
- [x] A regra "todo ticket atualiza o `ESTADO.md`" está registrada no fluxo (`AGENTS.md`/`specs/README.md`).
