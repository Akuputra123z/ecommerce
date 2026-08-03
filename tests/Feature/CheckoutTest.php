<?php

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\Http;

test('checkout attaches the order to the authenticated user', function () {
    config(['midtrans.server_key' => 'Mid-server-test', 'midtrans.snap_url' => 'https://app.sandbox.midtrans.com/snap/v1']);

    Http::fake([
        'https://app.sandbox.midtrans.com/snap/v1/*' => Http::response([
            'token' => 'snap-token-123',
            'redirect_url' => 'https://app.sandbox.midtrans.com/snap/v4/redirection/snap-token-123',
        ], 201),
    ]);

    $user = User::factory()->create(['role' => 'customer']);
    $product = Product::factory()->create(['price' => 100000, 'stock' => 5]);

    $response = $this->actingAs($user)->postJson(route('checkout.store'), [
        'customer_name' => 'Customer',
        'customer_email' => 'customer@example.com',
        'customer_phone' => '08123456789',
        'shipping_address' => 'Jl. Test',
        'notes' => '',
        'items' => [
            ['product_id' => $product->id, 'quantity' => 2],
        ],
    ]);

    $response->assertOk()->assertJson(['snap_token' => 'snap-token-123']);

    $order = Order::first();
    expect($order)->not->toBeNull()
        ->and($order->user_id)->toBe($user->id)
        ->and($order->status)->toBe('pending')
        ->and((int) $order->total)->toBe(215000)
        ->and($product->fresh()->stock)->toBe(3);
});

test('guest checkout does not attach a user', function () {
    config(['midtrans.server_key' => 'Mid-server-test', 'midtrans.snap_url' => 'https://app.sandbox.midtrans.com/snap/v1']);

    Http::fake([
        'https://app.sandbox.midtrans.com/snap/v1/*' => Http::response([
            'token' => 'snap-token-456',
            'redirect_url' => 'https://app.sandbox.midtrans.com/snap/v4/redirection/snap-token-456',
        ], 201),
    ]);

    $product = Product::factory()->create(['price' => 100000, 'stock' => 5]);

    $this->postJson(route('checkout.store'), [
        'customer_name' => 'Guest',
        'customer_email' => 'guest@example.com',
        'customer_phone' => '08123456789',
        'shipping_address' => 'Jl. Test',
        'items' => [
            ['product_id' => $product->id, 'quantity' => 1],
        ],
    ])->assertOk();

    expect(Order::first()->user_id)->toBeNull();
});
