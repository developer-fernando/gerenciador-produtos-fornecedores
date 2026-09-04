# Visão Geral

## O que é

Aplicação **web full stack** para o gerenciamento de **Empresas (Fornecedores)** e de seus **Produtos**, com um ciclo de vida controlado dos registros: cadastro, edição, inativação/reativação (status operacional), exclusão lógica com restauração (soft delete) e exclusão física quando permitida.

## Objetivo

Permitir **cadastrar e manter** Empresas (Fornecedores) e seus Produtos, garantindo consistência dos dados em todo o ciclo de vida.

## Problema que resolve

Manter um catálogo consistente de fornecedores e produtos, separando com clareza três conceitos distintos:

- **Inativo** — não usar mais por ora, mas o registro continua visível;
- **Excluído logicamente** — removido do fluxo de uso, mas preservado para consulta/histórico;
- **Excluído fisicamente** — apagado definitivamente, apenas quando as regras permitirem.

O sistema nunca pode deixar dados órfãos (produto sem empresa) nem estados inconsistentes.

## Escopo funcional

### Módulos do sistema
1. **Empresas (Fornecedores)**
2. **Produtos**

### Empresas
- Criar, editar e listar empresa.
- Inativar e reativar empresa.
- Excluir logicamente e restaurar empresa.
- Não permitir exclusão física de empresa que tenha produtos vinculados.

### Produtos
- Criar produto vinculado a uma empresa; editar e listar produto.
- Inativar e reativar produto.
- Excluir logicamente e restaurar produto.
- Excluir produto definitivamente (exclusão física permitida).

> Detalhamento das funcionalidades em [04-requisitos.md](04-requisitos.md); comportamento e regras em [02-regras-de-negocio.md](02-regras-de-negocio.md).

## Contexto do desafio

| Item | Definição |
|---|---|
| Foco de avaliação (🟩) | Organização e arquitetura, qualidade de código, boas práticas, capacidade de modelagem, validações e segurança, estruturação de API, front-end moderno e fluxo de uso/UI-UX. |
| Back-end | **Laravel** |
| Front-end | **React** |
| Autenticação | **Não necessária** |
| Prazo | 1 dia corrido |
| Entrega | Repositório GitHub (back-end + front-end) + README detalhado obrigatório |

> Critérios e pesos de avaliação em [07-criterios-de-avaliacao.md](07-criterios-de-avaliacao.md).
