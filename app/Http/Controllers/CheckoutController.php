<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class CheckoutController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'customer_name' => ['required', 'string', 'max:100'],
            'customer_email' => ['required', 'email', 'max:150'],
            'customer_phone' => ['required', 'string', 'max:20'],
            'shipping_address' => ['required', 'string', 'max:500'],
            'notes' => ['nullable', 'string', 'max:500'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'integer', 'exists:products,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:100'],
        ]);

        return DB::transaction(function () use ($validated): JsonResponse {
            $orderItems = [];
            $subtotal = 0;

            foreach ($validated['items'] as $cartItem) {
                $product = Product::findOrFail($cartItem['product_id']);

                if ($product->stock < $cartItem['quantity']) {
                    return response()->json([
                        'message' => "Stok produk \"{$product->name}\" tidak mencukupi.",
                    ], 422);
                }

                $lineSubtotal = (int) $product->price * $cartItem['quantity'];
                $subtotal += $lineSubtotal;

                $orderItems[] = [
                    'product' => $product,
                    'quantity' => $cartItem['quantity'],
                    'price' => (int) $product->price,
                    'subtotal' => $lineSubtotal,
                ];
            }

            $shippingCost = 15000;
            $total = $subtotal + $shippingCost;

            $order = Order::create([
                'user_id' => auth()->id(),
                'order_number' => 'ORD-'.strtoupper(Str::random(8)).'-'.now()->format('Ymd'),
                'customer_name' => $validated['customer_name'],
                'customer_email' => $validated['customer_email'],
                'customer_phone' => $validated['customer_phone'],
                'shipping_address' => $validated['shipping_address'],
                'notes' => $validated['notes'] ?? null,
                'subtotal' => $subtotal,
                'shipping_cost' => $shippingCost,
                'total' => $total,
                'status' => 'pending',
            ]);

            foreach ($orderItems as $item) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item['product']->id,
                    'product_name' => $item['product']->name,
                    'price' => $item['price'],
                    'quantity' => $item['quantity'],
                    'subtotal' => $item['subtotal'],
                ]);

                $item['product']->decrement('stock', $item['quantity']);
            }

            $snapResult = $this->createSnapToken($order, $orderItems);

            if ($snapResult === null) {
                DB::rollBack();

                return response()->json([
                    'message' => 'Gagal membuat transaksi Midtrans. Coba lagi.',
                ], 500);
            }

            $order->update([
                'snap_token' => $snapResult['token'],
                'payment_url' => $snapResult['redirect_url'] ?? null,
            ]);

            return response()->json([
                'snap_token' => $snapResult['token'],
                'order_number' => $order->order_number,
            ]);
        });
    }

    /**
     * @param  array<array{product: Product, quantity: int, price: int, subtotal: int}>  $orderItems
     * @return array{token: string, redirect_url: string}|null
     */
    private function createSnapToken(Order $order, array $orderItems): ?array
    {
        $serverKey = config('midtrans.server_key', '');

        if (empty($serverKey)) {
            Log::error('MIDTRANS_SERVER_KEY belum dikonfigurasi');

            return null;
        }

        $snapUrl = config('midtrans.snap_url');

        $items = collect($orderItems)->map(fn ($item) => [
            'id' => (string) $item['product']->id,
            'price' => $item['price'],
            'quantity' => $item['quantity'],
            'name' => mb_substr($item['product']->name, 0, 50),
        ])->toArray();

        $items[] = [
            'id' => 'shipping',
            'price' => (int) $order->shipping_cost,
            'quantity' => 1,
            'name' => 'Ongkos Kirim',
        ];

        $params = [
            'transaction_details' => [
                'order_id' => $order->order_number,
                'gross_amount' => (int) $order->total,
            ],
            'item_details' => $items,
            'customer_details' => [
                'first_name' => mb_substr($order->customer_name, 0, 20),
                'email' => $order->customer_email,
                'phone' => preg_replace('/[^\d+]/', '', $order->customer_phone),
                'shipping_address' => [
                    'first_name' => mb_substr($order->customer_name, 0, 20),
                    'phone' => preg_replace('/[^\d+]/', '', $order->customer_phone),
                    'address' => mb_substr($order->shipping_address, 0, 200),
                ],
            ],
            'expiry' => [
                'unit' => 'day',
                'duration' => 1,
            ],
            'enabled_payments' => [
                'credit_card', 'gopay', 'shopeepay', 'qris',
                'bca_va', 'bni_va', 'bri_va', 'permata_va', 'other_va',
                'echannel', 'akulaku', 'kredivo',
            ],
            'callbacks' => [
                'finish' => route('payment.success'),
            ],
        ];

        $response = Http::withBasicAuth($serverKey, '')
            ->withHeaders(['Content-Type' => 'application/json'])
            ->timeout(30)
            ->connectTimeout(10)
            ->retry(2, 1000)
            ->post("{$snapUrl}/transactions", $params);

        if ($response->successful()) {
            return $response->json();
        }

        Log::error('Midtrans Snap API error (checkout)', [
            'order' => $order->order_number,
            'status' => $response->status(),
            'body' => $response->body(),
        ]);

        return null;
    }
}
