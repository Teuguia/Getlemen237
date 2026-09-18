<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Order;
use App\Models\ProductVariant;
use App\Models\Reservation;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CartController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'product_variant_id' => ['required', 'exists:product_variants,id'],
            'quantity' => ['required', 'integer', 'min:1'],
        ]);

        $variant = ProductVariant::query()
            ->with('product')
            ->where('status', 'available')
            ->findOrFail($validated['product_variant_id']);

        if ($variant->stock_quantity < $validated['quantity']) {
            throw ValidationException::withMessages([
                'quantity' => 'La quantite demandee depasse le stock disponible.',
            ]);
        }

        $cart = $this->activeCart($request);

        $item = CartItem::query()->firstOrNew([
            'cart_id' => $cart->id,
            'product_variant_id' => $variant->id,
        ]);

        $newQuantity = ($item->exists ? $item->quantity : 0) + (int) $validated['quantity'];

        if ($variant->stock_quantity < $newQuantity) {
            throw ValidationException::withMessages([
                'quantity' => 'La quantite totale dans le panier depasse le stock disponible.',
            ]);
        }

        $item->fill([
            'product_id' => $variant->product_id,
            'quantity' => $newQuantity,
            'unit_price_cents' => $variant->product->activePriceCents(),
        ])->save();

        return back()->with('success', 'Produit ajoute au panier.');
    }

    public function update(Request $request, CartItem $cartItem): RedirectResponse
    {
        $validated = $request->validate([
            'quantity' => ['required', 'integer', 'min:1'],
        ]);

        $this->authorizeCartItem($request, $cartItem);

        if ($cartItem->variant && $cartItem->variant->stock_quantity < $validated['quantity']) {
            throw ValidationException::withMessages([
                'quantity' => 'Stock insuffisant pour cette quantite.',
            ]);
        }

        $cartItem->update(['quantity' => $validated['quantity']]);

        return back()->with('success', 'Panier mis a jour.');
    }

    public function destroy(Request $request, CartItem $cartItem): RedirectResponse
    {
        $this->authorizeCartItem($request, $cartItem);
        $cartItem->delete();

        return back()->with('success', 'Article retire du panier.');
    }

    public function checkout(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'customer_name' => ['required', 'string', 'max:255'],
            'customer_phone' => ['required', 'string', 'max:40'],
            'delivery_district' => ['nullable', 'string', 'max:120'],
            'delivery_address' => ['required', 'string', 'max:1000'],
            'payment_method' => ['required', 'in:cash_on_delivery,orange_money,mtn_mobile_money'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $cart = $this->activeCart($request)->load(['items.product', 'items.variant']);

        if ($cart->items->isEmpty()) {
            throw ValidationException::withMessages([
                'cart' => 'Votre panier est vide.',
            ]);
        }

        $order = DB::transaction(function () use ($cart, $request, $validated) {
            foreach ($cart->items as $item) {
                if ($item->variant && $item->variant->stock_quantity < $item->quantity) {
                    throw ValidationException::withMessages([
                        'cart' => "Stock insuffisant pour {$item->product->name}.",
                    ]);
                }
            }

            $subtotal = $cart->items->sum(fn (CartItem $item) => $item->quantity * $item->unit_price_cents);
            $deliveryFee = 200000;

            $order = Order::query()->create([
                'user_id' => $request->user()->id,
                'order_number' => 'G237-'.now()->format('ymdHis').'-'.$request->user()->id,
                'customer_name' => $validated['customer_name'],
                'customer_phone' => $validated['customer_phone'],
                'customer_email' => $request->user()->email,
                'delivery_city' => 'Yaounde',
                'delivery_district' => $validated['delivery_district'] ?? null,
                'delivery_address' => $validated['delivery_address'],
                'status' => $validated['payment_method'] === 'cash_on_delivery' ? 'confirmed' : 'pending_payment',
                'payment_status' => $validated['payment_method'] === 'cash_on_delivery' ? 'pay_on_delivery' : 'unpaid',
                'payment_method' => $validated['payment_method'],
                'subtotal_cents' => $subtotal,
                'delivery_fee_cents' => $deliveryFee,
                'total_cents' => $subtotal + $deliveryFee,
                'notes' => $validated['notes'] ?? null,
                'confirmed_at' => $validated['payment_method'] === 'cash_on_delivery' ? now() : null,
            ]);

            foreach ($cart->items as $item) {
                $order->items()->create([
                    'product_id' => $item->product_id,
                    'product_variant_id' => $item->product_variant_id,
                    'product_name' => $item->product->name,
                    'product_reference' => $item->product->reference,
                    'color_name' => $item->variant?->color_name,
                    'size' => $item->variant?->size,
                    'quantity' => $item->quantity,
                    'unit_price_cents' => $item->unit_price_cents,
                    'line_total_cents' => $item->quantity * $item->unit_price_cents,
                ]);

                if ($item->variant) {
                    $item->variant->decrement('stock_quantity', $item->quantity);
                    $item->variant->refresh();

                    if ($item->variant->stock_quantity === 0) {
                        $item->variant->update(['status' => 'out_of_stock']);
                    }
                }
            }

            $cart->items()->delete();
            $cart->update(['status' => 'converted', 'converted_at' => now()]);

            return $order;
        });

        return to_route('account.orders')->with('success', "Commande {$order->order_number} creee.");
    }

    public function reserve(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'product_variant_id' => ['required', 'exists:product_variants,id'],
            'quantity' => ['required', 'integer', 'min:1'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $variant = ProductVariant::query()->with('product')->findOrFail($validated['product_variant_id']);

        if ($variant->stock_quantity < $validated['quantity']) {
            throw ValidationException::withMessages([
                'quantity' => 'Stock insuffisant pour reserver cette quantite.',
            ]);
        }

        $reservation = Reservation::query()->create([
            'user_id' => $request->user()->id,
            'product_id' => $variant->product_id,
            'product_variant_id' => $variant->id,
            'reservation_number' => 'RES-'.now()->format('ymdHis').'-'.$request->user()->id,
            'customer_name' => $request->user()->name,
            'customer_phone' => $request->user()->phone,
            'quantity' => $validated['quantity'],
            'status' => 'pending',
            'notes' => $validated['notes'] ?? null,
            'expires_at' => now()->addDays(2),
        ]);

        return to_route('account.orders')->with('success', "Reservation {$reservation->reservation_number} enregistree.");
    }

    private function activeCart(Request $request): Cart
    {
        return Cart::query()->firstOrCreate([
            'user_id' => $request->user()?->id,
            'session_id' => $request->user() ? null : $request->session()->getId(),
            'status' => 'active',
        ]);
    }

    private function authorizeCartItem(Request $request, CartItem $cartItem): void
    {
        $cartItem->loadMissing('cart');

        abort_unless(
            $cartItem->cart->user_id === $request->user()?->id
            || $cartItem->cart->session_id === $request->session()->getId(),
            403,
        );
    }
}
