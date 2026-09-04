# Requisitos Técnicos, Arquitetura e Decisões

Stack, arquitetura, o que desenvolver em cada camada e as convenções/decisões técnicas do projeto.

## Stack

🟩 / 🟦
- **Back-end:** Laravel.
- **Front-end:** React.
- **Autenticação:** não necessária (não implementar).

## Requisitos técnicos

### Back-end (Laravel) — 🟩
- API REST bem estruturada; boas práticas REST.
- Uso correto de **Controllers**, **Services** *(diferencial)*, **Request Validation** e **Migrations**.
- Validações **server-side**.
- Tratamento de erros adequado.
- Uso de **exclusão lógica** (soft delete) e de **status**.

### Front-end (React) — 🟩
- Estrutura organizada de pastas e **separação de componentes**.
- Consumo adequado da API.
- Tratamento de erros e estados de loading.
- Validações no formulário.
- Boas práticas do framework.

## O que desenvolver

### Back-end
- **Migrations** para `empresas` e `produtos` (status, `deleted_at`, índices únicos — ver [03-modelagem.md](03-modelagem.md)).
- **Models** com relacionamento 1—N e SoftDeletes; rastreio da origem da exclusão do produto (regra 6).
- **Form Requests** cobrindo todas as validações ([03-modelagem.md](03-modelagem.md)).
- **Controllers** REST para Empresa e Produto.
- **Services** *(diferencial)* concentrando as regras de negócio e as **cascatas transacionais** (inativação/exclusão lógica/restauração).
- Endpoints: CRUD, inativar/reativar, excluir logicamente/restaurar, excluir definitivamente, e listagens com **paginação e filtros** (nome, status, excluídos).
- Bloqueio de exclusão física de empresa com produtos vinculados.

### Front-end
- Telas de **listagem** (Empresas e Produtos) com paginação, filtro por nome/status e acesso a excluídos.
- **Formulários** de criação/edição com validação e erros por campo.
- No formulário de Produto, **seletor de empresa** exibindo apenas empresas aptas.
- **Ações por registro** condicionais (só quando permitidas).
- **Confirmações** de exclusão (aviso de irreversibilidade na definitiva) e **aviso de impacto** ao inativar empresa.
- **Estados** de loading, vazio e erro; **feedback** de sucesso/erro.
- Atualização automática da listagem após ações (**sem reload manual**).
- Identidade visual Horizon e logotipo no cabeçalho ([05-ux-e-interface.md](05-ux-e-interface.md)).

## Convenções e decisões de projeto (🟦)

| Tema | Decisão |
|---|---|
| Idioma | Aplicação e documentação em **português** (UI, mensagens ao usuário, README, docs). Nomenclatura de código/domínio segue os termos do desafio (Empresa, Produto) e as convenções do framework, com consistência. |
| Moeda | **Real (R$)**; preço decimal com 2 casas. |
| Abordagem | **Simples e objetiva**; evitar complexidade desnecessária; solução adequada ao escopo. |
| Paginação | **Server-side**, 10 itens por página. |
| Filtro por nome | Parcial e case-insensitive. |
| Unicidade (CNPJ, email, código interno) | **Incluir** registros excluídos; no Laravel usar `Rule::unique()` simples (sem `withoutTrashed`) + índices únicos no banco. Código interno: `unique('produtos')->where('empresa_id', <id>)`. Na edição, ignorar o próprio registro. |
| CNPJ | Validar **dígitos verificadores** (não apenas formato). |
| CNPJ/Telefone | Armazenar normalizados (apenas dígitos); formatar na exibição. |
| Rastreio da exclusão | Marcar produtos excluídos por cascata para a restauração seletiva (regra 6). |
| Estrutura do repositório | Um repositório com projeto **back-end** e projeto **front-end** separados; README na raiz. |
| Respostas de erro da API | Validação no padrão do Laravel (HTTP 422 com `errors` por campo); erros de regra de negócio com mensagem clara ao usuário. Mensagens em português, sem detalhes internos. |

## Diretriz de validação técnica

🟦 Em dúvidas sobre Laravel, React, bibliotecas, APIs, recursos ou boas práticas, **pesquisar na web para validar** a abordagem recomendada antes de decidir — especialmente quando a informação puder estar desatualizada. Seguir os padrões oficiais de cada framework.
