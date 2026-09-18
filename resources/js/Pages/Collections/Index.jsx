import BrandHeader from '@/Components/Gentleman/BrandHeader';
import ProductCard from '@/Components/Gentleman/ProductCard';
import { fallbackCategories } from '@/Components/Gentleman/brand';
import { Head } from '@inertiajs/react';
import { useMemo, useState } from 'react';

const sizes = ['39', '40', '41', '43', '44', '45', '46'];
const colors = ['Noir', 'Marron', 'Bleu', 'Blanc', 'Beige', 'Autres'];

export default function Index({ auth, categories = [], products = [] }) {
    const menuCategories = categories.length ? categories : fallbackCategories;
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Chaussures');
    const [selectedSize, setSelectedSize] = useState('');
    const [selectedColor, setSelectedColor] = useState('');
    const [sort, setSort] = useState('popularite');
    const [filtersOpen, setFiltersOpen] = useState(false);

    const filteredProducts = useMemo(() => {
        const normalize = (value) => value?.toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') ?? '';

        return [...products]
            .filter((product) => !selectedCategory || normalize(product.category) === normalize(selectedCategory))
            .filter((product) => !selectedSize || product.variants?.some((variant) => variant.size === selectedSize))
            .filter((product) => !selectedColor || product.variants?.some((variant) => normalize(variant.color_name) === normalize(selectedColor)))
            .filter((product) => !search || normalize(product.name).includes(normalize(search)) || normalize(product.description).includes(normalize(search)))
            .sort((a, b) => {
                if (sort === 'price_asc') return a.active_price_cents - b.active_price_cents;
                if (sort === 'price_desc') return b.active_price_cents - a.active_price_cents;
                if (sort === 'newest') return b.id - a.id;
                return (b.stock_total ?? 0) - (a.stock_total ?? 0);
            });
    }, [products, search, selectedCategory, selectedSize, selectedColor, sort]);

    const resetFilters = () => {
        setSearch('');
        setSelectedCategory('');
        setSelectedSize('');
        setSelectedColor('');
        setSort('popularite');
    };

    const filterPanel = (
        <>
            <FilterGroup title="Categories" items={menuCategories.map((category) => category.name)} active={selectedCategory} onSelect={setSelectedCategory} />
            <FilterGroup title="Taille" items={sizes} active={selectedSize} onSelect={setSelectedSize} />
            <FilterGroup title="Couleur" items={colors} active={selectedColor} onSelect={setSelectedColor} />
            <div className="border-t border-neutral-200 pt-6">
                <h2 className="text-sm font-bold uppercase">Prix</h2>
                <div className="mt-4 grid gap-2 text-sm text-neutral-600">
                    <button type="button" onClick={() => setSort('price_asc')} className={sort === 'price_asc' ? 'text-left font-bold text-[#17110b]' : 'text-left'}>
                        Prix croissant
                    </button>
                    <button type="button" onClick={() => setSort('price_desc')} className={sort === 'price_desc' ? 'text-left font-bold text-[#17110b]' : 'text-left'}>
                        Prix decroissant
                    </button>
                </div>
            </div>
            <button type="button" onClick={resetFilters} className="mt-6 w-full rounded border border-neutral-300 px-4 py-3 text-sm font-bold uppercase">
                Reinitialiser
            </button>
        </>
    );

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
                        <h1 className="font-serif text-[30px] uppercase leading-none text-white sm:text-5xl">{selectedCategory || 'Collections'}</h1>
                        <p className="mt-2 max-w-[150px] text-lg leading-tight text-white sm:max-w-none sm:font-serif sm:text-2xl">Alliez confort et distinction</p>
                    </div>
                </section>

                <section className="mx-auto grid max-w-7xl grid-cols-1 lg:grid-cols-[260px_1fr]">
                    <aside className="hidden border-r border-neutral-200 bg-[#f6f3ed] px-7 py-8 lg:block">
                        {filterPanel}
                    </aside>

                    <div className="px-5 py-5 sm:px-6 sm:py-8">
                        <label className="relative block lg:hidden">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">Q</span>
                            <input
                                className="h-11 w-full rounded border-neutral-300 pl-10 text-sm focus:border-[#c99524] focus:ring-[#c99524]"
                                placeholder="Rechercher un produit..."
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                            />
                        </label>

                        <div className="mt-4 flex flex-wrap items-center justify-between gap-4 lg:mt-0">
                            <p className="hidden font-bold lg:block">{filteredProducts.length} produit(s)</p>
                            <label className="flex items-center gap-2 text-sm text-neutral-600">
                                Trier par :
                                <select className="rounded border-neutral-300 text-sm font-medium text-[#17110b] focus:border-[#c99524] focus:ring-[#c99524] lg:border-0 lg:bg-transparent lg:p-0" value={sort} onChange={(event) => setSort(event.target.value)}>
                                    <option value="popularite">Popularite</option>
                                    <option value="price_asc">Prix croissant</option>
                                    <option value="price_desc">Prix decroissant</option>
                                    <option value="newest">Nouveautes</option>
                                </select>
                            </label>
                            <button type="button" onClick={() => setFiltersOpen((open) => !open)} className="text-sm font-semibold lg:hidden">
                                {filtersOpen ? 'Fermer' : 'Filtrer'}
                            </button>
                        </div>

                        {filtersOpen && (
                            <div className="mt-4 rounded border border-neutral-200 bg-[#f6f3ed] p-5 lg:hidden">
                                {filterPanel}
                            </div>
                        )}

                        <div className="mt-6 grid grid-cols-2 gap-x-5 gap-y-7 md:grid-cols-3 lg:mt-7 lg:gap-x-8 lg:gap-y-10">
                            {filteredProducts.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>

                        {filteredProducts.length === 0 && (
                            <div className="mt-7 border border-neutral-200 bg-[#faf8f3] p-8 text-sm text-neutral-600">
                                Aucun produit ne correspond a votre recherche.
                            </div>
                        )}
                    </div>
                </section>
            </main>
        </>
    );
}

function FilterGroup({ title, items, active, onSelect }) {
    return (
        <div className="mb-8 border-b border-neutral-200 pb-6">
            <h2 className="text-sm font-bold uppercase">{title}</h2>
            <div className="mt-4 space-y-3">
                {items.map((item) => (
                    <button
                        key={item}
                        type="button"
                        onClick={() => onSelect(active === item ? '' : item)}
                        className={`block text-sm ${active === item ? 'font-bold text-[#17110b]' : 'text-neutral-600'}`}
                    >
                        {item}
                    </button>
                ))}
            </div>
        </div>
    );
}