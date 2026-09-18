<?php

use App\Http\Controllers\AdminDashboardController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\StorefrontController;
use Illuminate\Support\Facades\Route;

Route::get('/', [StorefrontController::class, 'index'])->name('home');

Route::middleware('auth')->get('/apres-connexion', function () {
    return auth()->user()->isStaff()
        ? redirect()->route('dashboard')
        : redirect()->route('collections.index');
})->name('post-login');

Route::middleware(['auth', 'verified', 'staff'])->group(function () {
    Route::get('/dashboard', AdminDashboardController::class)->name('dashboard');
    Route::post('/admin/products', [AdminDashboardController::class, 'storeProduct'])->name('admin.products.store');
    Route::put('/admin/products/{product}', [AdminDashboardController::class, 'updateProduct'])->name('admin.products.update');
    Route::delete('/admin/products/{product}', [AdminDashboardController::class, 'destroyProduct'])->name('admin.products.destroy');
    Route::patch('/admin/orders/{order}', [AdminDashboardController::class, 'updateOrder'])->name('admin.orders.update');
});

Route::middleware('auth')->group(function () {
    Route::get('/collections', [StorefrontController::class, 'collections'])->name('collections.index');
    Route::get('/produits/{product:slug}', [StorefrontController::class, 'show'])->name('products.show');
    Route::get('/panier', [StorefrontController::class, 'cart'])->name('cart.show');
    Route::get('/mon-compte/commandes', [StorefrontController::class, 'accountOrders'])->name('account.orders');
    Route::post('/panier', [CartController::class, 'store'])->name('cart.items.store');
    Route::patch('/panier/items/{cartItem}', [CartController::class, 'update'])->name('cart.items.update');
    Route::delete('/panier/items/{cartItem}', [CartController::class, 'destroy'])->name('cart.items.destroy');
    Route::post('/panier/commander', [CartController::class, 'checkout'])->name('cart.checkout');
    Route::post('/reservations', [CartController::class, 'reserve'])->name('reservations.store');
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
