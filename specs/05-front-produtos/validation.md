# Validação — Front: Produtos

| Campo | Valor |
|---|---|
| **Funcionalidade** | 05-front-produtos |
| **Artefatos avaliados** | [prd.md](./prd.md) · [spec.md](./spec.md) |
| **Veredito atual** | **Concluído** — validação estática aprovada (2 rodadas) + camada executável verde (59 testes); E2E via Docker conferido; logo real permanece no fechamento |
| **Rodadas** | 2 estáticas + camada executável |
| **Verificador** | verificação independente em contexto novo (sessão/chat separada; subagente é uma opção) · modelo: Sonnet (diferente do autor) |

> A camada **executável** (Vitest/MSW + build/lint) e a **verificação manual** de UI são registradas na conclusão dos tickets.

## Rodada 1 — REPROVADO (1 bloqueante)

- [x] **F1** — O seletor de empresa apta usava `GET /empresas?status=Ativo`, que é **paginado (10/pág, sem `per_page` no contrato)**; buscar só a 1ª página deixaria empresas aptas de fora → com >10 aptas, a 11ª+ ficava **inacessível ao criar** produto. A mitigação original só cobria a edição. → Corrigido: `listarEmpresasAptas()` **itera todas as páginas**; `EmpresaAptaSelect` recebe `empresaVinculada?` (edição) e trata "nenhuma apta" bloqueando o submit; teste `>10 aptas → todas selecionáveis`.

### Não-bloqueantes (corrigidos)
- [x] **N1** — Faltava teste do `reativar` → 422 (`empresa_inativa_ou_excluida`) → adicionado (Spec §6, ticket 05-T5).
- [x] **N2** — Contrato do `EmpresaAptaSelect`/`empresaVinculada` sem teste → props definidas + teste da edição (Spec §4/§6).
- [x] **N3** — `AcoesPermitidas` estava só em `features/empresas/types.ts` (reuso "da base" impreciso) → **movido para `shared/types.ts`** (usado por 2 features), com a 04 importando de lá (ticket 05-T2).

## Rodada 2 — APROVADO (0 bloqueantes)

Reverificação em novo contexto: F1/N1/N2/N3 confirmados resolvidos com evidência `arquivo:linha`; iteração de páginas justificada (contrato sem `per_page`); rubrica completa em PASS. Três não-bloqueantes de clareza incorporados após a aprovação: **N5** este `validation.md` passou a registrar a trilha; **N6** teste de 422 em `preco` (além de `codigo_interno`) explicitado na Spec §6; **N7** ticket 05-T2 enumera os pontos de import a ajustar no move de `AcoesPermitidas`.

| # | Critério | Veredito |
|---|---|---|
| 1 | Completude | PASS |
| 2 | Consistência com `docs/` | PASS |
| 3 | Arquitetura | PASS |
| 4 | Contrato/modelagem | PASS |
| 5 | Rastreabilidade | PASS |
| 6 | Fundamentação | PASS |
| 7 | Escopo | PASS |
| 8 | Contradições internas | PASS |
| 9 | Verificabilidade | PASS |
| 10 | Riscos/lacunas | PASS |

## Camada executável (conclusão — 05-T6)

Implementação validada por **ground truth executável** (`frontend/`):
- **`npm run build`** (tsc + vite) — verde.
- **`npm run test`** (Vitest + RTL + user-event + MSW) — **59 passed / 11 arquivos**, cobrindo: seletor de empresa apta (iteração de páginas F1, `empresaVinculada`, vazio), formulário (422 em `codigo_interno`/`preco`, validação local, sucesso), listagem (loading/vazio/erro/paginação/filtros/badge/invalidação), ações condicionais (4 estados) + irreversível + 409 `empresa_excluida` + 422 `empresa_inativa_ou_excluida`.
- **`npm run lint`** (oxlint) — sem erros nem warnings.
- Sem `dangerouslySetInnerHTML` em `frontend/src`; sem segredos no bundle.

## Verificação manual necessária

Comportamentos conferidos via Docker (`http://localhost:5173`, API real):
- [x] **Navegação Empresas ↔ Produtos** — NavLink com estado ativo; troca de seção sem recarregar o app.
- [x] **Seletor de empresa apta** — 5 opções (Corona-Queirós, Deverso e Meireles, Ferreira Comercial, Molina e Corona, Pena-Sanches); **não** inclui a inativa Carvalho Comercial nem a excluída Zambrano e Aranda.
- [x] **Fluxo ponta a ponta** (produto de teste `Horizon T6 Validação` / `HZ-T6-001`): criar (lista 23→24 sem reload, preço `R$ 12,50`) → editar (troca Pena-Sanches → Corona-Queirós) → inativar (ações passam a Editar/Reativar/Excluir) → excluir lógico (some da listagem padrão; filtro de excluídos mostra badge Excluído + Restaurar/Excluir definitivamente) → restaurar (volta à listagem padrão).
- [x] **Filtro de excluídos** — sem o filtro, o produto excluído não aparece (`Nenhum produto encontrado.` com o nome filtrado).
- [x] **Ações condicionais** — ativo/apta: Editar/Inativar/Excluir; empresa inativa (Carvalho): sem Editar; excluído com empresa apta: Restaurar + Excluir definitivamente.
- [x] **Aviso de irreversibilidade** — diálogo "Excluir definitivamente" (verificado no T5 em produto da Zambrano; botão presente no T6 no produto de teste excluído).
- [x] **Foco de teclado visível** — Tab em ação da linha (`Editar`) aplica outline `2px solid` (`:focus-visible` em `global.css`).
- [ ] **Logo no cabeçalho:** substituir o fallback textual pelo arquivo real (dependência: usuário fornece a logo). Item de **fechamento**, não bloqueia a 05.

## Histórico de rodadas

| Rodada | Veredito | Bloqueantes | Observação |
|---|---|---|---|
| 1 | Reprovado | 1 (F1 seletor trunca em 10) | + N1–N3 |
| 2 | **Aprovado** | 0 | + N5–N7 (clareza, incorporados) |
| executável (05-T6) | **Concluído** | 0 | 59 testes; E2E via Docker; logo real no fechamento |
