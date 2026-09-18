import { Link } from '@inertiajs/react';
import { useState } from 'react';

const navItems = [
    ['Accueil', 'home'],
    ['Collections', 'collections.index'],
    ['Categories', 'collections.index'],
    ['Promotions', 'collections.index'],
    ['A propos', 'home'],
    ['Contact', 'home'],
];

export default function BrandHeader({ auth, leftLabel = 'Menu', leftHref = null }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const isStaff = ['admin', 'manager', 'seller'].includes(auth?.user?.role);

    return (
        <header className="sticky top-0 z-40 bg-[#0d0b08] text-white sm:static">
            <div className="mx-auto flex h-[102px] max-w-7xl items-center justify-between px-5 sm:hidden">
                {leftHref ? (
                    <Link href={leftHref} className="text-xs font-bold uppercase tracking-wide">
                        {leftLabel}
                    </Link>
                ) : (
                    <button type="button" onClick={() => setMenuOpen((open) => !open)} className="text-xs font-bold uppercase tracking-wide" aria-expanded={menuOpen}>
                        {leftLabel}
                    </button>
                )}
                <Link href={route('home')} className="text-center font-serif text-[#d5a62d]">
                    <span className="block text-xl leading-none">237</span>
                    <span className="block text-[26px] font-bold leading-none">GENTLEMAN</span>
                    <span className="block text-[8px] font-semibold uppercase tracking-[0.22em]">Elegance & Originalite</span>
                </Link>
                <Link href={route('cart.show')} className="text-xs font-bold uppercase tracking-wide">
                    Panier
                </Link>
            </div>

            {menuOpen && (
                <nav className="border-t border-white/10 px-5 pb-5 text-sm font-bold uppercase tracking-wide sm:hidden">
                    <div className="grid gap-3">
                        {navItems.map(([label, routeName]) => (
                            <Link key={label} href={route(routeName)} className="border-b border-white/10 py-3" onClick={() => setMenuOpen(false)}>
                                {label}
                            </Link>
                        ))}
                        {auth?.user ? (
                            <>
                                <Link href={route('account.orders')} className="border-b border-white/10 py-3" onClick={() => setMenuOpen(false)}>
                                    Mon compte
                                </Link>
                                {isStaff && (
                                    <Link href={route('dashboard')} className="border-b border-white/10 py-3 text-[#d5a62d]" onClick={() => setMenuOpen(false)}>
                                        Admin
                                    </Link>
                                )}
                            </>
                        ) : (
                            <>
                                <Link href={route('login')} className="border-b border-white/10 py-3" onClick={() => setMenuOpen(false)}>
                                    Se connecter
                                </Link>
                                <Link href={route('register')} className="border-b border-white/10 py-3" onClick={() => setMenuOpen(false)}>
                                    Creer un compte
                                </Link>
                            </>
                        )}
                    </div>
                </nav>
            )}

            <div className="mx-auto hidden max-w-7xl flex-col items-center px-4 pt-4 sm:flex">
                <Link href={route('home')} className="text-center font-serif text-[#d5a62d]">
                    <span className="block text-2xl leading-none">237</span>
                    <span className="block text-4xl font-bold leading-none">GENTLEMAN</span>
                    <span className="block text-[11px] font-semibold uppercase tracking-[0.24em]">Elegance & Originalite</span>
                </Link>
                <nav className="mt-5 flex w-full items-center justify-center gap-2 overflow-x-auto border-t border-white/10 py-3 text-[11px] font-semibold uppercase tracking-wide sm:gap-9">
                    {navItems.map(([label, routeName]) => (
                        <Link
                            key={label}
                            href={route(routeName)}
                            className="whitespace-nowrap border-b border-transparent px-1 pb-1 text-white transition hover:border-[#c99524] hover:text-[#c99524]"
                        >
                            {label}
                        </Link>
                    ))}
                    <Link href={route('cart.show')} className="whitespace-nowrap border-b border-transparent px-1 pb-1 text-white transition hover:border-[#c99524] hover:text-[#c99524]">
                        Panier
                    </Link>
                    {auth?.user && (
                        <Link href={route('account.orders')} className="whitespace-nowrap border-b border-transparent px-1 pb-1 text-white transition hover:border-[#c99524] hover:text-[#c99524]">
                            Mon compte
                        </Link>
                    )}
                    {isStaff && (
                        <Link href={route('dashboard')} className="whitespace-nowrap border-b border-transparent px-1 pb-1 text-[#d5a62d]">
                            Admin
                        </Link>
                    )}
                </nav>
            </div>
        </header>
    );
}