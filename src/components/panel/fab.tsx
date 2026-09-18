import { PlusOutlined } from '@ant-design/icons';

interface FabProps {
  label: string;
  onClick: () => void;
}

/** Botón flotante de la acción principal. Solo en móvil, sobre la bottom-nav. */
export function Fab({ label, onClick }: FabProps) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="fixed right-4 z-30 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-2xl text-white shadow-lg shadow-brand-600/35 transition-transform active:scale-95 md:hidden"
      style={{ bottom: 'calc(5.5rem + env(safe-area-inset-bottom))' }}
    >
      <PlusOutlined />
    </button>
  );
}
