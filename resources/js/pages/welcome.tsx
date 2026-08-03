import type { PageProps as InertiaPageProps } from '@inertiajs/core';
import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { cart, home } from '@/routes';

interface Product {
    id: number;
    name: string;
    slug: string;
    description: string;
    price: number;
    stock: number;
    image: string | null;
    category: string | null;
}

interface CartItem {
    product: Product;
    quantity: number;
}

interface PageProps extends InertiaPageProps {
    auth: { user: { name: string } | null };
    products: Product[];
    categories: string[];
    midtransClientKey: string;
    midtransSnapJsUrl: string;
}

function formatRupiah(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(amount);
}

function ProductCard({
    product,
    onAddToCart,
}: {
    product: Product;
    onAddToCart: (product: Product) => void;
}) {
    const [hovered, setHovered] = useState(false);
    const isOutOfStock = product.stock === 0;

    return (
        <div
            className={`group relative flex flex-col overflow-hidden rounded-2xl border transition-all duration-500 ${
                hovered
                    ? '-translate-y-1 border-violet-500/50 shadow-[0_0_30px_rgba(139,92,246,0.2)]'
                    : 'border-white/10 shadow-lg'
            } bg-[#0f1117]`}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {/* Image */}
            <div className="relative aspect-square overflow-hidden bg-[#1a1d27]">
                {product.image ? (
                    <img
                        src={product.image}
                        alt={product.name}
                        className={`h-full w-full object-cover transition-transform duration-700 ${hovered ? 'scale-110' : 'scale-100'}`}
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center">
                        <svg
                            className="h-20 w-20 text-white/10"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1}
                                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                            />
                        </svg>
                    </div>
                )}

                {/* Category badge */}
                {product.category && (
                    <span className="absolute top-3 left-3 rounded-full bg-violet-600/80 px-3 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
                        {product.category}
                    </span>
                )}

                {/* Out of stock overlay */}
                {isOutOfStock && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                        <span className="rounded-full bg-red-500/80 px-4 py-1 text-sm font-semibold text-white">
                            Habis
                        </span>
                    </div>
                )}

                {/* Stock badge */}
                {!isOutOfStock && product.stock <= 10 && (
                    <span className="absolute top-3 right-3 rounded-full bg-amber-500/80 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
                        Sisa {product.stock}
                    </span>
                )}
            </div>

            {/* Content */}
            <div className="flex flex-1 flex-col gap-3 p-4">
                <div>
                    <h3 className="line-clamp-1 text-sm font-semibold text-white">
                        {product.name}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-xs text-white/40">
                        {product.description}
                    </p>
                </div>

                <div className="mt-auto flex items-center justify-between">
                    <span className="bg-gradient-to-r from-violet-400 to-emerald-400 bg-clip-text text-lg font-bold text-transparent">
                        {formatRupiah(product.price)}
                    </span>

                    <button
                        id={`add-to-cart-${product.id}`}
                        onClick={() => !isOutOfStock && onAddToCart(product)}
                        disabled={isOutOfStock}
                        className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-200 ${
                            isOutOfStock
                                ? 'cursor-not-allowed bg-white/5 text-white/20'
                                : 'cursor-pointer bg-violet-600 text-white hover:bg-violet-500 active:scale-95'
                        }`}
                    >
                        <svg
                            className="h-3.5 w-3.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                        </svg>
                        Tambah
                    </button>
                </div>
            </div>
        </div>
    );
}

function CartDrawer({
    isOpen,
    onClose,
    cartItems,
    onUpdateQuantity,
    onRemove,
}: {
    isOpen: boolean;
    onClose: () => void;
    cartItems: CartItem[];
    onUpdateQuantity: (productId: number, delta: number) => void;
    onRemove: (productId: number) => void;
}) {
    const total = cartItems.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0,
    );

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
                onClick={onClose}
            />

            {/* Drawer */}
            <div
                className={`fixed top-0 right-0 z-50 flex h-full w-full max-w-md flex-col border-l border-white/10 bg-[#0d0f18] shadow-2xl transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
                    <div className="flex items-center gap-2">
                        <svg
                            className="h-5 w-5 text-violet-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                        </svg>
                        <h2 className="text-lg font-semibold text-white">
                            Keranjang
                        </h2>
                        <span className="rounded-full bg-violet-600 px-2 py-0.5 text-xs font-bold text-white">
                            {cartItems.reduce((s, i) => s + i.quantity, 0)}
                        </span>
                    </div>
                    <button
                        onClick={onClose}
                        className="cursor-pointer rounded-lg p-2 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
                    >
                        <svg
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>

                {/* Items */}
                <div className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
                    {cartItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
                            <div className="rounded-full bg-white/5 p-6">
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
                            <button
                                onClick={onClose}
                                className="cursor-pointer text-sm font-medium text-violet-400 hover:text-violet-300"
                            >
                                Lanjutkan belanja →
                            </button>
                        </div>
                    ) : (
                        cartItems.map((item) => (
                            <div
                                key={item.product.id}
                                className="flex gap-3 rounded-xl bg-white/5 p-3"
                            >
                                <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-white/10">
                                    {item.product.image ? (
                                        <img
                                            src={item.product.image}
                                            alt={item.product.name}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center">
                                            <svg
                                                className="h-6 w-6 text-white/20"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={1}
                                                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                                                />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-1 flex-col justify-between">
                                    <div className="flex items-start justify-between gap-2">
                                        <p className="line-clamp-1 text-sm font-medium text-white">
                                            {item.product.name}
                                        </p>
                                        <button
                                            onClick={() =>
                                                onRemove(item.product.id)
                                            }
                                            className="flex-shrink-0 cursor-pointer text-white/30 transition-colors hover:text-red-400"
                                        >
                                            <svg
                                                className="h-4 w-4"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M6 18L18 6M6 6l12 12"
                                                />
                                            </svg>
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-semibold text-violet-400">
                                            {formatRupiah(
                                                item.product.price *
                                                    item.quantity,
                                            )}
                                        </span>
                                        <div className="flex items-center gap-2 rounded-lg bg-white/10 p-1">
                                            <button
                                                onClick={() =>
                                                    onUpdateQuantity(
                                                        item.product.id,
                                                        -1,
                                                    )
                                                }
                                                className="flex h-5 w-5 cursor-pointer items-center justify-center rounded text-white transition-colors hover:bg-white/20"
                                            >
                                                −
                                            </button>
                                            <span className="w-5 text-center text-sm font-medium text-white">
                                                {item.quantity}
                                            </span>
                                            <button
                                                onClick={() =>
                                                    onUpdateQuantity(
                                                        item.product.id,
                                                        1,
                                                    )
                                                }
                                                disabled={
                                                    item.quantity >=
                                                    item.product.stock
                                                }
                                                className="flex h-5 w-5 cursor-pointer items-center justify-center rounded text-white transition-colors hover:bg-white/20 disabled:opacity-30"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                {cartItems.length > 0 && (
                    <div className="space-y-4 border-t border-white/10 px-6 py-5">
                        <div className="flex items-center justify-between text-sm text-white/60">
                            <span>Subtotal</span>
                            <span className="font-semibold text-white">
                                {formatRupiah(total)}
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-sm text-white/60">
                            <span>Ongkos Kirim</span>
                            <span className="font-semibold text-emerald-400">
                                {formatRupiah(15000)}
                            </span>
                        </div>
                        <div className="flex items-center justify-between border-t border-white/10 pt-3">
                            <span className="font-semibold text-white">
                                Total
                            </span>
                            <span className="text-lg font-bold text-violet-400">
                                {formatRupiah(total + 15000)}
                            </span>
                        </div>
                        <Link
                            href={cart()}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-violet-700 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all duration-200 hover:from-violet-500 hover:to-violet-600 active:scale-95"
                            onClick={() => {
                                // Store cart in sessionStorage for cart page
                                sessionStorage.setItem(
                                    'shopCart',
                                    JSON.stringify(cartItems),
                                );
                            }}
                        >
                            <svg
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                                />
                            </svg>
                            Checkout Sekarang
                        </Link>
                    </div>
                )}
            </div>
        </>
    );
}

export default function Welcome() {
    const { auth, products, categories } = usePage<PageProps>().props;

    const [cartItems, setCartItems] = useState<CartItem[]>(() => {
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
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const heroRef = useRef<HTMLDivElement>(null);
    const [scrollY, setScrollY] = useState(0);

    useEffect(() => {
        sessionStorage.setItem('shopCart', JSON.stringify(cartItems));
    }, [cartItems]);

    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const addToCart = (product: Product) => {
        setCartItems((prev) => {
            const existing = prev.find((i) => i.product.id === product.id);

            if (existing) {
                return prev.map((i) =>
                    i.product.id === product.id
                        ? {
                              ...i,
                              quantity: Math.min(i.quantity + 1, product.stock),
                          }
                        : i,
                );
            }

            return [...prev, { product, quantity: 1 }];
        });
        showToast(`${product.name} ditambahkan ke keranjang`);
    };

    const updateQuantity = (productId: number, delta: number) => {
        setCartItems((prev) =>
            prev
                .map((i) =>
                    i.product.id === productId
                        ? { ...i, quantity: i.quantity + delta }
                        : i,
                )
                .filter((i) => i.quantity > 0),
        );
    };

    const removeItem = (productId: number) => {
        setCartItems((prev) => prev.filter((i) => i.product.id !== productId));
    };

    const showToast = (message: string) => {
        setToastMessage(message);
        setTimeout(() => setToastMessage(null), 3000);
    };

    const totalCartItems = cartItems.reduce((s, i) => s + i.quantity, 0);

    const filteredProducts = activeCategory
        ? products.filter((p) => p.category === activeCategory)
        : products;

    const featuredProducts = products.slice(0, 4);

    return (
        <>
            <Head title="NexaShop — Premium Online Store">
                <meta
                    name="description"
                    content="Temukan produk premium pilihan kami. Fashion, electronics, beauty, dan lebih banyak lagi. Belanja mudah dengan pembayaran aman via Midtrans."
                />
                <meta
                    property="og:title"
                    content="NexaShop — Premium Online Store"
                />
                <meta
                    property="og:description"
                    content="Belanja produk premium dengan pembayaran aman via Midtrans GoPay, QRIS, dan Transfer Bank."
                />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link
                    rel="preconnect"
                    href="https://fonts.gstatic.com"
                    crossOrigin="anonymous"
                />
                <link
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Outfit:wght@400;500;600;700;800;900&display=swap"
                    rel="stylesheet"
                />
                <style>{`
                    * { font-family: 'Inter', sans-serif; }
                    h1, h2, h3, .brand { font-family: 'Outfit', sans-serif; }
                    @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-12px); } }
                    @keyframes glow-pulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
                    @keyframes slide-in-toast { from { transform: translateX(120%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
                    .float-anim { animation: float 6s ease-in-out infinite; }
                    .glow-pulse { animation: glow-pulse 3s ease-in-out infinite; }
                    .toast-anim { animation: slide-in-toast 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards; }
                    .gradient-text { background: linear-gradient(135deg, #a78bfa, #34d399); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
                    .gradient-border { border: 1px solid transparent; background-clip: padding-box, border-box; background-origin: padding-box, border-box; }
                    ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: #0d0f18; } ::-webkit-scrollbar-thumb { background: #374151; border-radius: 2px; }
                `}</style>
            </Head>

            <div className="min-h-screen bg-[#080a12] text-white">
                {/* Toast */}
                {toastMessage && (
                    <div className="toast-anim fixed right-6 bottom-6 z-[100] flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-[#1a1d2e] px-4 py-3 shadow-2xl shadow-black/50">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/20">
                            <svg
                                className="h-3.5 w-3.5 text-emerald-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2.5}
                                    d="M5 13l4 4L19 7"
                                />
                            </svg>
                        </div>
                        <p className="text-sm font-medium text-white/90">
                            {toastMessage}
                        </p>
                    </div>
                )}

                {/* Navbar */}
                <header
                    className={`fixed top-0 right-0 left-0 z-30 transition-all duration-300 ${
                        scrollY > 60
                            ? 'border-b border-white/10 bg-[#080a12]/90 shadow-lg shadow-black/30 backdrop-blur-xl'
                            : 'bg-transparent'
                    }`}
                >
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
                        {/* Logo */}
                        <Link
                            href={home()}
                            className="group flex items-center gap-2"
                        >
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-emerald-500 shadow-lg shadow-violet-500/30 transition-shadow group-hover:shadow-violet-500/50">
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
                            <span className="brand text-xl font-bold tracking-tight text-white">
                                Nexa<span className="gradient-text">Shop</span>
                            </span>
                        </Link>

                        {/* Desktop Nav */}
                        <nav className="hidden items-center gap-8 md:flex">
                            {['Produk', 'Kategori', 'Tentang', 'Kontak'].map(
                                (item) => (
                                    <a
                                        key={item}
                                        href={`#${item.toLowerCase()}`}
                                        className="text-sm font-medium text-white/60 transition-colors hover:text-white"
                                    >
                                        {item}
                                    </a>
                                ),
                            )}
                        </nav>

                        {/* Right side */}
                        <div className="flex items-center gap-3">
                            {auth.user ? (
                                <Link
                                    href={
                                        auth.user.role === 'admin'
                                            ? '/dashboard'
                                            : '/orders'
                                    }
                                    className="hidden rounded-xl border border-white/20 px-4 py-2 text-sm font-medium text-white/80 transition-all hover:border-white/40 hover:text-white sm:flex"
                                >
                                    {auth.user.role === 'admin'
                                        ? 'Dashboard'
                                        : 'Pesanan Saya'}
                                </Link>
                            ) : (
                                <Link
                                    href="/login"
                                    className="hidden rounded-xl border border-white/20 px-4 py-2 text-sm font-medium text-white/80 transition-all hover:border-white/40 hover:text-white sm:flex"
                                >
                                    Masuk
                                </Link>
                            )}

                            {/* Cart button */}
                            <button
                                id="cart-toggle"
                                onClick={() => setIsCartOpen(true)}
                                className="relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl bg-white/10 text-white transition-colors hover:bg-white/20"
                            >
                                <svg
                                    className="h-5 w-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                                    />
                                </svg>
                                {totalCartItems > 0 && (
                                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-violet-600 text-[10px] font-bold text-white shadow-lg shadow-violet-500/50">
                                        {totalCartItems > 99
                                            ? '99+'
                                            : totalCartItems}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                </header>

                {/* Hero Section */}
                <section
                    ref={heroRef}
                    className="relative flex min-h-screen items-center overflow-hidden"
                >
                    {/* Background */}
                    <div className="absolute inset-0">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#080a12] via-[#0d0f1e] to-[#080a12]" />
                        <div className="glow-pulse absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-violet-600/15 blur-3xl" />
                        <div
                            className="glow-pulse absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-emerald-600/10 blur-3xl"
                            style={{ animationDelay: '1.5s' }}
                        />
                        <div className="absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-800/10 blur-2xl" />

                        {/* Grid pattern */}
                        <div
                            className="absolute inset-0 opacity-[0.02]"
                            style={{
                                backgroundImage:
                                    'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
                                backgroundSize: '80px 80px',
                            }}
                        />
                    </div>

                    <div className="relative mx-auto max-w-7xl px-4 py-32 sm:px-6 lg:px-8">
                        <div className="grid items-center gap-12 lg:grid-cols-2">
                            {/* Left content */}
                            <div className="space-y-8">
                                <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-sm font-medium text-violet-300">
                                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-violet-400" />
                                    ✨ Koleksi Terbaru 2026
                                </div>

                                <h1 className="brand text-5xl leading-tight font-black tracking-tight sm:text-6xl lg:text-7xl">
                                    Belanja
                                    <br />
                                    <span className="gradient-text">
                                        Premium
                                    </span>
                                    <br />
                                    Tanpa Batas
                                </h1>

                                <p className="max-w-md text-lg leading-relaxed text-white/60">
                                    Temukan ribuan produk premium pilihan kami.
                                    Dari fashion hingga elektronik, semua
                                    tersedia dengan harga terbaik dan pembayaran
                                    yang aman.
                                </p>

                                <div className="flex flex-col gap-3 sm:flex-row">
                                    <a
                                        href="#produk"
                                        id="hero-shop-now"
                                        className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-violet-700 px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all duration-200 hover:from-violet-500 hover:to-violet-600 active:scale-95"
                                    >
                                        Mulai Belanja
                                        <svg
                                            className="h-4 w-4"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M17 8l4 4m0 0l-4 4m4-4H3"
                                            />
                                        </svg>
                                    </a>
                                    <a
                                        href="#kategori"
                                        className="flex items-center justify-center gap-2 rounded-xl border border-white/20 px-8 py-4 text-sm font-semibold text-white transition-all duration-200 hover:border-white/40 hover:bg-white/5"
                                    >
                                        Lihat Kategori
                                    </a>
                                </div>

                                {/* Stats */}
                                <div className="flex gap-8 pt-2">
                                    {[
                                        { value: '500+', label: 'Produk' },
                                        { value: '10K+', label: 'Pembeli' },
                                        { value: '4.9★', label: 'Rating' },
                                    ].map((stat) => (
                                        <div key={stat.label}>
                                            <div className="brand text-2xl font-bold text-white">
                                                {stat.value}
                                            </div>
                                            <div className="text-xs text-white/40">
                                                {stat.label}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Right — floating product cards */}
                            <div className="relative hidden h-[520px] items-center justify-center lg:flex">
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="h-80 w-80 rounded-full bg-violet-600/10 blur-3xl" />
                                </div>

                                {featuredProducts
                                    .slice(0, 3)
                                    .map((product, i) => {
                                        const positions = [
                                            {
                                                top: '5%',
                                                left: '5%',
                                                rotate: '-6deg',
                                                delay: '0s',
                                            },
                                            {
                                                top: '10%',
                                                right: '5%',
                                                rotate: '5deg',
                                                delay: '0.5s',
                                            },
                                            {
                                                bottom: '5%',
                                                left: '20%',
                                                rotate: '-2deg',
                                                delay: '1s',
                                            },
                                        ];
                                        const pos = positions[i];

                                        return (
                                            <div
                                                key={product.id}
                                                className="float-anim absolute"
                                                style={{
                                                    ...pos,
                                                    animationDelay: pos.delay,
                                                }}
                                            >
                                                <div
                                                    className="w-44 overflow-hidden rounded-2xl border border-white/15 bg-[#0f1117] shadow-2xl shadow-black/50"
                                                    style={{
                                                        transform: `rotate(${pos.rotate})`,
                                                    }}
                                                >
                                                    <div className="aspect-square overflow-hidden bg-[#1a1d27]">
                                                        {product.image && (
                                                            <img
                                                                src={
                                                                    product.image
                                                                }
                                                                alt={
                                                                    product.name
                                                                }
                                                                className="h-full w-full object-cover"
                                                            />
                                                        )}
                                                    </div>
                                                    <div className="p-3">
                                                        <p className="line-clamp-1 text-xs font-semibold text-white">
                                                            {product.name}
                                                        </p>
                                                        <p className="mt-0.5 text-xs font-bold text-violet-400">
                                                            {formatRupiah(
                                                                product.price,
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                            </div>
                        </div>
                    </div>

                    {/* Scroll indicator */}
                    <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2">
                        <span className="text-xs text-white/30">Scroll</span>
                        <div className="h-8 w-0.5 bg-gradient-to-b from-white/30 to-transparent" />
                    </div>
                </section>

                {/* Payment Methods Banner */}
                <div className="border-y border-white/5 bg-[#0a0c15]/80 py-4">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-wrap items-center justify-center gap-6 sm:justify-between">
                            <span className="text-xs font-medium text-white/30">
                                Pembayaran aman via:
                            </span>
                            <div className="flex flex-wrap items-center gap-4">
                                {[
                                    'GoPay',
                                    'QRIS',
                                    'BCA VA',
                                    'BNI VA',
                                    'BRI VA',
                                    'Mandiri',
                                    'Kartu Kredit',
                                    'Akulaku',
                                ].map((method) => (
                                    <span
                                        key={method}
                                        className="rounded-md bg-white/10 px-3 py-1 text-xs font-semibold text-white/60"
                                    >
                                        {method}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Categories */}
                <section id="kategori" className="py-16">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="mb-8 text-center">
                            <h2 className="brand text-3xl font-bold text-white sm:text-4xl">
                                Kategori
                            </h2>
                            <p className="mt-2 text-white/40">
                                Temukan produk berdasarkan kategori favoritmu
                            </p>
                        </div>
                        <div className="flex flex-wrap justify-center gap-3">
                            <button
                                id="category-all"
                                onClick={() => setActiveCategory(null)}
                                className={`cursor-pointer rounded-full px-5 py-2 text-sm font-semibold transition-all duration-200 ${
                                    activeCategory === null
                                        ? 'bg-gradient-to-r from-violet-600 to-violet-700 text-white shadow-lg shadow-violet-500/25'
                                        : 'border border-white/15 text-white/60 hover:border-white/30 hover:text-white'
                                }`}
                            >
                                Semua ({products.length})
                            </button>
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    id={`category-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                                    onClick={() =>
                                        setActiveCategory(
                                            cat === activeCategory ? null : cat,
                                        )
                                    }
                                    className={`cursor-pointer rounded-full px-5 py-2 text-sm font-semibold transition-all duration-200 ${
                                        activeCategory === cat
                                            ? 'bg-gradient-to-r from-violet-600 to-violet-700 text-white shadow-lg shadow-violet-500/25'
                                            : 'border border-white/15 text-white/60 hover:border-white/30 hover:text-white'
                                    }`}
                                >
                                    {cat} (
                                    {
                                        products.filter(
                                            (p) => p.category === cat,
                                        ).length
                                    }
                                    )
                                </button>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Products */}
                <section id="produk" className="pb-20">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="mb-10 flex items-center justify-between">
                            <div>
                                <h2 className="brand text-3xl font-bold text-white sm:text-4xl">
                                    {activeCategory
                                        ? activeCategory
                                        : 'Semua Produk'}
                                </h2>
                                <p className="mt-1 text-sm text-white/40">
                                    {filteredProducts.length} produk tersedia
                                </p>
                            </div>
                            {totalCartItems > 0 && (
                                <button
                                    onClick={() => setIsCartOpen(true)}
                                    className="flex cursor-pointer items-center gap-2 rounded-xl border border-violet-500/30 bg-violet-600/20 px-4 py-2 text-sm font-medium text-violet-300 transition-all hover:bg-violet-600/30"
                                >
                                    <svg
                                        className="h-4 w-4"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                                        />
                                    </svg>
                                    {totalCartItems} item
                                </button>
                            )}
                        </div>

                        {filteredProducts.length === 0 ? (
                            <div className="flex flex-col items-center gap-4 py-20 text-center">
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
                                            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                                        />
                                    </svg>
                                </div>
                                <p className="text-white/40">
                                    Belum ada produk di kategori ini
                                </p>
                                <button
                                    onClick={() => setActiveCategory(null)}
                                    className="cursor-pointer text-sm text-violet-400 hover:text-violet-300"
                                >
                                    Lihat semua produk
                                </button>
                            </div>
                        ) : (
                            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {filteredProducts.map((product) => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        onAddToCart={addToCart}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                {/* Testimonials */}
                <section
                    id="tentang"
                    className="border-t border-white/5 bg-[#0a0c15]/60 py-20"
                >
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="mb-12 text-center">
                            <h2 className="brand text-3xl font-bold text-white sm:text-4xl">
                                Apa Kata Mereka
                            </h2>
                            <p className="mt-2 text-white/40">
                                Ribuan pelanggan puas setiap harinya
                            </p>
                        </div>
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {[
                                {
                                    name: 'Rina Kusuma',
                                    role: 'Fashion Enthusiast',
                                    text: 'Produknya bener-bener premium banget! Bahan bagus, pengiriman cepat, dan pembayarannya mudah pakai GoPay. Highly recommended!',
                                    rating: 5,
                                    avatar: 'RK',
                                },
                                {
                                    name: 'Budi Santoso',
                                    role: 'Tech Gadget Lover',
                                    text: 'Earbuds yang saya beli kualitasnya luar biasa. Harga worth it banget. Proses checkout via Midtrans juga sangat smooth.',
                                    rating: 5,
                                    avatar: 'BS',
                                },
                                {
                                    name: 'Dewi Anggraini',
                                    role: 'Beauty Blogger',
                                    text: 'Skincare set-nya cocok banget di kulit saya. Pengalaman belanja di NexaShop memuaskan, bakal repeat order terus!',
                                    rating: 5,
                                    avatar: 'DA',
                                },
                            ].map((review) => (
                                <div
                                    key={review.name}
                                    className="space-y-4 rounded-2xl border border-white/10 bg-[#0f1117] p-6"
                                >
                                    <div className="flex items-center gap-1">
                                        {Array.from({
                                            length: review.rating,
                                        }).map((_, i) => (
                                            <svg
                                                key={i}
                                                className="h-4 w-4 text-amber-400"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                        ))}
                                    </div>
                                    <p className="text-sm leading-relaxed text-white/70">
                                        "{review.text}"
                                    </p>
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-emerald-500 text-xs font-bold text-white">
                                            {review.avatar}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-white">
                                                {review.name}
                                            </p>
                                            <p className="text-xs text-white/40">
                                                {review.role}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Features / Why Us */}
                <section className="py-20">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="mb-12 text-center">
                            <h2 className="brand text-3xl font-bold text-white sm:text-4xl">
                                Kenapa NexaShop?
                            </h2>
                        </div>
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            {[
                                {
                                    icon: '🔒',
                                    title: 'Pembayaran Aman',
                                    desc: 'Didukung Midtrans — GoPay, QRIS, VA Bank, Kartu Kredit',
                                },
                                {
                                    icon: '🚀',
                                    title: 'Pengiriman Cepat',
                                    desc: 'Estimasi 1-3 hari kerja ke seluruh Indonesia',
                                },
                                {
                                    icon: '✅',
                                    title: 'Produk Original',
                                    desc: '100% produk original bergaransi resmi dari brand terpercaya',
                                },
                                {
                                    icon: '🔄',
                                    title: 'Garansi Return',
                                    desc: '7 hari garansi return jika produk tidak sesuai deskripsi',
                                },
                            ].map((feat) => (
                                <div
                                    key={feat.title}
                                    className="group rounded-2xl border border-white/10 bg-[#0f1117] p-6 text-center transition-all duration-300 hover:border-violet-500/30 hover:bg-[#13152a]"
                                >
                                    <div className="mb-4 text-4xl">
                                        {feat.icon}
                                    </div>
                                    <h3 className="mb-2 font-semibold text-white">
                                        {feat.title}
                                    </h3>
                                    <p className="text-sm text-white/50">
                                        {feat.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Newsletter CTA */}
                <section id="kontak" className="border-t border-white/5 py-20">
                    <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
                        <div className="relative overflow-hidden rounded-3xl border border-violet-500/20 bg-gradient-to-br from-violet-900/30 to-emerald-900/20 p-10 sm:p-14">
                            <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-violet-600/20 blur-3xl" />
                            <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-emerald-600/20 blur-3xl" />
                            <div className="relative">
                                <h2 className="brand text-3xl font-bold text-white sm:text-4xl">
                                    Dapatkan Promo{' '}
                                    <span className="gradient-text">
                                        Eksklusif
                                    </span>
                                </h2>
                                <p className="mt-4 text-white/60">
                                    Daftarkan emailmu dan dapatkan diskon 15%
                                    untuk pembelian pertama.
                                </p>
                                <form
                                    id="newsletter-form"
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        showToast(
                                            'Terima kasih! Cek email kamu.',
                                        );
                                    }}
                                    className="mt-8 flex flex-col gap-3 sm:flex-row"
                                >
                                    <input
                                        id="newsletter-email"
                                        type="email"
                                        placeholder="emailkamu@example.com"
                                        required
                                        className="flex-1 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                                    />
                                    <button
                                        type="submit"
                                        className="cursor-pointer rounded-xl bg-gradient-to-r from-violet-600 to-violet-700 px-6 py-3 text-sm font-semibold text-white transition-all hover:from-violet-500 hover:to-violet-600"
                                    >
                                        Subscribe
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="border-t border-white/10 bg-[#060810] py-12">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                            <div>
                                <div className="mb-4 flex items-center gap-2">
                                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-emerald-500">
                                        <svg
                                            className="h-3.5 w-3.5 text-white"
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
                                    <span className="brand text-lg font-bold text-white">
                                        NexaShop
                                    </span>
                                </div>
                                <p className="text-sm text-white/40">
                                    Platform belanja online premium dengan
                                    ribuan produk pilihan dan pembayaran yang
                                    aman.
                                </p>
                            </div>
                            {[
                                {
                                    title: 'Toko',
                                    links: [
                                        'Semua Produk',
                                        'Fashion',
                                        'Electronics',
                                        'Beauty',
                                        'Sports',
                                    ],
                                },
                                {
                                    title: 'Bantuan',
                                    links: [
                                        'Cara Order',
                                        'Tracking Pesanan',
                                        'Return & Refund',
                                        'FAQ',
                                        'Hubungi Kami',
                                    ],
                                },
                                {
                                    title: 'Pembayaran',
                                    links: [
                                        'GoPay',
                                        'QRIS',
                                        'BCA Virtual Account',
                                        'BNI Virtual Account',
                                        'Kartu Kredit',
                                    ],
                                },
                            ].map((col) => (
                                <div key={col.title}>
                                    <h4 className="mb-4 text-sm font-semibold text-white">
                                        {col.title}
                                    </h4>
                                    <ul className="space-y-2">
                                        {col.links.map((link) => (
                                            <li key={link}>
                                                <a
                                                    href="#"
                                                    className="text-sm text-white/40 transition-colors hover:text-white"
                                                >
                                                    {link}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
                            <p className="text-xs text-white/30">
                                © 2026 NexaShop. All rights reserved.
                            </p>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-white/30">
                                    Pembayaran aman via
                                </span>
                                <span className="rounded bg-[#003f88] px-2 py-0.5 text-xs font-bold text-white">
                                    midtrans
                                </span>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>

            {/* Cart Drawer */}
            <CartDrawer
                isOpen={isCartOpen}
                onClose={() => setIsCartOpen(false)}
                cartItems={cartItems}
                onUpdateQuantity={updateQuantity}
                onRemove={removeItem}
            />
        </>
    );
}
