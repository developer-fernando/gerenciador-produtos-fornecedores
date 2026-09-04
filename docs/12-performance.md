# Performance

Definições de performance (back e front), adequadas ao escopo — sem otimização prematura. Legenda em [08-arquitetura-geral.md](08-arquitetura-geral.md#legenda-de-origem-das-decisões).

> ⚠️ O desafio **não** define metas de performance. As definições abaixo são **boas práticas** aplicadas com bom senso, evitando complexidade desnecessária. Alinhadas à referência de performance do Sênior ([references/performance-orientacoes-dev-senior.md](../references/performance-orientacoes-dev-senior.md)).

## Back-end (Laravel)

### Banco de dados e índices
🧭🟦
- Relacionamentos por **PK/FK** (produto → empresa via `empresa_id`).
- **Índices** em: `empresa_id`, colunas de unicidade (`cnpj`, `email`, `(empresa_id, codigo_interno)`) e colunas usadas em filtros/listagens (`status`, `deleted_at`, `nome`). Ver [03-modelagem.md](03-modelagem.md#índices-e-unicidade-nível-de-banco).

### Consultas — evitar N+1 (Lazy Loading)
🧭 A referência do Sênior destaca a atenção ao **Lazy Loading** do Eloquent. Definição do projeto:
- Ao listar produtos com a empresa (ou empresas com contagem de produtos), usar **eager loading** (`with('empresa')` / `withCount('produtos')`) para evitar o problema **N+1**.
- **Cuidado com API Resources:** não tocar relacionamentos não carregados dentro do `toArray()` em listas (causa N+1). Carregar o que o Resource precisa na query.
- 🧭 Selecionar apenas as colunas necessárias quando fizer diferença.

### Paginação
🟩🟦 Listagens **paginadas no servidor**, **10 itens por página** (ver [04-requisitos.md](04-requisitos.md#listagens-paginação-e-filtros)).
- Uso do `paginate()` do Laravel, que aplica `limit`/`offset` (mecânica descrita pelo Sênior) e já retorna os metadados de paginação.
- Evita carregar e processar todos os registros de uma vez.

### Transações
🟦 Operações em cascata em `DB::transaction()` — além de consistência (regra 12), evitam trabalho parcial repetido.

## Front-end (React)

🧭🟦
- **Cache de servidor com TanStack Query:** deduplicação de requisições, cache e reaproveitamento entre telas; refetch/invalidização controlados após mutações (atualização sem reload). Ver [10-arquitetura-frontend.md](10-arquitetura-frontend.md#gerenciamento-de-estado).
- **Paginação no servidor:** o front busca só a página atual (10 itens), não a base inteira.
- **Renderização eficiente:** componentes focados; evitar re-render desnecessário; usar `key` estável em listas.
- **Bundle:** Vite com build de produção; code splitting básico por rota se necessário (não obrigatório para o escopo).

## Fora de escopo (não otimizar prematuramente)

⚠️ Não são exigidos nem necessários para este projeto: cache distribuído (Redis), filas/jobs, otimizações de escala, CDN, tuning avançado de banco. Registrado para evitar over-engineering.

## Pilares considerados (referência do Sênior)

Os quatro pilares citados — **Arquitetura, Organização, Segurança, Performance** — orientam as decisões:
- Arquitetura e Organização: [08](08-arquitetura-geral.md), [09](09-arquitetura-backend.md), [10](10-arquitetura-frontend.md).
- Segurança: [11-seguranca.md](11-seguranca.md).
- Performance: este documento.
