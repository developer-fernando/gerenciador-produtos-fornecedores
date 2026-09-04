<?php

namespace App\Http\Requests;

/**
 * Mesmas regras do cadastro, mas a unicidade ignora o próprio registro em edição.
 */
class UpdateEmpresaRequest extends StoreEmpresaRequest
{
    public function rules(): array
    {
        return $this->regras((int) $this->route('empresa'));
    }
}
