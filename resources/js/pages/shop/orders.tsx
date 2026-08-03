import { Head, Link } from '@inertiajs/react';
import { ShoppingBag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { home, orders } from '@/routes';

interface OrderRow {
    order_number: string;
    total: number;
    status: string;
    item_count: number;
    payment_url: string | null;
    created_at: string;
}

const STATUS_META: Record<string, { label: string; badge: string }> = {
    paid: {
        label: 'Dibayar',
        badge: 'border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300',
    },
    pending: {
        label: 'Menunggu Pembayaran',
        badge: 'border-transparent bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300',
    },
    cancelled: {
        label: 'Dibatalkan',
        badge: 'border-transparent bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300',
    },
    failed: {
        label: 'Gagal',
        badge: 'border-transparent bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300',
    },
};

function formatRupiah(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(amount);
}

export default function Orders({ orders }: { orders: OrderRow[] }) {
    return (
        <>
            <Head title="Pesanan Saya" />

            <div className="flex flex-1 flex-col gap-6">
                {orders.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
                            <div className="rounded-full bg-muted p-6">
                                <ShoppingBag className="size-10 text-muted-foreground" />
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Kamu belum punya pesanan.
                            </p>
                            <Link
                                href={home()}
                                className="rounded-xl bg-violet-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-violet-500"
                            >
                                Mulai Belanja
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    orders.map((order) => {
                        const meta =
                            STATUS_META[order.status] ?? STATUS_META.pending;

                        return (
                            <Card key={order.order_number}>
                                <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-3">
                                            <span className="font-semibold">
                                                {order.order_number}
                                            </span>
                                            <Badge className={meta.badge}>
                                                {meta.label}
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            {order.created_at} ·{' '}
                                            {order.item_count} produk
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-4 sm:gap-6">
                                        <span className="text-lg font-bold text-violet-600 dark:text-violet-400">
                                            {formatRupiah(order.total)}
                                        </span>
                                        {order.status === 'pending' &&
                                            order.payment_url && (
                                                <a
                                                    href={order.payment_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-violet-500"
                                                >
                                                    Bayar Sekarang
                                                </a>
                                            )}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })
                )}
            </div>
        </>
    );
}

Orders.layout = {
    breadcrumbs: [
        {
            title: 'Pesanan Saya',
            href: orders(),
        },
    ],
};
