import { Empty, Spin } from 'antd';
import type { ReactNode } from 'react';

interface AsyncListProps {
  isLoading: boolean;
  isError: boolean;
  isEmpty: boolean;
  emptyText?: string;
  children: ReactNode;
}

/** Maneja los estados carga/error/vacío de un listado de forma consistente. */
export function AsyncList({
  isLoading,
  isError,
  isEmpty,
  emptyText,
  children,
}: AsyncListProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spin />
      </div>
    );
  }

  if (isError) {
    return (
      <Empty
        className="py-16"
        description="No se pudo cargar la información"
      />
    );
  }

  if (isEmpty) {
    return <Empty className="py-16" description={emptyText ?? 'Sin registros'} />;
  }

  return <>{children}</>;
}
