import cn from '@/helpers/cn';
import type { PromotionState } from '../hooks/use-promotions';
import { PROMOTIONS_TONE, STATE_META } from '../promotion-meta';

export function StatePill({ state }: { state: PromotionState }) {
  const meta = STATE_META[state];
  return (
    <span
      className={cn(
        'shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold',
        PROMOTIONS_TONE[meta.tone],
      )}
    >
      {meta.label}
    </span>
  );
}
