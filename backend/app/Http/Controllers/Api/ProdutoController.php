<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProdutoRequest;
use App\Http\Requests\UpdateProdutoRequest;
use App\Http\Resources\ProdutoResource;
use App\Services\ProdutoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class ProdutoController extends Controller
{
    public function __construct(private readonly ProdutoService $service) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $produtos = $this->service->listar([
            'nome' => $request->query('nome'),
            'status' => $request->query('status'),
            'excluidos' => filter_var($request->query('excluidos'), FILTER_VALIDATE_BOOLEAN),
        ]);

        return ProdutoResource::collection($produtos);
    }

    public function store(StoreProdutoRequest $request): JsonResponse
    {
        $produto = $this->service->criar($request->validated());

        return (new ProdutoResource($produto))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }

    public function show(int $produto): ProdutoResource
    {
        return new ProdutoResource($this->service->buscar($produto));
    }

    public function update(UpdateProdutoRequest $request, int $produto): ProdutoResource
    {
        return new ProdutoResource($this->service->atualizar($produto, $request->validated()));
    }

    public function inativar(int $produto): ProdutoResource
    {
        return new ProdutoResource($this->service->inativar($produto));
    }

    public function reativar(int $produto): ProdutoResource
    {
        return new ProdutoResource($this->service->reativar($produto));
    }

    public function destroy(int $produto): ProdutoResource
    {
        return new ProdutoResource($this->service->excluir($produto));
    }

    public function restaurar(int $produto): ProdutoResource
    {
        return new ProdutoResource($this->service->restaurar($produto));
    }

    public function forcar(int $produto): Response
    {
        $this->service->forcar($produto);

        return response()->noContent();
    }
}
