import { APP_NAME } from '@/config';
import cn from '@/helpers/cn';

/** Isotipo: una "P" con un punto que marca el cupo asignado, sobre el indigo de marca. */
export function BrandMark({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn('flex shrink-0 items-center justify-center bg-brand-600', className)}
      style={{ width: size, height: size, borderRadius: Math.round(size * 0.3) }}
    >
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
        <path
          d="M23 50V15h12a10.5 10.5 0 0 1 0 21H23"
          stroke="#ffffff"
          strokeWidth={8.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx={36} cy={25.5} r={3.6} fill="#a5b4fc" />
      </svg>
    </span>
  );
}

/** Isotipo + nombre del producto. */
export function BrandLogo({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <span className={cn('flex items-center gap-2.5', className)}>
      <BrandMark size={size} />
      <span
        className="font-black tracking-tight text-brand-ink"
        style={{ fontSize: Math.round(size * 0.62) }}
      >
        {APP_NAME}
      </span>
    </span>
  );
}
