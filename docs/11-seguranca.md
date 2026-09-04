# Segurança

Definições de segurança da aplicação (back e front). Legenda em [08-arquitetura-geral.md](08-arquitetura-geral.md#legenda-de-origem-das-decisões).

## Autenticação e autorização — fora de escopo

🟩 O desafio define que **autenticação não é necessária**. Portanto:

- **Não** haverá login, tokens (JWT), sessão de usuário, nem middleware de autenticação.
- Os códigos **HTTP 401 (não autenticado)** e **403 (sem permissão)**, descritos na referência de segurança do Sênior ([references/seguranca-orientacoes-dev-senior.md](../references/seguranca-orientacoes-dev-senior.md)), **não fazem parte** da superfície desta API.

🟦🧭 **Princípio aproveitado da referência:** a ideia de **respostas de erro padronizadas e previsíveis** foi adotada — aplicada aos erros que realmente existem no escopo (validação, regra de negócio, não encontrado, erro interno). Ver [09-arquitetura-backend.md](09-arquitetura-backend.md#padronização-de-respostas).

> Caso a autenticação viesse a ser exigida no futuro, o caminho natural seria **Laravel Sanctum** (SPA) com um middleware de sessão/token e os padrões 401/403 — mas isso está **explicitamente fora do escopo** atual e não deve ser implementado.

## Segurança que permanece obrigatória

Mesmo sem autenticação, os seguintes pontos são responsabilidade de segurança (o foco de avaliação inclui "validações e segurança"):

### Back-end (Laravel)
| Item | Definição | Origem |
|---|---|---|
| **Validação server-side** | Toda entrada validada no servidor via Form Requests; validação só no front não conta. | 🟩 (eliminatório se ausente) |
| **Sem credenciais no repositório** | `.env` fora do versionamento; apenas `.env.example`. Nenhuma credencial real commitada. | 🟩 (eliminatório) |
| **Erros sem detalhes internos** | Mensagens ao usuário em português, sem stack trace, SQL ou detalhes de implementação. | 🟩 |
| **Proteção contra SQL Injection** | Uso do Eloquent/Query Builder (bindings parametrizados); nunca concatenar entrada em SQL. | 🧭 |
| **Mass assignment** | Definir `$fillable` nos Models; nunca `$guarded = []` com entrada crua. | 🧭 |
| **CORS restrito** | `config/cors.php` liberando apenas a origem do front-end e os métodos/cabeçalhos necessários — não usar `*` em produção. | 🧭 |
| **Rate limiting** | Opcional; o Laravel oferece throttling de rotas se necessário. | 🧭 (não exigido) |

### Front-end (React)
| Item | Definição | Origem |
|---|---|---|
| **Escape de saída** | O React escapa conteúdo por padrão; **evitar `dangerouslySetInnerHTML`**. Previne XSS. | 🧭 |
| **Sem segredos no bundle** | Nenhuma credencial/segredo no código do front; apenas configuração pública (ex.: `VITE_API_URL`). | 🧭 |
| **Validação como UX, não como segurança** | Validação no formulário melhora a experiência, mas a autoridade é o servidor. | 🟩 |
| **Tratamento consistente de erros** | Erros da API tratados de forma padronizada (interceptors), sem vazar detalhes ao usuário. | 🧭 |

## Consistência de dados como segurança

🟩🟦 A integridade dos dados é parte da robustez da aplicação:

- **Transações** nas operações em cascata (inativação/exclusão/restauração) para nunca deixar estado inconsistente (regra 12).
- **Integridade referencial** no banco (FK obrigatória produto→empresa); produto nunca sem empresa.
- **Regras de exclusão** aplicadas no servidor (não confiar na UI): bloqueio de exclusão física de empresa com produtos, exclusão definitiva só de registros já excluídos logicamente, etc. Ver [02-regras-de-negocio.md](02-regras-de-negocio.md).
