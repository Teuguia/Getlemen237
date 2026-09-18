<?php

namespace Tests\Feature;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Reservation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CommerceFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_cart_quantities_are_merged_and_limited_by_stock(): void
    {
        $user = User::factory()->create();
        [$product, $variant] = $this->availableVariant(stock: 3, priceCents: 3500000);

        $this->actingAs($user)
            ->post(route('cart.items.store'), [
                'product_variant_id' => $variant->id,
                'quantity' => 2,
            ])
            ->assertSessionHasNoErrors()
            ->assertSessionHas('success');

        $this->actingAs($user)
            ->post(route('cart.items.store'), [
                'product_variant_id' => $variant->id,
                'quantity' => 1,
            ])
            ->assertSessionHasNoErrors();

        $this->assertDatabaseHas('cart_items', [
            'product_id' => $product->id,
            'product_variant_id' => $variant->id,
            'quantity' => 3,
            'unit_price_cents' => 3500000,
        ]);

        $this->actingAs($user)
            ->from(route('products.show', $product))
            ->post(route('cart.items.store'), [
                'product_variant_id' => $variant->id,
                'quantity' => 1,
            ])
            ->assertSessionHasErrors('quantity');

        $this->assertSame(3, CartItem::query()->where('product_variant_id', $variant->id)->value('quantity'));
    }

    public function test_checkout_creates_order_converts_cart_and_decrements_stock(): void
    {
        $user = User::factory()->create([
            'phone' => '237699000000',
        ]);
        [$product, $variant] = $this->availableVariant(stock: 2, priceCents: 3500000);

        $this->actingAs($user)->post(route('cart.items.store'), [
            'product_variant_id' => $variant->id,
            'quantity' => 2,
        ]);

        $this->actingAs($user)
            ->post(route('cart.checkout'), [
                'customer_name' => 'Jean Client',
                'customer_phone' => '237699000000',
                'delivery_district' => 'Bastos',
                'delivery_address' => 'Rue principale',
                'payment_method' => 'cash_on_delivery',
                'notes' => 'Livrer le matin',
            ])
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('account.orders', absolute: false));

        $order = Order::query()->with('items')->sole();
        $this->assertSame($user->id, $order->user_id);
        $this->assertSame('confirmed', $order->status);
        $this->assertSame('pay_on_delivery', $order->payment_status);
        $this->assertSame(7000000, $order->subtotal_cents);
        $this->assertSame(200000, $order->delivery_fee_cents);
        $this->assertSame(7200000, $order->total_cents);
        $this->assertCount(1, $order->items);
        $this->assertSame($product->name, $order->items->first()->product_name);
        $this->assertSame(2, $order->items->first()->quantity);

        $variant->refresh();
        $this->assertSame(0, $variant->stock_quantity);
        $this->assertSame('out_of_stock', $variant->status);

        $cart = Cart::query()->where('user_id', $user->id)->sole();
        $this->assertSame('converted', $cart->status);
        $this->assertNotNull($cart->converted_at);
        $this->assertDatabaseMissing('cart_items', ['cart_id' => $cart->id]);
    }

    public function test_checkout_is_rejected_if_stock_becomes_insufficient_before_payment(): void
    {
        $user = User::factory()->create();
        [, $variant] = $this->availableVariant(stock: 3, priceCents: 4200000);

        $this->actingAs($user)->post(route('cart.items.store'), [
            'product_variant_id' => $variant->id,
            'quantity' => 3,
        ]);

        $variant->update(['stock_quantity' => 2]);

        $this->actingAs($user)
            ->from(route('cart.show'))
            ->post(route('cart.checkout'), [
                'customer_name' => 'Jean Client',
                'customer_phone' => '237699000000',
                'delivery_address' => 'Rue principale',
                'payment_method' => 'orange_money',
            ])
            ->assertSessionHasErrors('cart');

        $this->assertDatabaseCount('orders', 0);
        $this->assertSame(2, $variant->refresh()->stock_quantity);
        $this->assertSame(3, CartItem::query()->where('product_variant_id', $variant->id)->value('quantity'));
        $this->assertSame('active', Cart::query()->where('user_id', $user->id)->value('status'));
    }

    public function test_customer_can_reserve_available_stock_without_decrementing_inventory(): void
    {
        $user = User::factory()->create([
            'name' => 'Client Reserve',
            'phone' => '237677000000',
        ]);
        [$product, $variant] = $this->availableVariant(stock: 2);

        $this->actingAs($user)
            ->post(route('reservations.store'), [
                'product_variant_id' => $variant->id,
                'quantity' => 2,
                'notes' => 'Je passe demain.',
            ])
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('account.orders', absolute: false));

        $reservation = Reservation::query()->sole();
        $this->assertSame($user->id, $reservation->user_id);
        $this->assertSame($product->id, $reservation->product_id);
        $this->assertSame($variant->id, $reservation->product_variant_id);
        $this->assertSame('pending', $reservation->status);
        $this->assertSame(2, $reservation->quantity);
        $this->assertTrue($reservation->expires_at->isFuture());

        $this->assertSame(2, $variant->refresh()->stock_quantity);
    }

    public function test_reservation_is_rejected_when_quantity_exceeds_stock(): void
    {
        $user = User::factory()->create();
        [, $variant] = $this->availableVariant(stock: 1);

        $this->actingAs($user)
            ->from(route('products.show', $variant->product))
            ->post(route('reservations.store'), [
                'product_variant_id' => $variant->id,
                'quantity' => 2,
            ])
            ->assertSessionHasErrors('quantity');

        $this->assertDatabaseCount('reservations', 0);
        $this->assertSame(1, $variant->refresh()->stock_quantity);
    }

    public function test_customer_cannot_update_another_customer_cart_item(): void
    {
        $owner = User::factory()->create();
        $intruder = User::factory()->create();
        [$product, $variant] = $this->availableVariant(stock: 5);
        $cart = Cart::query()->create([
            'user_id' => $owner->id,
            'status' => 'active',
        ]);
        $item = CartItem::query()->create([
            'cart_id' => $cart->id,
            'product_id' => $product->id,
            'product_variant_id' => $variant->id,
            'quantity' => 1,
            'unit_price_cents' => $product->activePriceCents(),
        ]);

        $this->actingAs($intruder)
            ->patch(route('cart.items.update', $item), ['quantity' => 2])
            ->assertForbidden();

        $this->assertSame(1, $item->refresh()->quantity);
    }

    /**
     * @return array{Product, ProductVariant}
     */
    private function availableVariant(int $stock = 4, int $priceCents = 4500000): array
    {
        $category = Category::query()->create([
            'name' => 'Chaussures',
            'slug' => 'chaussures',
            'is_active' => true,
        ]);

        $product = Product::query()->create([
            'category_id' => $category->id,
            'name' => 'Mocassin Milano',
            'slug' => 'mocassin-milano-'.fake()->unique()->numberBetween(1000, 9999),
            'reference' => '237-SHO-'.fake()->unique()->numberBetween(1000, 9999),
            'description' => 'Mocassin en cuir.',
            'base_price_cents' => $priceCents,
            'status' => 'published',
            'is_featured' => true,
            'published_at' => now(),
        ]);

        $variant = ProductVariant::query()->create([
            'product_id' => $product->id,
            'sku' => $product->reference.'-42',
            'color_name' => 'Marron',
            'color_hex' => '#7a431f',
            'size' => '42',
            'stock_quantity' => $stock,
            'low_stock_threshold' => 2,
            'status' => $stock > 0 ? 'available' : 'out_of_stock',
        ]);

        return [$product, $variant];
    }
}
