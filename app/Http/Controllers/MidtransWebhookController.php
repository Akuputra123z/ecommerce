<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class MidtransWebhookController extends Controller
{
    public function handle(Request $request): JsonResponse
    {
        $payload = $request->all();

        Log::info('Midtrans webhook received', ['order_id' => $payload['order_id'] ?? null]);

        if (! $this->isValidSignature($payload)) {
            Log::warning('Midtrans webhook invalid signature', ['order_id' => $payload['order_id'] ?? null]);

            return response()->json(['message' => 'Invalid signature'], Response::HTTP_FORBIDDEN);
        }

        $orderNumber = $payload['order_id'] ?? null;
        $transactionStatus = $payload['transaction_status'] ?? null;
        $fraudStatus = $payload['fraud_status'] ?? null;
        $transactionId = $payload['transaction_id'] ?? null;

        if (! $orderNumber) {
            return response()->json(['message' => 'OK']);
        }

        $order = Order::where('order_number', $orderNumber)->first();

        if (! $order) {
            Log::warning('Midtrans webhook: order not found', ['order_number' => $orderNumber]);

            return response()->json(['message' => 'Order not found'], 404);
        }

        $newStatus = $this->resolveOrderStatus($transactionStatus, $fraudStatus);

        $order->update([
            'status' => $newStatus,
            'midtrans_transaction_id' => $transactionId,
        ]);

        Log::info('Midtrans order status updated', [
            'order_number' => $orderNumber,
            'old_status' => $order->getOriginal('status'),
            'new_status' => $newStatus,
        ]);

        return response()->json(['message' => 'OK']);
    }

    public function success(Request $request): \Inertia\Response
    {
        $orderNumber = $request->query('order_id');
        $order = null;

        if ($orderNumber) {
            $order = Order::where('order_number', $orderNumber)->first();

            if ($order && $order->status === 'pending') {
                $this->syncOrderStatusFromMidtrans($order);
            }

            $order = Order::where('order_number', $orderNumber)
                ->select(['order_number', 'customer_name', 'total', 'status'])
                ->first();
        }

        return Inertia::render('shop/payment-success', [
            'order' => $order,
        ]);
    }

    /**
     * Fallback when the payment notification webhook was missed (e.g. local development):
     * fetch the latest transaction status from the Midtrans API and update the order.
     */
    private function syncOrderStatusFromMidtrans(Order $order): void
    {
        $serverKey = config('midtrans.server_key', '');

        if (empty($serverKey)) {
            return;
        }

        try {
            $response = Http::withBasicAuth($serverKey, '')
                ->withHeaders(['Accept' => 'application/json'])
                ->timeout(15)
                ->get(config('midtrans.api_url').'/'.$order->order_number.'/status');

            if (! $response->successful() || $response->json('transaction_status') === null) {
                return;
            }

            $newStatus = $this->resolveOrderStatus(
                $response->json('transaction_status'),
                $response->json('fraud_status'),
            );

            $order->update([
                'status' => $newStatus,
                'midtrans_transaction_id' => $response->json('transaction_id'),
            ]);
        } catch (\Throwable $exception) {
            Log::warning('Midtrans status sync failed', [
                'order_number' => $order->order_number,
                'error' => $exception->getMessage(),
            ]);
        }
    }

    /**
     * Resolve the order status from Midtrans transaction/fraud status.
     */
    private function resolveOrderStatus(string $transactionStatus, ?string $fraudStatus): string
    {
        return match (true) {
            $transactionStatus === 'capture' && $fraudStatus === 'accept' => 'paid',
            $transactionStatus === 'settlement' => 'paid',
            in_array($transactionStatus, ['cancel', 'deny', 'expire'], true) => 'cancelled',
            $transactionStatus === 'failure' => 'failed',
            default => 'pending',
        };
    }

    /**
     * Validate Midtrans signature hash.
     * Formula: SHA512(order_id + status_code + gross_amount + server_key)
     */
    private function isValidSignature(array $payload): bool
    {
        $serverKey = config('midtrans.server_key', '');

        if (empty($serverKey)) {
            return false;
        }

        $orderId = $payload['order_id'] ?? '';
        $statusCode = $payload['status_code'] ?? '';
        $grossAmount = $payload['gross_amount'] ?? '';
        $receivedSignature = $payload['signature_key'] ?? '';

        $expectedSignature = hash('sha512', $orderId.$statusCode.$grossAmount.$serverKey);

        return hash_equals($expectedSignature, $receivedSignature);
    }
}
