<?php

namespace Database\Factories;

use App\Models\Empresa;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Empresa>
 */
class EmpresaFactory extends Factory
{
    protected $model = Empresa::class;

    public function definition(): array
    {
        return [
            'nome' => $this->faker->unique()->company(),
            'cnpj' => $this->cnpjValido(),
            'email' => $this->faker->unique()->safeEmail(),
            'telefone' => $this->faker->numerify('###########'), // 11 dígitos (DDD + número)
            'status' => 'Ativo',
        ];
    }

    /** Empresa inativa. */
    public function inativa(): static
    {
        return $this->state(fn () => ['status' => 'Inativo']);
    }

    /** Empresa excluída logicamente. */
    public function excluida(): static
    {
        return $this->state(fn () => ['deleted_at' => now()]);
    }

    /**
     * Gera um CNPJ válido (14 dígitos, com dígitos verificadores corretos), normalizado.
     */
    protected function cnpjValido(): string
    {
        $n = [];
        for ($i = 0; $i < 8; $i++) {
            $n[] = random_int(0, 9);
        }
        // Filial padrão 0001.
        array_push($n, 0, 0, 0, 1);

        $digito = function (array $base, array $pesos): int {
            $soma = 0;
            foreach ($pesos as $i => $peso) {
                $soma += $base[$i] * $peso;
            }
            $resto = $soma % 11;

            return $resto < 2 ? 0 : 11 - $resto;
        };

        $n[] = $digito($n, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
        $n[] = $digito($n, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);

        return implode('', $n);
    }
}
