# Spec — Continuidade do projeto entre diferentes LLMs

| Campo | Valor |
|---|---|
| **Status** | Aprovado (validação estática — pronto para implementar) |
| **Funcionalidade** | continuidade-entre-llms |
| **PRD relacionado** | [prd.md](./prd.md) · [validation.md](./validation.md) |

## 1. Abordagem técnica

Adicionar uma **camada de continuidade fina** sobre a estrutura existente, sem criar um repositório de memória paralelo. O princípio é **mapear** os conceitos de "Memory Bank" ([Cline](https://docs.cline.bot/best-practices/memory-bank), [Tweag](https://tweag.github.io/agentic-coding-handbook/WORKFLOW_MEMORY_BANK/)) no que o projeto já tem e preencher **apenas os gaps**: estado vivo, protocolo de cold-start e mecânica tool-agnóstica. Tudo em markdown versionado — a fonte da verdade é o git, alinhado ao padrão [AGENTS.md](https://agents.md/) e às práticas de handoff agent-agnóstico ([ai-memory](https://github.com/akitaonrails/ai-memory)).

Mapeamento (evidência de que não se duplica nada):

| Memory Bank | Já existe em | Ação |
|---|---|---|
| projectbrief / productContext | `docs/01,02,04,05` | reusar (apontar) |
| systemPatterns | `docs/08–13` + `AGENTS.md` | reusar |
| techContext | `docs/06,16` + `AGENTS.md` | reusar |
| activeContext + progress | — | **criar `ESTADO.md`** |
| protocolo de leitura/handoff | — | **criar (§0 do `AGENTS.md` + ponteiro no `README.md`)** |
| verificação em contexto novo | `specs/README.md` + `AGENTS.md` + `_templates/validation.md` (via subagente) | **generalizar (tool-agnóstico), nos três** |

## 2. Modelo de dados

Não há banco. Os artefatos são arquivos markdown versionados. `ESTADO.md` é um documento curto com seções fixas (ver §4).

## 3. Contrato / interfaces

Não há API. A "interface" é a **ordem de leitura** que qualquer LLM segue e as **seções fixas** do `ESTADO.md`, que tornam o estado previsível para leitura por diferentes modelos.

## 4. Mudanças por camada (arquivos)

**Novo — `ESTADO.md` (raiz):** documento curto, sempre atual, com seções fixas:
- **Snapshot** — fase atual, feature em andamento, ticket atual e próximo, último commit relevante, data.
- **Onde paramos** — 2–4 linhas em prosa.
- **Próximo passo** — a próxima ação concreta (ticket ou decisão pendente).
- **Progresso** — espelha exatamente as linhas do [specs/README §Recorte](../README.md#recorte-das-funcionalidades) (status **derivado** das specs; aponta, não recopia detalhes). Para isso, C-T1 **adiciona ao recorte** uma linha da própria camada de processo (`continuidade-entre-llms`), mantendo o recorte como fonte única — o `ESTADO.md` nunca é a única fonte de nenhuma linha.
- **Autoridade (autocontida)** — uma linha fixa no próprio `ESTADO.md`: *"Em caso de divergência, a fonte prevalece: `docs/` > `AGENTS.md` > `specs/` > este arquivo."* Assim a regra não depende de o leitor já ter visto a hierarquia em outro arquivo.
- **Como retomar** — 3 linhas apontando para o protocolo no `AGENTS.md` (§0).

**Ajuste — `AGENTS.md` (nova seção no topo, "§0 Continuidade — comece aqui"):**
- **Ordem de leitura para uma LLM nova:** `ESTADO.md` → `AGENTS.md` → `docs/README.md` → `specs/README.md` → a spec da feature atual (as demais `docs/` sob demanda).
- **Regras de retomada:** seguir o "Próximo passo" do `ESTADO.md`; respeitar o fluxo PRD→Spec→validação→implementação; commit por ticket `[NN-TX]`; rodar o portão de validação antes de concluir.
- **Regra de atualização (disciplina de estado):** **todo ticket termina** atualizando `ESTADO.md` + os checkboxes da spec + o `validation.md` quando aplicável, no **mesmo commit** — o estado nunca vive só na conversa.
- **Fonte única da verdade:** hierarquia `docs/` > `AGENTS.md` > `specs/` > `ESTADO.md` > histórico git.

**Ajuste — `README.md` (raiz):** um bloco curto "Para assistentes de IA / continuidade" apontando para `ESTADO.md` e para a §0 do `AGENTS.md` (para ferramentas que abrem pelo README).

**Ajuste — mecânica tool-agnóstica (em DOIS arquivos):** reescrever as menções a "subagente" para definir o verificador como **"uma passada de verificação independente em contexto novo — uma sessão/chat separada, de preferência outro modelo"**, registrando o subagente como *uma* implementação possível (não obrigatória). Aplicar nos **três** lugares que hoje mencionam "subagente" (grep confirma que são exatamente estes):
- `specs/README.md` (§Papéis produtor×verificador, linha ~56 — **único ponto** com "subagente"; o §Loop já é tool-agnóstico, N8) — hoje "subagente dedicado em contexto novo" ([specs/README.md](../README.md#papéis-produtor--verificador)).
- **`AGENTS.md`** (linha ~162: "verificador independente (subagente em contexto novo...)") — tem autoridade **maior** que `specs/README.md`; deixá-lo desalinhado manteria a contradição (finding F1).
- **`specs/_templates/validation.md`** (linha ~9: "subagente em contexto novo") — é o template copiado por **toda** spec nova; sem ajustá-lo, cada feature futura reintroduz a pressuposição de subagente (finding A da rodada 2).

O restante da rubrica/loop permanece.

**Sem mudanças:** `docs/` (conteúdo), regras de negócio, código do produto.

## 5. Regras e mecanismos a implementar

| Mecanismo | Origem/racional |
|---|---|
| Estado vivo em arquivo único (`ESTADO.md`) | activeContext+progress do Memory Bank ([Cline](https://docs.cline.bot/best-practices/memory-bank)) |
| Ordem de leitura fixa no cold-start | Memory Bank ([Tweag](https://tweag.github.io/agentic-coding-handbook/WORKFLOW_MEMORY_BANK/)) |
| Ponto de entrada tool-agnóstico | padrão [AGENTS.md](https://agents.md/) |
| Handoff em markdown versionado (git = event-log) | [ai-memory](https://github.com/akitaonrails/ai-memory) |
| Verificador = contexto novo (subagente opcional) | generalização da mecânica atual ([specs/README](../README.md#validação-autônoma-de-prdspec)) |
| Disciplina "todo ticket atualiza o estado" | evitar que o estado dependa da conversa |

## 6. Estratégia de validação

Como é uma camada de **processo** (não código), a verificação é **documental**, não executável:
- **Teste de cold-start (simulação):** uma leitura, seguindo só a ordem definida, deve responder "qual a feature atual e o próximo ticket?" — sem a conversa. Ideal validar com um **verificador em contexto novo** (subagente ou outra sessão) que só recebe o repositório.
- **Checagem de não-duplicação:** confirmar que `ESTADO.md`/§0 apontam para `docs/` em vez de recopiar.
- **Coerência de estado:** a tabela de progresso do `ESTADO.md` bate com `specs/README.md` e os checkboxes das specs.
- **Checagem tool-agnóstica:** nenhuma etapa obrigatória exige recurso exclusivo de uma ferramenta.

## 7. Tickets

> A implementação só começa após o `validation.md` aprovar (portão estático).

> Ordem de dependência: **C-T1 → C-T2** (a §0 do `AGENTS.md` referencia o `ESTADO.md`, que precisa existir antes, N11) e **C-T1, C-T2, C-T3 → C-T4** (o fechamento depende da mecânica já generalizada em C-T3).
> IDs `C-Tx` (em vez de `NN-Tx`): esta é uma camada de **processo**, fora da sequência numérica de produto; exceção de nomeação registrada em §9 (N10).

- [x] **C-T1** — Adicionar ao [recorte](../README.md#recorte-das-funcionalidades) de `specs/README.md` a linha da camada de processo (`continuidade-entre-llms`, marcada como processo/sem número de produto) **e** criar `ESTADO.md` com as seções fixas (Snapshot, Onde paramos, Próximo passo, Progresso, Autoridade, Como retomar), refletindo o estado real (pós-feature 04; próximo = feature 05). A linha de processo no recorte usa **"—" na coluna Nº** (fora da sequência 00–05) e o nome `continuidade-entre-llms` (N9). A tabela **Progresso espelha só a chave e o status** (Nº/nome + status) do recorte — **não** recopia a coluna "Abrange" (N6) — _uma LLM identifica fase/feature/próximo ticket lendo só o `ESTADO.md`; Progresso bate 1:1 (chave+status) com o recorte._
- [x] **C-T2** — Adicionar a §0 "Continuidade — comece aqui" ao `AGENTS.md` (ordem de leitura + regras de retomada + **regra de atualização "todo ticket atualiza o `ESTADO.md`"** + hierarquia de fonte única) e o ponteiro no `README.md` da raiz — _protocolo e regra de atualização encontráveis a partir da raiz._
- [ ] **C-T3** — Generalizar a mecânica para tool-agnóstica nos **três** arquivos: `specs/README.md`, `AGENTS.md` e `specs/_templates/validation.md` (verificador = contexto novo; subagente como opção) — _grep por "subagente" nos três não retorna nenhuma pressuposição obrigatória; spec futura copiada do template já nasce tool-agnóstica._
- [ ] **C-T4** — Fechar a verificação documental: cold-start simulado por um verificador em **contexto novo** que recebe só o repositório e responde "feature atual + próximo ticket" — _critérios do PRD atendidos (requer C-T1..C-T3 concluídos)._

## 8. Definition of Done

- [ ] Todos os tickets concluídos.
- [ ] Cold-start simulado por um verificador em contexto novo identifica fase/feature/próximo ticket **sem** a conversa anterior.
- [ ] `ESTADO.md` com seções fixas e tabela de progresso coerente com `specs/`.
- [ ] `AGENTS.md` §0 + ponteiro no `README.md`.
- [ ] Mecânica tool-agnóstica aplicada nos **três** arquivos (`specs/README.md`, `AGENTS.md`, `specs/_templates/validation.md`): grep por "subagente" não retorna nenhuma etapa obrigatória.
- [ ] Sem duplicação de `docs/`; tudo em markdown versionado.
- [ ] Critérios de aceite do PRD atendidos.

## 9. Decisões e riscos locais

- **Não criar `/memory-bank`:** duplicaria `docs/`. Decisão: mapear o Memory Bank no que já existe e só preencher gaps.
- **Nome da pasta e IDs de ticket sem `NN-` (exceção consciente):** as features seguem `NN-nome` e tickets `NN-Tk` ([specs/README.md §Convenções](../README.md#convenções)); esta é uma **camada de processo**, não uma feature de produto numerada, por isso usa nome descritivo (`continuidade-entre-llms`), IDs `C-Tx` e "—" na coluna Nº do recorte (N10). Exceção registrada aqui.
- **Disciplina sem enforcement automático (N12):** "todo ticket atualiza o `ESTADO.md`" é uma regra **manual** — não há hook/CI que a force. C-T4 valida a leitura inicial (cold-start), não a manutenção contínua nas features 05+. Mitigação: a regra fica na §0 do `AGENTS.md` (lida no cold-start) e o `ESTADO.md` **deriva** das specs (que são atualizadas por ticket de qualquer forma), reduzindo o custo de mantê-lo em dia; um enforcement automático (hook) pode ser adotado depois se a deriva ocorrer.
- **Ponto concreto de deriva (não só genérico):** o risco real é a tabela **Progresso do `ESTADO.md`** divergir do **Recorte de `specs/README.md`**. Mitigação: o Progresso **espelha** o recorte (mesma fonte) e a regra de autoridade autocontida no `ESTADO.md` diz que `specs/` prevalece — o `ESTADO.md` nunca é fonte única de uma linha de status.
- **Estado vivo curto:** se `ESTADO.md` ficar longo, desatualiza. Mantê-lo enxuto e apontando para as specs/ (que têm o detalhe por ticket).
- **Escopo do protocolo (cold-start, não "toda tarefa"):** o Memory Bank do Cline recomenda releitura no início de *toda* tarefa; aqui o gatilho é mais estreito — **troca de sessão/LLM**. Decisão consciente: manter enxuto e focado no handoff entre LLMs (o objetivo declarado); a releitura a cada tarefa pode ser adotada depois sem quebrar a estrutura.
- **Git como event-log:** dispensa `activity.jsonl`; commits `[NN-TX]` já dão a trilha cronológica tool-agnóstica.
