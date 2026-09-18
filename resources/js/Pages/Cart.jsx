import BrandHeader from '@/Components/Gentleman/BrandHeader';
import { formatPrice, productImage } from '@/Components/Gentleman/brand';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

const steps = ['Panier', 'Livraison', 'Paiement', 'Confirmation'];

export default function Cart({ auth, items = [], checkoutUser, deliveryFeeCents = 0 }) {
    const { props } = usePage();
    const [promoCode, setPromoCode] = useState('');
    const [promoMessage, setPromoMessage] = useState('');
    const subtotal = items.reduce((sum, item) => sum + item.unit_price_cents * item.quantity, 0);
    const total = subtotal + deliveryFeeCents;
    const checkoutForm = useForm({
        customer_name: checkoutUser?.name ?? '',
        customer_phone: checkoutUser?.phone ?? '',
        delivery_district: '',
        delivery_address: '',
        payment_method: 'cash_on_delivery',
        notes: '',
    });

    const updateQuantity = (item, quantity) => {
        if (quantity < 1) return;

        router.patch(route('cart.items.update', item.id), { quantity }, { preserveScroll: true });
    };

    const removeItem = (item) => {
        router.delete(route('cart.items.destroy', item.id), { preserveScroll: true });
    };

    const checkout = () => {
        checkoutForm.post(route('cart.checkout'), { preserveScroll: true });
    };

    const applyPromo = () => {
        if (!promoCode.trim()) {
            setPromoMessage('Entrez un code promotionnel.');
            return;
        }

        setPromoMessage('Code recu. La remise sera confirmee par la boutique avant paiement.');
    };

    return (
        <>
            <Head title="Votre panier" />
            <main className="min-h-screen bg-white text-[#17110b]">
                <BrandHeader auth={auth} leftLabel="Retour" leftHref={route('collections.index')} />

                <section className="mx-auto max-w-7xl px-5 py-5 sm:px-6 sm:py-10">
                    <div className="mb-7 grid grid-cols-4 items-start sm:hidden">
                        {steps.map((step, index) => (
                            <div key={step} className="relative text-center">
                                <div className={`mx-auto h-3 w-3 rounded-full ${index === 0 ? 'bg-[#c99524]' : 'bg-neutral-200'}`} />
                                {index < steps.length - 1 && <div className="absolute left-1/2 top-[5px] h-px w-full bg-neutral-200" />}
                                <p className={`mt-2 text-[11px] ${index === 0 ? 'text-[#c99524]' : 'text-neutral-500'}`}>{step}</p>
                            </div>
                        ))}
                    </div>

                    <h1 className="font-serif text-3xl font-semibold sm:text-4xl">Votre panier</h1>

                    {props.flash?.success && (
                        <div className="mt-4 rounded border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">
                            {props.flash.success}
                        </div>
                    )}

                    {items.length === 0 && (
                        <div className="mt-6 rounded border border-neutral-200 bg-[#faf8f3] p-6 text-sm text-neutral-600">
                            Votre panier est vide. <Link href={route('collections.index')} className="font-bold text-[#b97f19]">Voir les articles</Link>
                        </div>
                    )}

                    <div className="mt-5 divide-y divide-neutral-200 sm:hidden">
                        {items.map((item) => (
                            <MobileCartItem key={item.id} item={item} onUpdate={updateQuantity} onRemove={removeItem} />
                        ))}
                    </div>

                    <div className="mt-7 hidden overflow-x-auto sm:block">
                        <table className="min-w-full border-collapse text-sm">
                            <thead className="bg-[#f4f1eb] text-left">
                                <tr>
                                    <th className="px-5 py-4">Produit</th>
                                    <th className="px-5 py-4">Prix</th>
                                    <th className="px-5 py-4 text-center">Quantite</th>
                                    <th className="px-5 py-4 text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-200">
                                {items.map((item) => (
                                    <tr key={item.id}>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-4">
                                                <img src={productImage(item.product)} alt={item.product.name} className="h-20 w-20 object-cover" />
                                                <div>
                                                    <p className="font-semibold">{item.product.name}</p>
                                                    <p className="text-neutral-500">{item.variant?.color_name ?? 'Noir'} - {item.variant?.size ?? '42'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-5 py-4">{formatPrice(item.unit_price_cents)}</td>
                                        <td className="px-5 py-4 text-center">
                                            <div className="mx-auto grid h-9 w-28 grid-cols-3 overflow-hidden rounded border border-neutral-300">
                                                <button type="button" onClick={() => updateQuantity(item, item.quantity - 1)}>-</button>
                                                <span className="flex items-center justify-center border-x border-neutral-300">{item.quantity}</span>
                                                <button type="button" onClick={() => updateQuantity(item, item.quantity + 1)}>+</button>
                                            </div>
                                            <button type="button" onClick={() => removeItem(item)} className="mt-2 text-xs text-neutral-500">Supprimer</button>
                                        </td>
                                        <td className="whitespace-nowrap px-5 py-4 text-right font-bold">{formatPrice(item.unit_price_cents * item.quantity)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-6 sm:max-w-xl sm:ml-auto">
                        <label className="block text-sm font-semibold sm:hidden">Code promotionnel</label>
                        <div className="mt-2 grid grid-cols-[1fr_110px] gap-2 sm:hidden">
                            <input className="h-12 rounded border-neutral-300 text-sm" placeholder="Entrez votre code" value={promoCode} onChange={(event) => setPromoCode(event.target.value)} />
                            <button type="button" onClick={applyPromo} className="rounded bg-[#111] text-sm font-bold uppercase text-white">Appliquer</button>
                        </div>
                        {promoMessage && <p className="mt-2 text-xs font-semibold text-[#b97f19] sm:hidden">{promoMessage}</p>}

                        <div className="mt-6 text-sm">
                            <SummaryRow label="Sous-total" value={subtotal} />
                            <SummaryRow label="Livraison (Yaounde)" value={deliveryFeeCents} />
                            <SummaryRow label="Total" value={total} strong />
                        </div>
                    </div>

                    {auth.user ? (
                        <section className="mt-8 rounded border border-neutral-200 bg-[#faf8f3] p-5">
                            <h2 className="text-lg font-bold">Livraison et paiement</h2>
                            <div className="mt-4 grid gap-4 sm:grid-cols-2">
                                <CheckoutField label="Nom" value={checkoutForm.data.customer_name} error={checkoutForm.errors.customer_name} onChange={(value) => checkoutForm.setData('customer_name', value)} />
                                <CheckoutField label="Telephone" value={checkoutForm.data.customer_phone} error={checkoutForm.errors.customer_phone} onChange={(value) => checkoutForm.setData('customer_phone', value)} />
                                <CheckoutField label="Quartier" value={checkoutForm.data.delivery_district} error={checkoutForm.errors.delivery_district} onChange={(value) => checkoutForm.setData('delivery_district', value)} />
                                <label className="text-sm font-semibold">
                                    Moyen de paiement
                                    <select className="mt-2 w-full rounded border-neutral-300 text-sm" value={checkoutForm.data.payment_method} onChange={(event) => checkoutForm.setData('payment_method', event.target.value)}>
                                        <option value="cash_on_delivery">Paiement a la livraison</option>
                                        <option value="orange_money">Orange Money</option>
                                        <option value="mtn_mobile_money">MTN Mobile Money</option>
                                    </select>
                                    <Error message={checkoutForm.errors.payment_method} />
                                </label>
                            </div>
                            <label className="mt-4 block text-sm font-semibold">
                                Adresse de livraison
                                <textarea className="mt-2 h-24 w-full rounded border-neutral-300 text-sm" value={checkoutForm.data.delivery_address} onChange={(event) => checkoutForm.setData('delivery_address', event.target.value)} />
                                <Error message={checkoutForm.errors.delivery_address || checkoutForm.errors.cart} />
                            </label>
                            <button type="button" disabled={items.length === 0 || checkoutForm.processing} onClick={checkout} className="mt-5 w-full rounded bg-[#c99524] px-8 py-5 text-sm font-bold uppercase text-white disabled:opacity-60">
                                Passer a la caisse
                            </button>
                        </section>
                    ) : (
                        <Link href={route('login')} className="mt-7 block w-full rounded bg-[#c99524] px-8 py-5 text-center text-sm font-bold uppercase text-white">
                            Se connecter pour commander
                        </Link>
                    )}
                </section>
            </main>
        </>
    );
}

function MobileCartItem({ item, onUpdate, onRemove }) {
    return (
        <div className="grid grid-cols-[74px_1fr_auto] gap-4 py-4">
            <img src={productImage(item.product)} alt={item.product.name} className="h-[74px] w-[74px] rounded object-cover" />
            <div>
                <p className="font-semibold">{item.product.name}</p>
                <p className="mt-1 text-sm text-neutral-500">{item.variant?.color_name ?? 'Noir'} - {item.variant?.size ?? '42'}</p>
                <p className="mt-1 text-sm text-neutral-500">{formatPrice(item.unit_price_cents)}</p>
            </div>
            <div className="text-right">
                <div className="mb-3 grid h-9 grid-cols-3 overflow-hidden rounded border border-neutral-300">
                    <button type="button" className="w-8" onClick={() => onUpdate(item, item.quantity - 1)}>-</button>
                    <span className="flex w-8 items-center justify-center border-x border-neutral-300 text-sm">{item.quantity}</span>
                    <button type="button" className="w-8" onClick={() => onUpdate(item, item.quantity + 1)}>+</button>
                </div>
                <p className="font-bold">{formatPrice(item.unit_price_cents * item.quantity)}</p>
                <button type="button" className="mt-3 text-xs text-neutral-500" onClick={() => onRemove(item)}>Supprimer</button>
            </div>
        </div>
    );
}

function CheckoutField({ label, value, onChange, error }) {
    return (
        <label className="text-sm font-semibold">
            {label}
            <input className="mt-2 w-full rounded border-neutral-300 text-sm" value={value} onChange={(event) => onChange(event.target.value)} />
            <Error message={error} />
        </label>
    );
}

function Error({ message }) {
    return message ? <p className="mt-1 text-xs font-semibold text-red-700">{message}</p> : null;
}

function SummaryRow({ label, value, strong = false }) {
    return (
        <div className={`flex justify-between py-1.5 ${strong ? 'text-lg font-bold' : ''}`}>
            <span>{label}</span>
            <span className={strong ? 'text-[#b97f19]' : ''}>{formatPrice(value)}</span>
        </div>
    );
}
