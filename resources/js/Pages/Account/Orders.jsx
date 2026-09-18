import BrandHeader from '@/Components/Gentleman/BrandHeader';
import { formatPrice } from '@/Components/Gentleman/brand';
import { Head, Link, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';

const statusClasses = {
    preparing: 'bg-amber-100 text-amber-800',
    confirmed: 'bg-amber-100 text-amber-800',
    delivered: 'bg-emerald-100 text-emerald-800',
    delivering: 'bg-sky-100 text-sky-800',
    pending_payment: 'bg-neutral-100 text-neutral-700',
    pending: 'bg-neutral-100 text-neutral-700',
};

const statusLabels = {
    preparing: 'En preparation',
    confirmed: 'Confirmee',
    delivered: 'Livree',
    delivering: 'En livraison',
    pending_payment: 'En attente',
    pending: 'En attente',
};

const orderTabs = ['Toutes', 'En attente', 'En preparation', 'Livrees'];
const accountItems = ['Mes commandes', 'Mes adresses', 'Mes informations', 'Mes favoris', 'Changer mon mot de passe'];

export default function Orders({ auth, orders = [] }) {
    const { props } = usePage();
    const [activeTab, setActiveTab] = useState('Toutes');
    const [activePanel, setActivePanel] = useState('Mes commandes');
    const [expandedOrder, setExpandedOrder] = useState(null);

    const filteredOrders = useMemo(() => {
        if (activeTab === 'En attente') return orders.filter((order) => ['pending', 'pending_payment', 'confirmed'].includes(order.status));
        if (activeTab === 'En preparation') return orders.filter((order) => order.status === 'preparing');
        if (activeTab === 'Livrees') return orders.filter((order) => order.status === 'delivered');
        return orders;
    }, [orders, activeTab]);

    return (
        <>
            <Head title="Mes commandes" />
            <main className="min-h-screen bg-white text-[#17110b]">
                <BrandHeader auth={auth} />

                <section className="mx-auto grid max-w-7xl grid-cols-1 lg:grid-cols-[260px_1fr]">
                    <aside className="bg-[#111] px-5 pb-0 pt-6 text-sm text-white lg:bg-[#f2eee6] lg:px-7 lg:py-8 lg:text-[#17110b]">
                        <h2 className="mb-4 text-lg text-white lg:text-base lg:text-[#17110b]">Mon compte</h2>
                        <div className="mb-5 flex items-center gap-3 lg:hidden">
                            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#111]">U</span>
                            <div>
                                <p className="font-semibold">{auth.user.name}</p>
                                <p className="text-xs text-white/70">{auth.user.email}</p>
                            </div>
                        </div>
                        <div className="-mx-5 bg-white text-[#17110b] lg:-mx-7 lg:bg-transparent">
                            {accountItems.map((item) => (
                                <button key={item} type="button" onClick={() => setActivePanel(item)} className={`block w-full border-b border-neutral-200 px-5 py-4 text-left lg:px-7 ${activePanel === item ? 'bg-[#c99524] font-bold text-black' : ''}`}>
                                    {item}
                                </button>
                            ))}
                            <Link href={route('logout')} method="post" as="button" className="block w-full border-b border-neutral-200 px-5 py-4 text-left lg:px-7">
                                Deconnexion
                            </Link>
                        </div>
                    </aside>

                    <div className="px-5 py-7 lg:px-7 lg:py-8">
                        <h1 className="text-2xl font-bold lg:font-serif lg:text-3xl lg:font-semibold">{activePanel}</h1>

                        {props.flash?.success && (
                            <div className="mt-4 rounded border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">
                                {props.flash.success}
                            </div>
                        )}

                        {activePanel === 'Mes commandes' ? (
                            <>
                                <div className="mt-5 flex gap-7 border-b border-neutral-200 text-sm lg:hidden">
                                    {orderTabs.map((tab) => (
                                        <button key={tab} type="button" onClick={() => setActiveTab(tab)} className={`pb-3 ${activeTab === tab ? 'border-b-2 border-[#c99524]' : ''}`}>
                                            {tab}
                                        </button>
                                    ))}
                                </div>
                                <div className="mt-5 overflow-x-auto lg:mt-7">
                                    <table className="min-w-full text-sm">
                                        <thead className="hidden bg-[#f4f1eb] text-left sm:table-header-group">
                                            <tr>
                                                <th className="px-5 py-4">N commande</th>
                                                <th className="px-5 py-4">Date</th>
                                                <th className="px-5 py-4">Montant</th>
                                                <th className="px-5 py-4">Statut</th>
                                                <th className="px-5 py-4">Details</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-neutral-200">
                                            {filteredOrders.map((order) => (
                                                <tr key={order.order_number}>
                                                    <td className="px-5 py-4">
                                                        <span className="font-semibold">{order.order_number}</span>
                                                        {order.type === 'reservation' && <span className="ml-2 text-xs text-[#b27b18]">Reservation</span>}
                                                        {expandedOrder === order.order_number && (
                                                            <p className="mt-2 text-xs text-neutral-500">
                                                                {order.type === 'reservation' ? 'Reservation enregistree en boutique.' : 'Commande en cours de traitement par la boutique.'}
                                                            </p>
                                                        )}
                                                    </td>
                                                    <td className="px-5 py-4">{order.date}</td>
                                                    <td className="px-5 py-4">
                                                        {order.type === 'reservation' ? `${order.quantity} article(s)` : formatPrice(order.total_cents)}
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <span className={`px-3 py-1 text-xs font-semibold ${statusClasses[order.status] ?? statusClasses.pending_payment}`}>
                                                            {statusLabels[order.status] ?? order.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <button type="button" onClick={() => setExpandedOrder(expandedOrder === order.order_number ? null : order.order_number)} className="font-semibold text-[#b27b18] underline">
                                                            Voir
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {filteredOrders.length === 0 && (
                                                <tr>
                                                    <td colSpan="5" className="px-5 py-8 text-center text-neutral-500">
                                                        Aucune commande ou reservation dans cette section.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        ) : (
                            <AccountPlaceholder panel={activePanel} />
                        )}
                    </div>
                </section>
            </main>
        </>
    );
}

function AccountPlaceholder({ panel }) {
    const messages = {
        'Mes adresses': 'La gestion des adresses sera reliee a vos prochaines commandes.',
        'Mes informations': 'Vos informations de compte sont utilisees automatiquement lors du passage de commande.',
        'Mes favoris': 'Les favoris seront disponibles lorsque la selection personnelle sera activee.',
        'Changer mon mot de passe': 'Le changement de mot de passe est disponible depuis la page profil securisee.',
    };

    return (
        <div className="mt-6 rounded border border-neutral-200 bg-[#faf8f3] p-6 text-sm text-neutral-600">
            {messages[panel] ?? 'Cette section sera disponible prochainement.'}
        </div>
    );
}
