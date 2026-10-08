import { Form } from 'antd';
import { useLayoutEffect, useState } from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';

import { Fab } from '@/components/panel/fab';
import { PageHeader } from '@/components/panel/page-header';
import { ResponsiveModal } from '@/components/panel/responsive-modal';
import { SetupWelcome } from '@/modules/dashboard/components/setup-checklist';
import { ProviderAccountFormFields } from '@/modules/provider-accounts/components/provider-account-form-modal';
import {
  ProviderAccountsEmptyState,
  ProviderAccountsMobileList,
  ProviderAccountsTable,
  type ProviderAccountsListProps,
} from '@/modules/provider-accounts/components/provider-accounts-list';
import { DASHBOARD_ROUTE, PROVIDER_ACCOUNTS_ROUTE } from '@/routes/routes';
import { AnimatedCursor } from '../remotion/animated-cursor';
import { Caption } from '../remotion/caption';
import { captionSpot, sceneBlur } from '../remotion/caption-timing';
import { DoneCard } from '../remotion/done-card';
import { PanelFrame } from '../remotion/panel-frame';
import { SoundTrack } from '../remotion/sound-track';
import { useScrollProgress, useSimulatedFocus, useTargetPoints } from '../remotion/targets';
import {
  activeAt,
  clickProgress,
  cursorPosition,
  realFrame,
  sceneFrame,
  typedText,
} from '../remotion/timeline';
import { TutorialStage } from '../remotion/tutorial-stage';
import type { TutorialProps } from '../tutorials';
import {
  ACCOUNT,
  CAPACITY,
  CAPTIONS,
  COST,
  F,
  FORM_SCROLLER,
  HOLDS,
  MOVES,
  PASSWORD,
  REAL_CLICKS,
  SOUND_CUES,
  SERVICES,
  TARGETS,
  USERNAME,
} from './provider-account-script';

const EASE = Easing.bezier(0.65, 0, 0.35, 1);

const serviceById = (id: string) => SERVICES.find(s => s.id === id);

/** Tutorial 2: registrar una cuenta de proveedor y sus cupos. */
export function ProviderAccountTutorial({ variant }: TutorialProps) {
  const videoFrame = useCurrentFrame();
  // Tiempo de la escena: se congela durante la presentación de cada subtítulo.
  const frame = sceneFrame(videoFrame, HOLDS);
  const { width, height } = useVideoConfig();
  const [stage, setStage] = useState<HTMLDivElement | null>(null);
  const [scene, setScene] = useState<HTMLDivElement | null>(null);
  const [form] = Form.useForm();

  const onAccounts = frame >= F.showAccounts;
  const formOpen = frame >= F.formOpen && frame < F.created;
  const accounts = frame >= F.created ? [ACCOUNT] : [];

  // El formulario real se rellena según el frame (también al retroceder).
  useLayoutEffect(() => {
    if (!formOpen) return;
    form.setFieldsValue({
      serviceId: frame >= F.selected ? SERVICES[0].id : undefined,
      capacity: frame >= F.capacitySet ? CAPACITY : 1,
      cost: frame >= F.costSet ? COST : undefined,
      username: typedText(USERNAME, frame, F.usernameTyping),
      password: typedText(PASSWORD, frame, F.passwordTyping),
    });
  }, [form, formOpen, frame]);

  const focused =
    frame >= F.selectClick && frame < F.selected
      ? TARGETS.select
      : frame >= F.capacityClick && frame < F.costClick
        ? TARGETS.capacity
        : frame >= F.costClick && frame < F.scrollStart
          ? TARGETS.cost
          : frame >= F.usernameClick && frame < F.passwordClick
            ? TARGETS.username
            : frame >= F.passwordClick && frame < F.create
              ? TARGETS.password
              : null;
  useSimulatedFocus(stage, focused);

  // El formulario es largo: baja hasta las credenciales y el botón Crear.
  const scroll = interpolate(frame, [F.scrollStart, F.scrollEnd], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EASE,
  });
  useScrollProgress(stage, FORM_SCROLLER, formOpen ? scroll : 0);

  const points = useTargetPoints(stage, TARGETS);
  const cursor = cursorPosition(frame, MOVES, points, { x: width * 0.62, y: height * 0.72 });
  const caption = activeAt(CAPTIONS, frame);
  const captionFrom = caption ? realFrame(caption.from, HOLDS) : 0;
  // La escena se desenfoca bajo el subtítulo a pantalla completa y la tarjeta final.
  const blur = sceneBlur(caption ? videoFrame - captionFrom : null, frame - F.done);

  const listProps: ProviderAccountsListProps = {
    accounts,
    serviceById,
    onSell: noop,
    onCredentials: noop,
    menuFor: () => ({ items: [] }),
  };
  const free = accounts.reduce((sum, a) => sum + a.availableSlots, 0);

  const content = !onAccounts ? (
    <SetupWelcome hasServices hasAccounts={false} hasCustomers={false} />
  ) : (
    <>
      <PageHeader
        title="Mis cuentas"
        subtitle={
          accounts.length
            ? `${free} cupos libres para vender`
            : 'Las cuentas que compras y sus cupos'
        }
      />
      {!accounts.length ? (
        <ProviderAccountsEmptyState onCreate={noop} />
      ) : variant === 'mobile' ? (
        <div className="flex flex-col gap-3">
          <ProviderAccountsMobileList {...listProps} />
        </div>
      ) : (
        <ProviderAccountsTable {...listProps} />
      )}
      {variant === 'mobile' && accounts.length > 0 && <Fab label="Nueva cuenta" onClick={noop} />}
    </>
  );

  return (
    <TutorialStage ref={setStage}>
      {/* La escena (app, modal y cursor) va aparte para poder desenfocarla
          entera; los subtítulos quedan encima, nítidos. */}
      <AbsoluteFill ref={setScene} style={{ filter: blur ? `blur(${blur}px)` : undefined }}>
        <PanelFrame
          variant={variant}
          activeRoute={onAccounts ? PROVIDER_ACCOUNTS_ROUTE : DASHBOARD_ROUTE}
        >
          {content}
        </PanelFrame>

        {scene && (
          <ResponsiveModal
            title="Nueva cuenta"
            open={formOpen}
            onCancel={noop}
            onOk={noop}
            okText="Crear"
            confirmLoading={frame >= F.create}
            getContainer={scene}
          >
            <ProviderAccountFormFields
              form={form}
              services={SERVICES}
              serviceSelectProps={{
                open: frame >= F.selectOpen && frame < F.selected,
                getPopupContainer: () => scene,
              }}
            />
          </ResponsiveModal>
        )}

        <AnimatedCursor
          position={cursor}
          click={clickProgress(videoFrame, REAL_CLICKS)}
          variant={variant === 'mobile' ? 'touch' : 'pointer'}
        />
      </AbsoluteFill>

      {caption && frame < F.done && (
        <Caption
          key={caption.from}
          from={captionFrom}
          step={caption.step}
          text={caption.text}
          {...captionSpot(variant, formOpen)}
        />
      )}
      <DoneCard
        frame={frame}
        from={F.done}
        title={`¡Listo! Ya tienes ${CAPACITY} cupos para vender`}
        description="Siguiente paso: agrega tu primer cliente."
      />
      <SoundTrack cues={SOUND_CUES} />
    </TutorialStage>
  );
}

const noop = () => {};
