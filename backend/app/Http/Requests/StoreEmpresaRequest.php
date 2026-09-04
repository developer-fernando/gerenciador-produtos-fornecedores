<?php

namespace App\Http\Requests;

use App\Rules\CnpjValido;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreEmpresaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Normaliza CNPJ e telefone para apenas dígitos antes da validação.
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'cnpj' => $this->cnpj !== null ? preg_replace('/\D/', '', (string) $this->cnpj) : null,
            'telefone' => $this->telefone !== null ? preg_replace('/\D/', '', (string) $this->telefone) : null,
        ]);
    }

    public function rules(): array
    {
        return $this->regras(null);
    }

    /**
     * Regras de validação; `$ignorarId` é usado na edição para ignorar o próprio registro.
     * A unicidade considera também registros excluídos logicamente (query direta, sem `withoutTrashed`).
     */
    protected function regras(?int $ignorarId): array
    {
        return [
            'nome' => ['required', 'string', 'min:3', 'max:150'],
            'cnpj' => ['required', 'string', new CnpjValido, Rule::unique('empresas', 'cnpj')->ignore($ignorarId)],
            'email' => ['required', 'email:rfc', 'max:255', Rule::unique('empresas', 'email')->ignore($ignorarId)],
            'telefone' => ['required', 'string', 'regex:/^\d{10,11}$/'],
            'status' => ['nullable', 'in:Ativo,Inativo'],
        ];
    }

    public function attributes(): array
    {
        return [
            'nome' => 'nome',
            'cnpj' => 'CNPJ',
            'email' => 'e-mail',
            'telefone' => 'telefone',
            'status' => 'status',
        ];
    }

    public function messages(): array
    {
        return [
            'required' => 'O campo :attribute é obrigatório.',
            'nome.min' => 'O nome deve ter no mínimo 3 caracteres.',
            'nome.max' => 'O nome deve ter no máximo 150 caracteres.',
            'cnpj.unique' => 'Este CNPJ já está cadastrado.',
            'email.email' => 'Informe um e-mail válido.',
            'email.unique' => 'Este e-mail já está cadastrado.',
            'telefone.regex' => 'Informe um telefone válido com DDD (10 ou 11 dígitos).',
            'status.in' => 'O status deve ser Ativo ou Inativo.',
        ];
    }
}
