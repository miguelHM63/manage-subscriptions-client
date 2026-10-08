import { PlusOutlined, TagOutlined } from '@ant-design/icons';
import { Alert, Button, DatePicker, Form, Input, InputNumber, Segmented, Select } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import { useEffect, useMemo, useState } from 'react';

import { ResponsiveModal } from '@/components/panel/responsive-modal';
import { PhoneInput } from '@/components/phone-input';
import { REQUIRED } from '@/constants';
import { ServiceAvatar } from '@/components/panel/service-avatar';
import { solesToCents } from '@/helpers/money';
import { formatPhone, isPhoneOk } from '@/helpers/phone';
import { useFormErrorHandler } from '@/hooks/use-form-error-handler';
import { useCreateCustomer, useCustomers } from '@/modules/customers/hooks/use-customers';
import { useServices } from '@/modules/services/hooks/use-services';
import { useProviderAccounts } from '@/modules/provider-accounts/hooks/use-provider-accounts';
import { PromoSaleSummary } from '@/modules/promotions/components/promo-sale-summary';
import {
  usePromotionSale,
  usePromotions,
  useSellPromotion,
} from '@/modules/promotions/hooks/use-promotions';
import { promoImpacts } from '@/modules/promotions/promotion-meta';
import { useCreateSubscription, type CreateSubscriptionBody } from '../hooks/use-subscriptions';
import { DURATION_OPTIONS } from '../subscription-meta';

interface FormValues {
  customerId: string;
  serviceId: string;
  providerAccountId: string;
  durationMonths: number;
  price: number;
  startDate?: Dayjs;
  /** Venta con código: cuenta de proveedor por servicio del ítem. */
  promoAccounts?: Record<string, string>;
}

interface Props {
  open: boolean;
  onClose: () => void;
  /** Valores precargados (cliente desde su detalle, cuenta desde "Vender cupo"). */
  preset?: Partial<Pick<FormValues, 'customerId' | 'serviceId' | 'providerAccountId'>>;
}

export function SubscriptionFormModal({ open, onClose, preset }: Props) {
  const [invalidateForm, form] = useFormErrorHandler();
  const { data: customers } = useCustomers();
  const { data: services } = useServices();
  const { data: accounts } = useProviderAccounts();

  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState<string>();
  const [fullAccount, setFullAccount] = useState(false);
  // "Otro" en duración: muestra el campo libre de meses.
  const [customDuration, setCustomDuration] = useState(false);
  // Código de promo: lo que se escribe y el que se aplicó (consulta la api).
  const [promoInput, setPromoInput] = useState('');
  const [promoCode, setPromoCode] = useState('');

  // El estado local se limpia al cerrar (en el handler, no en un efecto), así
  // la próxima apertura empieza de cero.
  const handleClose = () => {
    setShowNewCustomer(false);
    setNewCustomerName('');
    setNewCustomerPhone(undefined);
    setFullAccount(false);
    setCustomDuration(false);
    setPromoInput('');
    setPromoCode('');
    onClose();
  };

  const { mutate: create, isPending } = useCreateSubscription(handleClose);
  const { mutate: createCustomer, isPending: creatingCustomer } = useCreateCustomer();
  const { mutate: sellPromotion, isPending: selling } = useSellPromotion(handleClose);
  const { data: promotions } = usePromotions();
  const { data: promoSale, isFetching: loadingPromo } = usePromotionSale(promoCode);

  // Con código aplicado, cada servicio arranca con la cuenta sugerida.
  useEffect(() => {
    if (!promoSale) return;
    form.setFieldsValue({
      promoAccounts: Object.fromEntries(
        promoSale.services.map(s => [s.serviceId, s.suggestedAccountId]),
      ),
    });
  }, [promoSale, form]);

  const removePromo = () => {
    setPromoInput('');
    setPromoCode('');
  };

  const selectedServiceId = Form.useWatch('serviceId', form);

  // Al abrir: formulario limpio y, si viene, precargado.
  useEffect(() => {
    if (open) {
      form.resetFields();
      if (preset) form.setFieldsValue(preset);
    }
  }, [open, form, preset]);

  // Crea un cliente con datos mínimos sin salir del modal y lo deja seleccionado.
  const handleQuickCreateCustomer = () => {
    const name = newCustomerName.trim();
    if (!name || !isPhoneOk(newCustomerPhone)) return;
    createCustomer(
      { name, phone: newCustomerPhone },
      {
        onSuccess: created => {
          form.setFieldValue('customerId', created.id);
          form.validateFields(['customerId']);
          setShowNewCustomer(false);
          setNewCustomerName('');
          setNewCustomerPhone(undefined);
        },
      },
    );
  };

  // Cuentas del servicio elegido. Para "cuenta completa" solo las totalmente
  // libres; para "por perfil" las que tengan al menos un cupo disponible.
  const availableAccounts = useMemo(
    () =>
      accounts?.filter(a => {
        if (a.serviceId !== selectedServiceId) return false;
        return fullAccount ? a.availableSlots === a.capacity : a.availableSlots > 0;
      }) ?? [],
    [accounts, selectedServiceId, fullAccount],
  );

  // Referencia de vigencia: avisa si la suscripción terminaría después de que
  // vence la cuenta de proveedor.
  const selectedAccountId = Form.useWatch('providerAccountId', form);
  const durationMonths = Form.useWatch('durationMonths', form);
  const startDate = Form.useWatch('startDate', form);
  const selectedAccount = accounts?.find(a => a.id === selectedAccountId);
  const accountExpiry = selectedAccount?.expiresAt ? dayjs(selectedAccount.expiresAt) : null;
  const projectedEnd = durationMonths ? (startDate ?? dayjs()).add(durationMonths, 'month') : null;
  const exceedsAccount =
    accountExpiry && projectedEnd && projectedEnd.isAfter(accountExpiry, 'day');
  const daysToExpiry = accountExpiry
    ? accountExpiry.startOf('day').diff(dayjs().startOf('day'), 'day')
    : null;
  const expiryFmt = accountExpiry?.format('DD/MM/YYYY') ?? '';
  // Frase de vencimiento: usa días cuando faltan ≤ 15 (o ya venció).
  const accountExpiryPhrase =
    daysToExpiry === null
      ? ''
      : daysToExpiry < 0
        ? `venció hace ${Math.abs(daysToExpiry)} ${
            Math.abs(daysToExpiry) === 1 ? 'día' : 'días'
          } (${expiryFmt})`
        : daysToExpiry === 0
          ? `vence hoy (${expiryFmt})`
          : daysToExpiry <= 15
            ? `vence en ${daysToExpiry} ${daysToExpiry === 1 ? 'día' : 'días'} (${expiryFmt})`
            : `vence el ${expiryFmt}`;

  // Venta normal que deja a una promo sin cupo para lo que ofrece.
  const impacts =
    !promoSale && selectedAccountId
      ? promoImpacts(promotions ?? [], accounts ?? [], selectedAccountId, fullAccount)
      : [];

  const onFinish = (values: FormValues) => {
    if (promoSale) {
      sellPromotion(
        {
          code: promoSale.item.code,
          customerId: values.customerId,
          accounts: promoSale.services.map(s => ({
            serviceId: s.serviceId,
            providerAccountId: values.promoAccounts?.[s.serviceId] ?? '',
          })),
          startDate: values.startDate?.toISOString(),
        },
        { onError: invalidateForm },
      );
      return;
    }
    const body: CreateSubscriptionBody = {
      customerId: values.customerId,
      serviceId: values.serviceId,
      providerAccountId: values.providerAccountId,
      durationMonths: values.durationMonths,
      price: solesToCents(values.price),
      fullAccount,
      startDate: values.startDate?.toISOString(),
    };
    create(body, { onError: invalidateForm });
  };

  return (
    <ResponsiveModal
      title="Nueva venta"
      open={open}
      onCancel={handleClose}
      onOk={() => form.submit()}
      okText="Registrar venta"
      cancelText="Cancelar"
      confirmLoading={isPending || selling}
    >
      <Form
        layout="vertical"
        form={form}
        onFinish={onFinish}
        disabled={isPending || selling}
        initialValues={{ durationMonths: 1, startDate: dayjs() }}
      >
        {!promoSale && (
          <div className="mb-4 flex gap-2">
            <Input
              prefix={<TagOutlined className="text-content-subtle" />}
              placeholder="Código de promo (opcional)"
              value={promoInput}
              onChange={e => setPromoInput(e.target.value.toUpperCase())}
              onPressEnter={e => {
                e.preventDefault();
                setPromoCode(promoInput.trim());
              }}
              className="font-mono"
            />
            <Button
              loading={loadingPromo}
              disabled={!promoInput.trim()}
              onClick={() => setPromoCode(promoInput.trim())}
            >
              Aplicar
            </Button>
          </div>
        )}
        <Form.Item label="Cliente" name="customerId" rules={REQUIRED} className="!mb-1">
          <Select
            placeholder="Selecciona un cliente"
            showSearch
            options={customers?.map(c => ({ value: c.id, label: c.name }))}
            // Busca también por correo y teléfono (solo dígitos).
            filterOption={(input, option) => {
              const c = customers?.find(x => x.id === option?.value);
              if (!c) return false;
              const q = input.trim().toLowerCase();
              const digits = q.replace(/\D/g, '');
              return (
                c.name.toLowerCase().includes(q) ||
                (c.email ?? '').toLowerCase().includes(q) ||
                (digits.length > 2 && (c.phone ?? '').replace(/\D/g, '').includes(digits))
              );
            }}
            optionRender={option => {
              const c = customers?.find(x => x.id === option.value);
              const contact = [formatPhone(c?.phone), c?.email].filter(Boolean).join(' · ');
              return (
                <div className="flex flex-col leading-tight">
                  <span>{option.label}</span>
                  {contact && (
                    <span className="truncate text-xs text-content-muted">{contact}</span>
                  )}
                </div>
              );
            }}
          />
        </Form.Item>

        {!showNewCustomer ? (
          <Button
            type="link"
            size="small"
            icon={<PlusOutlined />}
            className="!mb-3 !px-0"
            onClick={() => setShowNewCustomer(true)}
          >
            Nuevo cliente
          </Button>
        ) : (
          <div className="mb-4 rounded-lg border border-border bg-surface-muted p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold text-content-muted">Nuevo cliente</span>
              <Button type="text" size="small" onClick={() => setShowNewCustomer(false)}>
                Cancelar
              </Button>
            </div>
            <div className="flex flex-col gap-2">
              <Input
                placeholder="Nombre"
                value={newCustomerName}
                onChange={e => setNewCustomerName(e.target.value)}
                onPressEnter={handleQuickCreateCustomer}
              />
              <PhoneInput
                placeholder="WhatsApp (opcional)"
                value={newCustomerPhone}
                onChange={setNewCustomerPhone}
                onPressEnter={handleQuickCreateCustomer}
                status={isPhoneOk(newCustomerPhone) ? undefined : 'error'}
              />
              <Button
                type="primary"
                icon={<PlusOutlined />}
                loading={creatingCustomer}
                disabled={!newCustomerName.trim() || !isPhoneOk(newCustomerPhone)}
                onClick={handleQuickCreateCustomer}
                block
              >
                Agregar y seleccionar
              </Button>
            </div>
          </div>
        )}
        {promoSale ? (
          <>
            <PromoSaleSummary sale={promoSale} onRemove={removePromo} />
            {promoSale.services.map(service => (
              <Form.Item
                key={service.serviceId}
                label={`Cuenta de ${service.name}`}
                name={['promoAccounts', service.serviceId]}
                rules={REQUIRED}
              >
                <Select
                  placeholder="Selecciona una cuenta"
                  notFoundContent="Sin cuentas con cupo disponible"
                  options={accounts
                    ?.filter(
                      a =>
                        a.serviceId === service.serviceId &&
                        (promoSale.item.fullAccount
                          ? a.availableSlots === a.capacity
                          : a.availableSlots > 0),
                    )
                    .map(a => ({
                      value: a.id,
                      label: `${a.label || 'Cuenta'} · ${a.availableSlots} cupo(s)${
                        a.expiresAt ? ` · vence ${dayjs(a.expiresAt).format('DD/MM')}` : ''
                      }`,
                    }))}
                />
              </Form.Item>
            ))}
            <Form.Item label="Inicio" name="startDate">
              <DatePicker className="w-full" format="DD/MM/YYYY" />
            </Form.Item>
          </>
        ) : (
          <>
            <Form.Item label="Servicio" name="serviceId" rules={REQUIRED}>
              <Select
                placeholder="Selecciona un servicio"
                options={services?.map(s => ({ value: s.id, label: s.name }))}
                optionRender={option => {
                  const svc = services?.find(s => s.id === option.value);
                  return (
                    <span className="flex items-center gap-2">
                      <ServiceAvatar name={svc?.name ?? ''} iconUrl={svc?.iconUrl} size={20} />
                      {option.label}
                    </span>
                  );
                }}
                onChange={() => form.setFieldValue('providerAccountId', undefined)}
              />
            </Form.Item>
            <Form.Item label="Tipo de venta">
              <Segmented
                block
                value={fullAccount ? 'full' : 'profile'}
                onChange={value => {
                  setFullAccount(value === 'full');
                  form.setFieldValue('providerAccountId', undefined);
                }}
                options={[
                  { label: 'Por perfil', value: 'profile' },
                  { label: 'Cuenta completa', value: 'full' },
                ]}
              />
            </Form.Item>
            <Form.Item label="Mis cuentas" name="providerAccountId" rules={REQUIRED}>
              <Select
                placeholder={
                  selectedServiceId ? 'Selecciona una cuenta' : 'Primero elige un servicio'
                }
                disabled={!selectedServiceId}
                notFoundContent={
                  fullAccount
                    ? 'Sin cuentas completamente libres'
                    : 'Sin cuentas con cupo disponible'
                }
                options={availableAccounts.map(a => ({
                  value: a.id,
                  label: fullAccount
                    ? `${a.label || 'Cuenta'} · capacidad ${a.capacity}`
                    : `${a.label || 'Cuenta'} · ${a.availableSlots} cupo(s)`,
                }))}
                optionRender={option => {
                  const account = availableAccounts.find(a => a.id === option.value);
                  return (
                    <div className="flex flex-col leading-tight">
                      <span>{option.label}</span>
                      {account?.username && (
                        <span className="truncate text-xs text-content-muted">
                          {account.username}
                        </span>
                      )}
                    </div>
                  );
                }}
              />
            </Form.Item>

            {accountExpiry &&
              (exceedsAccount ? (
                <Alert
                  className="!mb-4 !-mt-1"
                  type="warning"
                  showIcon
                  title={`La cuenta ${accountExpiryPhrase} y esta suscripción terminaría el ${projectedEnd?.format(
                    'DD/MM/YYYY',
                  )}.`}
                />
              ) : (
                <p
                  className={`-mt-1 mb-4 text-xs ${
                    daysToExpiry !== null && daysToExpiry < 0
                      ? 'text-danger'
                      : daysToExpiry !== null && daysToExpiry <= 15
                        ? 'text-warning'
                        : 'text-content-muted'
                  }`}
                >
                  {daysToExpiry !== null && daysToExpiry > 15
                    ? `Vigencia de la cuenta: ${expiryFmt}`
                    : `La cuenta ${accountExpiryPhrase}`}
                </p>
              ))}

            {impacts.map(impact => (
              <Alert
                key={impact.code}
                className="!mb-4 !-mt-1"
                type="warning"
                showIcon
                title={
                  impact.after === 0
                    ? `Esta venta agota la promo «${impact.title}» (${impact.code}).`
                    : `Esta venta deja la promo «${impact.title}» (${impact.code}) con ${impact.after} de ${impact.promised} disponibles.`
                }
              />
            ))}

            <Form.Item
              label="Duración (meses)"
              required
              className={customDuration ? '!mb-2' : undefined}
              extra={
                projectedEnd && !customDuration
                  ? `Vence el ${projectedEnd.format('DD/MM/YYYY')}`
                  : undefined
              }
            >
              <Segmented
                block
                value={customDuration ? 'custom' : durationMonths}
                onChange={value => {
                  if (value === 'custom') {
                    setCustomDuration(true);
                    return;
                  }
                  setCustomDuration(false);
                  form.setFieldValue('durationMonths', value);
                }}
                // Solo el número: con "meses" las etiquetas se truncan en móvil.
                options={[
                  ...DURATION_OPTIONS.map(o => ({ value: o.value, label: String(o.value) })),
                  { value: 'custom', label: 'Otro' },
                ]}
              />
            </Form.Item>
            {/* Siempre registrado; solo visible con "Otro". */}
            <Form.Item
              name="durationMonths"
              rules={REQUIRED}
              hidden={!customDuration}
              extra={projectedEnd ? `Vence el ${projectedEnd.format('DD/MM/YYYY')}` : undefined}
            >
              <InputNumber
                min={1}
                max={36}
                precision={0}
                suffix={durationMonths === 1 ? 'mes' : 'meses'}
                className="!w-full"
                placeholder="Cantidad de meses"
              />
            </Form.Item>

            <div className="grid grid-cols-2 gap-3">
              <Form.Item label="Precio" name="price" rules={REQUIRED}>
                <InputNumber
                  min={0}
                  step={0.5}
                  precision={2}
                  prefix="S/"
                  className="!w-full"
                  placeholder="0.00"
                />
              </Form.Item>
              <Form.Item label="Inicio" name="startDate">
                <DatePicker className="w-full" format="DD/MM/YYYY" />
              </Form.Item>
            </div>
          </>
        )}
      </Form>
    </ResponsiveModal>
  );
}
