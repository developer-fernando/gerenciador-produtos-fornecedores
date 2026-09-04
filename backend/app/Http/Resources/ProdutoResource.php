<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\Produto
 */
class ProdutoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'empresa_id' => $this->empresa_id,
            'empresa' => $this->whenLoaded('empresa', fn () => [
                'id' => $this->empresa->id,
                'nome' => $this->empresa->nome,
                'status' => $this->empresa->status,
                'excluido' => $this->empresa->trashed(),
            ]),
            'nome' => $this->nome,
            'descricao' => $this->descricao,
            'preco' => $this->preco,
            'codigo_interno' => $this->codigo_interno,
            'status' => $this->status,
            'excluido' => $this->resource->trashed(),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'deleted_at' => $this->deleted_at,
            'acoes_permitidas' => $this->acoesPermitidas(),
        ];
    }

    /**
     * Ações derivadas do estado do produto e da aptidão da empresa vinculada.
     * `editar`/`reativar` exigem empresa apta; `restaurar` exige empresa não excluída. Ver docs/15.
     */
    private function acoesPermitidas(): array
    {
        $empresa = $this->resource->relationLoaded('empresa')
            ? $this->resource->empresa
            : $this->resource->empresa()->withTrashed()->first();

        $empresaExcluida = $empresa === null || $empresa->trashed();
        $empresaApta = ! $empresaExcluida && $empresa->status === 'Ativo';

        $excluido = $this->resource->trashed();
        $ativo = $this->status === 'Ativo';

        return [
            'editar' => ! $excluido && $empresaApta,
            'inativar' => ! $excluido && $ativo,
            'reativar' => ! $excluido && ! $ativo && $empresaApta,
            'excluir' => ! $excluido,
            'restaurar' => $excluido && ! $empresaExcluida,
            'excluir_definitivamente' => $excluido,
        ];
    }
}
