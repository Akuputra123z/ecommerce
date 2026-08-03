<?php

use App\Models\User;

test('guests are redirected to the login page', function () {
    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('login'));
});

test('admins can visit the dashboard', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $this->actingAs($admin);

    $response = $this->get(route('dashboard'));
    $response->assertOk();
});

test('customers are redirected to their orders page', function () {
    $customer = User::factory()->create(['role' => 'customer']);
    $this->actingAs($customer);

    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('orders'));
});
