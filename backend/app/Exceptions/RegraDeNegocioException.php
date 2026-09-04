<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Erro de regra de negócio, convertido em resposta JSON padronizada
 * ({ message, code }) com o status HTTP apropriado (ver docs/15).
 */
class RegraDeNegocioException extends Exception
{
    public function __construct(
        string $message,
        protected string $codigo = 'regra_de_negocio',
        protected int $status = 409,
    ) {
        parent::__construct($message);
    }

    public function render(Request $request): JsonResponse
    {
        return response()->json([
            'message' => $this->getMessage(),
            'code' => $this->codigo,
        ], $this->status);
    }

    /** Exclusão física de empresa com produtos vinculados (mesmo excluídos). */
    public static function empresaComProdutosVinculados(): self
    {
        return new self(
            'Não é possível excluir definitivamente a empresa: há produtos vinculados.',
            'empresa_com_produtos_vinculados',
        );
    }

    /** Exclusão definitiva de registro que não está excluído logicamente. */
    public static function registroNaoExcluido(): self
    {
        return new self(
            'A exclusão definitiva só é permitida para um registro já excluído.',
            'registro_nao_excluido',
        );
    }

    /** Operação (inativar/reativar/editar) sobre um registro já excluído logicamente. */
    public static function registroExcluido(): self
    {
        return new self(
            'Esta operação não é permitida em um registro excluído. Restaure-o antes.',
            'registro_excluido',
        );
    }

    /** Criar/editar/reativar produto vinculado a empresa inativa ou excluída (422). */
    public static function empresaInativaOuExcluida(): self
    {
        return new self(
            'A empresa vinculada deve estar ativa e não excluída.',
            'empresa_inativa_ou_excluida',
            422,
        );
    }

    /** Restaurar produto cuja empresa está excluída logicamente (409). */
    public static function empresaExcluida(): self
    {
        return new self(
            'Não é possível restaurar o produto: a empresa vinculada está excluída. Restaure a empresa antes.',
            'empresa_excluida',
        );
    }
}
