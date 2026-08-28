import { CloseCircleFilled, LinkOutlined, SearchOutlined } from '@ant-design/icons';
import { Avatar, Button, Input, Spin } from 'antd';
import { useEffect, useState } from 'react';

import { ServiceAvatar } from '@/components/panel/service-avatar';
import {
  brandLogoUrl,
  isBrandSearchEnabled,
  useBrandSearch,
  type BrandResult,
} from '../hooks/use-brand-search';

interface LogoPickerProps {
  // Inyectados por AntD Form.Item:
  value?: string;
  onChange?: (value?: string) => void;
  disabled?: boolean;
  name?: string;
}

export function LogoPicker({ value, onChange, disabled, name }: LogoPickerProps) {
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [manual, setManual] = useState(false);

  // Debounce de la búsqueda (300 ms).
  useEffect(() => {
    const id = setTimeout(() => setDebounced(query), 300);
    return () => clearTimeout(id);
  }, [query]);

  const { data: results, isFetching } = useBrandSearch(debounced);

  const select = (brand: BrandResult) => {
    onChange?.(brandLogoUrl(brand));
    setQuery('');
    setDebounced('');
  };

  // Logo ya seleccionado: muestra preview + opción de quitar.
  if (value) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-border p-2">
        <Avatar src={value} shape="square" size={40} />
        <span className="min-w-0 flex-1 truncate text-xs text-content-muted">{value}</span>
        <Button
          type="text"
          size="small"
          disabled={disabled}
          icon={<CloseCircleFilled />}
          onClick={() => onChange?.(undefined)}
        />
      </div>
    );
  }

  // Fallback: si no hay clientId o el usuario elige modo manual, input de URL.
  if (!isBrandSearchEnabled || manual) {
    return (
      <Input
        placeholder="https://... (URL del logo)"
        disabled={disabled}
        value={value}
        onChange={e => onChange?.(e.target.value || undefined)}
        suffix={
          isBrandSearchEnabled ? (
            <Button type="link" size="small" className="!px-0" onClick={() => setManual(false)}>
              Buscar
            </Button>
          ) : null
        }
      />
    );
  }

  return (
    <div>
      <Input
        prefix={<SearchOutlined className="text-content-subtle" />}
        placeholder={`Busca la marca${name ? ` (ej. ${name})` : ' (ej. Netflix)'}`}
        disabled={disabled}
        value={query}
        onChange={e => setQuery(e.target.value)}
        allowClear
        suffix={isFetching ? <Spin size="small" /> : undefined}
      />

      {debounced.trim().length >= 2 && (
        <div className="mt-1 max-h-56 overflow-y-auto rounded-lg border border-border">
          {results?.length ? (
            results.map(brand => (
              <button
                type="button"
                key={brand.brandId}
                onClick={() => select(brand)}
                className="flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-surface-hover"
              >
                <ServiceAvatar name={brand.name} iconUrl={brand.icon} size={28} />
                <span className="min-w-0">
                  <span className="block truncate text-sm text-content">{brand.name}</span>
                  <span className="block truncate text-xs text-content-subtle">
                    {brand.domain}
                  </span>
                </span>
              </button>
            ))
          ) : (
            <p className="px-3 py-3 text-sm text-content-muted">
              {isFetching ? 'Buscando…' : 'Sin resultados'}
            </p>
          )}
        </div>
      )}

      <Button
        type="link"
        size="small"
        icon={<LinkOutlined />}
        className="!mt-1 !px-0"
        onClick={() => setManual(true)}
      >
        O pegar una URL
      </Button>
    </div>
  );
}
