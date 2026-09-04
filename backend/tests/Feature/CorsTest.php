<?php

it('libera CORS apenas para a origem do front-end (não usa *)', function () {
    $origem = config('cors.allowed_origins')[0];

    expect($origem)->not->toBe('*');

    $this->getJson('/api/empresas', ['Origin' => $origem])
        ->assertHeader('Access-Control-Allow-Origin', $origem);
});

it('nunca reflete uma origem não permitida (o navegador bloqueia por não bater)', function () {
    // Para uma origem não permitida o middleware devolve a origem CONFIGURADA
    // (não a da requisição). Como não bate com a origem real, o navegador bloqueia.
    $resposta = $this->getJson('/api/empresas', ['Origin' => 'http://malicioso.example']);

    expect($resposta->headers->get('Access-Control-Allow-Origin'))
        ->not->toBe('http://malicioso.example')
        ->not->toBe('*');
});
