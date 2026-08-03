import { Head } from '@inertiajs/react';
import { ShoppingBag, ShoppingCart, Store, Wallet } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { dashboard } from '@/routes';

interface Stats {
    total_orders: number;
    pending_orders: number;
    paid_orders: number;
    revenue: number;
    total_products: number;
}

interface OrderRow {
    order_number: string;
    customer_name: string;
    total: number;
    status: string;
    item_count: number;
    created_at: string;
}

interface LowStockProduct {
    name: string;
    stock: number;
}

const STATUS_META: Record<
    string,
    { label: string; badge: string; iconColor: string }
> = {
    paid: {
        label: 'Dibayar',
        badge: 'border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300',
        iconColor: 'text-emerald-500',
    },
    pending: {
        label: 'Menunggu Pembayaran',
        badge: 'border-transparent bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300',
        iconColor: 'text-amber-500',
    },
    cancelled: {
        label: 'Dibatalkan',
        badge: 'border-transparent bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300',
        iconColor: 'text-red-500',
    },
    failed: {
        label: 'Gagal',
        badge: 'border-transparent bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300',
        iconColor: 'text-red-500',
    },
};

function formatRupiah(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(amount);
}

export default function Dashboard({
    stats,
    recentOrders,
    lowStockProducts,
}: {
    stats: Stats;
    recentOrders: OrderRow[];
    lowStockProducts: LowStockProduct[];
}) {
    const statCards = [
        {
            title: 'Total Pesanan',
            value: stats.total_orders.toLocaleString('id-ID'),
            icon: ShoppingCart,
            iconColor: 'text-violet-500',
        },
        {
            title: 'Menunggu Pembayaran',
            value: stats.pending_orders.toLocaleString('id-ID'),
            icon: Wallet,
            iconColor: 'text-amber-500',
        },
        {
            title: 'Pendapatan',
            value: formatRupiah(stats.revenue),
            icon: ShoppingBag,
            iconColor: 'text-emerald-500',
        },
        {
            title: 'Produk Aktif',
            value: stats.total_products.toLocaleString('id-ID'),
            icon: Store,
            iconColor: 'text-sky-500',
        },
    ];

    return (
        <>
            <Head title="Dashboard" />

            <div className="flex flex-1 flex-col gap-6">
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {statCards.map((card) => (
                        <Card key={card.title}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    {card.title}
                                </CardTitle>
                                <card.icon
                                    className={`size-4 ${card.iconColor}`}
                                />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {card.value}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="grid gap-6 xl:grid-cols-3">
                    <Card className="xl:col-span-2">
                        <CardHeader>
                            <CardTitle>Pesanan Terbaru</CardTitle>
                            <CardDescription>
                                10 pesanan terakhir dari toko
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {recentOrders.length === 0 ? (
                                <p className="py-8 text-center text-sm text-muted-foreground">
                                    Belum ada pesanan. Pesanan akan muncul di
                                    sini setelah pelanggan checkout.
                                </p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b text-left text-xs tracking-wider text-muted-foreground uppercase">
                                                <th className="pr-4 pb-2 font-medium">
                                                    No. Pesanan
                                                </th>
                                                <th className="pr-4 pb-2 font-medium">
                                                    Pelanggan
                                                </th>
                                                <th className="pr-4 pb-2 font-medium">
                                                    Item
                                                </th>
                                                <th className="pr-4 pb-2 font-medium">
                                                    Total
                                                </th>
                                                <th className="pr-4 pb-2 font-medium">
                                                    Status
                                                </th>
                                                <th className="pb-2 font-medium">
                                                    Waktu
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {recentOrders.map((order) => {
                                                const meta =
                                                    STATUS_META[order.status] ??
                                                    STATUS_META.pending;

                                                return (
                                                    <tr
                                                        key={order.order_number}
                                                    >
                                                        <td className="py-3 pr-4 font-medium">
                                                            {order.order_number}
                                                        </td>
                                                        <td className="py-3 pr-4 text-muted-foreground">
                                                            {
                                                                order.customer_name
                                                            }
                                                        </td>
                                                        <td className="py-3 pr-4 text-muted-foreground">
                                                            {order.item_count}{' '}
                                                            produk
                                                        </td>
                                                        <td className="py-3 pr-4 font-semibold">
                                                            {formatRupiah(
                                                                order.total,
                                                            )}
                                                        </td>
                                                        <td className="py-3 pr-4">
                                                            <Badge
                                                                className={
                                                                    meta.badge
                                                                }
                                                            >
                                                                {meta.label}
                                                            </Badge>
                                                        </td>
                                                        <td className="py-3 text-muted-foreground">
                                                            {order.created_at}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Stok Menipis</CardTitle>
                            <CardDescription>
                                Produk dengan stok &le; 10
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {lowStockProducts.length === 0 ? (
                                <p className="py-8 text-center text-sm text-muted-foreground">
                                    Semua stok produk aman.
                                </p>
                            ) : (
                                <ul className="space-y-3">
                                    {lowStockProducts.map((product) => (
                                        <li
                                            key={product.name}
                                            className="flex items-center justify-between rounded-lg border p-3"
                                        >
                                            <span className="line-clamp-1 text-sm font-medium">
                                                {product.name}
                                            </span>
                                            <Badge
                                                variant={
                                                    product.stock === 0
                                                        ? 'destructive'
                                                        : 'outline'
                                                }
                                                className={
                                                    product.stock === 0
                                                        ? ''
                                                        : 'ml-3 shrink-0 text-amber-600 dark:text-amber-400'
                                                }
                                            >
                                                {product.stock === 0
                                                    ? 'Habis'
                                                    : `Sisa ${product.stock}`}
                                            </Badge>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
