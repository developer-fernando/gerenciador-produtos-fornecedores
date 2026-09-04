# Requisitos

Requisitos funcionais e não funcionais. Regras de comportamento em [02-regras-de-negocio.md](02-regras-de-negocio.md); campos e validações em [03-modelagem.md](03-modelagem.md).

## Requisitos funcionais

### Empresa
| Funcionalidade | Observações |
|---|---|
| Criar | Validar campos e unicidades (CNPJ, Email). |
| Editar | Manter unicidades (ignorando o próprio registro). |
| Listar | Paginação, filtro por nome, filtro por status, acesso a excluídos por filtro. |
| Inativar | Cascata: inativa todos os produtos; **informar o impacto ao usuário**. |
| Reativar | **Não** reativa produtos automaticamente. |
| Excluir logicamente | Cascata: produtos ao mesmo estado. |
| Restaurar | Restaura produtos excluídos pela cascata; mantém os excluídos individualmente. |
| Excluir fisicamente | Proibido se houver qualquer produto vinculado (mesmo excluído). |

### Produto
| Funcionalidade | Observações |
|---|---|
| Criar | Somente vinculado a empresa **ativa e não excluída**. |
| Editar | Empresa vinculada deve estar apta. |
| Listar | Paginação, filtro por nome, filtro por status, acesso a excluídos por filtro. |
| Inativar / Reativar | Reativação individual só se a empresa estiver apta. |
| Excluir logicamente / Restaurar | Soft delete / restauração (ver regras em [02](02-regras-de-negocio.md#5-regras-por-operação-sobre-produto)). |
| Excluir definitivamente | Só se já excluído logicamente + confirmação explícita. |

### Listagens, paginação e filtros
🟩 / 🟦
- **Paginação:** 🟩 obrigatória; 🟦 **server-side, 10 itens por página**.
- **Filtro por nome:** 🟩 obrigatório; 🟦 busca **parcial e case-insensitive**.
- **Filtro por status:** 🟩 obrigatório (Ativo/Inativo).
- **Filtro de excluídos:** 🟩 acesso apenas por filtro explícito; 🟦 quando selecionado, exibe **somente** os registros excluídos. Por padrão, listagens **não** retornam excluídos.
- **Seleção de empresa no cadastro de produto:** 🟩 oferecer **apenas empresas aptas** (ativas e não excluídas).

⚠️ **Fora de escopo:** funcionalidades não citadas no desafio não devem ser implementadas (ex.: filtro de produtos por empresa não é exigido). Regra: *se não está especificado no escopo, não faz parte do escopo.*

## Requisitos não funcionais

🟩 Exigidos pelo enunciado:

| Aspecto | Exigência |
|---|---|
| Qualidade de código | Clean Code, boa nomenclatura. |
| Boas práticas | REST (back) e do framework (front). |
| Organização/estrutura | Back: Controllers, Services (diferencial), Request Validation, Migrations. Front: pastas organizadas e separação de componentes. |
| Arquitetura | API REST bem estruturada. |
| Segurança | Validações server-side; **sem credenciais reais no repositório**; erros sem detalhes internos. |
| Usabilidade | Feedback de ações, estados de loading/vazio/erro, acessibilidade, responsividade. |
| Padronização | Commits organizados; nomenclatura consistente. |
| Entrega | GitHub com back + front; **README detalhado** (como rodar + estrutura). |
| Acessibilidade | Contraste/legibilidade adequados; foco de teclado visível. |
| Responsividade | Layout moderno e responsivo. |

> Detalhes de arquitetura e convenções técnicas em [06-requisitos-tecnicos.md](06-requisitos-tecnicos.md); requisitos de UI/UX em [05-ux-e-interface.md](05-ux-e-interface.md).

⚠️ **Não exigidos** pelo enunciado (não tratar como obrigatórios): metas de **performance**, **escalabilidade** e **testes automatizados**. Evitar sobre-engenharia justificada apenas por esses aspectos.
