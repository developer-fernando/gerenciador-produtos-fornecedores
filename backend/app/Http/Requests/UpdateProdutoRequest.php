<?php

namespace App\Http\Requests;

/**
 * Mesmas regras do cadastro; a unicidade ignora o próprio registro. O `empresa_id`
 * enviado é usado como escopo da unicidade, suportando a troca de vínculo (docs/02 §5).
 */
class UpdateProdutoRequest extends StoreProdutoRequest
{
    public function rules(): array
    {
        return $this->regras((int) $this->route('produto'));
    }
}
