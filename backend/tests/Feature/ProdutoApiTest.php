<?php

use App\Models\Empresa;
use App\Models\Produto;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

// ---------- Criação e validação ----------

it('cria produto válido vinculado a empresa apta (201) com empresa aninhada', function () {
    $empresa = Empresa::factory()->create();

    $this->postJson('/api/produtos', [
        'empresa_id' => $empresa->id,
        'nome' => 'Produto Teste',
        'descricao' => 'Descrição',
        'preco' => 19.90,
        'codigo_interno' => 'SKU-1',
    ])->assertCreated()
        ->assertJsonPath('data.nome', 'Produto Teste')
        ->assertJsonPath('data.status', 'Ativo')
        ->assertJsonPath('data.preco', '19.90')
        ->assertJsonPath('data.empresa.id', $empresa->id)
        ->assertJsonPath('data.acoes_permitidas.editar', true);
});

it('rejeita produto inválido com 422 por campo', function () {
    $this->postJson('/api/produtos', [
        'empresa_id' => null,
        'nome' => 'AB',
        'preco' => 0,
        'codigo_interno' => '',
        'status' => 'X',
    ])->assertStatus(422)
        ->assertJsonValidationErrors(['empresa_id', 'nome', 'preco', 'codigo_interno', 'status']);
});

it('rejeita vínculo com empresa inativa ou excluída (422 no empresa_id)', function () {
    $inativa = Empresa::factory()->inativa()->create();
    $excluida = Empresa::factory()->excluida()->create();

    foreach ([$inativa->id, $excluida->id] as $empresaId) {
        $this->postJson('/api/produtos', [
            'empresa_id' => $empresaId,
            'nome' => 'Produto',
            'preco' => 10,
            'codigo_interno' => 'SKU-'.$empresaId,
        ])->assertStatus(422)->assertJsonValidationErrors(['empresa_id']);
    }
});

// ---------- Código interno único por empresa ----------

it('barra código interno duplicado na mesma empresa, inclusive contra excluídos', function () {
    $empresa = Empresa::factory()->create();
    $produto = Produto::factory()->for($empresa)->create(['codigo_interno' => 'DUP']);
    $produto->delete(); // excluído individualmente

    $this->postJson('/api/produtos', [
        'empresa_id' => $empresa->id,
        'nome' => 'Outro Produto',
        'preco' => 5,
        'codigo_interno' => 'DUP',
    ])->assertStatus(422)->assertJsonValidationErrors(['codigo_interno']);
});

it('permite o mesmo código interno em empresas diferentes', function () {
    $a = Empresa::factory()->create();
    $b = Empresa::factory()->create();
    Produto::factory()->for($a)->create(['codigo_interno' => 'MESMO']);

    $this->postJson('/api/produtos', [
        'empresa_id' => $b->id,
        'nome' => 'Produto B',
        'preco' => 5,
        'codigo_interno' => 'MESMO',
    ])->assertCreated();
});

it('permite trocar o vínculo para outra empresa apta, revalidando o código no destino', function () {
    $a = Empresa::factory()->create();
    $b = Empresa::factory()->create();
    $produto = Produto::factory()->for($a)->create(['codigo_interno' => 'X1']);
    Produto::factory()->for($b)->create(['codigo_interno' => 'COLIDE']);

    // troca para B com código livre -> OK
    $this->patchJson("/api/produtos/{$produto->id}", [
        'empresa_id' => $b->id, 'nome' => 'Movido', 'preco' => 7, 'codigo_interno' => 'X1',
    ])->assertOk()->assertJsonPath('data.empresa.id', $b->id);

    // troca (ou permanência) em B com código já usado em B -> 422
    $this->patchJson("/api/produtos/{$produto->id}", [
        'empresa_id' => $b->id, 'nome' => 'Movido', 'preco' => 7, 'codigo_interno' => 'COLIDE',
    ])->assertStatus(422)->assertJsonValidationErrors(['codigo_interno']);
});

// ---------- Status ----------

it('inativa; reativa com empresa apta; reativar com empresa inativa retorna 422', function () {
    $empresa = Empresa::factory()->create();
    $produto = Produto::factory()->for($empresa)->create();

    $this->patchJson("/api/produtos/{$produto->id}/inativar")->assertOk()
        ->assertJsonPath('data.status', 'Inativo');
    $this->patchJson("/api/produtos/{$produto->id}/reativar")->assertOk()
        ->assertJsonPath('data.status', 'Ativo');

    $empresaInativa = Empresa::factory()->inativa()->create();
    $produtoInativo = Produto::factory()->for($empresaInativa)->inativo()->create();
    $this->patchJson("/api/produtos/{$produtoInativo->id}/reativar")
        ->assertStatus(422)->assertJsonPath('code', 'empresa_inativa_ou_excluida');
});

// ---------- Exclusão lógica / restauração ----------

it('exclui individualmente (excluido_em_cascata=false) e restaura conforme a empresa', function () {
    $empresa = Empresa::factory()->create();
    $produto = Produto::factory()->for($empresa)->create(['status' => 'Ativo']);

    $this->deleteJson("/api/produtos/{$produto->id}")->assertOk();
    $this->assertSoftDeleted('produtos', ['id' => $produto->id, 'excluido_em_cascata' => false]);

    // empresa ativa -> restaura mantendo status anterior (Ativo)
    $this->postJson("/api/produtos/{$produto->id}/restaurar")->assertOk()
        ->assertJsonPath('data.status', 'Ativo');
});

it('ao restaurar com empresa inativa, o produto volta como Inativo', function () {
    $empresa = Empresa::factory()->inativa()->create();
    $produto = Produto::factory()->for($empresa)->create(['status' => 'Ativo']);
    $produto->delete();

    $this->postJson("/api/produtos/{$produto->id}/restaurar")->assertOk()
        ->assertJsonPath('data.status', 'Inativo');
});

it('bloqueia restauração quando a empresa está excluída (409 empresa_excluida)', function () {
    $empresa = Empresa::factory()->create();
    $produto = Produto::factory()->for($empresa)->create();
    $produto->delete();
    $empresa->delete();

    $this->postJson("/api/produtos/{$produto->id}/restaurar")
        ->assertStatus(409)->assertJsonPath('code', 'empresa_excluida');
});

// ---------- Exclusão física ----------

it('exclusão física: 409 se não excluído; 204 se já excluído', function () {
    $empresa = Empresa::factory()->create();
    $produto = Produto::factory()->for($empresa)->create();

    $this->deleteJson("/api/produtos/{$produto->id}/forcar")
        ->assertStatus(409)->assertJsonPath('code', 'registro_nao_excluido');

    $produto->delete();
    $this->deleteJson("/api/produtos/{$produto->id}/forcar")->assertNoContent();
    expect(Produto::withTrashed()->whereKey($produto->id)->exists())->toBeFalse();
});

// ---------- Revalidação de estado ----------

it('operar produto excluído retorna 409 registro_excluido', function () {
    $empresa = Empresa::factory()->create();
    $produto = Produto::factory()->for($empresa)->create();
    $produto->delete();

    $this->patchJson("/api/produtos/{$produto->id}/inativar")
        ->assertStatus(409)->assertJsonPath('code', 'registro_excluido');
});

// ---------- Listagem / filtros ----------

it('lista paginada (10) com empresa vinculada e sem excluídos por padrão', function () {
    $empresa = Empresa::factory()->create();
    Produto::factory()->for($empresa)->count(12)->create();
    $excluido = Produto::factory()->for($empresa)->create();
    $excluido->delete();

    $resposta = $this->getJson('/api/produtos')->assertOk()
        ->assertJsonCount(10, 'data')
        ->assertJsonPath('meta.total', 12);
    expect($resposta->json('data.0.empresa.id'))->toBe($empresa->id);

    $this->getJson('/api/produtos?excluidos=true')->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.id', $excluido->id);
});

it('filtra por nome (parcial) e por status', function () {
    $empresa = Empresa::factory()->create();
    Produto::factory()->for($empresa)->create(['nome' => 'Cadeira Gamer']);
    Produto::factory()->for($empresa)->create(['nome' => 'Mesa Escritório']);
    Produto::factory()->for($empresa)->inativo()->create(['nome' => 'Item Inativo']);

    expect($this->getJson('/api/produtos?nome=Cadeira')->assertOk()->json('meta.total'))->toBe(1);
    expect($this->getJson('/api/produtos?status=Inativo')->assertOk()->json('meta.total'))->toBe(1);
});
