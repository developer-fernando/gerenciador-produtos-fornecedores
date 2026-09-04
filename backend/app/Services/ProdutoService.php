<?php

namespace App\Services;

use App\Exceptions\RegraDeNegocioException;
use App\Models\Produto;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProdutoService
{
    private const POR_PAGINA = 10;

    /**
     * Eager load da empresa incluindo excluídas (para exibir o vínculo mesmo quando
     * a empresa está soft-deleted e para derivar `acoes_permitidas`).
     */
    private function comEmpresa(): array
    {
        return ['empresa' => fn (BelongsTo $q) => $q->withTrashed()];
    }

    /**
     * @param  array{nome?: string|null, status?: string|null, excluidos?: bool}  $filtros
     */
    public function listar(array $filtros = []): LengthAwarePaginator
    {
        $query = Produto::query()->with($this->comEmpresa());

        if (! empty($filtros['excluidos'])) {
            $query->onlyTrashed();
        }

        if (! empty($filtros['nome'])) {
            $query->where('nome', 'like', '%'.$filtros['nome'].'%');
        }

        if (! empty($filtros['status'])) {
            $query->where('status', $filtros['status']);
        }

        return $query->orderBy('nome')->paginate(self::POR_PAGINA)->withQueryString();
    }

    public function buscar(int $id): Produto
    {
        return Produto::withTrashed()->with($this->comEmpresa())->findOrFail($id);
    }

    /**
     * @param  array<string, mixed>  $dados
     */
    public function criar(array $dados): Produto
    {
        $dados['status'] = $dados['status'] ?? 'Ativo';

        $produto = Produto::create($dados);

        return $produto->load($this->comEmpresa());
    }

    /**
     * Atualiza um produto não excluído (editar produto excluído não é permitido).
     *
     * @param  array<string, mixed>  $dados
     */
    public function atualizar(int $id, array $dados): Produto
    {
        $produto = Produto::withTrashed()->findOrFail($id);

        if ($produto->trashed()) {
            throw RegraDeNegocioException::registroExcluido();
        }

        $produto->update($dados);

        return $produto->load($this->comEmpresa());
    }

    /**
     * Inativa o produto (não permitido em produto excluído).
     */
    public function inativar(int $id): Produto
    {
        $produto = Produto::withTrashed()->findOrFail($id);

        if ($produto->trashed()) {
            throw RegraDeNegocioException::registroExcluido();
        }

        $produto->update(['status' => 'Inativo']);

        return $produto->load($this->comEmpresa());
    }

    /**
     * Reativa o produto — só permitido se a empresa vinculada estiver apta
     * (ativa e não excluída) e o produto não estiver excluído.
     */
    public function reativar(int $id): Produto
    {
        $produto = Produto::withTrashed()->with($this->comEmpresa())->findOrFail($id);

        if ($produto->trashed()) {
            throw RegraDeNegocioException::registroExcluido();
        }

        $empresa = $produto->empresa;
        if ($empresa === null || $empresa->trashed() || $empresa->status !== 'Ativo') {
            throw RegraDeNegocioException::empresaInativaOuExcluida();
        }

        $produto->update(['status' => 'Ativo']);

        return $produto->load($this->comEmpresa());
    }
}
