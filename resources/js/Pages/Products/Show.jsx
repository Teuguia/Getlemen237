import BrandHeader from '@/Components/Gentleman/BrandHeader';
import { formatPrice, productImage } from '@/Components/Gentleman/brand';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';

const tabs = ['Description', 'Livraison', 'Retours', 'Guide des tailles'];

export default function Show({ auth, product, whatsappPhone }) {
    const { props } = usePage();
    const image = product.media?.find((media) => media.is_primary)?.path ?? productImage(product);
    const thumbnails = product.media?.length ? product.media : [{ path: image }, { path: image }, { path: image }];
    const colors = [...new Set(product.variants.map((variant) => variant.color_name).filter(Boolean))];
    const sizes = [...new Set(product.variants.map((variant) => variant.size).filter(Boolean))];
    const [selectedColor, setSelectedColor] = useState(colors[0] ?? '');
    const [selectedSize, setSelectedSize] = useState(sizes[0] ?? '');
    const [quantity, setQuantity] = useState(1);
    const selectedVariant = useMemo(
        () =>
            product.variants.find((variant) => variant.color_name === selectedColor && variant.size === selectedSize)
            ?? product.variants[0],
        [product.variants, selectedColor, selectedSize],
    );
    const cartForm = useForm({
        product_variant_id: selectedVariant?.id ?? '',
        quantity,
    });
    const reservationForm = useForm({
        product_variant_id: selectedVariant?.id ?? '',
        quantity,
        notes: '',
    });
    const message = encodeURIComponent(`Bonjour 237 Gentleman, je souhaite commander ${product.name}.`);
    const whatsappHref = whatsappPhone ? `https://wa.me/${whatsappPhone}?text=${message}` : null;
    const availableStock = selectedVariant?.stock_quantity ?? product.stock_total ?? 0;

    const addToCart = (redirectToCart = false) => {
        cartForm
            .transform(() => ({
                product_variant_id: selectedVariant?.id,
                quantity,
            }))
            .post(route('cart.items.store'), {
                preserveScroll: !redirectToCart,
                onSuccess: () => {
                    if (redirectToCart) {
                        window.location.href = route('cart.show');
                    }
                },
            });
    };

    const reserve = () => {
        reservationForm
            .transform(() => ({
                product_variant_id: selectedVariant?.id,
                quantity,
                notes: `Reservation depuis la fiche ${product.name}`,
            }))
            .post(route('reservations.store'), { preserveScroll: true });
    };

    return (
        <>
            <Head title={product.name} />
            <main className="min-h-screen bg-white text-[#17110b]">
                <BrandHeader auth={auth} leftLabel="Retour" leftHref={route('collections.index')} />

                <section className="mx-auto max-w-7xl px-5 py-3 sm:px-6 sm:py-8">
                    <div className="mb-6 hidden items-center gap-2 text-sm text-neutral-500 sm:flex">
                        <Link href={route('home')}>Accueil</Link>
                        <span>/</span>
                        <Link href={route('collections.index')}>{product.category ?? 'Collection'}</Link>
                        <span>/</span>
                        <span className="font-semibold text-[#17110b]">{product.name}</span>
                    </div>

                    <div className="grid gap-5 lg:grid-cols-[1.08fr_.92fr] lg:gap-10">
                        <div>
                            <div className="aspect-[1.18/1] overflow-hidden rounded bg-[#e8e1d8] sm:aspect-[1.08/1]">
                                <img src={image} alt={product.name} className="h-full w-full object-cover" />
                            </div>
                            <div className="mt-3 grid grid-cols-4 gap-2 sm:mt-5 sm:grid-cols-3 sm:gap-4">
                                {thumbnails.slice(0, 3).map((media, index) => (
                                    <button key={`${media.path}-${index}`} type="button" className="aspect-square overflow-hidden rounded border border-neutral-200 bg-[#e8e1d8] sm:aspect-[4/3]">
                                        <img src={media.path} alt={product.name} className="h-full w-full object-cover" />
                                    </button>
                                ))}
                                <button type="button" className="flex aspect-square flex-col items-center justify-center rounded bg-[#111] text-[11px] font-bold uppercase text-white sm:hidden">
                                    <span className="mb-1 flex h-6 w-6 items-center justify-center rounded-full border border-white">▶</span>
                                    Voir la video
                                </button>
                            </div>
                        </div>

                        <aside className="pt-1 sm:pt-2">
                            {props.flash?.success && (
                                <div className="mb-4 rounded border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">
                                    {props.flash.success}
                                </div>
                            )}
                            <h1 className="text-2xl font-bold sm:font-serif sm:text-4xl sm:font-semibold">{product.name}</h1>
                            <div className="mt-3 flex items-center gap-3 sm:mt-5 sm:gap-4">
                                <span className="text-xl font-bold text-[#c78916] sm:text-2xl">{formatPrice(product.active_price_cents)}</span>
                                {product.discount_percentage && (
                                    <>
                                        <span className="text-sm text-neutral-500 line-through">{formatPrice(product.base_price_cents)}</span>
                                        <span className="rounded-sm bg-[#bd8723] px-3 py-2 text-sm font-bold text-white">-{product.discount_percentage}%</span>
                                    </>
                                )}
                            </div>

                            <p className="mt-5 max-w-xl text-sm leading-6 text-neutral-600">{product.description}</p>

                            <OptionGroup title="Couleur" values={colors} selected={selectedColor} onSelect={setSelectedColor} />
                            <OptionGroup title="Taille" values={sizes} selected={selectedSize} onSelect={setSelectedSize} boxed />

                            <div className="mt-6">
                                <h2 className="text-sm font-bold">Quantite</h2>
                                <div className="mt-3 flex items-center gap-4">
                                    <div className="grid h-11 grid-cols-3 overflow-hidden rounded border border-neutral-300">
                                        <button type="button" className="w-11 text-lg" onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                                        <span className="flex w-11 items-center justify-center border-x border-neutral-300 text-sm">{quantity}</span>
                                        <button type="button" className="w-11 text-lg" onClick={() => setQuantity(Math.min(availableStock || 1, quantity + 1))}>+</button>
                                    </div>
                                    <span className="text-sm font-semibold text-[#bd8723]">Plus que {availableStock} disponibles</span>
                                </div>
                                {(cartForm.errors.quantity || cartForm.errors.product_variant_id || reservationForm.errors.quantity) && (
                                    <p className="mt-2 text-sm font-semibold text-red-700">
                                        {cartForm.errors.quantity || cartForm.errors.product_variant_id || reservationForm.errors.quantity}
                                    </p>
                                )}
                            </div>

                            <div className="mt-7 grid gap-3">
                                <button type="button" disabled={!selectedVariant || cartForm.processing} onClick={() => addToCart(false)} className="rounded bg-[#c99524] px-6 py-4 text-sm font-bold uppercase text-white disabled:opacity-60">Ajouter au panier</button>
                                <button type="button" disabled={!selectedVariant || cartForm.processing} onClick={() => addToCart(true)} className="rounded border border-[#111] bg-white px-6 py-4 text-sm font-bold uppercase text-[#111] disabled:opacity-60 sm:bg-[#111] sm:text-white">Acheter maintenant</button>
                                {whatsappHref && (
                                    <a href={whatsappHref} className="rounded border border-neutral-400 px-6 py-4 text-center text-sm font-bold uppercase text-[#17110b]">
                                        Commander via WhatsApp
                                    </a>
                                )}
                                <button type="button" disabled={!selectedVariant || reservationForm.processing} onClick={reserve} className="border border-neutral-400 px-6 py-4 text-sm font-bold uppercase text-[#17110b] disabled:opacity-60">Reserver en boutique</button>
                            </div>
                        </aside>
                    </div>

                    <section className="mt-8 sm:mt-16">
                        <div className="flex gap-7 overflow-x-auto border-b border-neutral-200 text-sm font-semibold sm:flex-wrap sm:gap-12">
                            {tabs.map((tab, index) => (
                                <button key={tab} type="button" className={`whitespace-nowrap pb-3 sm:pb-4 ${index === 0 ? 'border-b-4 border-[#111]' : ''}`}>
                                    {tab}
                                </button>
                            ))}
                        </div>
                        <div className="hidden border border-t-0 border-neutral-200 p-8 text-sm leading-7 text-neutral-700 sm:block">
                            <p>{product.name} elegant, concu pour allier confort et raffinement. Ideal pour le bureau, les ceremonies et vos sorties.</p>
                            <ul className="mt-5 space-y-2">
                                <li>&gt; Matiere : Cuir veritable ou textile premium selon modele</li>
                                <li>&gt; Semelle : Anti-derapante</li>
                                <li>&gt; Style : Classique et moderne</li>
                                <li>&gt; Origine : Europe</li>
                            </ul>
                        </div>
                    </section>
                </section>
            </main>
        </>
    );
}

function OptionGroup({ title, values, selected, onSelect, boxed = false }) {
    return (
        <div className="mt-6">
            <h2 className="text-sm font-bold">{title}</h2>
            <div className="mt-3 flex flex-wrap gap-3">
                {values.map((value) => (
                    <button
                        key={value}
                        type="button"
                        onClick={() => onSelect(value)}
                        className={
                            boxed
                                ? `h-10 min-w-12 rounded border px-3 text-sm ${selected === value ? 'border-[#111] bg-[#111] text-white' : 'border-neutral-300'}`
                                : `rounded px-4 py-2 text-sm ${selected === value ? 'bg-[#c99524] text-white shadow' : 'text-neutral-700'}`
                        }
                    >
                        {value}
                    </button>
                ))}
            </div>
        </div>
    );
}
