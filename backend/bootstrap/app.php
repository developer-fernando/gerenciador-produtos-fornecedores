<?php

use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        //
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );

        // 404 padronizado (cobre ModelNotFoundException, convertida em NotFoundHttpException).
        $exceptions->render(function (NotFoundHttpException $e, Request $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                return response()->json(['message' => 'Registro não encontrado.'], 404);
            }

            return null;
        });

        // Demais exceções em respostas JSON: nunca vazar detalhes internos.
        $exceptions->render(function (Throwable $e, Request $request) {
            if (! ($request->is('api/*') || $request->expectsJson())) {
                return null;
            }

            // Defere ao tratamento nativo (422 de validação, etc.).
            if ($e instanceof ValidationException
                || $e instanceof HttpResponseException
                || $e instanceof AuthenticationException) {
                return null;
            }

            // Erros HTTP conhecidos (405, 403, ...) mantêm o status, com mensagem genérica.
            if ($e instanceof HttpExceptionInterface) {
                return response()->json(['message' => 'Requisição inválida.'], $e->getStatusCode());
            }

            // Erro inesperado (500): mensagem genérica, sem trace/detalhes.
            return response()->json(['message' => 'Ocorreu um erro inesperado. Tente novamente.'], 500);
        });
    })->create();
