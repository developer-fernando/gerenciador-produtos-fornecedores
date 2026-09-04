# Documentação do Projeto — Sistema de Gerenciamento de Produtos e Fornecedores

Base documental do sistema de gerenciamento de produtos e fornecedores. Cada arquivo tem uma responsabilidade única e é a **fonte principal** do seu assunto; os demais apenas referenciam.

## Mapa da documentação

| Arquivo | Responsabilidade — o que consultar aqui |
|---|---|
| [01-visao-geral.md](01-visao-geral.md) | O que é o projeto, objetivo, problema, escopo funcional e módulos. |
| [02-regras-de-negocio.md](02-regras-de-negocio.md) | **Regras de uso**, status × exclusão lógica, regras de exclusão, cascatas, mecânicas obrigatórias e unicidade. Fonte principal das regras. |
| [03-modelagem.md](03-modelagem.md) | Entidades, campos, tipos, validações de campo, relacionamentos, índices e rastreio da exclusão. |
| [04-requisitos.md](04-requisitos.md) | Requisitos funcionais (funcionalidades, listagens, filtros) e não funcionais. |
| [05-ux-e-interface.md](05-ux-e-interface.md) | Fluxos de uso, requisitos de interface, estados e identidade visual. |
| [06-requisitos-tecnicos.md](06-requisitos-tecnicos.md) | Stack, arquitetura, o que fazer no back-end e no front-end, convenções e decisões técnicas. |
| [07-criterios-de-avaliacao.md](07-criterios-de-avaliacao.md) | Critérios, pesos, itens eliminatórios e mapa de prioridades. |
| [08-arquitetura-geral.md](08-arquitetura-geral.md) | Visão de arquitetura da aplicação como um todo; comunicação front↔back; stack; o que foi adotado, adaptado ou descartado (Service, sem Repository, sem DTO dedicado). |
| [09-arquitetura-backend.md](09-arquitetura-backend.md) | Arquitetura Laravel: camadas, fluxo da requisição, endpoints e padronização de respostas. |
| [10-arquitetura-frontend.md](10-arquitetura-frontend.md) | Arquitetura React: estrutura feature-based, estado de servidor (TanStack Query), consumo da API. |
| [11-seguranca.md](11-seguranca.md) | Segurança (back e front); autenticação fora de escopo; o que permanece obrigatório. |
| [12-performance.md](12-performance.md) | Performance (back e front): índices, N+1/eager loading, paginação, cache no front. |
| [13-persistencia-e-banco.md](13-persistencia-e-banco.md) | ORM (Eloquent), banco (MySQL), migrations, schema definido e factories/seeders. |
| [14-estrategia-de-testes.md](14-estrategia-de-testes.md) | Estratégia de testes back (Pest) e front (Vitest + RTL); testes mínimos obrigatórios. |
| [15-contrato-api.md](15-contrato-api.md) | Contrato REST: endpoints, requisições/respostas, códigos HTTP, erros padronizados e ações permitidas. |
| [16-ambiente-docker.md](16-ambiente-docker.md) | Ambiente Docker: serviços (backend/frontend/db), estrutura, clone-and-run, portas e execução de testes. |

## Como navegar rapidamente

- **Onde estão as regras?** → [02-regras-de-negocio.md](02-regras-de-negocio.md)
- **Onde estão os requisitos?** → [04-requisitos.md](04-requisitos.md)
- **Definições técnicas?** → [06-requisitos-tecnicos.md](06-requisitos-tecnicos.md) e [03-modelagem.md](03-modelagem.md)
- **Arquitetura (geral / back / front)?** → [08](08-arquitetura-geral.md) · [09](09-arquitetura-backend.md) · [10](10-arquitetura-frontend.md)
- **Segurança?** → [11-seguranca.md](11-seguranca.md) · **Performance?** → [12-performance.md](12-performance.md)
- **Critérios de avaliação?** → [07-criterios-de-avaliacao.md](07-criterios-de-avaliacao.md)
- **UX e identidade visual?** → [05-ux-e-interface.md](05-ux-e-interface.md)

## Convenção de marcação

Em toda a documentação:

- 🟩 **Definido no desafio** — regra explícita do enunciado; prevalece sobre qualquer interpretação.
- 🟦 **Decisão de projeto** — não definida no enunciado; fechada por lógica/boas práticas dentro do escopo. Revisável se o responsável orientar diferente.
- ⚠️ **Não exigido / fora de escopo** — não consta no enunciado; não implementar/tratar como obrigatório.

> Fonte primária: o enunciado do desafio técnico (Gerenciador de Produtos e Fornecedores). O conteúdo destes documentos preserva o enunciado; onde houve lacuna, a decisão está marcada como 🟦. Orientações de arquitetura, segurança e performance foram avaliadas e **internalizadas** em `08`–`12` (o que foi adotado, adaptado ou descartado).

## Stack

- **Back-end:** Laravel · **Front-end:** React · **Autenticação:** não necessária.
- **Idioma:** português (aplicação e documentação) · **Moeda:** Real (R$).
