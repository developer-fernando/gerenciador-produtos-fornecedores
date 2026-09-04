# Regras de Negócio

Fonte principal das regras de comportamento do sistema. As validações de campo estão em [03-modelagem.md](03-modelagem.md).

## 1. As duas dimensões: Status × Exclusão lógica

🟩 O sistema trabalha com **duas dimensões independentes e coexistentes**. Confundi-las é erro grave (item eliminatório — ver [07-criterios-de-avaliacao.md](07-criterios-de-avaliacao.md)).

| Dimensão | Significado | Comportamento exigido |
|---|---|---|
| **Status** (`Ativo` / `Inativo`) | Estado operacional. O registro existe e permanece visível, mas não pode ser usado em novas operações. | Continua nas listagens, com indicação clara de inativo; **não recebe novos vínculos**; **reversível por reativação**. |
| **Exclusão lógica** (excluído / não excluído) | Registro removido do fluxo de uso, mas preservado para consulta e histórico. | **Fora das listagens por padrão**; acessível apenas por **filtro explícito**; **restaurável**; exclusão definitiva **somente quando as regras permitirem**. |

Um registro pode estar em qualquer combinação: **Ativo**, **Inativo**, **Excluído logicamente**, ou **Inativo e Excluído** ao mesmo tempo.

> ⚠️ A exclusão lógica **não pode** ser usada como substituto do campo status — são conceitos distintos e ambos obrigatórios.

## 2. Regras de uso obrigatórias

🟩 Regras extraídas integralmente do enunciado:

1. **Produto sempre vinculado a uma empresa válida** — não é permitido criar, editar ou manter produto sem empresa.
2. Ao **inativar uma empresa**, todos os seus produtos ficam **inativos automaticamente**.
3. Ao **reativar uma empresa**, os produtos **não** são reativados automaticamente — a reativação é individual ou por ação explícita do usuário.
4. **Não é permitido criar ou editar produto vinculado a empresa inativa ou excluída**, nem **ativar** produto cuja empresa esteja nesse estado.
5. A **exclusão lógica de uma empresa** leva seus produtos vinculados ao mesmo estado.
6. A **restauração de uma empresa** restaura os produtos excluídos junto com ela; os que já estavam excluídos individualmente **permanecem excluídos**.
7. A **exclusão física de empresa** é proibida havendo qualquer produto vinculado, **inclusive os excluídos logicamente**.
8. A **exclusão definitiva** só pode ser solicitada para registros **já excluídos logicamente** e exige **confirmação explícita** do usuário.
9. **Listagens não retornam registros excluídos por padrão**; o acesso a eles ocorre apenas por filtro explícito.
10. **CNPJ não pode ser duplicado**, considerando também os registros excluídos logicamente.
11. **Código interno não pode se repetir dentro da mesma empresa.**
12. **Nenhuma operação em cascata pode deixar registros em estado inconsistente.**

## 3. Regras de exclusão

🟩 Três operações **distintas**, que nunca devem ser confundidas.

### 3.1. Inativação (dimensão status)
- Reversível; registro **continua visível** com marcação de "Inativo".
- Não recebe novos vínculos. **Não é exclusão.**

### 3.2. Exclusão lógica (soft delete)
- Registro **sai das listagens padrão**; acessível apenas por filtro explícito; **restaurável**.
- **Empresa:** ao excluir logicamente, os produtos são excluídos logicamente em **cascata**.

### 3.3. Exclusão física (hard delete)
- Remoção **definitiva e irreversível**; exige registro **já excluído logicamente** + **confirmação explícita**.
- **Produto:** permitida (quando já excluído logicamente).
- **Empresa:** **proibida** se houver **qualquer** produto vinculado, inclusive excluídos logicamente. 🟦 Consequência prática: para excluir fisicamente uma empresa, seus produtos precisam ter sido excluídos fisicamente antes; só empresas sem nenhum produto (em qualquer estado) são elimináveis.

## 4. Cascatas e consistência

🟩 Comportamentos de propagação Empresa → Produtos:

| Ação na Empresa | Efeito nos Produtos vinculados |
|---|---|
| Inativar | Todos ficam **inativos** automaticamente. |
| Reativar | **Não** são reativados (reativação individual/explícita). |
| Excluir logicamente | Todos são **excluídos logicamente** (cascata). |
| Restaurar | Restaura apenas os que foram excluídos **pela cascata**; os excluídos individualmente antes permanecem excluídos. |

🟦 **Rastreio da origem da exclusão:** para cumprir a regra 6, o modelo registra **qual ação originou a exclusão** de cada produto (individual × cascata da empresa). Mecanismo detalhado em [03-modelagem.md](03-modelagem.md).

🟦 As cascatas devem ser **transacionais** (atômicas) para nunca deixar estado inconsistente (regra 12).

## 5. Regras por operação sobre Produto

| Operação | Regra |
|---|---|
| Criar (🟩) | Somente vinculado a empresa **ativa e não excluída**. |
| Editar (🟩) | A empresa vinculada deve estar **ativa e não excluída**; produto nunca sem empresa. Alterar o vínculo só é possível para empresa apta, revalidando a unicidade do código interno na empresa destino. |
| Reativar (🟩) | Só permitido se a empresa estiver **ativa e não excluída**. |
| Restaurar (🟦) | Só permitido se a empresa **não estiver excluída**. Se a empresa está excluída, o caminho é restaurar a empresa (cascata). Ao restaurar isoladamente, o produto pode voltar como **inativo** para respeitar a regra 4. |
| Excluir definitivamente (🟩) | Só para produto já excluído logicamente + confirmação explícita. |

## 6. Unicidade

| Campo | Escopo | Origem |
|---|---|---|
| **CNPJ** (Empresa) | Único globalmente, **incluindo** registros excluídos logicamente. | 🟩 Regra do desafio. |
| **Email** (Empresa) | Único globalmente, **incluindo** excluídos logicamente. | 🟦 Decisão de projeto. |
| **Código interno** (Produto) | Único **por empresa**, **incluindo** produtos excluídos logicamente. | 🟦 Decisão de projeto (o desafio exige "único dentro da empresa"; incluir excluídos é a decisão). |

🟦 **Justificativa de email e código interno** (o desafio só define o critério "incluir excluídos" para o CNPJ): o núcleo do sistema é soft delete **com restauração**; incluir os excluídos na unicidade torna a restauração **sempre consistente** (regra 12) sem lógica adicional, e uma unicidade mais estrita nunca viola o "sem duplicidade" do enunciado. Alternativa de mercado (unicidade só entre ativos, `withoutTrashed`) foi descartada por exigir checagens extras na restauração. Detalhes de implementação e índices em [03-modelagem.md](03-modelagem.md) e [06-requisitos-tecnicos.md](06-requisitos-tecnicos.md).

🟦 Na **edição**, as validações de unicidade ignoram o próprio registro.

## 7. Mecânicas obrigatórias

🟩 São de uso obrigatório (ausência ou uso incorreto é eliminatório):

| Mecânica | Quando | Comportamento exigido |
|---|---|---|
| **Exclusão lógica (soft delete)** | Toda "exclusão" que não seja a definitiva. | Marca como excluído; some das listagens padrão; restaurável. |
| **Status Ativo/Inativo** | Controle operacional, independente da exclusão. | Restrito a Ativo/Inativo; reversível; visível nas listagens. |
| **Validação server-side** | Toda criação/edição e regra de negócio. | Validação reforçada no servidor (só no front não conta). Ver [03-modelagem.md](03-modelagem.md). |
| **Cascatas transacionais** | Inativação/exclusão/restauração da empresa. | Propagação atômica, sem estado inconsistente. |
