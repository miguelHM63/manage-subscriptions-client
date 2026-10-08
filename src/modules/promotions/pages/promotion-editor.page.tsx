import { ArrowLeftOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons';
import { App, Button, DatePicker, Input, Skeleton } from 'antd';
import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { LoadError } from '@/components/panel/load-error';
import { withErrorBoundary } from '@/hoc/with-error-boundary';
import { useAuth } from '@/hooks/use-auth';
import { useMyOrganization } from '@/modules/organization/hooks/use-my-organization';
import { useMe, useUpdateProfile } from '@/modules/profile/hooks/use-profile';
import { useProviderAccounts } from '@/modules/provider-accounts/hooks/use-provider-accounts';
import { useServices } from '@/modules/services/hooks/use-services';
import { PROMOTIONS_ROUTE, promotionRoute } from '@/routes/routes';
import { DesignPicker } from '../components/design-picker';
import { PromotionItemEditor } from '../components/promotion-item-editor';
import { PromotionItemRow } from '../components/promotion-item-row';
import { PromotionPreviewModal } from '../components/promotion-preview-modal';
import { SharePromotionModal } from '../components/share-promotion-modal';
import { StatePill } from '../components/state-pill';
import { WhatsappStepModal } from '../components/whatsapp-step-modal';
import {
  usePromotion,
  usePromotionAction,
  useSavePromotion,
  type IPromotion,
} from '../hooks/use-promotions';
import {
  draftFromPromotion,
  draftProblem,
  draftToBody,
  draftToPublic,
  emptyDraft,
  emptyItem,
  type PromotionDraft,
} from '../promotion-draft';

const sectionTitle = 'text-[11px] font-semibold tracking-wider text-content-subtle uppercase';

/** Formulario de la promo; `initial` es la promo guardada (si se está editando). */
function PromotionEditor({ initial }: { initial?: IPromotion }) {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const { updateLoggedUser } = useAuth();

  const { data: services = [] } = useServices();
  const { data: accounts = [] } = useProviderAccounts();
  const { data: organization } = useMyOrganization();
  const { data: me } = useMe();
  const { mutateAsync: save, isPending: saving } = useSavePromotion();
  const { mutateAsync: runAction, isPending: publishing } = usePromotionAction();
  const { mutateAsync: updateProfile, isPending: savingPhone } = useUpdateProfile(user =>
    updateLoggedUser?.(user),
  );

  const [draft, setDraft] = useState<PromotionDraft>(() =>
    initial ? draftFromPromotion(initial) : emptyDraft(),
  );
  // La última versión guardada: tras crear, las siguientes veces se actualiza.
  // Ítem abierto en el formulario; los demás se ven plegados en la lista.
  // Una promo nueva arranca con su primer ítem abierto.
  const [openKey, setOpenKey] = useState<string | null>(() =>
    initial ? null : (draft.items[0]?.key ?? null),
  );
  const [current, setCurrent] = useState<IPromotion | undefined>(initial);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [askPhone, setAskPhone] = useState(false);
  const [sharing, setSharing] = useState<{ promotion: IPromotion; justPublished: boolean } | null>(
    null,
  );

  // Filas seguidas se agrupan en una sola tabla; el ítem abierto la corta.
  type ItemRef = { item: PromotionDraft['items'][number]; index: number };
  const itemGroups: Array<
    { open: true; item: ItemRef['item']; index: number } | { open: false; rows: ItemRef[] }
  > = [];
  draft.items.forEach((item, index) => {
    const last = itemGroups[itemGroups.length - 1];
    if (item.key === openKey) itemGroups.push({ open: true, item, index });
    else if (last && !last.open) last.rows.push({ item, index });
    else itemGroups.push({ open: false, rows: [{ item, index }] });
  });

  const removeItem = (index: number) => {
    if (draft.items[index]?.key === openKey) setOpenKey(null);
    set({ items: draft.items.filter((_, i) => i !== index) });
  };

  const set = (patch: Partial<PromotionDraft>) => setDraft(current => ({ ...current, ...patch }));
  const setItem = (index: number, item: PromotionDraft['items'][number]) =>
    setDraft(current => ({
      ...current,
      items: current.items.map((it, i) => (i === index ? item : it)),
    }));

  const preview = useMemo(
    () =>
      draftToPublic(draft, {
        businessName: organization?.name ?? '',
        whatsapp: me?.phone,
        services,
        accounts,
      }),
    [draft, organization, me, services, accounts],
  );

  /** Guarda y devuelve la promo guardada (o null si falta algo). */
  const persist = async (forPublish: boolean): Promise<IPromotion | null> => {
    const problem = draftProblem(draft, forPublish, { accounts, services, original: current });
    if (problem) {
      message.warning(problem);
      return null;
    }
    try {
      const saved = await save({ id: current?.id, body: draftToBody(draft) });
      if (!current) {
        // Deja la URL de la promo creada sin remontar el editor (se pierde el
        // paso de publicar en curso).
        window.history.replaceState(window.history.state, '', promotionRoute(saved.id));
      }
      setCurrent(saved);
      // La api asigna id, número y código a cada ítem (en el mismo orden): el
      // borrador los toma para que el próximo guardado conserve sus ventas.
      setDraft(prev => ({
        ...prev,
        code: saved.code,
        items: prev.items.map((item, index) => ({
          ...item,
          id: saved.items[index]?.id,
          code: saved.items[index]?.code,
          sold: saved.items[index]?.sold,
        })),
      }));
      return saved;
    } catch {
      return null; // El interceptor ya mostró el error.
    }
  };

  const onSave = async () => {
    if (await persist(false)) message.success('Promoción guardada');
  };

  const publish = async (promotionId: string) => {
    try {
      const result = await runAction({ id: promotionId, action: 'publish' });
      setPreviewOpen(false);
      setAskPhone(false);
      setCurrent(result);
      setSharing({ promotion: result, justPublished: true });
    } catch {
      // El interceptor ya mostró el error.
    }
  };

  const onPublish = async () => {
    const saved = await persist(true);
    if (!saved) return;
    // Sin WhatsApp no hay a dónde escribir: se pide antes de publicar.
    if (!me?.phone?.trim()) {
      setAskPhone(true);
      return;
    }
    await publish(saved.id);
  };

  const onPhone = async (phone: string) => {
    try {
      await updateProfile({ phone });
    } catch {
      return;
    }
    const saved = current ?? (await persist(true));
    if (saved) await publish(saved.id);
  };

  const isPublished = current?.status === 'published';

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 pb-6">
      <div className="flex items-center gap-2">
        <Link
          to={PROMOTIONS_ROUTE}
          aria-label="Volver a promociones"
          className="-ml-2 flex h-10 w-10 items-center justify-center rounded-full !text-content"
        >
          <ArrowLeftOutlined />
        </Link>
        <h1 className="flex-1 text-xl font-bold text-content md:text-2xl">
          {current ? 'Editar promoción' : 'Nueva promoción'}
        </h1>
        {current && <StatePill state={current.state} />}
      </div>

      <section className="flex flex-col gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-semibold text-content">Título</span>
          <Input
            size="large"
            maxLength={60}
            placeholder="Ej.: Combo Navidad"
            value={draft.title}
            onChange={e => set({ title: e.target.value })}
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-semibold text-content">
            Descripción <span className="font-normal text-content-subtle">(opcional)</span>
          </span>
          <Input
            size="large"
            maxLength={200}
            placeholder="Ej.: Precios especiales hasta fin de año"
            value={draft.description}
            onChange={e => set({ description: e.target.value })}
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-semibold text-content">
            Código{' '}
            <span className="font-normal text-content-subtle">(para registrar las ventas)</span>
          </span>
          <Input
            size="large"
            maxLength={12}
            placeholder="Se genera del título. Ej.: NAVIDAD"
            value={draft.code}
            onChange={e => set({ code: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '') })}
            className="font-mono"
          />
          <span className="text-xs text-content-muted">
            Cada ítem lleva su número ({draft.code || 'CODIGO'}-1, {draft.code || 'CODIGO'}-2…) y
            llega en el mensaje de WhatsApp del cliente.
          </span>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-semibold text-content">Vigencia</span>
          <DatePicker.RangePicker
            size="large"
            format="DD/MM/YYYY"
            allowClear={false}
            value={[draft.startsAt, draft.endsAt]}
            onChange={range => {
              if (range?.[0] && range[1])
                set({ startsAt: range[0].startOf('day'), endsAt: range[1].endOf('day') });
            }}
            placeholder={['Desde', 'Hasta']}
            className="w-full"
          />
        </label>
      </section>

      <section className="flex flex-col gap-2.5">
        <div className="flex items-baseline justify-between">
          <h2 className={sectionTitle}>Diseño del link</h2>
          <span className="text-xs text-content-subtle">Puedes cambiarlo después</span>
        </div>
        <DesignPicker value={draft.design} onChange={design => set({ design })} />
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className={sectionTitle}>Ítems ({draft.items.length})</h2>
          <Button
            type="link"
            icon={<PlusOutlined />}
            className="!px-0"
            onClick={() => {
              const item = emptyItem();
              set({ items: [...draft.items, item] });
              setOpenKey(item.key);
            }}
          >
            Agregar ítem
          </Button>
        </div>
        {/* Ítems plegados en filas; el abierto se edita en su lugar. */}
        {itemGroups.map(group =>
          group.open ? (
            <PromotionItemEditor
              key={group.item.key}
              item={group.item}
              index={group.index}
              services={services}
              accounts={accounts}
              onChange={next => setItem(group.index, next)}
              onRemove={() => removeItem(group.index)}
              onDone={() => setOpenKey(null)}
            />
          ) : (
            <div
              key={group.rows[0].item.key}
              className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface shadow-sm"
            >
              {group.rows.map(({ item, index }) => (
                <PromotionItemRow
                  key={item.key}
                  item={item}
                  services={services}
                  accounts={accounts}
                  onEdit={() => setOpenKey(item.key)}
                  onRemove={() => removeItem(index)}
                />
              ))}
            </div>
          ),
        )}
        {!draft.items.length && (
          <p className="rounded-xl border border-dashed border-border p-5 text-center text-sm text-content-muted">
            Agrega los servicios que quieres ofrecer en esta promo.
          </p>
        )}
      </section>

      <div className="grid grid-cols-2 gap-2.5 md:flex md:justify-end">
        <Button
          size="large"
          onClick={onSave}
          loading={saving && !publishing}
          className="max-md:col-span-2"
        >
          {isPublished ? 'Guardar cambios' : 'Guardar borrador'}
        </Button>
        <Button size="large" icon={<EyeOutlined />} onClick={() => setPreviewOpen(true)}>
          Vista previa
        </Button>
        {!isPublished && (
          <Button size="large" type="primary" onClick={onPublish} loading={publishing}>
            Publicar
          </Button>
        )}
        {isPublished && current && (
          <Button
            size="large"
            type="primary"
            onClick={() => setSharing({ promotion: current, justPublished: false })}
          >
            Compartir
          </Button>
        )}
      </div>

      <PromotionPreviewModal
        open={previewOpen}
        promo={preview}
        onClose={() => setPreviewOpen(false)}
        onDesignChange={design => set({ design })}
        onPublish={isPublished ? onSave : onPublish}
        publishLabel={isPublished ? 'Guardar cambios' : 'Publicar'}
        publishing={publishing || saving}
      />
      <WhatsappStepModal
        open={askPhone}
        saving={savingPhone || publishing}
        onCancel={() => setAskPhone(false)}
        onSubmit={onPhone}
      />
      <SharePromotionModal
        promotion={sharing?.promotion ?? null}
        open={Boolean(sharing)}
        justPublished={sharing?.justPublished}
        onClose={() => {
          const leave = sharing?.justPublished;
          setSharing(null);
          if (leave) navigate(PROMOTIONS_ROUTE);
        }}
      />
    </div>
  );
}

function PromotionEditorPageComponent() {
  const { id } = useParams();
  const { data: existing, isLoading, isError, refetch, isRefetching } = usePromotion(id);

  if (!id) return <PromotionEditor />;
  if (isError)
    return <LoadError what="la promoción" onRetry={() => refetch()} retrying={isRefetching} />;
  if (isLoading || !existing) return <Skeleton active paragraph={{ rows: 8 }} />;
  return <PromotionEditor key={existing.id} initial={existing} />;
}

export const PromotionEditorPage = withErrorBoundary(PromotionEditorPageComponent);
