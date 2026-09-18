<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Reservation;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class AdminDashboardController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('Dashboard', [
            'stats' => [
                'publishedProducts' => Product::query()->where('status', 'published')->count(),
                'draftProducts' => Product::query()->where('status', 'draft')->count(),
                'pendingOrders' => Order::query()->whereIn('status', ['pending_payment', 'confirmed', 'preparing'])->count(),
                'lowStockVariants' => ProductVariant::query()
                    ->whereColumn('stock_quantity', '<=', 'low_stock_threshold')
                    ->count(),
            ],
            'categories' => Category::query()
                ->where('is_active', true)
                ->orderBy('sort_order')
                ->get(['id', 'name']),
            'products' => Product::query()
                ->with(['category:id,name', 'media:id,product_id,type,path,alt_text,sort_order,is_primary', 'variants'])
                ->latest()
                ->take(60)
                ->get()
                ->map(fn (Product $product) => $this->productPayload($product)),
            'orders' => Order::query()
                ->with('items:id,order_id,product_name,quantity,line_total_cents')
                ->latest()
                ->take(30)
                ->get(['id', 'order_number', 'customer_name', 'customer_phone', 'status', 'payment_status', 'payment_method', 'total_cents', 'created_at'])
                ->map(fn (Order $order) => [
                    'id' => $order->id,
                    'order_number' => $order->order_number,
                    'customer_name' => $order->customer_name,
                    'customer_phone' => $order->customer_phone,
                    'status' => $order->status,
                    'payment_status' => $order->payment_status,
                    'payment_method' => $order->payment_method,
                    'total' => $order->total_cents / 100,
                    'created_at' => $order->created_at?->format('d/m/Y'),
                    'items_count' => $order->items->sum('quantity'),
                ]),
            'customers' => User::query()
                ->where('role', 'customer')
                ->latest()
                ->take(40)
                ->get(['id', 'name', 'email', 'phone', 'is_active', 'created_at'])
                ->map(fn (User $user) => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'is_active' => $user->is_active,
                    'created_at' => $user->created_at?->format('d/m/Y'),
                ]),
        ]);
    }

    public function storeProduct(Request $request): RedirectResponse
    {
        $validated = $this->validateProduct($request);

        DB::transaction(function () use ($request, $validated): void {
            $product = Product::query()->create([
                ...$this->productData($validated),
                'slug' => $this->uniqueSlug($validated['name']),
                'reference' => strtoupper('237-'.Str::random(8)),
            ]);

            $this->attachUploadedMedia($request, $product, $validated);
            $this->syncVariants($product, $validated['variants']);
        });

        return back()->with('success', 'Produit ajoute avec succes.');
    }

    public function updateProduct(Request $request, Product $product): RedirectResponse
    {
        $validated = $this->validateProduct($request, true);

        DB::transaction(function () use ($request, $product, $validated): void {
            $product->update([
                ...$this->productData($validated, $product),
                'slug' => $product->name !== $validated['name']
                    ? $this->uniqueSlug($validated['name'], $product)
                    : $product->slug,
            ]);

            $this->attachUploadedMedia($request, $product, $validated);
            $this->syncVariants($product, $validated['variants']);
        });

        return back()->with('success', 'Produit mis a jour.');
    }

    public function destroyProduct(Product $product): RedirectResponse
    {
        $hasHistory = OrderItem::query()->where('product_id', $product->id)->exists()
            || Reservation::query()->where('product_id', $product->id)->exists();

        if ($hasHistory) {
            $product->update([
                'status' => 'draft',
                'is_featured' => false,
                'published_at' => null,
            ]);

            $product->variants()->update([
                'stock_quantity' => 0,
                'status' => 'unavailable',
            ]);

            return back()->with('success', 'Produit retire de la boutique, son historique est conserve.');
        }

        $product->delete();

        return back()->with('success', 'Produit supprime.');
    }

    public function updateOrder(Request $request, Order $order): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'in:pending_payment,confirmed,preparing,delivering,delivered,cancelled'],
            'payment_status' => ['nullable', 'in:unpaid,pay_on_delivery,pending,paid,failed,refunded'],
        ]);

        $order->update([
            'status' => $validated['status'],
            'payment_status' => $validated['payment_status'] ?? $order->payment_status,
            'confirmed_at' => in_array($validated['status'], ['confirmed', 'preparing', 'delivering', 'delivered'], true)
                ? ($order->confirmed_at ?? now())
                : $order->confirmed_at,
        ]);

        return back()->with('success', 'Commande mise a jour.');
    }

    /**
     * @return array<string, mixed>
     */
    private function validateProduct(Request $request, bool $updating = false): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'category_id' => ['required', 'exists:categories,id'],
            'description' => ['nullable', 'string'],
            'normal_price' => ['required', 'numeric', 'min:0'],
            'sale_price' => ['nullable', 'numeric', 'min:0'],
            'sale_starts_at' => ['nullable', 'date'],
            'sale_ends_at' => ['nullable', 'date', 'after_or_equal:sale_starts_at'],
            'image_url' => ['nullable', 'url', 'max:2048'],
            'video_url' => ['nullable', 'url', 'max:2048'],
            'image_file' => ['nullable', 'image', 'max:5120'],
            'video_file' => ['nullable', 'file', 'mimes:mp4,mov,avi,webm,m4v', 'max:51200'],
            'status' => ['required', 'in:draft,published'],
            'variants' => ['required', 'array', 'min:1'],
            'variants.*.id' => ['nullable', 'integer', 'exists:product_variants,id'],
            'variants.*.color_name' => ['required', 'string', 'max:80'],
            'variants.*.color_hex' => ['nullable', 'string', 'max:7'],
            'variants.*.size' => ['required', 'string', 'max:40'],
            'variants.*.stock_quantity' => ['required', 'integer', 'min:0'],
        ]);
    }

    /**
     * @param  array<string, mixed>  $validated
     * @return array<string, mixed>
     */
    private function productData(array $validated, ?Product $product = null): array
    {
        $publishedAt = $validated['status'] === 'published'
            ? ($product?->published_at ?? now())
            : null;

        return [
            'category_id' => $validated['category_id'],
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'base_price_cents' => (int) round(((float) $validated['normal_price']) * 100),
            'sale_price_cents' => filled($validated['sale_price'] ?? null)
                ? (int) round(((float) $validated['sale_price']) * 100)
                : null,
            'sale_starts_at' => $validated['sale_starts_at'] ?? null,
            'sale_ends_at' => $validated['sale_ends_at'] ?? null,
            'status' => $validated['status'],
            'is_featured' => $validated['status'] === 'published',
            'published_at' => $publishedAt,
        ];
    }

    /**
     * @param  array<string, mixed>  $validated
     */
    private function attachUploadedMedia(Request $request, Product $product, array $validated): void
    {
        if ($request->hasFile('image_file')) {
            $product->media()->where('type', 'image')->delete();

            $path = $request->file('image_file')->store('products/images', 'public');

            $product->media()->create([
                'type' => 'image',
                'path' => Storage::url($path),
                'alt_text' => $validated['name'],
                'sort_order' => 1,
                'is_primary' => true,
            ]);
        } elseif (filled($validated['image_url'] ?? null)) {
            $product->media()->where('type', 'image')->delete();
            $product->media()->create([
                'type' => 'image',
                'path' => $validated['image_url'],
                'alt_text' => $validated['name'],
                'sort_order' => 1,
                'is_primary' => true,
            ]);
        }

        if ($request->hasFile('video_file')) {
            $product->media()->where('type', 'video')->delete();

            $path = $request->file('video_file')->store('products/videos', 'public');

            $product->media()->create([
                'type' => 'video',
                'path' => Storage::url($path),
                'alt_text' => $validated['name'],
                'sort_order' => 2,
                'is_primary' => false,
            ]);
        } elseif (filled($validated['video_url'] ?? null)) {
            $product->media()->where('type', 'video')->delete();

            $product->media()->create([
                'type' => 'video',
                'path' => $validated['video_url'],
                'alt_text' => $validated['name'],
                'sort_order' => 2,
                'is_primary' => false,
            ]);
        }
    }

    /**
     * @param  array<int, array<string, mixed>>  $variants
     */
    private function syncVariants(Product $product, array $variants): void
    {
        $keptIds = [];

        foreach ($variants as $index => $variant) {
            $stockQuantity = (int) $variant['stock_quantity'];
            $variantData = [
                'color_name' => $variant['color_name'],
                'color_hex' => $variant['color_hex'] ?? null,
                'size' => $variant['size'],
                'stock_quantity' => $stockQuantity,
                'low_stock_threshold' => 2,
                'status' => $stockQuantity > 0 ? 'available' : 'out_of_stock',
            ];

            $existingVariant = filled($variant['id'] ?? null)
                ? $product->variants()->whereKey($variant['id'])->first()
                : null;

            if ($existingVariant) {
                $existingVariant->update($variantData);
                $keptIds[] = $existingVariant->id;

                continue;
            }

            $createdVariant = $product->variants()->create([
                ...$variantData,
                'sku' => strtoupper(($product->reference ?? '237-PRD').'-'.($index + 1).'-'.Str::random(4)),
            ]);
            $keptIds[] = $createdVariant->id;
        }

        $product->variants()
            ->whereNotIn('id', $keptIds)
            ->get()
            ->each(function (ProductVariant $variant): void {
                if (OrderItem::query()->where('product_variant_id', $variant->id)->exists()) {
                    $variant->update([
                        'stock_quantity' => 0,
                        'status' => 'unavailable',
                    ]);

                    return;
                }

                $variant->delete();
            });
    }

    private function uniqueSlug(string $name, ?Product $product = null): string
    {
        $slug = Str::slug($name);
        $baseSlug = $slug ?: 'produit';
        $slug = $baseSlug;
        $counter = 2;

        while (
            Product::query()
                ->where('slug', $slug)
                ->when($product, fn ($query) => $query->whereKeyNot($product->id))
                ->exists()
        ) {
            $slug = "{$baseSlug}-{$counter}";
            $counter++;
        }

        return $slug;
    }

    /**
     * @return array<string, mixed>
     */
    private function productPayload(Product $product): array
    {
        $primaryImage = $product->media->first(fn ($media) => $media->type === 'image' && $media->is_primary)
            ?? $product->media->firstWhere('type', 'image');

        return [
            'id' => $product->id,
            'category_id' => $product->category_id,
            'category_name' => $product->category?->name,
            'name' => $product->name,
            'slug' => $product->slug,
            'reference' => $product->reference,
            'description' => $product->description,
            'normal_price' => $product->base_price_cents / 100,
            'sale_price' => $product->sale_price_cents ? $product->sale_price_cents / 100 : '',
            'sale_starts_at' => $product->sale_starts_at?->toDateString(),
            'sale_ends_at' => $product->sale_ends_at?->toDateString(),
            'status' => $product->status,
            'image' => $primaryImage?->path,
            'video' => $product->media->firstWhere('type', 'video')?->path,
            'variants' => $product->variants->map(fn (ProductVariant $variant) => [
                'id' => $variant->id,
                'color_name' => $variant->color_name,
                'color_hex' => $variant->color_hex,
                'size' => $variant->size,
                'stock_quantity' => $variant->stock_quantity,
                'status' => $variant->status,
            ])->values(),
        ];
    }
}
