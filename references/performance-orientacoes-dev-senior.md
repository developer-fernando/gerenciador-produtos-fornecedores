# Performance da Aplicação — Orientações do Desenvolvedor Sênior (material de referência)

> **Natureza deste documento:** transcrição/consolidação **fiel** das orientações fornecidas por um desenvolvedor PHP/Laravel Sênior sobre performance da aplicação.
>
> É **material de referência**, não decisão de projeto. Não contém análise, validação nem conclusões. As definições de performance e as abordagens que serão efetivamente utilizadas no projeto serão consolidadas em etapa posterior.

---

## 1. Relacionamento com o Banco de Dados

- O Laravel estabelece o relacionamento direto com o banco de dados.
- Por isso, os relacionamentos entre as entidades devem ser estabelecidos utilizando:
  - **Chave primária (Primary Key);**
  - **Chave estrangeira (Foreign Key).**
- Todos os relacionamentos devem possuir **índices criados** para melhorar a eficiência das consultas ao banco de dados.

## 2. Avaliação de Performance das Requisições

Ao desenvolver uma funcionalidade que exige uma consulta ao banco, devem ser consideradas algumas questões.

**Requisição do Frontend** — primeiro, avaliar:

- Preciso exibir muitos dados nessa requisição?

A partir disso, questionar:

1. O Laravel conseguirá processar essa quantidade de dados tranquilamente?
2. O banco de dados conseguirá sustentar essa consulta tranquilamente?

- Caso a resposta seja negativa, deve-se pensar em uma **estratégia para tratar a quantidade de dados** retornada.

## 3. Paginação

- Uma das formas normalmente utilizadas para resolver esse problema é a **paginação**, trabalhando com parâmetros de `limit` e `offset`.
- A quantidade de registros por página pode ser **parametrizada**.

**Exemplo** — supondo que sejam exibidos 10 registros por página:

- **Página 1:** `limit = 10`, `offset = 0` → são retornados os primeiros 10 registros.
- **Página 2:** `limit = 10`, `offset = 10` → os primeiros 10 registros são ignorados e são retornados os próximos 10.
- **Página 3:** `limit = 10`, `offset = 20` → os 20 registros das páginas anteriores são ignorados e são retornados os próximos 10.

- Esse mecanismo evita que todos os registros sejam carregados e processados de uma única vez, contribuindo para a performance da aplicação.

## 4. Pilares da Entrega da Aplicação

Os principais pilares considerados são:

1. **Arquitetura**
2. **Organização**
3. **Segurança**
4. **Performance**

- A performance está diretamente relacionada, entre outros pontos, à **forma como as consultas ao banco de dados são realizadas**.

## 5. ORM do Laravel — Lazy Loading

- O Laravel possui um ORM que trabalha com o conceito de **Lazy Loading**.
- Sempre que uma consulta for implementada, deve-se questionar à IA:
  - *Essa consulta está utilizando Lazy Loading?*
- Essa verificação deve ser feita para as consultas desenvolvidas na aplicação, visando identificar como os relacionamentos e dados relacionados estão sendo carregados e **evitar problemas de performance**.

---

> Estas informações representam a explicação fornecida pelo desenvolvedor Sênior e devem ser mantidas como referência para a posterior definição da estratégia de performance do projeto.
