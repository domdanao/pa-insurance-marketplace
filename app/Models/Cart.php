<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Cart extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'user_id',
        'product_id',
        'quantity',
    ];

    protected $appends = [
        'total_price',
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function getTotalPriceAttribute(): int
    {
        // Get raw price in centavos and multiply by quantity
        $rawPriceInCentavos = \DB::table('products')->where('id', $this->product_id)->value('price');

        return $rawPriceInCentavos * $this->quantity;
    }

    public function getFormattedTotalPriceAttribute(): string
    {
        return '₱'.number_format($this->total_price / 100, 2);
    }
}
