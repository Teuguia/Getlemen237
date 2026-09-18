<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\Reservation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class StorefrontController extends Controller
{
    public function index(): Response
    {
        $products = $this->publishedProductsQuery()
            ->take(8)
            ->get()
            ->map(fn (Product $product) => $this->productPayload($product));

        return Inertia::render('Welcome', [
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
            'categories' => $this->categoriesPayload(),
            'featuredProducts' => $products,
        ]);
    }

    public function collections(): Response
    {
        return Inertia::render('Collections/Index', [
            'categories' => $this->categoriesPayload(),
            'products' => $this->publishedProductsQuery()
                ->take(24)
                ->get()
                ->map(fn (Product $product) => $this->productPayload($product)),
        ]);
    }

    public function show(Product $product): Response
    {
        abort_unless($product->status === 'published', 404);

        $product->load(['category', 'media', 'variants']);

        return Inertia::render('Products/Show', [
            'product' => $this->productPayload($product, detailed: true),
            'whatsappPhone' => config('services.whatsapp.store_phone'),
        ]);
    }

    public function cart(Request $request): Response
    {
        $cart = $request->user()
            ? $this->activeCart($request)->load(['items.product.primaryMedia', 'items.product.category', 'items.product.variants', 'items.variant'])
            : null;

        return Inertia::render('Cart', [
            'items' => $cart?->items->map(fn (CartItem $item) => [
                'id' => $item->id,
                'product' => $this->productPayload($item->product),
                'quantity' => $item->quantity,
                'unit_price_cents' => $item->unit_price_cents,
                'variant' => $item->variant?->only(['id', 'color_name', 'size', 'stock_quantity']),
            ]) ?? [],
            'checkoutUser' => $request->user()?->only(['name', 'email', 'phone']),
            'deliveryFeeCents' => 200000,
        ]);
    }

    public function accountOrders(): Response
    {
        $orders = Order::query()
            ->where('user_id', auth()->id())
            ->latest()
            ->take(8)
            ->get(['order_number', 'created_at', 'total_cents', 'status'])
            ->map(fn (Order $order) => [
                'order_number' => $order->order_number,
                'date' => $order->created_at->translatedFormat('d M Y'),
                'total_cents' => $order->total_cents,
                'status' => $order->status,
                'type' => 'commande',
            ]);

        $reservations = Reservation::query()
            ->where('user_id', auth()->id())
            ->latest()
            ->take(8)
            ->get(['reservation_number', 'created_at', 'quantity', 'status'])
            ->map(fn (Reservation $reservation) => [
                'order_number' => $reservation->reservation_number,
                'date' => $reservation->created_at->translatedFormat('d M Y'),
                'total_cents' => 0,
                'status' => $reservation->status,
                'type' => 'reservation',
                'quantity' => $reservation->quantity,
            ]);

        return Inertia::render('Account/Orders', [
            'orders' => $orders
                ->concat($reservations)
                ->sortByDesc('date')
                ->values(),
        ]);
    }

    private function activeCart(Request $request): Cart
    {
        return Cart::query()->firstOrCreate([
            'user_id' => $request->user()?->id,
            'session_id' => $request->user() ? null : $request->session()->getId(),
            'status' => 'active',
        ]);
    }

    private function publishedProductsQuery()
    {
        return Product::query()
            ->with(['category', 'primaryMedia', 'variants'])
            ->where('status', 'published')
            ->latest('published_at');
    }

    private function categoriesPayload()
    {
        return Category::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get(['id', 'name', 'slug']);
    }

    private function productPayload(Product $product, bool $detailed = false): array
    {
        $payload = [
            'id' => $product->id,
            'name' => $product->name,
            'slug' => $product->slug,
            'reference' => $product->reference,
            'category' => $product->category?->name,
            'category_slug' => $product->category?->slug,
            'description' => $product->description,
            'base_price_cents' => $product->base_price_cents,
            'active_price_cents' => $product->activePriceCents(),
            'discount_percentage' => $product->discountPercentage(),
            'primary_image' => $product->primaryMedia?->path,
            'stock_total' => $product->variants->sum('stock_quantity'),
            'variants' => $product->variants->map(fn ($variant) => [
                'id' => $variant->id,
                'color_name' => $variant->color_name,
                'color_hex' => $variant->color_hex,
                'size' => $variant->size,
                'stock_quantity' => $variant->stock_quantity,
                'is_in_stock' => $variant->isInStock(),
            ])->values(),
        ];

        if ($detailed) {
            $payload['description'] = $product->description;
            $payload['media'] = $product->media->map(fn ($media) => [
                'type' => $media->type,
                'path' => $media->path,
                'alt_text' => $media->alt_text,
                'is_primary' => $media->is_primary,
            ]);
            $payload['variants'] = $product->variants->map(fn ($variant) => [
                'id' => $variant->id,
                'sku' => $variant->sku,
                'color_name' => $variant->color_name,
                'color_hex' => $variant->color_hex,
                'size' => $variant->size,
                'stock_quantity' => $variant->stock_quantity,
                'is_in_stock' => $variant->isInStock(),
            ]);
        }

        return $payload;
    }
}
