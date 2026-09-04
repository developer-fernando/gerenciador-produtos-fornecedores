<?php

namespace Database\Factories;

use App\Models\Empresa;
use App\Models\Produto;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Produto>
 */
class ProdutoFactory extends Factory
{
    protected $model = Produto::class;

    public function definition(): array
    {
        return [
            'empresa_id' => Empresa::factory(),
            'nome' => ucfirst($this->faker->words(3, true)),
            'descricao' => $this->faker->optional()->sentence(),
            'preco' => $this->faker->randomFloat(2, 1, 9999),
            'codigo_interno' => strtoupper($this->faker->unique()->bothify('SKU-####')),
            'status' => 'Ativo',
            'excluido_em_cascata' => false,
        ];
    }

    /** Produto inativo. */
    public function inativo(): static
    {
        return $this->state(fn () => ['status' => 'Inativo']);
    }

    /** Produto excluído individualmente. */
    public function excluido(): static
    {
        return $this->state(fn () => [
            'deleted_at' => now(),
            'excluido_em_cascata' => false,
        ]);
    }

    /** Produto excluído pela cascata da empresa (regra 6). */
    public function excluidoEmCascata(): static
    {
        return $this->state(fn () => [
            'deleted_at' => now(),
            'excluido_em_cascata' => true,
        ]);
    }
}
