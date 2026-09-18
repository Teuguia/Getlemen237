import { Link } from '@inertiajs/react';

export default function AuthBrand({ compact = false }) {
    return (
        <Link href={route('home')} className="inline-flex flex-col items-center text-[#d6a22a]">
            <div className={`${compact ? 'h-16 w-16' : 'h-20 w-20'} relative mb-2`}>
                <div className="absolute inset-x-5 top-1 h-12 bg-[#d6a22a] [clip-path:polygon(50%_0,100%_18%,72%_100%,50%_80%,28%_100%,0_18%)]" />
                <div className="absolute left-1/2 top-3 h-10 w-2 -translate-x-1/2 bg-[#0d0b08]" />
                <div className="absolute left-1/2 top-2 h-2 w-2 -translate-x-1/2 rounded-full bg-[#0d0b08]" />
            </div>
            <span className="font-serif text-2xl leading-none">237</span>
            <span className="font-serif text-4xl font-bold leading-none">GENTLEMAN</span>
            <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.22em]">Elegance & Originalite</span>
        </Link>
    );
}
