<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\Empresa
 */
class EmpresaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'nome' => $this->nome,
            'cnpj' => $this->cnpj,
            'email' => $this->email,
            'telefone' => $this->telefone,
            'status' => $this->status,
            'excluido' => $this->resource->trashed(),
            'produtos_count' => $this->whenCounted('produtos'),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'deleted_at' => $this->deleted_at,
            'acoes_permitidas' => $this->acoesPermitidas(),
        ];
    }

    /**
     * Ações permitidas derivadas do estado (status × exclusão lógica) e da
     * existência de produtos vinculados. A UI usa isto; o servidor revalida. Ver docs/15.
     */
    private function acoesPermitidas(): array
    {
        $excluido = $this->resource->trashed();
        $ativo = $this->status === 'Ativo';

        // Total de produtos incluindo excluídos logicamente (regra da exclusão física).
        $temProdutos = ($this->produtos_total ?? $this->resource->produtos()->withTrashed()->count()) > 0;

        if ($excluido) {
            return [
                'editar' => false,
                'inativar' => false,
                'reativar' => false,
                'excluir' => false,
                'restaurar' => true,
                'excluir_definitivamente' => ! $temProdutos,
            ];
        }

        return [
            'editar' => true,
            'inativar' => $ativo,
            'reativar' => ! $ativo,
            'excluir' => true,
            'restaurar' => false,
            'excluir_definitivamente' => false,
        ];
    }
}
