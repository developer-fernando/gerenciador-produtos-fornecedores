<?php

namespace App\Services;

use App\Exceptions\RegraDeNegocioException;
use App\Models\Empresa;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

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
            throw RegraDeNegocioException::registroExcluido();
        }

        $empresa->update($dados);

        return $empresa->loadCount('produtos');
    }

    /**
     * Inativa a empresa e, em cascata, inativa seus produtos (transacional).
     */
    public function inativar(int $id): Empresa
    {
        $empresa = Empresa::withTrashed()->findOrFail($id);

        if ($empresa->trashed()) {
            throw RegraDeNegocioException::registroExcluido();
        }

        return DB::transaction(function () use ($empresa) {
            $empresa->update(['status' => 'Inativo']);
            $empresa->produtos()->update(['status' => 'Inativo']);

            return $empresa->loadCount('produtos');
        });
    }

    /**
     * Reativa a empresa. Os produtos NÃO são reativados automaticamente (regra 3).
     */
    public function reativar(int $id): Empresa
    {
        $empresa = Empresa::withTrashed()->findOrFail($id);

        if ($empresa->trashed()) {
            throw RegraDeNegocioException::registroExcluido();
        }

        $empresa->update(['status' => 'Ativo']);

        return $empresa->loadCount('produtos');
    }

    /**
     * Exclusão lógica da empresa com cascata: os produtos não excluídos são
     * marcados com `excluido_em_cascata = true` e excluídos logicamente (transacional).
     */
    public function excluir(int $id): Empresa
    {
        $empresa = Empresa::withTrashed()->findOrFail($id);

        if ($empresa->trashed()) {
            throw RegraDeNegocioException::registroExcluido();
        }

        return DB::transaction(function () use ($empresa) {
            // Marca e exclui em cascata apenas os produtos ainda não excluídos.
            $empresa->produtos()->update(['excluido_em_cascata' => true]);
            $empresa->produtos()->delete();
            $empresa->delete();

            return $empresa->loadCount('produtos');
        });
    }

    /**
     * Restauração da empresa: restaura apenas os produtos excluídos pela cascata
     * (`excluido_em_cascata = true`), limpando a marca. Os excluídos individualmente
     * permanecem excluídos (transacional).
     */
    public function restaurar(int $id): Empresa
    {
        $empresa = Empresa::withTrashed()->findOrFail($id);

        if (! $empresa->trashed()) {
            throw new RegraDeNegocioException('A empresa não está excluída.', 'registro_nao_excluido');
        }

        return DB::transaction(function () use ($empresa) {
            $empresa->restore();

            $empresa->produtos()
                ->onlyTrashed()
                ->where('excluido_em_cascata', true)
                ->restore();

            $empresa->produtos()
                ->where('excluido_em_cascata', true)
                ->update(['excluido_em_cascata' => false]);

            return $empresa->loadCount('produtos');
        });
    }

    /**
     * Exclusão física (definitiva): permitida apenas quando a empresa está
     * excluída logicamente E não possui nenhum produto vinculado (incl. excluídos).
     */
    public function forcar(int $id): void
    {
        $empresa = Empresa::withTrashed()->findOrFail($id);

        if (! $empresa->trashed()) {
            throw RegraDeNegocioException::registroNaoExcluido();
        }

        if ($empresa->produtos()->withTrashed()->exists()) {
            throw RegraDeNegocioException::empresaComProdutosVinculados();
        }

        $empresa->forceDelete();
    }
}
