<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class OrderItem extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'order_id',
        'product_id',
        'store_id',
        'product_name',
        'product_price',
        'quantity',
        'total_price',
        'product_snapshot',
        'digital_downloads',
        'delivered_at',
    ];

    protected function casts(): array
    {
        return [
            'product_price' => 'decimal:2',
            'total_price' => 'decimal:2',
            'product_snapshot' => 'array',
            'digital_downloads' => 'array',
            'delivered_at' => 'datetime',
        ];
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function store()
    {
        return $this->belongsTo(Store::class);
    }

    public function isDelivered(): bool
    {
        return !is_null($this->delivered_at);
    }

    public function markAsDelivered(): void
    {
        $this->update(['delivered_at' => now()]);
    }

    public function hasDigitalDownloads(): bool
    {
        return !empty($this->digital_downloads);
    }
}
