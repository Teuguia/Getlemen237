export default function AuthSeparator({ children }) {
    return (
        <div className="my-6 grid grid-cols-[1fr_auto_1fr] items-center gap-4 text-xs text-white/80">
            <span className="h-px bg-white/30" />
            <span>{children}</span>
            <span className="h-px bg-white/30" />
        </div>
    );
}
