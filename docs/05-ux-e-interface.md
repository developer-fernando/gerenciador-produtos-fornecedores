# UX e Interface

Fluxos de uso, requisitos de interface e identidade visual. Regras de negócio que a UI deve respeitar em [02-regras-de-negocio.md](02-regras-de-negocio.md).

## Princípio geral

🟩 A interface deve deixar **evidente a diferença entre inativar e excluir**, e **nunca oferecer uma ação que a regra de negócio vai recusar depois**.

## Fluxos de uso exigidos

🟩
1. **Listagens** com paginação, filtro por nome, filtro por status e acesso aos registros excluídos (via filtro explícito). Ver [04-requisitos.md](04-requisitos.md#listagens-paginação-e-filtros).
2. **Cadastro de produto:** a seleção de empresa oferece **apenas empresas aptas** a receber vínculo (ativas e não excluídas).
3. **Ações por registro** (editar, inativar, reativar, excluir, restaurar, excluir definitivamente) exibidas **somente quando permitidas**.
4. **Ao inativar uma empresa:** informar ao usuário o **impacto nos produtos vinculados**.
5. **Confirmação antes de excluir**, com aviso explícito de que a **exclusão definitiva é irreversível**.
6. Após qualquer ação, a listagem **reflete o novo estado sem recarregamento manual** da página.

## Requisitos de interface

🟩
- Layout **moderno e responsivo**, com boa organização visual.
- **Distinção visual clara** entre `Ativo`, `Inativo` e `Excluído`.
- **Feedback visual** para todas as ações (sucesso e erro).
- **Validação de formulário:** erros apontados no **campo correspondente**; erros de regra de negócio em **linguagem compreensível, sem jargão técnico**.
- Estados de **carregamento, listagem vazia e erro** devidamente tratados.
- **Contraste e legibilidade** adequados, com **foco de teclado visível**.

## Identidade visual Horizon

🟩 Paleta oficial:

| Cor | Hex |
|---|---|
| Amarelo Horizon | `#FBE509` |
| Preto Horizon | `#000000` |
| Grafite | `#141414` |
| Cinza claro | `#F7F7F7` |
| Branco | `#FFFFFF` |

Regras de aplicação (🟩):
- Aplicar o **logotipo** no **cabeçalho** da aplicação, **sem distorção ou recoloração**.
- O **amarelo** é cor de **destaque e ação**.
- **Texto sobre amarelo é sempre preto.**
- **Não** usar texto amarelo sobre branco.

🟦 **Logotipo:** já existe uma logo disponível que será utilizada no cabeçalho, respeitando as regras acima.
