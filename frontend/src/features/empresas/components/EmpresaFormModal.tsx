import { useState } from 'react'
import { Button } from '../../../shared/components/Button'
import { campoClasses, idErro } from '../../../shared/components/fieldClasses'
import { FormField } from '../../../shared/components/FormField'
import { Modal } from '../../../shared/components/Modal'
import { useToast } from '../../../shared/components/toastContext'
import { ehApiError } from '../../../lib/errors'
import { useEmpresaMutations } from '../hooks'
import type { Empresa, EmpresaFormInput } from '../types'
import { validarEmpresa } from '../validarEmpresa'
import type { ErrosEmpresa } from '../validarEmpresa'

const VAZIO: EmpresaFormInput = {
  nome: '',
  cnpj: '',
  email: '',
  telefone: '',
  status: 'Ativo',
}

function daEmpresa(empresa: Empresa): EmpresaFormInput {
  return {
    nome: empresa.nome,
    cnpj: empresa.cnpj,
    email: empresa.email,
    telefone: empresa.telefone,
    status: empresa.status,
  }
}

/**
 * Formulário de criar/editar empresa. Valida no cliente (UX) e mapeia os erros
 * do servidor (422) para o campo correspondente; 409/500 viram feedback (toast).
 * O sucesso fecha o modal e a invalidação das mutações atualiza a lista.
 *
 * É montado apenas quando aberto (o pai controla via `key`), então o estado
 * inicial vem direto das props — sem efeito de sincronização.
 */
export function EmpresaFormModal({
  empresa,
  onClose,
}: {
  empresa?: Empresa | null
  onClose: () => void
}) {
  const editando = Boolean(empresa)
  const { criar, atualizar } = useEmpresaMutations()
  const toast = useToast()

  const [form, setForm] = useState<EmpresaFormInput>(() =>
    empresa ? daEmpresa(empresa) : VAZIO,
  )
  const [erros, setErros] = useState<ErrosEmpresa>({})

  const salvando = criar.isPending || atualizar.isPending

  function alterar<K extends keyof EmpresaFormInput>(campo: K, valor: EmpresaFormInput[K]) {
    setForm((f) => ({ ...f, [campo]: valor }))
  }

  function tratarErro(erro: unknown) {
    if (ehApiError(erro) && erro.fieldErrors) {
      setErros(erro.fieldErrors as ErrosEmpresa)
      return
    }
    toast.erro(ehApiError(erro) ? erro.message : 'Não foi possível salvar a empresa.')
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errosLocais = validarEmpresa(form)
    setErros(errosLocais)
    if (Object.keys(errosLocais).length > 0) return

    if (empresa) {
      atualizar.mutate(
        { id: empresa.id, input: form },
        {
          onSuccess: () => {
            toast.sucesso('Empresa atualizada com sucesso.')
            onClose()
          },
          onError: tratarErro,
        },
      )
    } else {
      criar.mutate(form, {
        onSuccess: () => {
          toast.sucesso('Empresa criada com sucesso.')
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
      title={editando ? 'Editar empresa' : 'Nova empresa'}
      footer={
        <>
          <Button variante="secundario" onClick={onClose} disabled={salvando}>
            Cancelar
          </Button>
          <Button variante="primario" type="submit" form="empresa-form" disabled={salvando}>
            {salvando ? 'Salvando…' : 'Salvar'}
          </Button>
        </>
      }
    >
      <form id="empresa-form" onSubmit={onSubmit} noValidate>
        <FormField id="empresa-nome" label="Nome" required error={erros.nome}>
          <input
            id="empresa-nome"
            className={campoClasses(Boolean(erros.nome))}
            value={form.nome}
            onChange={(e) => alterar('nome', e.target.value)}
            aria-invalid={Boolean(erros.nome)}
            aria-describedby={erros.nome ? idErro('empresa-nome') : undefined}
          />
        </FormField>

        <FormField id="empresa-cnpj" label="CNPJ" required error={erros.cnpj}>
          <input
            id="empresa-cnpj"
            className={campoClasses(Boolean(erros.cnpj))}
            value={form.cnpj}
            onChange={(e) => alterar('cnpj', e.target.value)}
            aria-invalid={Boolean(erros.cnpj)}
            aria-describedby={erros.cnpj ? idErro('empresa-cnpj') : undefined}
          />
        </FormField>

        <FormField id="empresa-email" label="E-mail" required error={erros.email}>
          <input
            id="empresa-email"
            type="email"
            className={campoClasses(Boolean(erros.email))}
            value={form.email}
            onChange={(e) => alterar('email', e.target.value)}
            aria-invalid={Boolean(erros.email)}
            aria-describedby={erros.email ? idErro('empresa-email') : undefined}
          />
        </FormField>

        <FormField id="empresa-telefone" label="Telefone" required error={erros.telefone}>
          <input
            id="empresa-telefone"
            className={campoClasses(Boolean(erros.telefone))}
            value={form.telefone}
            onChange={(e) => alterar('telefone', e.target.value)}
            aria-invalid={Boolean(erros.telefone)}
            aria-describedby={erros.telefone ? idErro('empresa-telefone') : undefined}
          />
        </FormField>

        <FormField id="empresa-status" label="Status" required error={erros.status}>
          <select
            id="empresa-status"
            className={campoClasses(Boolean(erros.status))}
            value={form.status}
            onChange={(e) => alterar('status', e.target.value as EmpresaFormInput['status'])}
          >
            <option value="Ativo">Ativo</option>
            <option value="Inativo">Inativo</option>
          </select>
        </FormField>
      </form>
    </Modal>
  )
}
