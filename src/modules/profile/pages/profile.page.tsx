import {
  CrownOutlined,
  LogoutOutlined,
  PlayCircleOutlined,
  RightOutlined,
  WhatsAppOutlined,
} from '@ant-design/icons';
import { App, Button, Form, Input, Segmented, Skeleton, Tabs } from 'antd';
import { useEffect, type ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { PageHeader } from '@/components/panel/page-header';
import { PhoneInput } from '@/components/phone-input';
import { UserAvatar } from '@/components/panel/user-avatar';
import type { ThemeMode } from '@/context/theme/theme-context.interfaces';
import cn from '@/helpers/cn';
import { dueLabel, formatDate } from '@/helpers/dates';
import { PHONE_RULES } from '@/helpers/phone';
import { HOW_TO_ROUTE, PLATFORM_ADMIN_ROUTE } from '@/routes/routes';
import { withErrorBoundary } from '@/hoc/with-error-boundary';
import { useAbility } from '@/hooks/use-ability';
import { useAuth } from '@/hooks/use-auth';
import { useFormErrorHandler } from '@/hooks/use-form-error-handler';
import { useTheme } from '@/hooks/use-theme';
import {
  BILLING_CYCLE_LABEL,
  PLAN_LABEL,
  useMyOrganization,
  useUpdateMyOrganization,
} from '@/modules/organization/hooks/use-my-organization';
import { useSalesWhatsapp } from '@/modules/organization/hooks/use-sales-whatsapp';
import { planHealth } from '@/modules/organization/plan-status';
import { ActionsEnum } from '@/types/actions.enum';
import { SubjectsEnum } from '@/types/subjects.enum';
import { PaymentsTab } from '../components/payments-tab';
import { useMe, useUpdateProfile, type ProfileBody } from '../hooks/use-profile';

interface FormValues extends ProfileBody {
  businessName?: string;
}

// A partir de este uso se sugiere mejorar el plan.
const NEAR_LIMIT = 0.8;

function ProfilePageComponent() {
  const { message } = App.useApp();
  const { updateLoggedUser, logout } = useAuth();
  const salesWhatsapp = useSalesWhatsapp();
  const ability = useAbility();
  // La pestaña va en la URL (?tab=pagos) para poder enlazarla.
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') === 'pagos' ? 'pagos' : 'perfil';
  const { mode, setMode } = useTheme();
  const [invalidateForm, form] = useFormErrorHandler();

  const { data: me, isLoading } = useMe();
  const { data: org, isLoading: loadingOrg } = useMyOrganization();
  const { mutateAsync: updateProfile, isPending: savingProfile } = useUpdateProfile(updated =>
    updateLoggedUser?.(updated),
  );
  const { mutateAsync: updateOrg, isPending: savingOrg } = useUpdateMyOrganization();

  // El formulario se monta cuando ambos cargaron; recién ahí se llena.
  useEffect(() => {
    if (!me || !org) return;
    form.setFieldsValue({
      businessName: org.name,
      firstName: me.profile?.firstName,
      lastName: me.profile?.lastName,
      phone: me.phone,
    });
  }, [me, org, form]);

  const onFinish = async (values: FormValues) => {
    try {
      await updateProfile({
        firstName: values.firstName || undefined,
        lastName: values.lastName || undefined,
        phone: values.phone || undefined,
      });
      if (values.businessName && values.businessName !== org?.name) {
        await updateOrg({ name: values.businessName });
      }
      message.success('Cambios guardados');
    } catch (error) {
      invalidateForm(error as Parameters<typeof invalidateForm>[0]);
    }
  };

  const max = org?.limits.maxCustomers ?? -1;
  const used = org?.usage.customers ?? 0;
  const ratio = max > 0 ? used / max : 0;
  const nearLimit = max > 0 && ratio >= NEAR_LIMIT;
  const plan = org ? planHealth(org) : undefined;
  const isPaid = Boolean(org && org.plan !== 'free');
  // Free: siempre se ofrece mejorar. De pago: renovar, salvo que no venza
  // (cortesía sin fecha), donde no hay nada que renovar.
  const salesLink = !org
    ? undefined
    : !isPaid
      ? { label: 'Mejorar plan', url: salesWhatsapp('upgrade') }
      : org.planValidUntil
        ? { label: 'Renovar', url: salesWhatsapp('renew') }
        : undefined;
  const fullName = [me?.profile?.firstName, me?.profile?.lastName].filter(Boolean).join(' ');

  const section = (title: string, children: ReactNode) => (
    <section className="flex flex-col gap-2">
      <h2 className="text-[11px] font-semibold tracking-wider text-content-subtle uppercase">
        {title}
      </h2>
      <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">{children}</div>
    </section>
  );

  if (isLoading || loadingOrg) {
    return <Skeleton active avatar paragraph={{ rows: 6 }} />;
  }

  return (
    <div className="flex max-w-xl flex-col gap-5">
      <PageHeader title="Mi cuenta" />

      <div className="-mt-2 flex items-center gap-3.5">
        <UserAvatar size={60} />
        <div className="min-w-0">
          <p className="truncate text-lg font-bold tracking-tight text-content">
            {fullName || me?.email}
          </p>
          <p className="truncate text-sm text-content-muted">
            {[org?.name, me?.email].filter(Boolean).join(' · ')}
          </p>
        </div>
      </div>

      {org && (
        <div className="flex flex-col gap-2.5 rounded-xl border border-border bg-surface p-4 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <span className="rounded-md bg-surface-hover px-2 py-0.5 text-[11px] font-bold tracking-wide text-content-muted uppercase">
              Plan {PLAN_LABEL[org.plan]}
            </span>
            {salesLink?.url && (
              <Button
                type="link"
                size="small"
                icon={<WhatsAppOutlined />}
                href={salesLink.url}
                target="_blank"
                className="!px-0 !font-semibold"
              >
                {salesLink.label}
              </Button>
            )}
          </div>
          {isPaid && (
            <p
              className={cn(
                'text-xs',
                plan?.health === 'expiring' && 'font-semibold text-warning',
                (plan?.health === 'grace' || plan?.health === 'expired') &&
                  'font-semibold text-danger',
                plan?.health === 'active' && 'text-content-muted',
              )}
            >
              {BILLING_CYCLE_LABEL[org.billingCycle]}
              {org.planValidUntil
                ? ` · ${
                    plan?.days !== undefined && plan.days < 0
                      ? `Venció el ${formatDate(org.planValidUntil, 'D MMM YYYY')}`
                      : `${dueLabel(plan?.days ?? 0)} (${formatDate(org.planValidUntil, 'D MMM YYYY')})`
                  }`
                : ' · Sin vencimiento'}
              {plan?.health === 'expired' && ' · Ahora con límites de Free'}
            </p>
          )}
          {max > 0 ? (
            <>
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-semibold text-content">
                  {used} de {max} clientes
                </span>
                <span
                  className={cn(
                    'text-xs font-semibold',
                    nearLimit ? 'text-warning' : 'text-content-muted',
                  )}
                >
                  {used >= max ? 'Límite alcanzado' : `Quedan ${max - used}`}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-surface-hover">
                <div
                  className={cn('h-full', nearLimit ? 'bg-warning' : 'bg-brand-500')}
                  style={{ width: `${Math.min(100, ratio * 100)}%` }}
                />
              </div>
            </>
          ) : (
            <span className="text-sm font-semibold text-content">{used} clientes · sin límite</span>
          )}
          <p className="text-xs text-content-muted">
            Comprobantes de cobro este mes: {org.usage.receipts ?? 0} de{' '}
            {org.limits.maxReceiptsPerMonth}
          </p>
        </div>
      )}

      <Tabs
        activeKey={tab}
        onChange={key => setParams(key === 'pagos' ? { tab: 'pagos' } : {}, { replace: true })}
        items={[
          {
            key: 'perfil',
            label: 'Perfil',
            // Siempre montada: el formulario se llena aunque se entre por ?tab=pagos.
            forceRender: true,
            children: (
              <div className="flex flex-col gap-5">
                {section(
                  'Tu negocio y perfil',
                  <Form
                    layout="vertical"
                    form={form}
                    onFinish={onFinish}
                    disabled={savingProfile || savingOrg}
                    requiredMark={false}
                  >
                    <Form.Item
                      label="Nombre del negocio"
                      name="businessName"
                      rules={[{ required: true, whitespace: true }]}
                    >
                      <Input size="large" placeholder="Nombre de tu negocio" maxLength={80} />
                    </Form.Item>
                    <div className="grid grid-cols-1 gap-x-3 sm:grid-cols-2">
                      <Form.Item label="Nombre" name="firstName">
                        <Input size="large" placeholder="Tu nombre" />
                      </Form.Item>
                      <Form.Item label="Apellido" name="lastName">
                        <Input size="large" placeholder="Tu apellido" />
                      </Form.Item>
                    </div>
                    <Form.Item label="WhatsApp" name="phone" rules={PHONE_RULES}>
                      <PhoneInput size="large" placeholder="987 654 321" />
                    </Form.Item>
                    <Form.Item label="Correo" className="!mb-5">
                      <Input size="large" value={me?.email} disabled />
                    </Form.Item>
                    <Button
                      type="primary"
                      size="large"
                      htmlType="submit"
                      loading={savingProfile || savingOrg}
                      block
                    >
                      Guardar cambios
                    </Button>
                  </Form>,
                )}

                {section(
                  'Preferencias',
                  <div className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-content">Tema</span>
                    <Segmented<ThemeMode>
                      block
                      value={mode}
                      onChange={setMode}
                      options={[
                        { label: 'Sistema', value: 'system' },
                        { label: 'Claro', value: 'light' },
                        { label: 'Oscuro', value: 'dark' },
                      ]}
                    />
                  </div>,
                )}

                {ability.can(ActionsEnum.manage, SubjectsEnum.Platform) &&
                  section(
                    'Plataforma',
                    <Link to={PLATFORM_ADMIN_ROUTE} className="-m-4 flex items-center gap-3 p-4">
                      <CrownOutlined className="text-xl !text-brand-ink" />
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-content">
                          Administración
                        </span>
                        <span className="block text-xs text-content-muted">
                          Negocios registrados, planes y pagos
                        </span>
                      </span>
                      <RightOutlined className="text-xs !text-content-subtle" />
                    </Link>,
                  )}

                {section(
                  'Ayuda',
                  <Link to={HOW_TO_ROUTE} className="-m-4 flex items-center gap-3 p-4">
                    <PlayCircleOutlined className="text-xl !text-brand-ink" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-content">Cómo usarlo</span>
                      <span className="block text-xs text-content-muted">
                        Tutoriales cortos para dar tus primeros pasos
                      </span>
                    </span>
                    <RightOutlined className="text-xs !text-content-subtle" />
                  </Link>,
                )}

                <Button
                  danger
                  size="large"
                  icon={<LogoutOutlined />}
                  onClick={() => logout?.()}
                  block
                >
                  Cerrar sesión
                </Button>
              </div>
            ),
          },
          { key: 'pagos', label: 'Pagos', children: <PaymentsTab /> },
        ]}
      />
    </div>
  );
}

export const ProfilePage = withErrorBoundary(ProfilePageComponent);
