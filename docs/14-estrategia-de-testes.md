# Estratégia de Testes

Estratégia **mínima, porém significativa** — proporcional ao projeto, focada em testes úteis (não em quantidade). Legenda em [08-arquitetura-geral.md](08-arquitetura-geral.md#legenda-de-origem-das-decisões).

> Testes não são exigidos explicitamente pelo enunciado (⚠️), mas são um diferencial de qualidade (critério "Arquitetura e qualidade de código") e a melhor forma de comprovar que as **regras de negócio** (critério de maior peso) funcionam. Por isso, cobertura mínima focada no que mais vale pontos.

## Back-end (Laravel)

### Ferramentas
🟦🧭
- **Pest** como framework de testes (padrão nas versões recentes do Laravel; sintaxe mais limpa, roda sobre o PHPUnit). PHPUnit permanece disponível por baixo.
- **Factories** + `RefreshDatabase` (migra e isola cada teste em transação).
- **MySQL** como banco de teste (mesmo engine da produção — ver [13-persistencia-e-banco.md](13-persistencia-e-banco.md#banco-de-testes)).
- **Mocking** apenas quando necessário (ex.: serviços externos) — aqui, praticamente desnecessário.

### Tipos de teste
| Tipo | Uso neste projeto |
|---|---|
| **Feature (HTTP/API)** | Principal foco — exercitam rota → controller → service → banco, validando regras e respostas. |
| **Unit** | Para lógica isolada de Service que valha testar sem HTTP (ex.: decisão de restauração seletiva). |

### Organização e execução
- `backend/tests/Feature/` e `backend/tests/Unit/`.
- Execução: `php artisan test` (ou `./vendor/bin/pest`).
- Configuração via `phpunit.xml` + `.env.testing` (base de teste MySQL dedicada).
- Isolamento: `RefreshDatabase` em cada teste; factories para montar o cenário.

### Testes obrigatórios (mínimos)
Focados nas regras de maior peso e nos **itens eliminatórios**:

**CRUD e validação**
- Criar/editar/listar empresa e produto (caminho feliz).
- Validação server-side retornando **422** com erro por campo (nome, cnpj válido, email, preço > 0, código interno, etc.).
- **Unicidade incluindo excluídos:** CNPJ e email (empresa) e código interno por empresa (produto) barram duplicata mesmo com registro soft-deleted; na edição, ignora o próprio registro.

**Regras de negócio / status / exclusão (críticos)**
- **Produto exige empresa apta:** não permite criar/editar/reativar produto com empresa inativa ou excluída.
- **Inativar empresa** → produtos ficam inativos (cascata).
- **Reativar empresa** → produtos **não** são reativados.
- **Excluir empresa logicamente** → produtos excluídos (cascata) com `excluido_em_cascata = true`.
- **Restaurar empresa** → restaura só os excluídos pela cascata; mantém os excluídos individualmente.
- **Exclusão física de empresa bloqueada** havendo qualquer produto vinculado (mesmo soft-deleted).
- **Exclusão definitiva** só para registro já excluído logicamente + confirmação.
- **Listagens** não retornam excluídos por padrão; **filtro de excluídos** retorna somente excluídos.
- **Paginação** de 10 itens.

> Cada regra acima mapeia diretamente para um item do critério 1 (30%) e/ou eliminatório — ver [07-criterios-de-avaliacao.md](07-criterios-de-avaliacao.md).

## Front-end (React)

### Ferramentas
🟦🧭
- **Vitest** como test runner (nativo do ecossistema Vite; TypeScript e ESM sem configuração extra; rápido).
- **React Testing Library** + **@testing-library/user-event** — testam o componente **como o usuário usa**, evitando depender de detalhes internos (menos testes frágeis).
- **jsdom** como ambiente DOM.
- **MSW (Mock Service Worker)** para simular a API em testes de integração de componentes que consomem dados.

### Organização e execução
- Testes co-localizados por feature: `feature/**/*.test.tsx` (ou `__tests__/`).
- Execução: `npm run test` (Vitest); modo watch no desenvolvimento.
- Reprodutibilidade: handlers do MSW definem respostas previsíveis da API.

### Testes obrigatórios (mínimos)
Focados em comportamento e nas regras de UX que a interface deve respeitar:

- **Formulário de empresa/produto:** exibe erros de validação no campo correto; envia dados corretos; mostra erro de regra de negócio vindo da API em linguagem ao usuário.
- **Seletor de empresa (produto):** oferece apenas empresas aptas.
- **Ações condicionais por registro:** botões (editar, inativar, reativar, excluir, restaurar, excluir definitivamente) aparecem **somente quando permitidos** pelo estado do registro.
- **Confirmação de exclusão** e **aviso de impacto** ao inativar empresa.
- **Estados da listagem:** loading, vazio e erro tratados; atualização após ação (via TanStack Query).
- **Componentes compartilhados-chave:** ex.: badge de status (Ativo/Inativo/Excluído), diálogo de confirmação.

## Boas práticas (evitar testes frágeis)

🧭
- Testar **comportamento e saída visível ao usuário**, não implementação interna.
- Consultar elementos por **papel/rótulo/texto** (queries acessíveis da RTL), não por classes CSS/estrutura.
- Um cenário por teste; nomes descritivos; dados montados por factory/handler.
- Evitar acoplar testes a detalhes que mudam sem alterar comportamento.

## Uso durante o desenvolvimento

- Rodar os testes localmente antes de considerar uma funcionalidade concluída.
- Priorizar escrever/atualizar os testes das **regras críticas** ao implementá-las.
- Testes reprodutíveis (factories/seeders no back, MSW no front) garantem execução consistente por qualquer pessoa ou IA.

## Resumo das ferramentas

| Camada | Runner | Bibliotecas | Banco/API |
|---|---|---|---|
| Laravel | **Pest** (sobre PHPUnit) | Factories, RefreshDatabase | MySQL de teste |
| React | **Vitest** | React Testing Library, user-event, jsdom, MSW | API simulada (MSW) |
