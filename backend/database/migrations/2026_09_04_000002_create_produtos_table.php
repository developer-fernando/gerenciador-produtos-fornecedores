<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('produtos', function (Blueprint $table) {
            $table->id();
            // Produto nunca sem empresa: FK obrigatória. Bloqueio de exclusão física
            // de empresa com produtos é garantido na aplicação; restrictOnDelete é rede de segurança.
            $table->foreignId('empresa_id')
                ->constrained('empresas')
                ->cascadeOnUpdate()
                ->restrictOnDelete();
            $table->string('nome', 150);
            $table->text('descricao')->nullable();
            $table->decimal('preco', 12, 2);
            $table->string('codigo_interno');
            $table->string('status', 10)->default('Ativo');
            // Marca produtos excluídos pela cascata da empresa (restauração seletiva — regra 6).
            $table->boolean('excluido_em_cascata')->default(false);
            $table->softDeletes();
            $table->timestamps();

            // Código interno único por empresa, incluindo registros excluídos logicamente.
            $table->unique(['empresa_id', 'codigo_interno']);
            $table->index('status');
            $table->index('nome');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('produtos');
    }
};
