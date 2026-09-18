import BrandHeader from '@/Components/Gentleman/BrandHeader';
import ProductCard from '@/Components/Gentleman/ProductCard';
import SectionTitle from '@/Components/Gentleman/SectionTitle';
import { categoryImages, fallbackCategories } from '@/Components/Gentleman/brand';
import { Head, Link } from '@inertiajs/react';

export default function Welcome({ auth, categories = [], featuredProducts = [] }) {
    const categoryTiles = (categories.length ? categories : fallbackCategories).slice(0, 5);

    return (
        <>
            <Head title="237 Gentleman" />
            <main className="min-h-screen bg-white text-[#17110b]">
                <BrandHeader auth={auth} />

                <section
                    className="mx-auto min-h-[298px] max-w-7xl bg-cover bg-center sm:min-h-[565px]"
                    style={{
                        backgroundImage:
                            "linear-gradient(90deg, rgba(8,7,5,.88) 0%, rgba(8,7,5,.56) 38%, rgba(8,7,5,.08) 68%), url('https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=1800&q=90')",
                    }}
                >
                    <div className="flex min-h-[298px] max-w-[260px] flex-col justify-center px-6 py-8 sm:min-h-[565px] sm:max-w-xl sm:px-16 sm:py-16">
                        <h1 className="font-serif text-[32px] font-semibold uppercase leading-tight text-white sm:text-6xl">
                            L'elegance au masculin
                        </h1>
                        <p className="mt-3 text-lg leading-tight text-white sm:font-serif sm:text-2xl">Style. Qualite. Originalite.</p>
                        <Link href={route('collections.index')} className="mt-7 inline-flex w-fit rounded-sm bg-[#c99524] px-5 py-3 text-xs font-bold uppercase text-black sm:px-8 sm:py-4 sm:text-sm">
                            Decouvrir la collection
                        </Link>
                        <div className="mt-3 flex flex-wrap gap-2 sm:mt-5 sm:gap-3">
                            {auth.user ? (
                                <Link href={route('post-login')} className="rounded-sm border border-white/60 px-4 py-2 text-xs font-bold uppercase text-white sm:px-6 sm:py-3">
                                    Continuer
                                </Link>
                            ) : (
                                <>
                                    <Link href={route('login')} className="rounded-sm border border-white/60 px-4 py-2 text-xs font-bold uppercase text-white sm:px-6 sm:py-3">
                                        Se connecter
                                    </Link>
                                    <Link href={route('register')} className="rounded-sm bg-white px-4 py-2 text-xs font-bold uppercase text-black sm:px-6 sm:py-3">
                                        Creer un compte
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </section>

                <section className="bg-[#0d0b08] sm:hidden">
                    <div className="mx-auto grid max-w-7xl grid-cols-3 divide-x divide-white/10 px-5 py-4 text-center text-[12px] font-medium leading-tight text-white">
                        <span>Produits authentiques</span>
                        <span>Livraison a Yaounde</span>
                        <span>Paiement flexible</span>
                    </div>
                </section>

                <section className="mx-auto max-w-7xl px-5 py-6 sm:px-6 sm:py-8">
                    <div className="flex items-center justify-between">
                        <SectionTitle>Nos categories</SectionTitle>
                        <Link href={route('collections.index')} className="text-sm text-neutral-600 sm:hidden">Voir tout</Link>
                    </div>
                    <div className="mt-5 grid grid-cols-3 gap-3 sm:mt-6 sm:grid-cols-3 sm:gap-5 lg:grid-cols-5">
                        {categoryTiles.map((category) => (
                            <Link key={category.slug} href={route('collections.index')} className="group">
                                <div className="aspect-square overflow-hidden rounded-sm bg-[#ded8cd] sm:aspect-[4/5]">
                                    <img
                                        src={categoryImages[category.slug] ?? categoryImages.chaussures}
                                        alt={category.name}
                                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                    />
                                </div>
                                <p className="mt-2 rounded-b-sm bg-[#f0e7d7] py-1 text-center text-xs font-semibold sm:mt-3 sm:bg-transparent sm:py-0 sm:text-sm sm:font-bold sm:uppercase">{category.name}</p>
                            </Link>
                        ))}
                    </div>
                </section>

                <section
                    className="mx-auto hidden max-w-7xl bg-cover bg-center px-8 py-16 sm:block sm:px-16"
                    style={{
                        backgroundImage:
                            "linear-gradient(90deg, rgba(8,7,5,.86), rgba(8,7,5,.54)), url('https://images.unsplash.com/photo-1593032465175-481ac7f401a0?auto=format&fit=crop&w=1600&q=90')",
                    }}
                >
                    <div className="max-w-xl">
                        <h2 className="font-serif text-4xl font-semibold uppercase leading-tight text-white">Un style qui vous ressemble</h2>
                        <p className="mt-4 text-white/90">Des pieces selectionnees avec soin pour l'homme moderne.</p>
                        <Link href={route('collections.index')} className="mt-8 inline-flex bg-[#c99524] px-8 py-4 text-sm font-bold uppercase text-black">
                            Voir nos promotions
                        </Link>
                    </div>
                </section>

                <section className="mx-auto max-w-7xl px-5 py-6 sm:px-6 sm:py-8">
                    <div className="flex items-center justify-between">
                        <SectionTitle>Nouveautes</SectionTitle>
                        <Link href={route('collections.index')} className="text-sm text-neutral-600 sm:hidden">Voir tout</Link>
                    </div>
                    <div className="mt-5 grid grid-cols-3 gap-3 sm:mt-6 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
                        {featuredProducts.slice(0, 6).map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                    {featuredProducts.length === 0 && (
                        <div className="mt-6 border border-neutral-200 bg-[#faf8f3] p-8 text-sm text-neutral-600">
                            Le catalogue est pret. Lance les migrations et seeders pour afficher les produits.
                        </div>
                    )}
                </section>
            </main>
        </>
    );
}
