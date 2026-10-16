import cn from '@/helpers/cn';
import type { PaymentMethod } from '../hooks/use-subscriptions';
import { PAYMENT_METHOD_OPTIONS } from '../subscription-meta';

// Chips de método de pago, controlados por Form.Item (value/onChange).
export function MethodChips({
  value,
  onChange,
}: {
  value?: PaymentMethod;
  onChange?: (value: PaymentMethod) => void;
}) {
  return (
    <div role="radiogroup" className="flex flex-wrap gap-2">
      {PAYMENT_METHOD_OPTIONS.map(option => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange?.(option.value)}
            className={cn(
              'h-10 rounded-lg px-3.5 text-sm font-semibold transition-colors',
              selected
                ? 'border-[1.5px] border-brand-500 bg-brand-50 text-brand-ink dark:bg-brand-400/15'
                : 'border border-border bg-surface text-content',
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
