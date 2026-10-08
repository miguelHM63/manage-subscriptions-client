import { ServiceAvatar } from '@/components/panel/service-avatar';
import cn from '@/helpers/cn';
import type { PublicPromotionItem } from './public-promotion.types';

interface ServiceStackProps {
  item: PublicPromotionItem;
  size: number;
  /** Color del borde que separa los logos superpuestos. */
  ring?: string;
  className?: string;
}

/** Logo del servicio; en un paquete, los logos superpuestos en diagonal. */
export function ServiceStack({ item, size, ring = '#fff', className }: ServiceStackProps) {
  const [first, second] = item.services;
  if (!second) {
    return (
      <span className={cn('shrink-0', className)}>
        <ServiceAvatar name={first?.name ?? ''} iconUrl={first?.iconUrl} size={size} />
      </span>
    );
  }
  const small = Math.round(size * 0.72);
  return (
    <span className={cn('relative shrink-0', className)} style={{ width: size, height: size }}>
      <span className="absolute top-0 left-0">
        <ServiceAvatar name={first.name} iconUrl={first.iconUrl} size={small} />
      </span>
      <span
        className="absolute right-0 bottom-0 rounded-[9px]"
        style={{ boxShadow: `0 0 0 3px ${ring}` }}
      >
        <ServiceAvatar name={second.name} iconUrl={second.iconUrl} size={small} />
      </span>
    </span>
  );
}
