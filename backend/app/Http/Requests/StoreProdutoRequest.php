<?php

namespace App\Http\Requests;

use App\Rules\EmpresaApta;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreProdutoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return $this->regras(null);
    }

    /**
     * Regras; `$ignorarId` é usado na edição. A unicidade do código interno é por
     * empresa (escopada ao `empresa_id` enviado) e inclui registros excluídos logicamente.
     */
    protected function regras(?int $ignorarId): array
    {
        return [
            'empresa_id' => ['required', 'integer', new EmpresaApta],
            'nome' => ['required', 'string', 'min:3', 'max:150'],
            'descricao' => ['nullable', 'string', 'max:2000'],
            'preco' => ['required', 'numeric', 'gt:0', 'decimal:0,2'],
            'codigo_interno' => [
                'required', 'string', 'max:255',
                Rule::unique('produtos', 'codigo_interno')
                    ->where(fn ($q) => $q->where('empresa_id', $this->input('empresa_id')))
                    ->ignore($ignorarId),
            ],
            'status' => ['nullable', 'in:Ativo,Inativo'],
        ];
    }

    public function attributes(): array
    {
        return [
            'empresa_id' => 'empresa',
            'nome' => 'nome',
            'descricao' => 'descrição',
            'preco' => 'preço',
            'codigo_interno' => 'código interno',
            'status' => 'status',
        ];
    }

    public function messages(): array
    {
        return [
            'required' => 'O campo :attribute é obrigatório.',
            'nome.min' => 'O nome deve ter no mínimo 3 caracteres.',
            'nome.max' => 'O nome deve ter no máximo 150 caracteres.',
            'descricao.max' => 'A descrição deve ter no máximo 2.000 caracteres.',
            'preco.gt' => 'O preço deve ser maior que zero.',
            'preco.decimal' => 'O preço deve ter no máximo 2 casas decimais.',
            'codigo_interno.unique' => 'Este código interno já está em uso nesta empresa.',
            'status.in' => 'O status deve ser Ativo ou Inativo.',
        ];
    }
}
