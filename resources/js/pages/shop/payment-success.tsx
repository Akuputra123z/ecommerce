import { Head, Link } from '@inertiajs/react';
import { home } from '@/routes';

interface Order {
    order_number: string;
    customer_name: string;
    total: number;
    status: string;
}

interface PageProps {
    order: Order | null;
}

const STATUS_META: Record<string, { label: string; color: string }> = {
    paid: { label: 'Pembayaran Berhasil', color: 'text-emerald-400' },
    pending: { label: 'Menunggu Pembayaran', color: 'text-amber-400' },
    cancelled: { label: 'Pembayaran Dibatalkan', color: 'text-red-400' },
    failed: { label: 'Pembayaran Gagal', color: 'text-red-400' },
};

function formatRupiah(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(amount);
}

export default function PaymentSuccess({ order }: PageProps) {
    const meta = order
        ? (STATUS_META[order.status] ?? STATUS_META.pending)
        : null;

    return (
        <>
            <Head title="Status Pesanan — NexaShop" />

            <div className="min-h-screen bg-[#080a12] text-white">
                <main className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center sm:px-6">
                    <div
                        className={`rounded-full p-6 ${order?.status === 'paid' ? 'bg-emerald-500/15' : 'bg-white/5'}`}
                    >
                        <svg
                            className={`h-14 w-14 ${order?.status === 'paid' ? 'text-emerald-400' : 'text-white/30'}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            {order?.status === 'paid' ? (
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            ) : (
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            )}
                        </svg>
                    </div>

                    {order ? (
                        <>
                            <h1 className="brand mt-6 text-3xl font-bold">
                                {meta?.label}
                            </h1>
                            <p className="mt-2 text-white/60">
                                Terima kasih, {order.customer_name}! Kami telah
                                menerima pesananmu.
                            </p>

                            <div className="mt-8 w-full rounded-2xl border border-white/10 bg-[#0f1117] p-6 text-left">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-white/50">
                                        No. Pesanan
                                    </span>
                                    <span className="text-sm font-semibold text-white">
                                        {order.order_number}
                                    </span>
                                </div>
                                <div className="mt-3 flex items-center justify-between">
                                    <span className="text-sm text-white/50">
                                        Status
                                    </span>
                                    <span
                                        className={`text-sm font-semibold ${meta?.color}`}
                                    >
                                        {meta?.label}
                                    </span>
                                </div>
                                <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3">
                                    <span className="text-sm text-white/50">
                                        Total
                                    </span>
                                    <span className="text-lg font-bold text-violet-400">
                                        {formatRupiah(order.total)}
                                    </span>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <h1 className="brand mt-6 text-3xl font-bold">
                                Status Pesanan Tidak Ditemukan
                            </h1>
                            <p className="mt-2 text-white/60">
                                Kami tidak dapat menemukan detail pesanan
                                tersebut.
                            </p>
                        </>
                    )}

                    <Link
                        href={home()}
                        className="mt-8 rounded-xl bg-gradient-to-r from-violet-600 to-violet-700 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all duration-200 hover:from-violet-500 hover:to-violet-600"
                    >
                        Kembali ke Beranda
                    </Link>
                </main>
            </div>
        </>
    );
}
