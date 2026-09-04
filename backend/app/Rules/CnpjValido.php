<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

/**
 * Valida um CNPJ conferindo os dígitos verificadores.
 * Aceita entrada com ou sem máscara (considera apenas os dígitos).
 */
class CnpjValido implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $cnpj = preg_replace('/\D/', '', (string) $value);

        // Tamanho e rejeição de sequências repetidas (ex.: 00000000000000).
        if (strlen($cnpj) !== 14 || preg_match('/^(\d)\1{13}$/', $cnpj)) {
            $fail('O :attribute informado não é válido.');

            return;
        }

        if ((int) $cnpj[12] !== $this->digitoVerificador($cnpj, 12)
            || (int) $cnpj[13] !== $this->digitoVerificador($cnpj, 13)) {
            $fail('O :attribute informado não é válido.');
        }
    }

    /**
     * Calcula o dígito verificador considerando os primeiros $tamanho dígitos.
     */
    private function digitoVerificador(string $cnpj, int $tamanho): int
    {
        $peso = $tamanho - 7;
        $soma = 0;

        for ($i = 0; $i < $tamanho; $i++) {
            $soma += ((int) $cnpj[$i]) * $peso--;
            if ($peso < 2) {
                $peso = 9;
            }
        }

        $resto = $soma % 11;

        return $resto < 2 ? 0 : 11 - $resto;
    }
}
