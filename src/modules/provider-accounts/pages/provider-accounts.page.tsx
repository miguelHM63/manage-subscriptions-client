import { DeleteOutlined, EditOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { App, Button, type MenuProps } from 'antd';
import { useCallback, useMemo, useState } from 'react';

import { Fab } from '@/components/panel/fab';
import { LoadError } from '@/components/panel/load-error';
import { PageHeader } from '@/components/panel/page-header';
import { withErrorBoundary } from '@/hoc/with-error-boundary';
import { useOpenFromQuery } from '@/hooks/use-open-from-query';
import { useServices } from '@/modules/services/hooks/use-services';
import { SubscriptionFormModal } from '@/modules/subscriptions/components/subscription-form-modal';
import {
  accountTotals,
  useDeleteProviderAccount,
  useProviderAccounts,
  type IProviderAccount,
} from '../hooks/use-provider-accounts';
import { ProviderAccountFormModal } from '../components/provider-account-form-modal';
import { CredentialsModal } from '../components/credentials-modal';
import { RenewProviderAccountModal } from '../components/renew-provider-account-modal';
import {
  ProviderAccountsEmptyState,
  ProviderAccountsMobileList,
  ProviderAccountsTable,
  type ProviderAccountsListProps,
} from '../components/provider-accounts-list';

function ProviderAccountsPageComponent() {
  const { modal } = App.useApp();
  const { data: accounts, isLoading, isError, refetch, isRefetching } = useProviderAccounts();
  const { data: services } = useServices();
  const { mutate: deleteAccount } = useDeleteProviderAccount();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<IProviderAccount | null>(null);
  const [credentialsId, setCredentialsId] = useState<string | null>(null);
  const [renewing, setRenewing] = useState<IProviderAccount | null>(null);
  const [sellFrom, setSellFrom] = useState<{ serviceId: string; providerAccountId: string } | null>(null);

  const serviceById = useMemo(() => {
    const map = new Map(services?.map(s => [s.id, s]));
    return (id: string) => map.get(id);
  }, [services]);

  const openCreate = useCallback(() => {
    setEditing(null);
    setFormOpen(true);
  }, []);
  useOpenFromQuery(openCreate);

  const openEdit = (account: IProviderAccount) => {
    setEditing(account);
    setFormOpen(true);
  };

  const confirmDelete = (account: IProviderAccount) => {
    modal.confirm({
      title: 'Eliminar cuenta de proveedor',
      content: 'Solo puedes eliminarla si no tiene suscripciones activas.',
      okText: 'Eliminar',
      okButtonProps: { danger: true },
      cancelText: 'Cancelar',
      onOk: () => deleteAccount(account.id),
    });
  };

  const sell = (account: IProviderAccount) =>
    setSellFrom({ serviceId: account.serviceId, providerAccountId: account.id });

  const menuFor = (account: IProviderAccount): MenuProps => ({
    items: [
      { key: 'renew', label: 'Renovar', icon: <ReloadOutlined /> },
      { key: 'edit', label: 'Editar', icon: <EditOutlined /> },
      { key: 'delete', label: 'Eliminar', icon: <DeleteOutlined />, danger: true },
    ],
    onClick: ({ key }) => {
      if (key === 'renew') setRenewing(account);
      else if (key === 'edit') openEdit(account);
      else confirmDelete(account);
    },
  });

  const list = accounts ?? [];
  const totals = accountTotals(list);

  const hasAny = list.length > 0;

  const renderContent = () => {
    if (isError) {
      return <LoadError what="tus cuentas" onRetry={() => refetch()} retrying={isRefetching} />;
    }
    if (!isLoading && !hasAny) {
      return <ProviderAccountsEmptyState onCreate={openCreate} />;
    }

    const listProps: ProviderAccountsListProps = {
      accounts: list,
      serviceById,
      loading: isLoading,
      onSell: sell,
      onCredentials: account => setCredentialsId(account.id),
      menuFor,
    };
    return (
      <>
        {/* Móvil: tarjetas */}
        <div className="flex flex-col gap-3 md:hidden">
          <ProviderAccountsMobileList {...listProps} />
        </div>

        {/* Escritorio: tabla */}
        <div className="hidden md:block">
          <ProviderAccountsTable {...listProps} />
        </div>
      </>
    );
  };

  return (
    <>
      <PageHeader
        title="Mis cuentas"
        subtitle={hasAny ? `${totals.free} cupos libres para vender` : 'Las cuentas que compras y sus cupos'}
        action={
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate} className="!hidden md:!inline-flex">
            Nueva cuenta
          </Button>
        }
      />

      {renderContent()}

      {hasAny && <Fab label="Nueva cuenta" onClick={openCreate} />}

      <ProviderAccountFormModal open={formOpen} onClose={() => setFormOpen(false)} account={editing} />
      <RenewProviderAccountModal account={renewing} open={Boolean(renewing)} onClose={() => setRenewing(null)} />
      <CredentialsModal
        accountId={credentialsId}
        open={Boolean(credentialsId)}
        onClose={() => setCredentialsId(null)}
      />
      <SubscriptionFormModal
        open={Boolean(sellFrom)}
        onClose={() => setSellFrom(null)}
        preset={sellFrom ?? undefined}
      />
    </>
  );
}

export const ProviderAccountsPage = withErrorBoundary(ProviderAccountsPageComponent);
