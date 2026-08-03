import type { PageProps as InertiaPageProps } from '@inertiajs/core';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import CheckoutController from '@/actions/App/Http/Controllers/CheckoutController';
import { home } from '@/routes';
import { success } from '@/routes/payment';

interface Product {
    id: number;
    name: string;
    price: number;
    stock: number;
    image: string | null;
}

interface CartItem {
    product: Product;
    quantity: number;
}

interface PageProps extends InertiaPageProps {
    midtransClientKey: string;
    midtransSnapJsUrl: string;
}

interface SnapPayOptions {
    onSuccess: (result: unknown) => void;
    onPending: (result: unknown) => void;
    onError: (result: unknown) => void;
    onClose: () => void;
}

declare global {
    interface Window {
        snap?: {
            pay: (snapToken: string, options: SnapPayOptions) => void;
        };
    }
}

const SHIPPING_COST = 15000;

function formatRupiah(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(amount);
}

function getXsrfToken(): string {
    const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]*)/);

    return match ? decodeURIComponent(match[1]) : '';
}

function loadSnapScript(snapJsUrl: string, clientKey: string): Promise<void> {
    return new Promise((resolve, reject) => {
        if (window.snap) {
            resolve();

            return;
        }

        const script = document.createElement('script');
        script.src = snapJsUrl;
        script.setAttribute('data-client-key', clientKey);
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Gagal memuat Snap.js'));
        document.body.appendChild(script);
    });
}

export default function ShopCart() {
    const { midtransClientKey, midtransSnapJsUrl } = usePage<PageProps>().props;

    const [cartItems] = useState<CartItem[]>(() => {
        const saved = sessionStorage.getItem('shopCart');

        if (!saved) {
            return [];
        }

        try {
            return JSON.parse(saved) as CartItem[];
        } catch {
            return [];
        }
    });
    const [form, setForm] = useState({
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        shipping_address: '',
        notes: '',
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const subtotal = cartItems.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0,
    );
    const total = subtotal + SHIPPING_COST;

    const updateField = (field: keyof typeof form, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setError(null);
        setSubmitting(true);

        try {
            const response = await fetch(CheckoutController.store.url(), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-XSRF-TOKEN': getXsrfToken(),
                },
                body: JSON.stringify({
                    ...form,
                    items: cartItems.map((item) => ({
                        product_id: item.product.id,
                        quantity: item.quantity,
                    })),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(
                    data.message ?? 'Terjadi kesalahan saat memproses pesanan.',
                );

                return;
            }

            await loadSnapScript(midtransSnapJsUrl, midtransClientKey);

            if (!window.snap) {
                setError('Gagal memuat Snap.js. Silakan coba lagi.');

                return;
            }

            window.snap.pay(data.snap_token, {
                onSuccess: () => {
                    sessionStorage.removeItem('shopCart');
                    router.visit(
                        success({ query: { order_id: data.order_number } }).url,
                    );
                },
                onPending: () => {
                    router.visit(
                        success({ query: { order_id: data.order_number } }).url,
                    );
                },
                onError: () => {
                    setError('Pembayaran gagal. Silakan coba lagi.');
                },
                onClose: () => {},
            });
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Terjadi kesalahan. Silakan coba lagi.',
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            <Head title="Checkout — NexaShop" />

            <div className="min-h-screen bg-[#080a12] text-white">
                <header className="border-b border-white/10 bg-[#0a0c15]/80 backdrop-blur-xl">
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
                        <Link href={home()} className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-emerald-500">
                                <svg
                                    className="h-4 w-4 text-white"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2.5}
                                        d="M13 10V3L4 14h7v7l9-11h-7z"
                                    />
                                </svg>
                            </div>
                            <span className="text-xl font-bold tracking-tight">
                                Nexa
                                <span className="bg-gradient-to-r from-violet-400 to-emerald-400 bg-clip-text text-transparent">
                                    Shop
                                </span>
                            </span>
                        </Link>
                        <span className="rounded-full border border-violet-500/30 bg-violet-600/20 px-3 py-1 text-xs font-medium text-violet-300">
                            Checkout
                        </span>
                    </div>
                </header>

                <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                    {error && (
                        <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                            {error}
                        </div>
                    )}

                    {cartItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
                            <div className="rounded-full bg-white/5 p-8">
                                <svg
                                    className="h-12 w-12 text-white/20"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1}
                                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                                    />
                                </svg>
                            </div>
                            <p className="text-white/40">
                                Keranjang masih kosong
                            </p>
                            <Link
                                href={home()}
                                className="rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-violet-500"
                            >
                                Mulai Belanja
                            </Link>
                        </div>
                    ) : (
                        <form
                            onSubmit={handleSubmit}
                            className="grid gap-8 lg:grid-cols-5"
                        >
                            <div className="space-y-6 lg:col-span-3">
                                <section className="rounded-2xl border border-white/10 bg-[#0f1117] p-6">
                                    <h2 className="mb-4 font-semibold text-white">
                                        Data Pengiriman
                                    </h2>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <label className="block">
                                            <span className="mb-1 block text-xs font-medium text-white/50">
                                                Nama Lengkap
                                            </span>
                                            <input
                                                type="text"
                                                value={form.customer_name}
                                                onChange={(e) =>
                                                    updateField(
                                                        'customer_name',
                                                        e.target.value,
                                                    )
                                                }
                                                required
                                                className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                                                placeholder="Nama kamu"
                                            />
                                        </label>
                                        <label className="block">
                                            <span className="mb-1 block text-xs font-medium text-white/50">
                                                No. WhatsApp
                                            </span>
                                            <input
                                                type="tel"
                                                value={form.customer_phone}
                                                onChange={(e) =>
                                                    updateField(
                                                        'customer_phone',
                                                        e.target.value,
                                                    )
                                                }
                                                required
                                                className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                                                placeholder="0812xxxxxxx"
                                            />
                                        </label>
                                        <label className="block sm:col-span-2">
                                            <span className="mb-1 block text-xs font-medium text-white/50">
                                                Email
                                            </span>
                                            <input
                                                type="email"
                                                value={form.customer_email}
                                                onChange={(e) =>
                                                    updateField(
                                                        'customer_email',
                                                        e.target.value,
                                                    )
                                                }
                                                required
                                                className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                                                placeholder="emailkamu@example.com"
                                            />
                                        </label>
                                        <label className="block sm:col-span-2">
                                            <span className="mb-1 block text-xs font-medium text-white/50">
                                                Alamat Lengkap
                                            </span>
                                            <textarea
                                                value={form.shipping_address}
                                                onChange={(e) =>
                                                    updateField(
                                                        'shipping_address',
                                                        e.target.value,
                                                    )
                                                }
                                                required
                                                rows={3}
                                                className="w-full resize-none rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                                                placeholder="Jalan, kota, provinsi, kode pos"
                                            />
                                        </label>
                                        <label className="block sm:col-span-2">
                                            <span className="mb-1 block text-xs font-medium text-white/50">
                                                Catatan (opsional)
                                            </span>
                                            <textarea
                                                value={form.notes}
                                                onChange={(e) =>
                                                    updateField(
                                                        'notes',
                                                        e.target.value,
                                                    )
                                                }
                                                rows={2}
                                                className="w-full resize-none rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                                                placeholder="Catatan untuk penjual"
                                            />
                                        </label>
                                    </div>
                                </section>

                                <section className="rounded-2xl border border-white/10 bg-[#0f1117] p-6">
                                    <h2 className="mb-4 font-semibold text-white">
                                        Ringkasan Pesanan
                                    </h2>
                                    <div className="space-y-4">
                                        {cartItems.map((item) => (
                                            <div
                                                key={item.product.id}
                                                className="flex items-center gap-3 rounded-xl bg-white/5 p-3"
                                            >
                                                <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-white/10">
                                                    {item.product.image ? (
                                                        <img
                                                            src={
                                                                item.product
                                                                    .image
                                                            }
                                                            alt={
                                                                item.product
                                                                    .name
                                                            }
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center text-xs text-white/20">
                                                            No img
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="line-clamp-1 text-sm font-medium text-white">
                                                        {item.product.name}
                                                    </p>
                                                    <p className="text-xs text-white/40">
                                                        {item.quantity} ×{' '}
                                                        {formatRupiah(
                                                            item.product.price,
                                                        )}
                                                    </p>
                                                </div>
                                                <span className="text-sm font-semibold text-violet-400">
                                                    {formatRupiah(
                                                        item.product.price *
                                                            item.quantity,
                                                    )}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            </div>

                            <aside className="lg:col-span-2">
                                <div className="sticky top-6 space-y-6">
                                    <section className="rounded-2xl border border-white/10 bg-[#0f1117] p-6">
                                        <h2 className="mb-4 font-semibold text-white">
                                            Total Pembayaran
                                        </h2>
                                        <div className="space-y-3 text-sm">
                                            <div className="flex items-center justify-between text-white/60">
                                                <span>Subtotal</span>
                                                <span className="font-semibold text-white">
                                                    {formatRupiah(subtotal)}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between text-white/60">
                                                <span>Ongkos Kirim</span>
                                                <span className="font-semibold text-emerald-400">
                                                    {formatRupiah(
                                                        SHIPPING_COST,
                                                    )}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between border-t border-white/10 pt-3">
                                                <span className="font-semibold text-white">
                                                    Total
                                                </span>
                                                <span className="text-lg font-bold text-violet-400">
                                                    {formatRupiah(total)}
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-violet-700 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all duration-200 hover:from-violet-500 hover:to-violet-600 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {submitting
                                                ? 'Memproses...'
                                                : 'Bayar Sekarang'}
                                        </button>
                                        <p className="mt-4 text-center text-xs text-white/30">
                                            Pembayaran diproses aman via
                                            Midtrans (GoPay, QRIS, VA Bank,
                                            Kartu Kredit)
                                        </p>
                                    </section>
                                </div>
                            </aside>
                        </form>
                    )}
                </main>
            </div>
        </>
    );
}
