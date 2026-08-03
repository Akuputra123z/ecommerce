<?php

use App\Models\Order;
use App\Models\User;

test('guests are redirected to the login page', function () {
    $response = $this->get(route('orders'));
    $response->assertRedirect(route('login'));
});

test('customers only see their own orders', function () {
    $customer = User::factory()->create(['role' => 'customer']);
    $other = User::factory()->create(['role' => 'customer']);

    $ownOrder = Order::create([
        'user_id' => $customer->id,
        'order_number' => 'ORD-OWNER-20260804',
        'customer_name' => 'Customer',
        'customer_email' => 'customer@example.com',
        'customer_phone' => '08123456789',
        'shipping_address' => 'Jl. Test',
        'subtotal' => 100000,
        'shipping_cost' => 15000,
        'total' => 115000,
        'status' => 'pending',
        'payment_url' => 'https://app.sandbox.midtrans.com/snap/v4/redirection/token',
    ]);

    Order::create([
        'user_id' => $other->id,
        'order_number' => 'ORD-OTHER-20260804',
        'customer_name' => 'Other',
        'customer_email' => 'other@example.com',
        'customer_phone' => '08123456789',
        'shipping_address' => 'Jl. Lain',
        'subtotal' => 50000,
        'shipping_cost' => 15000,
        'total' => 65000,
        'status' => 'paid',
    ]);

    $this->actingAs($customer)
        ->get(route('orders'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('shop/orders')
            ->has('orders', 1)
            ->where('orders.0.order_number', $ownOrder->order_number));
});
