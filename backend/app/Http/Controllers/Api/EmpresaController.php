<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreEmpresaRequest;
use App\Http\Requests\UpdateEmpresaRequest;
use App\Http\Resources\EmpresaResource;
use App\Services\EmpresaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class EmpresaController extends Controller
{
    public function __construct(private readonly EmpresaService $service) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $empresas = $this->service->listar([
            'nome' => $request->query('nome'),
            'status' => $request->query('status'),
            'excluidos' => filter_var($request->query('excluidos'), FILTER_VALIDATE_BOOLEAN),
        ]);

        return EmpresaResource::collection($empresas);
    }

    public function store(StoreEmpresaRequest $request): JsonResponse
    {
        $empresa = $this->service->criar($request->validated());

        return (new EmpresaResource($empresa))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }

    public function show(int $empresa): EmpresaResource
    {
        return new EmpresaResource($this->service->buscar($empresa));
    }

    public function update(UpdateEmpresaRequest $request, int $empresa): EmpresaResource
    {
        return new EmpresaResource($this->service->atualizar($empresa, $request->validated()));
    }

    public function inativar(int $empresa): EmpresaResource
    {
        return new EmpresaResource($this->service->inativar($empresa));
    }

    public function reativar(int $empresa): EmpresaResource
    {
        return new EmpresaResource($this->service->reativar($empresa));
    }

    public function destroy(int $empresa): EmpresaResource
    {
        return new EmpresaResource($this->service->excluir($empresa));
    }

    public function restaurar(int $empresa): EmpresaResource
    {
        return new EmpresaResource($this->service->restaurar($empresa));
    }

    public function forcar(int $empresa): Response
    {
        $this->service->forcar($empresa);

        return response()->noContent();
    }
}
