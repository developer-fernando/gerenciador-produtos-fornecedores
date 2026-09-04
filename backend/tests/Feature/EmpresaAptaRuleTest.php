<?php

use App\Models\Empresa;
use App\Rules\EmpresaApta;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Validator;

uses(RefreshDatabase::class);

function empresaAptaPassa(int|string|null $empresaId): bool
{
    return Validator::make(
        ['empresa_id' => $empresaId],
        ['empresa_id' => new EmpresaApta]
    )->passes();
}

it('aceita empresa ativa e não excluída', function () {
    $empresa = Empresa::factory()->create();
    expect(empresaAptaPassa($empresa->id))->toBeTrue();
});

it('rejeita empresa inexistente, inativa ou excluída', function () {
    expect(empresaAptaPassa(999999))->toBeFalse();

    $inativa = Empresa::factory()->inativa()->create();
    expect(empresaAptaPassa($inativa->id))->toBeFalse();

    $excluida = Empresa::factory()->excluida()->create();
    expect(empresaAptaPassa($excluida->id))->toBeFalse();
});
