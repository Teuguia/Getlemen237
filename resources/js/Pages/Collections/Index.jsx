import BrandHeader from '@/Components/Gentleman/BrandHeader';
import ProductCard from '@/Components/Gentleman/ProductCard';
import { fallbackCategories } from '@/Components/Gentleman/brand';
import { Head } from '@inertiajs/react';

const sizes = ['39', '40', '41', '43', '44', '45', '46'];
const colors = ['Noir', 'Marron', 'Bleu', 'Blanc', 'Beige', 'Autres'];

export default function Index({ auth, categories = [], products = [] }) {
    const menuCategories = categories.length ? categories : fallbackCategories;

    return (
        <>
            <Head title="Collections" />
            <main className="min-h-screen bg-white text-[#17110b]">
                <BrandHeader auth={auth} />

                <section
                    className="mx-auto h-[126px] max-w-7xl bg-cover bg-center sm:h-60"
                    style={{
                        backgroundImage:
                            "linear-gradient(90deg, rgba(11,8,5,.86), rgba(11,8,5,.34)), url('https://images.unsplash.com/photo-1614252369475-531eba835eb1?auto=format&fit=crop&w=1600&q=90')",
                    }}
                >
                    <div className="flex h-full flex-col justify-center px-5 sm:px-16">
                        <h1 className="font-serif text-[30px] uppercase leading-none text-white sm:text-5xl">Chaussures</h1>
                        <p className="mt-2 max-w-[150px] text-lg leading-tight text-white sm:max-w-none sm:font-serif sm:text-2xl">Alliez confort et distinction</p>
                    </div>
                </section>

                <section className="mx-auto grid max-w-7xl grid-cols-1 lg:grid-cols-[260px_1fr]">
                    <aside className="hidden border-r border-neutral-200 bg-[#f6f3ed] px-7 py-8 lg:block">
                        <FilterGroup title="Categories" items={menuCategories.map((category) => category.name)} active="Chaussures" />
                        <FilterGroup title="Taille" items={sizes} />
                        <FilterGroup title="Couleur" items={colors} />
                        <div className="border-t border-neutral-200 pt-6">
                            <h2 className="text-sm font-bold uppercase">Prix</h2>
                            <p className="mt-4 text-sm text-neutral-600">0 FCFA - 200 000 FCFA</p>
                        </div>
                    </aside>

                    <div className="px-5 py-5 sm:px-6 sm:py-8">
                        <label className="relative block lg:hidden">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">⌕</span>
                            <input className="h-11 w-full rounded border-neutral-300 pl-10 text-sm focus:border-[#c99524] focus:ring-[#c99524]" placeholder="Rechercher un produit..." />
                        </label>

                        <div className="mt-4 flex flex-wrap items-center justify-between gap-4 lg:mt-0">
                            <p className="hidden font-bold lg:block">{products.length || 24} produits</p>
                            <label className="flex items-center gap-2 text-sm text-neutral-600">
                                Trier par :
                                <select className="rounded border-neutral-300 text-sm font-medium text-[#17110b] focus:border-[#c99524] focus:ring-[#c99524] lg:border-0 lg:bg-transparent lg:p-0">
                                    <option>Popularite</option>
                                    <option>Prix croissant</option>
                                    <option>Nouveautes</option>
                                </select>
                            </label>
                            <button type="button" className="text-sm font-semibold lg:hidden">Filtrer</button>
                        </div>

                        <div className="mt-6 grid grid-cols-2 gap-x-5 gap-y-7 md:grid-cols-3 lg:mt-7 lg:gap-x-8 lg:gap-y-10">
                            {products.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>

                        {products.length === 0 && (
                            <div className="mt-7 border border-neutral-200 bg-[#faf8f3] p-8 text-sm text-neutral-600">
                                Aucun produit publie pour le moment.
                            </div>
                        )}
                    </div>
                </section>
            </main>
        </>
    );
}

function FilterGroup({ title, items, active }) {
    return (
        <div className="mb-8 border-b border-neutral-200 pb-6">
            <h2 className="text-sm font-bold uppercase">{title}</h2>
            <div className="mt-4 space-y-3">
                {items.map((item) => (
                    <button
                        key={item}
                        type="button"
                        className={`block text-sm ${active === item ? 'font-bold text-[#17110b]' : 'text-neutral-600'}`}
                    >
                        {item}
                    </button>
                ))}
            </div>
        </div>
    );
}
