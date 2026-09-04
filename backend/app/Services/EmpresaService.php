<?php

namespace App\Services;

use App\Models\Empresa;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class EmpresaService
{
    private const POR_PAGINA = 10;

    /**
     * Lista empresas com paginação e filtros (nome parcial, status, excluídos).
     * Por padrão não retorna excluídos; `excluidos=true` retorna somente os excluídos.
     *
     * @param  array{nome?: string|null, status?: string|null, excluidos?: bool}  $filtros
     */
    public function listar(array $filtros = []): LengthAwarePaginator
    {
        $query = Empresa::query()
            ->withCount('produtos')
            ->withCount(['produtos as produtos_total' => fn ($q) => $q->withTrashed()]);

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

    /**
     * Busca uma empresa por id, inclusive excluída logicamente (para detalhamento).
     */
    public function buscar(int $id): Empresa
    {
        return Empresa::withTrashed()
            ->withCount('produtos')
            ->withCount(['produtos as produtos_total' => fn ($q) => $q->withTrashed()])
            ->findOrFail($id);
    }

    /**
     * Cria uma empresa (status padrão Ativo).
     *
     * @param  array<string, mixed>  $dados
     */
    public function criar(array $dados): Empresa
    {
        $dados['status'] = $dados['status'] ?? 'Ativo';

        $empresa = Empresa::create($dados);

        return $empresa->loadCount('produtos');
    }

    /**
     * Atualiza uma empresa não excluída. Editar empresa excluída não é permitido.
     *
     * @param  array<string, mixed>  $dados
     */
    public function atualizar(int $id, array $dados): Empresa
    {
        $empresa = Empresa::withTrashed()->findOrFail($id);

        if ($empresa->trashed()) {
            throw \App\Exceptions\RegraDeNegocioException::registroExcluido();
        }

        $empresa->update($dados);

        return $empresa->loadCount('produtos');
    }
}
