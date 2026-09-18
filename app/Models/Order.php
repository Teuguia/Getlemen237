<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'user_id',
    'delivery_zone_id',
    'order_number',
    'customer_name',
    'customer_phone',
    'customer_email',
    'delivery_city',
    'delivery_district',
    'delivery_address',
    'status',
    'payment_status',
    'payment_method',
    'subtotal_cents',
    'delivery_fee_cents',
    'total_cents',
    'notes',
    'confirmed_at',
])]
class Order extends Model
{
    protected function casts(): array
    {
        return [
            'confirmed_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function deliveryZone(): BelongsTo
    {
        return $this->belongsTo(DeliveryZone::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }
}
