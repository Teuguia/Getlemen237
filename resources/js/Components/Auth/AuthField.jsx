import InputError from '@/Components/InputError';

export default function AuthField({ label, error, ...props }) {
    return (
        <label className="block rounded bg-white/95 p-3 text-xs font-bold text-[#17110b] shadow-sm">
            {label}
            <input
                {...props}
                className="mt-2 h-10 w-full rounded border border-neutral-300 bg-white px-3 text-sm font-normal text-[#17110b] placeholder:text-neutral-400 focus:border-[#c99524] focus:ring-[#c99524]"
            />
            <InputError message={error} className="mt-2" />
        </label>
    );
}
