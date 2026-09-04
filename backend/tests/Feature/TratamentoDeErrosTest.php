<?php

use App\Models\Empresa;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Route;

uses(RefreshDatabase::class);

it('retorna 404 padronizado, sem detalhes internos, para recurso inexistente', function () {
    foreach (['/api/empresas/999999', '/api/produtos/999999'] as $url) {
        $this->getJson($url)
            ->assertStatus(404)
            ->assertExactJson(['message' => 'Registro não encontrado.'])
            ->assertJsonMissingPath('trace')
            ->assertJsonMissingPath('exception')
            ->assertJsonMissingPath('file');
    }
});

it('retorna 500 genérico, sem vazar trace/detalhes, para erro inesperado', function () {
    Route::get('/api/_boom', fn () => throw new RuntimeException('detalhe interno sensível'));

    $resposta = $this->getJson('/api/_boom')
        ->assertStatus(500)
        ->assertJsonPath('message', 'Ocorreu um erro inesperado. Tente novamente.')
        ->assertJsonMissingPath('trace')
        ->assertJsonMissingPath('exception')
        ->assertJsonMissingPath('file');

    // Garante que a mensagem interna não vazou em lugar nenhum do corpo.
    expect($resposta->getContent())->not->toContain('detalhe interno sensível');
});

it('preserva 422 de validação (não é engolido pelo handler genérico)', function () {
    $this->postJson('/api/empresas', ['nome' => ''])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['nome', 'cnpj', 'email', 'telefone']);
});

it('preserva 409 de regra de negócio', function () {
    $empresa = Empresa::factory()->create();

    // exclusão física de empresa não excluída → 409 com code
    $this->deleteJson("/api/empresas/{$empresa->id}/forcar")
        ->assertStatus(409)
        ->assertJsonPath('code', 'registro_nao_excluido');
});
