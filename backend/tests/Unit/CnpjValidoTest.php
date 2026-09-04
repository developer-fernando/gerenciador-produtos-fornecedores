<?php

use App\Rules\CnpjValido;

/**
 * Executa a regra sem depender do container: retorna true se passou.
 */
function cnpjPassa(string $cnpj): bool
{
    $passou = true;
    (new CnpjValido)->validate('cnpj', $cnpj, function () use (&$passou) {
        $passou = false;
    });

    return $passou;
}

it('aceita CNPJ válido (com e sem máscara)', function () {
    expect(cnpjPassa('11444777000161'))->toBeTrue();
    expect(cnpjPassa('11.444.777/0001-61'))->toBeTrue();
});

it('rejeita CNPJ com dígito verificador incorreto', function () {
    expect(cnpjPassa('11444777000160'))->toBeFalse();
});

it('rejeita tamanho inválido e sequências repetidas', function () {
    expect(cnpjPassa('123'))->toBeFalse();
    expect(cnpjPassa('00000000000000'))->toBeFalse();
});
