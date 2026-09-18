<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

#[Fillable([
    'category_id',
    'name',
    'slug',
    'reference',
    'description',
    'base_price_cents',
    'sale_price_cents',
    'sale_starts_at',
    'sale_ends_at',
    'status',
    'is_featured',
    'published_at',
])]
class Product extends Model
{
    protected function casts(): array
    {
        return [
            'sale_starts_at' => 'datetime',
            'sale_ends_at' => 'datetime',
            'published_at' => 'datetime',
            'is_featured' => 'boolean',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function media(): HasMany
    {
        return $this->hasMany(ProductMedia::class)->orderBy('sort_order');
    }

    public function primaryMedia(): HasOne
    {
        return $this->hasOne(ProductMedia::class)->where('is_primary', true);
    }

    public function variants(): HasMany
    {
        return $this->hasMany(ProductVariant::class);
    }

    public function activePriceCents(): int
    {
        $now = now();

        if (
            $this->sale_price_cents !== null
            && ($this->sale_starts_at === null || $this->sale_starts_at->lte($now))
            && ($this->sale_ends_at === null || $this->sale_ends_at->gte($now))
        ) {
            return $this->sale_price_cents;
        }

        return $this->base_price_cents;
    }

    public function discountPercentage(): ?int
    {
        if ($this->sale_price_cents === null || $this->sale_price_cents >= $this->base_price_cents) {
            return null;
        }

        return (int) round((1 - ($this->sale_price_cents / $this->base_price_cents)) * 100);
    }
}
