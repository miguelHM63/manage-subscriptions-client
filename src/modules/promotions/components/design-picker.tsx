import cn from '@/helpers/cn';
import type { PromotionDesign } from '../hooks/use-promotions';
import { DESIGN_OPTIONS } from '../promotion-meta';

/** Miniatura de cada diseño, solo para reconocerlo de un vistazo. */
function Thumb({ design }: { design: PromotionDesign }) {
  if (design === 'coupon') {
    return (
      <div className="absolute inset-0 bg-[#0c0a14]">
        <div className="h-2 bg-yellow-400" />
        <div className="mx-2 mt-2 h-2.5 w-12 rounded-sm bg-stone-100" />
        <div className="mx-1.5 mt-2.5 flex h-7 overflow-hidden rounded-md bg-white">
          <div className="w-5 bg-yellow-400" />
        </div>
        <div className="mx-1.5 mt-1.5 flex h-7 overflow-hidden rounded-md bg-white">
          <div className="w-5 bg-red-500" />
        </div>
      </div>
    );
  }
  if (design === 'stories') {
    return (
      <div className="absolute inset-0 bg-[linear-gradient(165deg,#450a0a,#b91c1c_45%,#6d28d9)] p-1.5">
        <div className="flex gap-0.5">
          <div className="h-0.5 flex-1 bg-white" />
          <div className="h-0.5 flex-1 bg-white/40" />
          <div className="h-0.5 flex-1 bg-white/40" />
        </div>
        <div className="mt-4 h-6 w-6 rounded-md border border-white/70 bg-red-500" />
        <div className="mt-2 h-2.5 w-14 rounded-sm bg-white" />
        <div className="absolute inset-x-1.5 bottom-1.5 h-3 rounded bg-white" />
      </div>
    );
  }
  return (
    <div className="absolute inset-0 bg-violet-50">
      <div className="h-12 bg-[linear-gradient(135deg,#1e1b4b,#7c3aed_60%,#db2777)] p-1.5">
        <div className="h-1.5 w-8 rounded bg-yellow-300" />
        <div className="mt-1.5 h-2 w-12 rounded-sm bg-white" />
      </div>
      <div className="mx-1.5 -mt-2 h-7 rounded-md border-[1.5px] border-purple-400 bg-white shadow" />
      <div className="mx-1.5 mt-1 h-5 rounded-md bg-white shadow-sm" />
    </div>
  );
}

interface DesignPickerProps {
  value: PromotionDesign;
  onChange: (design: PromotionDesign) => void;
}

/** Elige cómo se ve el link público. */
export function DesignPicker({ value, onChange }: DesignPickerProps) {
  return (
    <div role="radiogroup" aria-label="Diseño del link" className="grid grid-cols-3 gap-2.5">
      {DESIGN_OPTIONS.map(option => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.value)}
            className={cn(
              'rounded-xl border bg-surface p-1.5 pb-2.5 text-left transition-shadow',
              selected
                ? 'border-2 border-brand-500 p-[5px] pb-[9px] ring-3 ring-brand-500/15'
                : 'border-border',
            )}
          >
            <span className="relative block h-28 overflow-hidden rounded-lg">
              <Thumb design={option.value} />
            </span>
            <span className="mt-1.5 block text-[13px] font-semibold text-content">
              {option.label}
            </span>
            <span className="block text-[11.5px] text-content-muted">{option.hint}</span>
          </button>
        );
      })}
    </div>
  );
}
