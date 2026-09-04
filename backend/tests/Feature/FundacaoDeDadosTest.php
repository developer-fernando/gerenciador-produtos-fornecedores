<?php

use App\Models\Empresa;
use App\Models\Produto;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('relaciona empresa e produtos (1-N)', function () {
    $empresa = Empresa::factory()
        ->has(Produto::factory()->count(3))
        ->create();

    expect($empresa->produtos)->toHaveCount(3);
    expect($empresa->produtos->first()->empresa->id)->toBe($empresa->id);
});

it('exige empresa para o produto (FK obrigatória)', function () {
    Produto::factory()->create(['empresa_id' => null]);
})->throws(QueryException::class);

it('aplica soft delete mantendo o registro acessível via withTrashed', function () {
    $empresa = Empresa::factory()->create();
    $empresa->delete();

    expect(Empresa::count())->toBe(0);
    expect(Empresa::withTrashed()->count())->toBe(1);
    expect($empresa->fresh()->trashed())->toBeTrue();
});

it('distingue produto excluído em cascata de excluído individualmente', function () {
    $empresa = Empresa::factory()->create();
    $individual = Produto::factory()->for($empresa)->excluido()->create();
    $cascata = Produto::factory()->for($empresa)->excluidoEmCascata()->create();

    expect($individual->excluido_em_cascata)->toBeFalse();
    expect($cascata->excluido_em_cascata)->toBeTrue();
    expect(Produto::withTrashed()->whereNotNull('deleted_at')->count())->toBe(2);
});
