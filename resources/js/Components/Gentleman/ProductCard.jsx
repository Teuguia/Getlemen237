import { Link } from '@inertiajs/react';
import { formatPrice, productImage } from './brand';

export default function ProductCard({ product }) {
    return (
        <Link href={route('products.show', product.slug)} className="group block">
            <div className="relative aspect-[1.08/1] overflow-hidden rounded-sm bg-[#e8e2d7] sm:aspect-square">
                <img src={productImage(product)} alt={product.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                {product.discount_percentage && (
                    <span className="absolute right-0 top-0 bg-[#bb841f] px-2 py-1.5 text-xs font-bold text-white sm:px-3 sm:py-2">
                        -{product.discount_percentage}%
                    </span>
                )}
            </div>
            <div className="pt-2 sm:pt-3">
                <h3 className="text-[13px] font-semibold leading-tight text-[#16120d] sm:text-[15px]">{product.name}</h3>
                <div className="mt-1 flex flex-wrap items-baseline gap-1.5 sm:gap-2">
                    <span className={`text-[13px] sm:text-base ${product.discount_percentage ? 'font-bold text-[#c01818]' : 'font-bold text-[#16120d]'}`}>
                        {formatPrice(product.active_price_cents)}
                    </span>
                    {product.discount_percentage && (
                        <span className="text-xs text-neutral-500 line-through">{formatPrice(product.base_price_cents)}</span>
                    )}
                </div>
            </div>
        </Link>
    );
}
