<?php

use App\Http\Controllers\Api\EmpresaController;
use App\Http\Controllers\Api\ProdutoController;
use Illuminate\Support\Facades\Route;

// Empresas — ações de ciclo de vida (antes do apiResource).
Route::patch('empresas/{empresa}/inativar', [EmpresaController::class, 'inativar']);
Route::patch('empresas/{empresa}/reativar', [EmpresaController::class, 'reativar']);
Route::post('empresas/{empresa}/restaurar', [EmpresaController::class, 'restaurar']);
Route::delete('empresas/{empresa}/forcar', [EmpresaController::class, 'forcar']);
Route::apiResource('empresas', EmpresaController::class);

// Produtos — ações de ciclo de vida (antes do apiResource).
Route::patch('produtos/{produto}/inativar', [ProdutoController::class, 'inativar']);
Route::patch('produtos/{produto}/reativar', [ProdutoController::class, 'reativar']);
Route::post('produtos/{produto}/restaurar', [ProdutoController::class, 'restaurar']);
Route::delete('produtos/{produto}/forcar', [ProdutoController::class, 'forcar']);
Route::apiResource('produtos', ProdutoController::class);
