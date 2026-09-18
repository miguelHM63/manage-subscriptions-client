import cn from '@/helpers/cn';

/** Isotipo de Plancito: renovación + check, sobre el indigo de marca. */
export function BrandMark({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn('flex shrink-0 items-center justify-center bg-brand-600', className)}
      style={{ width: size, height: size, borderRadius: Math.round(size * 0.3) }}
    >
      <svg
        width={Math.round(size * 0.55)}
        height={Math.round(size * 0.55)}
        viewBox="0 0 24 24"
        fill="none"
        stroke="#ffffff"
        strokeWidth={2.3}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.5 12a8.5 8.5 0 1 1-2.5-6" />
        <path d="M20.5 3.5V9H15" />
        <path d="m9 12 2.2 2.2L15.5 10" />
      </svg>
    </span>
  );
}

/** Isotipo + "Plancito". */
export function BrandLogo({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <span className={cn('flex items-center gap-2.5', className)}>
      <BrandMark size={size} />
      <span
        className="font-black tracking-tight text-brand-ink"
        style={{ fontSize: Math.round(size * 0.62) }}
      >
        Plancito
      </span>
    </span>
  );
}
