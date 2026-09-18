export const formatPrice = (amount) =>
    `${Math.round((amount ?? 0) / 100).toLocaleString('fr-FR')} FCFA`;

export const productImage = (product) =>
    product?.primary_image ??
    'https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=900&q=80';

export const categoryImages = {
    chaussures:
        'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=700&q=80',
    chemises:
        'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=700&q=80',
    pantalons:
        'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=700&q=80',
    accessoires:
        'https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=700&q=80',
    parfums:
        'https://images.unsplash.com/photo-1619994403073-2cec844b8e63?auto=format&fit=crop&w=700&q=80',
    costumes:
        'https://images.unsplash.com/photo-1593032465175-481ac7f401a0?auto=format&fit=crop&w=700&q=80',
};

export const fallbackCategories = [
    { name: 'Chaussures', slug: 'chaussures' },
    { name: 'Chemises', slug: 'chemises' },
    { name: 'Pantalons', slug: 'pantalons' },
    { name: 'Accessoires', slug: 'accessoires' },
    { name: 'Parfums', slug: 'parfums' },
];
