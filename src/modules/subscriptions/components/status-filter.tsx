import { DownOutlined, FilterFilled } from '@ant-design/icons';
import { Button, Checkbox, Dropdown } from 'antd';
import { useState } from 'react';

import cn from '@/helpers/cn';
import type { SubscriptionStatus } from '../hooks/use-subscriptions';
import { OPEN_STATUSES } from '../subscription-meta';

const GROUPS: { title: string; items: { value: SubscriptionStatus; label: string }[] }[] = [
  {
    title: 'Vigentes',
    items: [
      { value: 'expiring_soon', label: 'Por vencer' },
      { value: 'expired', label: 'Vencidas' },
      { value: 'active', label: 'Activas' },
      { value: 'paused', label: 'Pausadas' },
    ],
  },
  {
    title: 'Historial',
    items: [
      { value: 'cancelled', label: 'Canceladas' },
      { value: 'migrated', label: 'Cambiadas' },
    ],
  },
];

const isDefault = (value: SubscriptionStatus[]) =>
  value.length === OPEN_STATUSES.length && OPEN_STATUSES.every(s => value.includes(s));

interface Props {
  value: SubscriptionStatus[];
  onChange: (value: SubscriptionStatus[]) => void;
  counts: Record<SubscriptionStatus, number>;
}

/** Filtro de estados con casillas: vigentes marcadas por defecto. */
export function StatusFilter({ value, onChange, counts }: Props) {
  const [open, setOpen] = useState(false);
  const custom = !isDefault(value);

  const toggle = (status: SubscriptionStatus, checked: boolean) =>
    onChange(checked ? [...value, status] : value.filter(s => s !== status));

  return (
    <Dropdown
      trigger={['click']}
      open={open}
      onOpenChange={setOpen}
      popupRender={() => (
        <div className="min-w-56 rounded-xl border border-border bg-surface p-1.5 shadow-lg">
          {GROUPS.map((group, i) => (
            <div key={group.title}>
              {i > 0 && <div className="mx-1.5 my-1 h-px bg-border" />}
              <p className="px-2.5 pt-1.5 pb-0.5 text-[10.5px] font-bold tracking-wider text-content-subtle uppercase">
                {group.title}
              </p>
              {group.items.map(item => (
                <label
                  key={item.value}
                  className="flex cursor-pointer items-center justify-between gap-4 rounded-lg px-2.5 py-2 text-sm text-content hover:bg-surface-hover"
                >
                  <Checkbox
                    checked={value.includes(item.value)}
                    onChange={e => toggle(item.value, e.target.checked)}
                  >
                    {item.label}
                  </Checkbox>
                  <span className="text-content-subtle tabular-nums">{counts[item.value]}</span>
                </label>
              ))}
            </div>
          ))}
          <div className="mx-1.5 my-1 h-px bg-border" />
          <button
            type="button"
            disabled={!custom}
            onClick={() => onChange(OPEN_STATUSES)}
            className="w-full rounded-lg px-2.5 py-2 text-left text-sm text-content hover:bg-surface-hover disabled:cursor-default disabled:text-content-subtle disabled:hover:bg-transparent"
          >
            Restablecer (solo vigentes)
          </button>
        </div>
      )}
    >
      <Button
        size="large"
        icon={<FilterFilled />}
        className={cn('shrink-0', custom && '!border-brand-500 !text-brand-ink')}
      >
        Estado{custom && ` · ${value.length}`}
        <DownOutlined className="!text-xs" />
      </Button>
    </Dropdown>
  );
}
