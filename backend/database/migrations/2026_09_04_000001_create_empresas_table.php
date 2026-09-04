<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('empresas', function (Blueprint $table) {
            $table->id();
            $table->string('nome', 150);
            // Unicidade incluindo registros excluídos logicamente (índice único simples).
            $table->string('cnpj')->unique();
            $table->string('email')->unique();
            $table->string('telefone');
            $table->string('status', 10)->default('Ativo');
            $table->softDeletes();
            $table->timestamps();

            // Índices de apoio a listagens/filtros.
            $table->index('status');
            $table->index('nome');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('empresas');
    }
};
