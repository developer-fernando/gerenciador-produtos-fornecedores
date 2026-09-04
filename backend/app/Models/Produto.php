<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Produto extends Model
{
    /** @use HasFactory<\Database\Factories\ProdutoFactory> */
    use HasFactory;
    use SoftDeletes;

    protected $table = 'produtos';

    protected $fillable = [
        'empresa_id',
        'nome',
        'descricao',
        'preco',
        'codigo_interno',
        'status',
        'excluido_em_cascata',
    ];

    protected function casts(): array
    {
        return [
            'preco' => 'decimal:2',
            'excluido_em_cascata' => 'boolean',
            'deleted_at' => 'datetime',
        ];
    }

    /**
     * Um produto pertence a uma empresa.
     *
     * @return BelongsTo<Empresa, $this>
     */
    public function empresa(): BelongsTo
    {
        return $this->belongsTo(Empresa::class);
    }
}
