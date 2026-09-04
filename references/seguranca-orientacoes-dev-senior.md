# Segurança da Aplicação — Orientações do Desenvolvedor Sênior (material de referência)

> **Natureza deste documento:** transcrição/consolidação **fiel** das orientações fornecidas por um desenvolvedor PHP/Laravel Sênior sobre segurança da aplicação.
>
> É **material de referência**, não decisão de projeto. Não contém análise, validação nem conclusões. As definições de segurança e as abordagens que serão efetivamente utilizadas no projeto serão consolidadas em etapa posterior.

---

## Autenticação das rotas

- A aplicação deve possuir um **Middleware** responsável por autenticar as rotas.
- Esse Middleware deve:
  - Conferir a sessão;
  - Verificar se a sessão é válida;
  - Verificar se a sessão está ativa;
  - Permitir a execução da requisição caso a sessão esteja válida;
  - Retornar um erro para o front-end caso a sessão não esteja mais válida ou ativa.
- Quando a sessão não estiver válida, o front-end deve receber uma informação indicando que a sessão não está mais ativa e que o usuário precisa realizar a autenticação novamente.
- Isso pode ser feito utilizando um **token JWT**.

## Fluxo de uma requisição utilizando JWT

- Imagine uma rota de **login**.
- Depois que o login é realizado com sucesso, o usuário é redirecionado para a rota de **dashboard**.
- A partir desse momento, tudo o que for feito depois da autenticação passa por uma **verificação**. Isso inclui, por exemplo:
  - Carregar uma página;
  - Enviar informações;
  - Executar uma funcionalidade;
  - Realizar qualquer outra requisição.
- Toda requisição realizada após a autenticação passa **primeiro por uma verificação da sessão**.

Fluxo conceitual:

- O sistema identificou que existe uma requisição.
- Antes de verificar o que essa requisição faz, primeiro deve verificar: **a sessão desse usuário ainda está ativa?**
- Se estiver ativa, a requisição pode continuar sua execução.
- É necessário existir uma **confirmação de que a sessão continua válida**.

## Token JWT

- Quando utilizamos JWT, é gerado um **token para a sessão**.
- Cada sessão possui um token.
- Esse token possui um **tempo de validade**.
- A cada utilização da aplicação, o token pode ser **atualizado** conforme a mecânica definida para a sessão.
- Quando o usuário permanece muito tempo sem utilizar a aplicação, o tempo da sessão pode **expirar**.
- Quando isso acontece, o usuário precisa realizar uma **nova autenticação**.

## Validação da sessão

- Quando o JWT é utilizado, devemos verificar se o tempo de validade daquela sessão ainda está ativo.
- O sistema deve verificar:
  - Se o token ainda é válido;
  - Se a sessão ainda está ativa;
  - Se o token expirou.
- Caso o token tenha expirado, o usuário deve ser direcionado novamente para o **fluxo de login**.

### Exemplo de sessão expirada

- Imagine que o usuário esteja na rota `dashboard`.
- Ele carrega a página.
- O sistema identifica que a sessão daquele usuário expirou.
- Nesse cenário, o usuário precisa gerar um **novo token válido** por meio do processo de autenticação novamente.
- Esse comportamento precisa ser **padronizado para toda a aplicação**.

## Padronização das respostas

- Para padronizar o tratamento das respostas, entra novamente o conceito de **DTO**.
- Os erros de **autenticação** e **autorização** também precisam possuir um padrão de resposta.

### HTTP 401 — Não autenticado

- O erro `401` representa uma situação em que a autenticação não foi realizada ou não é mais válida.
- A resposta deve possuir um formato padronizado. Por exemplo:
  - *Autenticação falhou. Autentique novamente.*

### HTTP 403 — Sem permissão

- O erro `403` representa uma situação em que o usuário está autenticado, mas **não possui permissão** para realizar determinada ação.
- Isso pode ocorrer, por exemplo, ao tentar:
  - Executar determinada ação;
  - Acessar determinada funcionalidade;
  - Realizar determinada operação na tela.
- A resposta também deve possuir um formato padronizado. Por exemplo:
  - *Sem permissão para realizar esta ação. Consulte o administrador do sistema.*

## Padronização dos erros

- É importante padronizar os formatos de resposta da aplicação.
- Sempre que uma requisição retornar `401`, o formato da resposta deve seguir o mesmo padrão.
- Da mesma forma, sempre que uma requisição retornar `403`, o formato da resposta também deve seguir um padrão definido.
- Isso permite que o front-end saiba exatamente como tratar cada tipo de resposta.
- A aplicação deve evitar que o mesmo tipo de erro seja tratado de maneiras diferentes em diferentes partes do sistema.
- O tratamento das respostas deve ser **consistente e padronizado** em toda a aplicação.
- A ideia é que, quando uma requisição retornar uma resposta de erro, o front-end tenha um **formato previsível** para identificar o erro e realizar o tratamento correspondente.

## Conceito geral apresentado

A ideia geral é estabelecer um padrão para:

```
Requisição → Verificação da sessão → Autenticação/Autorização → Execução da requisição → Resposta padronizada
```

Os códigos de resposta e seus respectivos formatos devem seguir uma definição consistente em toda a aplicação.

---

> Estas informações representam a explicação fornecida pelo desenvolvedor Sênior e devem ser mantidas como referência para a posterior definição da estratégia de segurança do projeto.
