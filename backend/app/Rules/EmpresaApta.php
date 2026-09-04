<?php

namespace App\Rules;

use App\Models\Empresa;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

/**
 * Valida que o `empresa_id` referencia uma empresa existente, ativa e não excluída.
 * Produto só pode ser vinculado a uma empresa apta (docs/02 §5).
 */
class EmpresaApta implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $empresa = Empresa::withTrashed()->find($value);

        if ($empresa === null) {
            $fail('A empresa informada não existe.');

            return;
        }

        if ($empresa->trashed() || $empresa->status !== 'Ativo') {
            $fail('A empresa deve estar ativa e não excluída.');
        }
    }
}
