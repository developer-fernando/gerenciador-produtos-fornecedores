<?php

use App\Http\Controllers\Api\EmpresaController;
use Illuminate\Support\Facades\Route;

// Ações de ciclo de vida (definidas antes do apiResource).
Route::patch('empresas/{empresa}/inativar', [EmpresaController::class, 'inativar']);
Route::patch('empresas/{empresa}/reativar', [EmpresaController::class, 'reativar']);
Route::post('empresas/{empresa}/restaurar', [EmpresaController::class, 'restaurar']);
Route::delete('empresas/{empresa}/forcar', [EmpresaController::class, 'forcar']);

Route::apiResource('empresas', EmpresaController::class);
