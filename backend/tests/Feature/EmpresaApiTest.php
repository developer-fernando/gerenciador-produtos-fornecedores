<?php

use App\Models\Empresa;
use App\Models\Produto;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

// ---------- Criação e validação ----------

it('cria empresa válida (201) com payload padronizado e telefone normalizado', function () {
    $resposta = $this->postJson('/api/empresas', [
        'nome' => 'Fornecedor Teste',
        'cnpj' => '11.444.777/0001-61',
        'email' => 'contato@fornecedor.com',
        'telefone' => '(11) 91234-5678',
    ]);

    $resposta->assertCreated()
        ->assertJsonPath('data.nome', 'Fornecedor Teste')
        ->assertJsonPath('data.status', 'Ativo')
        ->assertJsonPath('data.cnpj', '11444777000161')
        ->assertJsonPath('data.telefone', '11912345678')
        ->assertJsonPath('data.acoes_permitidas.inativar', true);

    $this->assertDatabaseHas('empresas', ['cnpj' => '11444777000161']);
});

it('rejeita empresa inválida com 422 e erro por campo', function () {
    $this->postJson('/api/empresas', [
        'nome' => 'AB',
        'cnpj' => '123',
        'email' => 'invalido',
        'telefone' => '123',
        'status' => 'Outro',
    ])->assertStatus(422)
        ->assertJsonValidationErrors(['nome', 'cnpj', 'email', 'telefone', 'status']);
});

it('rejeita CNPJ com dígitos verificadores inválidos', function () {
    $this->postJson('/api/empresas', [
        'nome' => 'Empresa X',
        'cnpj' => '11444777000160',
        'email' => 'x@x.com',
        'telefone' => '11912345678',
    ])->assertStatus(422)->assertJsonValidationErrors(['cnpj']);
});

it('barra CNPJ e e-mail duplicados inclusive contra registros excluídos', function () {
    $empresa = Empresa::factory()->create(['cnpj' => '11444777000161', 'email' => 'dup@x.com']);
    $empresa->delete(); // excluída logicamente

    $this->postJson('/api/empresas', [
        'nome' => 'Outra Empresa',
        'cnpj' => '11444777000161',
        'email' => 'dup@x.com',
        'telefone' => '11912345678',
    ])->assertStatus(422)->assertJsonValidationErrors(['cnpj', 'email']);
});

it('permite editar mantendo o próprio CNPJ (ignora o próprio registro)', function () {
    $empresa = Empresa::factory()->create(['cnpj' => '11444777000161']);

    $this->patchJson("/api/empresas/{$empresa->id}", [
        'nome' => 'Nome Editado',
        'cnpj' => '11444777000161',
        'email' => $empresa->email,
        'telefone' => $empresa->telefone,
    ])->assertOk()->assertJsonPath('data.nome', 'Nome Editado');
});

// ---------- Status (cascata) ----------

it('inativa a empresa e seus produtos; reativar não reativa os produtos', function () {
    $empresa = Empresa::factory()->has(Produto::factory()->count(2))->create();

    $this->patchJson("/api/empresas/{$empresa->id}/inativar")->assertOk()
        ->assertJsonPath('data.status', 'Inativo');
    expect($empresa->produtos()->where('status', 'Inativo')->count())->toBe(2);

    $this->patchJson("/api/empresas/{$empresa->id}/reativar")->assertOk()
        ->assertJsonPath('data.status', 'Ativo');
    expect($empresa->produtos()->where('status', 'Inativo')->count())->toBe(2);
});

// ---------- Exclusão lógica / restauração seletiva ----------

it('exclui em cascata e restaura apenas os produtos excluídos pela cascata', function () {
    $empresa = Empresa::factory()->create();
    $p1 = Produto::factory()->for($empresa)->create();
    $p2 = Produto::factory()->for($empresa)->create();
    $individual = Produto::factory()->for($empresa)->excluido()->create();

    $this->deleteJson("/api/empresas/{$empresa->id}")->assertOk();
    $this->assertSoftDeleted('empresas', ['id' => $empresa->id]);
    expect(Produto::onlyTrashed()->where('empresa_id', $empresa->id)->count())->toBe(3);

    $this->postJson("/api/empresas/{$empresa->id}/restaurar")->assertOk();
    expect(Produto::where('empresa_id', $empresa->id)->pluck('id')->sort()->values()->all())
        ->toBe([$p1->id, $p2->id]);
    $this->assertSoftDeleted('produtos', ['id' => $individual->id]);
});

// ---------- Exclusão física (dupla condição) ----------

it('bloqueia exclusão física de empresa não excluída (409 registro_nao_excluido)', function () {
    $empresa = Empresa::factory()->create();

    $this->deleteJson("/api/empresas/{$empresa->id}/forcar")
        ->assertStatus(409)->assertJsonPath('code', 'registro_nao_excluido');
});

it('bloqueia exclusão física havendo produto vinculado, mesmo excluído (409)', function () {
    $empresa = Empresa::factory()->create();
    Produto::factory()->for($empresa)->create();
    $empresa->delete(); // cascata exclui o produto também

    $this->deleteJson("/api/empresas/{$empresa->id}/forcar")
        ->assertStatus(409)->assertJsonPath('code', 'empresa_com_produtos_vinculados');
});

it('exclui fisicamente quando excluída logicamente e sem produtos (204)', function () {
    $empresa = Empresa::factory()->create();
    $empresa->delete();

    $this->deleteJson("/api/empresas/{$empresa->id}/forcar")->assertNoContent();
    expect(Empresa::withTrashed()->whereKey($empresa->id)->exists())->toBeFalse();
});

// ---------- Revalidação de estado ----------

it('empresa excluída: acoes_permitidas suprime inativar/reativar e o servidor revalida com 409', function () {
    $empresa = Empresa::factory()->create();
    $empresa->delete();

    $this->getJson("/api/empresas/{$empresa->id}")
        ->assertOk()
        ->assertJsonPath('data.acoes_permitidas.inativar', false)
        ->assertJsonPath('data.acoes_permitidas.reativar', false)
        ->assertJsonPath('data.acoes_permitidas.restaurar', true);

    $this->patchJson("/api/empresas/{$empresa->id}/inativar")
        ->assertStatus(409)->assertJsonPath('code', 'registro_excluido');
});

// ---------- Listagem / paginação / filtros ----------

it('lista paginada com 10 por página', function () {
    Empresa::factory()->count(12)->create();

    $this->getJson('/api/empresas')
        ->assertOk()
        ->assertJsonCount(10, 'data')
        ->assertJsonPath('meta.total', 12)
        ->assertJsonPath('meta.per_page', 10);
});

it('não retorna excluídos por padrão; filtro de excluídos retorna somente excluídos', function () {
    $ativa = Empresa::factory()->create();
    $excluida = Empresa::factory()->create();
    $excluida->delete();

    $padrao = $this->getJson('/api/empresas')->assertOk();
    expect(collect($padrao->json('data'))->pluck('id')->all())->toBe([$ativa->id]);

    $somenteExcluidos = $this->getJson('/api/empresas?excluidos=true')->assertOk();
    expect(collect($somenteExcluidos->json('data'))->pluck('id')->all())->toBe([$excluida->id]);
});

it('filtra por nome (parcial) e por status', function () {
    Empresa::factory()->create(['nome' => 'Alpha Distribuidora']);
    Empresa::factory()->create(['nome' => 'Beta Comercio']);
    Empresa::factory()->inativa()->create(['nome' => 'Gamma Inativa']);

    $porNome = $this->getJson('/api/empresas?nome=Alpha')->assertOk();
    expect($porNome->json('meta.total'))->toBe(1);
    expect($porNome->json('data.0.nome'))->toBe('Alpha Distribuidora');

    $porStatus = $this->getJson('/api/empresas?status=Inativo')->assertOk();
    expect($porStatus->json('meta.total'))->toBe(1);
    expect($porStatus->json('data.0.nome'))->toBe('Gamma Inativa');
});
