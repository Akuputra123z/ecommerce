<?php

use App\Models\Order;
use App\Models\Product;
use Illuminate\Support\Facades\Http;

test('payment success page re-syncs a pending order from the Midtrans API', function () {
    config(['midtrans.server_key' => 'Mid-server-test', 'midtrans.api_url' => 'https://api.sandbox.midtrans.com/v2']);

    $product = Product::factory()->create(['price' => 100000, 'stock' => 5]);
    $order = Order::create([
        'order_number' => 'ORD-SYNC-TEST-20260804',
        'customer_name' => 'Test',
        'customer_email' => 'test@example.com',
        'customer_phone' => '08123456789',
        'shipping_address' => 'Jl. Test',
        'subtotal' => 100000,
        'shipping_cost' => 15000,
        'total' => 115000,
        'status' => 'pending',
    ]);

    Http::fake([
        '*' => Http::response([
            'transaction_status' => 'settlement',
            'fraud_status' => 'accept',
            'transaction_id' => 'txn-123',
        ], 200),
    ]);

    $response = $this->get(route('payment.success', ['order_id' => $order->order_number]));
    $response->assertOk();

    expect($order->fresh()->status)->toBe('paid')
        ->and($order->fresh()->midtrans_transaction_id)->toBe('txn-123');

    Http::assertSent(function ($request) use ($order) {
        return $request->url() === 'https://api.sandbox.midtrans.com/v2/'.$order->order_number.'/status';
    });
});

test('payment success page keeps a pending order when the Midtrans API is unreachable', function () {
    config(['midtrans.server_key' => 'sk', 'midtrans.api_url' => 'https://api.sandbox.midtrans.com/v2']);

    $order = Order::create([
        'order_number' => 'ORD-SYNC-TEST2-20260804',
        'customer_name' => 'Test',
        'customer_email' => 'test@example.com',
        'customer_phone' => '08123456789',
        'shipping_address' => 'Jl. Test',
        'subtotal' => 100000,
        'shipping_cost' => 15000,
        'total' => 115000,
        'status' => 'pending',
    ]);

    Http::fake([
        '*' => Http::response(['status_message' => 'not found'], 404),
    ]);

    $this->get(route('payment.success', ['order_id' => $order->order_number]));

    expect($order->fresh()->status)->toBe('pending');
});
