import BrandHeader from '@/Components/Gentleman/BrandHeader';
import { Head, router, useForm, usePage } from '@inertiajs/react';

const menu = [
    'Tableau de bord',
    'Produits',
    'Ajouter un produit',
    'Commandes',
    'Clients',
    'Stock',
    'Parametres',
];

const emptyVariant = {
    color_name: '',
    color_hex: '',
    size: '',
    stock_quantity: 0,
};

const orderStatuses = [
    ['pending_payment', 'Paiement en attente'],
    ['confirmed', 'Confirmee'],
    ['preparing', 'En preparation'],
    ['delivering', 'En livraison'],
    ['delivered', 'Livree'],
    ['cancelled', 'Annulee'],
];

const paymentStatuses = [
    ['unpaid', 'Non paye'],
    ['pay_on_delivery', 'A la livraison'],
    ['pending', 'En attente'],
    ['paid', 'Paye'],
    ['failed', 'Echoue'],
    ['refunded', 'Rembourse'],
];

export default function Dashboard({ auth, stats, categories = [], products = [], orders = [], customers = [] }) {
    const { props } = usePage();
    const form = useForm({
        name: 'Mocassin Milano',
        category_id: categories[0]?.id ?? '',
        description: 'Mocassin en cuir veritable, finition haut de gamme.',
        normal_price: '45000',
        sale_price: '35000',
        sale_starts_at: '2026-09-01',
        sale_ends_at: '2026-09-30',
        image_file: null,
        video_file: null,
        image_url: '',
        video_url: '',
        status: 'published',
        variants: [
            { color_name: 'Noir', color_hex: '#111111', size: '42', stock_quantity: 3 },
            { color_name: 'Noir', color_hex: '#111111', size: '43', stock_quantity: 2 },
            { color_name: 'Marron', color_hex: '#7a431f', size: '42', stock_quantity: 4 },
        ],
    });

    const updateVariant = (index, key, value) => {
        const variants = [...form.data.variants];
        variants[index] = { ...variants[index], [key]: value };
        form.setData('variants', variants);
    };

    const addVariant = () => {
        form.setData('variants', [...form.data.variants, emptyVariant]);
    };

    const removeVariant = (index) => {
        form.setData(
            'variants',
            form.data.variants.filter((_, variantIndex) => variantIndex !== index),
        );
    };

    const submit = (status) => {
        form
            .transform((data) => ({ ...data, status }))
            .post(route('admin.products.store'), {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => {
                    form.reset('name', 'description', 'normal_price', 'sale_price', 'sale_starts_at', 'sale_ends_at', 'image_file', 'video_file', 'image_url', 'video_url');
                    form.setData('variants', [{ ...emptyVariant }]);
                },
            });
    };

    return (
        <>
            <Head title="Administration" />
            <main className="min-h-screen bg-white text-[#17110b]">
                <BrandHeader auth={auth} />

                <section className="mx-auto grid max-w-7xl grid-cols-1 lg:grid-cols-[245px_1fr]">
                    <aside className="hidden bg-[#f2eee6] py-6 text-sm lg:block">
                        {menu.map((item, index) => (
                            <a
                                key={item}
                                href={`#${item.toLowerCase().replaceAll(' ', '-')}`}
                                className={`block w-full px-7 py-3 text-left ${index === 1 ? 'bg-[#c99524] font-bold text-black' : 'text-[#17110b]'}`}
                            >
                                {item}
                            </a>
                        ))}
                    </aside>

                    <div className="space-y-9 px-5 py-5 sm:px-7 sm:py-7">
                        <section id="tableau-de-bord" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            <Stat label="Publies" value={stats?.publishedProducts ?? 0} />
                            <Stat label="Brouillons" value={stats?.draftProducts ?? 0} />
                            <Stat label="Commandes" value={stats?.pendingOrders ?? 0} />
                            <Stat label="Stock faible" value={stats?.lowStockVariants ?? 0} />
                        </section>

                        {props.flash?.success && (
                            <div className="rounded border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">
                                {props.flash.success}
                            </div>
                        )}

                        <section id="ajouter-un-produit">
                            <SectionTitle title="Ajouter un produit" subtitle="Le seller peut publier, garder en brouillon et charger les medias depuis son telephone." />

                            <form className="mt-5 grid gap-5 lg:grid-cols-[1fr_350px] lg:gap-7" onSubmit={(event) => event.preventDefault()}>
                                <div className="space-y-5">
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <Field label="Nom du produit" value={form.data.name} onChange={(value) => form.setData('name', value)} error={form.errors.name} />
                                        <SelectField label="Categorie" value={form.data.category_id} onChange={(value) => form.setData('category_id', value)} error={form.errors.category_id}>
                                            <option value="">Choisir</option>
                                            {categories.map((category) => (
                                                <option key={category.id} value={category.id}>
                                                    {category.name}
                                                </option>
                                            ))}
                                        </SelectField>
                                    </div>

                                    <label className="block text-sm font-semibold">
                                        Description
                                        <textarea
                                            className="mt-2 h-28 w-full rounded border-neutral-300 text-sm focus:border-[#c99524] focus:ring-[#c99524]"
                                            value={form.data.description}
                                            onChange={(event) => form.setData('description', event.target.value)}
                                        />
                                        <Error message={form.errors.description} />
                                    </label>

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <FileField label="Image depuis l'appareil" accept="image/*" onChange={(file) => form.setData('image_file', file)} error={form.errors.image_file} />
                                        <FileField label="Video depuis l'appareil" accept="video/*" onChange={(file) => form.setData('video_file', file)} error={form.errors.video_file} />
                                        <Field label="Image URL optionnelle" value={form.data.image_url} onChange={(value) => form.setData('image_url', value)} error={form.errors.image_url} placeholder="https://..." />
                                        <Field label="Video URL optionnelle" value={form.data.video_url} onChange={(value) => form.setData('video_url', value)} error={form.errors.video_url} placeholder="https://..." />
                                    </div>
                                </div>

                                <div className="space-y-5">
                                    <div className="grid grid-cols-2 gap-4">
                                        <Field label="Prix normal (FCFA)" value={form.data.normal_price} onChange={(value) => form.setData('normal_price', value)} error={form.errors.normal_price} />
                                        <Field label="Prix promo (FCFA)" value={form.data.sale_price} onChange={(value) => form.setData('sale_price', value)} error={form.errors.sale_price} />
                                        <Field label="Debut promo" value={form.data.sale_starts_at} onChange={(value) => form.setData('sale_starts_at', value)} error={form.errors.sale_starts_at} type="date" />
                                        <Field label="Fin promo" value={form.data.sale_ends_at} onChange={(value) => form.setData('sale_ends_at', value)} error={form.errors.sale_ends_at} type="date" />
                                    </div>

                                    <VariantEditor variants={form.data.variants} updateVariant={updateVariant} addVariant={addVariant} removeVariant={removeVariant} error={form.errors.variants} />

                                    <div className="grid grid-cols-2 gap-3">
                                        <button type="button" disabled={form.processing} onClick={() => submit('draft')} className="rounded border border-neutral-400 px-4 py-4 text-sm font-bold disabled:opacity-60">
                                            Brouillon
                                        </button>
                                        <button type="button" disabled={form.processing} onClick={() => submit('published')} className="rounded bg-[#c99524] px-4 py-4 text-sm font-bold text-white disabled:opacity-60">
                                            Publier
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </section>

                        <section id="produits">
                            <SectionTitle title="Produits et stock" subtitle="Modifier les prix, remplacer les medias, ajuster les variantes et retirer un produit." />
                            <div className="mt-5 space-y-4">
                                {products.length === 0 ? (
                                    <EmptyState message="Aucun produit pour le moment." />
                                ) : (
                                    products.map((product) => <ProductManager key={product.id} product={product} categories={categories} />)
                                )}
                            </div>
                        </section>

                        <section id="commandes">
                            <SectionTitle title="Commandes" subtitle="Suivre les commandes clients et mettre a jour leur avancement." />
                            <div className="mt-5 overflow-x-auto border border-neutral-200">
                                <table className="min-w-[760px] w-full text-sm">
                                    <thead className="bg-[#f4f1eb] text-left">
                                        <tr>
                                            <th className="px-3 py-3">Commande</th>
                                            <th className="px-3 py-3">Client</th>
                                            <th className="px-3 py-3">Articles</th>
                                            <th className="px-3 py-3">Total</th>
                                            <th className="px-3 py-3">Statut</th>
                                            <th className="px-3 py-3">Paiement</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-200">
                                        {orders.map((order) => <OrderRow key={order.id} order={order} />)}
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        <section id="clients">
                            <SectionTitle title="Clients" subtitle="Comptes inscrits pour paniers, reservations et commandes." />
                            <div className="mt-5 grid gap-3 md:grid-cols-2">
                                {customers.length === 0 ? (
                                    <EmptyState message="Aucun client inscrit." />
                                ) : (
                                    customers.map((customer) => (
                                        <article key={customer.id} className="border border-neutral-200 p-4">
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <h3 className="font-bold">{customer.name}</h3>
                                                    <p className="mt-1 text-sm text-neutral-600">{customer.email}</p>
                                                    <p className="text-sm text-neutral-600">{customer.phone || 'Telephone non renseigne'}</p>
                                                </div>
                                                <span className={`rounded px-2 py-1 text-xs font-bold ${customer.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                                                    {customer.is_active ? 'Actif' : 'Bloque'}
                                                </span>
                                            </div>
                                            <p className="mt-3 text-xs text-neutral-500">Inscrit le {customer.created_at}</p>
                                        </article>
                                    ))
                                )}
                            </div>
                        </section>
                    </div>
                </section>
            </main>
        </>
    );
}

function ProductManager({ product, categories }) {
    const form = useForm({
        _method: 'put',
        name: product.name,
        category_id: product.category_id ?? '',
        description: product.description ?? '',
        normal_price: product.normal_price,
        sale_price: product.sale_price ?? '',
        sale_starts_at: product.sale_starts_at ?? '',
        sale_ends_at: product.sale_ends_at ?? '',
        image_file: null,
        video_file: null,
        image_url: '',
        video_url: '',
        status: product.status,
        variants: product.variants.length ? product.variants : [{ ...emptyVariant }],
    });

    const updateVariant = (index, key, value) => {
        const variants = [...form.data.variants];
        variants[index] = { ...variants[index], [key]: value };
        form.setData('variants', variants);
    };

    const addVariant = () => {
        form.setData('variants', [...form.data.variants, { ...emptyVariant }]);
    };

    const removeVariant = (index) => {
        form.setData(
            'variants',
            form.data.variants.filter((_, variantIndex) => variantIndex !== index),
        );
    };

    const save = () => {
        form.post(route('admin.products.update', product.id), {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    const destroy = () => {
        if (!window.confirm('Retirer ce produit de la boutique ?')) {
            return;
        }

        router.delete(route('admin.products.destroy', product.id), {
            preserveScroll: true,
        });
    };

    return (
        <article className="border border-neutral-200 p-4">
            <div className="grid gap-4 lg:grid-cols-[150px_1fr]">
                <div>
                    {product.image ? (
                        <img src={product.image} alt={product.name} className="aspect-square w-full rounded object-cover" />
                    ) : (
                        <div className="flex aspect-square items-center justify-center rounded bg-[#f4f1eb] text-xs font-bold text-neutral-500">Sans image</div>
                    )}
                    <p className="mt-2 text-xs font-semibold text-neutral-500">{product.reference}</p>
                </div>

                <div className="space-y-4">
                    <div className="grid gap-3 md:grid-cols-3">
                        <Field label="Nom" value={form.data.name} onChange={(value) => form.setData('name', value)} error={form.errors.name} />
                        <SelectField label="Categorie" value={form.data.category_id} onChange={(value) => form.setData('category_id', value)} error={form.errors.category_id}>
                            <option value="">Choisir</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </SelectField>
                        <SelectField label="Statut" value={form.data.status} onChange={(value) => form.setData('status', value)} error={form.errors.status}>
                            <option value="published">Publie</option>
                            <option value="draft">Brouillon</option>
                        </SelectField>
                    </div>

                    <label className="block text-sm font-semibold">
                        Description
                        <textarea
                            className="mt-2 h-24 w-full rounded border-neutral-300 text-sm focus:border-[#c99524] focus:ring-[#c99524]"
                            value={form.data.description}
                            onChange={(event) => form.setData('description', event.target.value)}
                        />
                        <Error message={form.errors.description} />
                    </label>

                    <div className="grid gap-3 md:grid-cols-4">
                        <Field label="Prix normal" value={form.data.normal_price} onChange={(value) => form.setData('normal_price', value)} error={form.errors.normal_price} />
                        <Field label="Prix promo" value={form.data.sale_price} onChange={(value) => form.setData('sale_price', value)} error={form.errors.sale_price} />
                        <Field label="Debut promo" value={form.data.sale_starts_at} onChange={(value) => form.setData('sale_starts_at', value)} error={form.errors.sale_starts_at} type="date" />
                        <Field label="Fin promo" value={form.data.sale_ends_at} onChange={(value) => form.setData('sale_ends_at', value)} error={form.errors.sale_ends_at} type="date" />
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                        <FileField label="Remplacer l'image" accept="image/*" onChange={(file) => form.setData('image_file', file)} error={form.errors.image_file} />
                        <FileField label="Ajouter/remplacer une video" accept="video/*" onChange={(file) => form.setData('video_file', file)} error={form.errors.video_file} />
                    </div>

                    <VariantEditor variants={form.data.variants} updateVariant={updateVariant} addVariant={addVariant} removeVariant={removeVariant} error={form.errors.variants} compact />

                    <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                        <button type="button" onClick={destroy} className="rounded border border-red-300 px-4 py-3 text-sm font-bold text-red-700">
                            Supprimer
                        </button>
                        <button type="button" disabled={form.processing} onClick={save} className="rounded bg-[#17110b] px-5 py-3 text-sm font-bold text-white disabled:opacity-60">
                            Enregistrer
                        </button>
                    </div>
                </div>
            </div>
        </article>
    );
}

function OrderRow({ order }) {
    const form = useForm({
        status: order.status,
        payment_status: order.payment_status ?? 'pending',
    });

    const update = (key, value) => {
        const nextData = { ...form.data, [key]: value };
        form.setData(nextData);
        router.patch(route('admin.orders.update', order.id), nextData, {
            preserveScroll: true,
        });
    };

    return (
        <tr>
            <td className="px-3 py-3 font-bold">
                {order.order_number}
                <span className="block text-xs font-normal text-neutral-500">{order.created_at}</span>
            </td>
            <td className="px-3 py-3">
                {order.customer_name}
                <span className="block text-xs text-neutral-500">{order.customer_phone}</span>
            </td>
            <td className="px-3 py-3">{order.items_count}</td>
            <td className="px-3 py-3 font-bold">{formatPrice(order.total)}</td>
            <td className="px-3 py-3">
                <select className="rounded border-neutral-300 text-sm" value={form.data.status} onChange={(event) => update('status', event.target.value)}>
                    {orderStatuses.map(([value, label]) => (
                        <option key={value} value={value}>
                            {label}
                        </option>
                    ))}
                </select>
            </td>
            <td className="px-3 py-3">
                <select className="rounded border-neutral-300 text-sm" value={form.data.payment_status} onChange={(event) => update('payment_status', event.target.value)}>
                    {paymentStatuses.map(([value, label]) => (
                        <option key={value} value={value}>
                            {label}
                        </option>
                    ))}
                </select>
            </td>
        </tr>
    );
}

function VariantEditor({ variants, updateVariant, addVariant, removeVariant, error, compact = false }) {
    return (
        <div>
            <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-semibold">Variantes (taille, couleur, quantite)</h2>
                <button type="button" className="text-sm font-bold text-[#b57a14]" onClick={addVariant}>
                    Ajouter
                </button>
            </div>
            <div className="mt-2 overflow-x-auto border border-neutral-300">
                <table className="min-w-[520px] w-full text-sm">
                    <thead className="bg-[#f4f1eb] text-left">
                        <tr>
                            <th className="px-2 py-2">Couleur</th>
                            <th className="px-2 py-2">Code</th>
                            <th className="px-2 py-2">Taille</th>
                            <th className="px-2 py-2">Qt</th>
                            <th className="px-2 py-2"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200">
                        {variants.map((variant, index) => (
                            <tr key={variant.id ?? index}>
                                <td className="px-2 py-2">
                                    <input className="w-full rounded border-neutral-300 text-sm" value={variant.color_name} onChange={(event) => updateVariant(index, 'color_name', event.target.value)} />
                                </td>
                                <td className="px-2 py-2">
                                    <input className="w-24 rounded border-neutral-300 text-sm" value={variant.color_hex ?? ''} onChange={(event) => updateVariant(index, 'color_hex', event.target.value)} placeholder="#111111" />
                                </td>
                                <td className="px-2 py-2">
                                    <input className="w-20 rounded border-neutral-300 text-sm" value={variant.size} onChange={(event) => updateVariant(index, 'size', event.target.value)} />
                                </td>
                                <td className="px-2 py-2">
                                    <input className="w-20 rounded border-neutral-300 text-sm" type="number" min="0" value={variant.stock_quantity} onChange={(event) => updateVariant(index, 'stock_quantity', event.target.value)} />
                                </td>
                                <td className="px-2 py-2">
                                    <button type="button" className="text-xs font-bold text-red-700" onClick={() => removeVariant(index)} disabled={variants.length === 1}>
                                        X
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {compact ? null : <p className="mt-2 text-xs text-neutral-500">Le stock passe automatiquement indisponible quand la quantite est a zero.</p>}
            <Error message={error} />
        </div>
    );
}

function SectionTitle({ title, subtitle }) {
    return (
        <div>
            <h1 className="text-2xl font-bold lg:font-serif lg:text-3xl lg:font-semibold">{title}</h1>
            <p className="mt-1 text-sm text-neutral-600">{subtitle}</p>
        </div>
    );
}

function Field({ label, value, onChange, error, type = 'text', placeholder = '' }) {
    return (
        <label className="block text-sm font-semibold">
            {label}
            <input
                className="mt-2 w-full rounded border-neutral-300 text-sm focus:border-[#c99524] focus:ring-[#c99524]"
                type={type}
                value={value}
                placeholder={placeholder}
                onChange={(event) => onChange(event.target.value)}
            />
            <Error message={error} />
        </label>
    );
}

function SelectField({ label, value, onChange, error, children }) {
    return (
        <label className="block text-sm font-semibold">
            {label}
            <select className="mt-2 w-full rounded border-neutral-300 text-sm focus:border-[#c99524] focus:ring-[#c99524]" value={value} onChange={(event) => onChange(event.target.value)}>
                {children}
            </select>
            <Error message={error} />
        </label>
    );
}

function FileField({ label, accept, onChange, error }) {
    return (
        <label className="block text-sm font-semibold">
            {label}
            <input className="mt-2 w-full rounded border border-neutral-300 p-2 text-sm file:mr-3 file:rounded file:border-0 file:bg-[#17110b] file:px-3 file:py-2 file:text-sm file:font-bold file:text-white" type="file" accept={accept} onChange={(event) => onChange(event.target.files?.[0] ?? null)} />
            <Error message={error} />
        </label>
    );
}

function Error({ message }) {
    return message ? <p className="mt-1 text-xs font-medium text-red-700">{message}</p> : null;
}

function Stat({ label, value }) {
    return (
        <div className="border border-neutral-200 bg-[#faf8f3] p-4">
            <p className="text-xs font-bold uppercase text-neutral-500">{label}</p>
            <p className="mt-2 text-2xl font-bold">{value}</p>
        </div>
    );
}

function EmptyState({ message }) {
    return <div className="border border-dashed border-neutral-300 p-5 text-sm font-semibold text-neutral-500">{message}</div>;
}

function formatPrice(value) {
    return new Intl.NumberFormat('fr-FR', {
        maximumFractionDigits: 0,
    }).format(value) + ' FCFA';
}
