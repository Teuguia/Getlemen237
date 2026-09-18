import { Link } from '@inertiajs/react';

const navItems = [
    ['Accueil', 'home'],
    ['Collections', 'collections.index'],
    ['Categories', 'collections.index'],
    ['Promotions', 'collections.index'],
    ['A propos', 'home'],
    ['Contact', 'home'],
];

export default function BrandHeader({ auth, leftLabel = 'Menu', leftHref = null }) {
    const isStaff = ['admin', 'manager', 'seller'].includes(auth?.user?.role);

    return (
        <header className="sticky top-0 z-40 bg-[#0d0b08] text-white sm:static">
            <div className="mx-auto flex h-[102px] max-w-7xl items-center justify-between px-5 sm:hidden">
                {leftHref ? (
                    <Link href={leftHref} className="text-xs font-bold uppercase tracking-wide">
                        {leftLabel}
                    </Link>
                ) : (
                    <button type="button" className="text-xs font-bold uppercase tracking-wide">
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
