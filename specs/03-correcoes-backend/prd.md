# PRD — Correções de Back-end (hardening)

| Campo | Valor |
|---|---|
| **Status** | Aprovado (validação autônoma, rodada 2) |
| **Funcionalidade** | 03-correcoes-backend |
| **Spec relacionada** | [spec.md](./spec.md) · [validation.md](./validation.md) |

## 1. Contexto e problema

A validação completa da implementação do back-end (features 00/01/02) apontou o back-end como **sólido com ressalvas**: as regras de negócio estão corretas e testadas, mas foram encontrados problemas reais de **segurança, contrato de erros e consistência transacional** que precisam ser corrigidos antes de considerar a implementação concluída e antes de iniciar o front-end.

## 2. Objetivo / resultado esperado

Corrigir todos os achados da validação, deixando o back-end **correto, seguro e consistente** com a documentação:
- Respostas de erro padronizadas, **sem vazar detalhes internos**.
- **CORS restrito** à origem do front-end.
- **Consistência transacional** também no `ProdutoService`.
- Índice de `deleted_at` conforme a modelagem.
- Documentação alinhada ao comportamento real.

## 3. Escopo

**Dentro do escopo (achados da validação):**
- **#1 (crítico):** handler global de exceções — 404 (`ModelNotFoundException`/`NotFoundHttpException`) e 500 genérico retornam JSON padronizado (`{ message }`) **sem** stack trace, caminhos ou nomes de classe. Manter 422 (validação) e o `render()` da `RegraDeNegocioException` (409/422).
- **#2 (médio):** `config/cors.php` restrito à origem do front (`FRONTEND_URL`), em vez do fallback permissivo `*`.
- **#3 (médio):** `DB::transaction` em `ProdutoService::excluir()` e `restaurar()` (duas escritas cada); reset de `excluido_em_cascata` na restauração (simetria/robustez).
- **#4 (baixo):** migration adicionando índice `deleted_at` em `empresas` e `produtos`.
- **#5 (obs):** ajustar `docs/15` (derivação de `acoes_permitidas` do produto — `editar` exige empresa apta) e o exemplo de payload de Empresa (`produtos_count`).

**Fora do escopo:**
- Qualquer nova funcionalidade de negócio; front-end (04/05).
- Alterar regras de negócio já validadas (apenas corrigir/endurecer).

## 4. Atores e fluxos de uso

Sem ator de usuário final — correção técnica. Melhora a robustez para o consumo pelo front-end (04/05) e a conformidade com [docs/11](../../docs/11-seguranca.md) e [docs/15](../../docs/15-contrato-api.md).

## 5. Requisitos funcionais

- Erros não tratados (404, 500) retornam JSON `{ message }` padronizado.
- CORS permite apenas a origem do front-end configurada.
- Operações de exclusão/restauração de produto são atômicas.

## 6. Regras de negócio aplicáveis

Não altera regras de negócio. Reforça requisitos já documentados:
- **Erros sem detalhes internos**, mensagens ao usuário — [docs/11 §Back-end](../../docs/11-seguranca.md) e [docs/03 §Validações](../../docs/03-modelagem.md#validações--princípios).
- **Respostas padronizadas** (404/500) — [docs/15 §Tratamento de erros](../../docs/15-contrato-api.md#tratamento-de-erros--formatos-padronizados).
- **CORS restrito** — [docs/11](../../docs/11-seguranca.md).
- **Operações multi-escrita transacionais** (exclusão/restauração de produto — consistência de dados) — [docs/11 §Consistência de dados como segurança](../../docs/11-seguranca.md#consistência-de-dados-como-segurança) · [AGENTS §6](../../AGENTS.md). (As cascatas de **empresa** já transacionais seguem [docs/02 §7](../../docs/02-regras-de-negocio.md#7-mecânicas-obrigatórias).)
- **Índice `deleted_at`** — [docs/13 §Índices (resumo)](../../docs/13-persistencia-e-banco.md#índices-resumo).

## 7. Requisitos não-funcionais relevantes

- Segurança ([docs/11](../../docs/11-seguranca.md)); padronização ([docs/09 §Padronização](../../docs/09-arquitetura-backend.md#padronização-de-respostas)); performance ([docs/12](../../docs/12-performance.md)).
- Nenhuma regressão: a suíte existente (39 testes) deve permanecer verde.

## 8. Critérios de aceite

- [ ] `GET /api/empresas/{id inexistente}` e `/api/produtos/{id inexistente}` retornam **404** com corpo `{ "message": "..." }` **sem** `trace`/`exception`/`file` e sem nome de classe/ID interno.
- [ ] Um erro interno (500) retorna mensagem genérica, sem detalhes internos.
- [ ] Respostas 422 (validação) e 409 (regra de negócio) permanecem no formato atual.
- [ ] `OPTIONS`/requisições com `Origin` do front recebem `Access-Control-Allow-Origin` **igual ao `FRONTEND_URL`**, não `*`.
- [ ] `ProdutoService::excluir()` e `restaurar()` executam em transação; restauração reseta `excluido_em_cascata`.
- [ ] `empresas` e `produtos` possuem índice em `deleted_at` (verificável por `SHOW INDEX`).
- [ ] `docs/15` reflete a regra real de `editar` do produto e inclui `produtos_count` no exemplo de Empresa.
- [ ] `php artisan test` permanece verde (com novos testes de 404/erro).
