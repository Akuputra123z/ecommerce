<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use Inertia\Inertia;
use Inertia\Response;

class ShopController extends Controller
{
    public function index(): Response
    {
        $products = Product::where('is_active', true)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn (Product $product) => [
                'id' => $product->id,
                'name' => $product->name,
                'slug' => $product->slug,
                'description' => $product->description,
                'price' => (int) $product->price,
                'stock' => $product->stock,
                'image' => $product->image,
                'category' => $product->category,
            ]);

        $categories = Product::where('is_active', true)
            ->whereNotNull('category')
            ->distinct()
            ->pluck('category');

        return Inertia::render('welcome', [
            'products' => $products,
            'categories' => $categories,
            'midtransClientKey' => config('midtrans.client_key'),
            'midtransSnapJsUrl' => config('midtrans.snap_js_url'),
        ]);
    }

    public function cart(): Response
    {
        return Inertia::render('shop/cart', [
            'midtransClientKey' => config('midtrans.client_key'),
            'midtransSnapJsUrl' => config('midtrans.snap_js_url'),
        ]);
    }

    public function dashboard(): Response
    {
        $stats = [
            'total_orders' => Order::count(),
            'pending_orders' => Order::where('status', 'pending')->count(),
            'paid_orders' => Order::where('status', 'paid')->count(),
            'revenue' => (int) Order::where('status', 'paid')->sum('total'),
            'total_products' => Product::count(),
        ];

        $recentOrders = Order::query()
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(fn (Order $order) => [
                'order_number' => $order->order_number,
                'customer_name' => $order->customer_name,
                'total' => (int) $order->total,
                'status' => $order->status,
                'item_count' => $order->items()->count(),
                'created_at' => $order->created_at->diffForHumans(),
            ]);

        $lowStockProducts = Product::where('is_active', true)
            ->where('stock', '<=', 10)
            ->orderBy('stock')
            ->limit(10)
            ->get()
            ->map(fn (Product $product) => [
                'name' => $product->name,
                'stock' => $product->stock,
            ]);

        return Inertia::render('dashboard', [
            'stats' => $stats,
            'recentOrders' => $recentOrders,
            'lowStockProducts' => $lowStockProducts,
        ]);
    }

    public function orders(): Response
    {
        $orders = Order::where('user_id', auth()->id())
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn (Order $order) => [
                'order_number' => $order->order_number,
                'total' => (int) $order->total,
                'status' => $order->status,
                'item_count' => $order->items()->count(),
                'payment_url' => $order->payment_url,
                'created_at' => $order->created_at->diffForHumans(),
            ]);

        return Inertia::render('shop/orders', [
            'orders' => $orders,
        ]);
    }
}
