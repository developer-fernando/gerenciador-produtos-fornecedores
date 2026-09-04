<?php

namespace Database\Seeders;

use App\Models\Empresa;
use App\Models\Produto;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Popula o banco de desenvolvimento com empresas e produtos de exemplo,
     * cobrindo os estados relevantes (ativo, inativo e excluído em cascata).
     */
    public function run(): void
    {
        // Empresas ativas, cada uma com alguns produtos ativos.
        Empresa::factory(5)
            ->has(Produto::factory()->count(4))
            ->create();

        // Uma empresa inativa com produtos.
        Empresa::factory()
            ->inativa()
            ->has(Produto::factory()->count(3))
            ->create();

        // Uma empresa excluída logicamente, com produtos excluídos pela cascata (regra 6).
        $excluida = Empresa::factory()->excluida()->create();
        Produto::factory()
            ->count(3)
            ->excluidoEmCascata()
            ->for($excluida)
            ->create();
    }
}
