import { useState } from 'react'
import { Button } from '../../../shared/components/Button'
import { campoClasses, idErro } from '../../../shared/components/fieldClasses'
import { FormField } from '../../../shared/components/FormField'
import { Modal } from '../../../shared/components/Modal'
import { useToast } from '../../../shared/components/toastContext'
import { ehApiError } from '../../../lib/errors'
import { useProdutoMutations } from '../hooks'
import type { Produto, ProdutoFormInput } from '../types'
import { validarProduto } from '../validarProduto'
import type { ErrosProduto } from '../validarProduto'
import { EmpresaAptaSelect } from './EmpresaAptaSelect'

const VAZIO: ProdutoFormInput = {
  empresa_id: '',
  nome: '',
  descricao: '',
  preco: '',
  codigo_interno: '',
  status: 'Ativo',
}

function doProduto(produto: Produto): ProdutoFormInput {
  return {
    empresa_id: produto.empresa_id,
    nome: produto.nome,
    descricao: produto.descricao ?? '',
    preco: produto.preco,
    codigo_interno: produto.codigo_interno,
    status: produto.status,
  }
}

/**
 * Formulário de criar/editar produto. Seletor de empresa apta; valida no cliente
 * (UX) e mapeia os erros do servidor (422) para o campo; 409/422 de regra viram
 * feedback (toast). Montado por `key` (estado inicial das props).
 */
export function ProdutoFormModal({
  produto,
  onClose,
}: {
  produto?: Produto | null
  onClose: () => void
}) {
  const editando = Boolean(produto)
  const { criar, atualizar } = useProdutoMutations()
  const toast = useToast()

  const [form, setForm] = useState<ProdutoFormInput>(() =>
    produto ? doProduto(produto) : VAZIO,
  )
  const [erros, setErros] = useState<ErrosProduto>({})

  const salvando = criar.isPending || atualizar.isPending

  function alterar<K extends keyof ProdutoFormInput>(campo: K, valor: ProdutoFormInput[K]) {
    setForm((f) => ({ ...f, [campo]: valor }))
  }

  function tratarErro(erro: unknown) {
    if (ehApiError(erro) && erro.fieldErrors) {
      setErros(erro.fieldErrors as ErrosProduto)
      return
    }
    toast.erro(ehApiError(erro) ? erro.message : 'Não foi possível salvar o produto.')
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errosLocais = validarProduto(form)
    setErros(errosLocais)
    if (Object.keys(errosLocais).length > 0) return

    if (produto) {
      atualizar.mutate(
        { id: produto.id, input: form },
        {
          onSuccess: () => {
            toast.sucesso('Produto atualizado com sucesso.')
            onClose()
          },
          onError: tratarErro,
        },
      )
    } else {
      criar.mutate(form, {
        onSuccess: () => {
          toast.sucesso('Produto criado com sucesso.')
          onClose()
        },
        onError: tratarErro,
      })
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={editando ? 'Editar produto' : 'Novo produto'}
      footer={
        <>
          <Button variante="secundario" onClick={onClose} disabled={salvando}>
            Cancelar
          </Button>
          <Button variante="primario" type="submit" form="produto-form" disabled={salvando}>
            {salvando ? 'Salvando…' : 'Salvar'}
          </Button>
        </>
      }
    >
      <form id="produto-form" onSubmit={onSubmit} noValidate>
        <EmpresaAptaSelect
          value={form.empresa_id}
          onChange={(empresaId) => alterar('empresa_id', empresaId)}
          empresaVinculada={produto?.empresa}
          error={erros.empresa_id}
        />

        <FormField id="produto-nome" label="Nome" required error={erros.nome}>
          <input
            id="produto-nome"
            className={campoClasses(Boolean(erros.nome))}
            value={form.nome}
            onChange={(e) => alterar('nome', e.target.value)}
            aria-invalid={Boolean(erros.nome)}
            aria-describedby={erros.nome ? idErro('produto-nome') : undefined}
          />
        </FormField>

        <FormField id="produto-descricao" label="Descrição" error={erros.descricao}>
          <textarea
            id="produto-descricao"
            className={campoClasses(Boolean(erros.descricao))}
            rows={3}
            value={form.descricao}
            onChange={(e) => alterar('descricao', e.target.value)}
            aria-invalid={Boolean(erros.descricao)}
            aria-describedby={erros.descricao ? idErro('produto-descricao') : undefined}
          />
        </FormField>

        <FormField id="produto-preco" label="Preço (R$)" required error={erros.preco}>
          <input
            id="produto-preco"
            className={campoClasses(Boolean(erros.preco))}
            inputMode="decimal"
            placeholder="0,00"
            value={form.preco}
            onChange={(e) => alterar('preco', e.target.value)}
            aria-invalid={Boolean(erros.preco)}
            aria-describedby={erros.preco ? idErro('produto-preco') : undefined}
          />
        </FormField>

        <FormField
          id="produto-codigo"
          label="Código interno"
          required
          error={erros.codigo_interno}
        >
          <input
            id="produto-codigo"
            className={campoClasses(Boolean(erros.codigo_interno))}
            value={form.codigo_interno}
            onChange={(e) => alterar('codigo_interno', e.target.value)}
            aria-invalid={Boolean(erros.codigo_interno)}
            aria-describedby={erros.codigo_interno ? idErro('produto-codigo') : undefined}
          />
        </FormField>

        <FormField id="produto-status" label="Status" required error={erros.status}>
          <select
            id="produto-status"
            className={campoClasses(Boolean(erros.status))}
            value={form.status}
            onChange={(e) => alterar('status', e.target.value as ProdutoFormInput['status'])}
          >
            <option value="Ativo">Ativo</option>
            <option value="Inativo">Inativo</option>
          </select>
        </FormField>
      </form>
    </Modal>
  )
}
