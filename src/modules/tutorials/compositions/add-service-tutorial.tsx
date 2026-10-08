import { Form } from 'antd';
import { useLayoutEffect, useState } from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';

import { Fab } from '@/components/panel/fab';
import { PageHeader } from '@/components/panel/page-header';
import { ResponsiveModal } from '@/components/panel/responsive-modal';
import { SetupWelcome } from '@/modules/dashboard/components/setup-checklist';
import { LogoPickerView } from '@/modules/services/components/logo-picker';
import {
  AddServiceTile,
  ServiceCard,
  ServicesGrid,
} from '@/modules/services/components/service-card';
import { ServiceFormFields } from '@/modules/services/components/service-form-modal';
import { ServicesEmptyState } from '@/modules/services/components/services-empty-state';
import { isBrandSearchEnabled } from '@/modules/services/hooks/use-brand-search';
import { DASHBOARD_ROUTE, SERVICES_ROUTE } from '@/routes/routes';
import { AnimatedCursor } from '../remotion/animated-cursor';
import { Caption } from '../remotion/caption';
import { DoneCard } from '../remotion/done-card';
import { captionSpot, sceneBlur } from '../remotion/caption-timing';
import { PanelFrame } from '../remotion/panel-frame';
import { SoundTrack } from '../remotion/sound-track';
import { useSimulatedFocus, useTargetPoints } from '../remotion/targets';
import {
  activeAt,
  clickProgress,
  cursorPosition,
  realFrame,
  sceneFrame,
  typedText,
  typingEnd,
} from '../remotion/timeline';
import { TutorialStage } from '../remotion/tutorial-stage';
import type { TutorialProps } from '../tutorials';
import {
  BRAND,
  CAPTIONS,
  F,
  HOLDS,
  LOGO_QUERY,
  MOVES,
  NEW_NAME,
  QUICK_ADD,
  REAL_CLICKS,
  SOUND_CUES,
  TARGETS,
} from './add-service-script';

/** Tutorial 1: agregar los servicios que vende el negocio. */
export function AddServiceTutorial({ variant }: TutorialProps) {
  const videoFrame = useCurrentFrame();
  // Tiempo de la escena: se congela durante la presentación de cada subtítulo.
  const frame = sceneFrame(videoFrame, HOLDS);
  const { width, height } = useVideoConfig();
  const [stage, setStage] = useState<HTMLDivElement | null>(null);
  const [scene, setScene] = useState<HTMLDivElement | null>(null);
  const [form] = Form.useForm();

  const onServices = frame >= F.showServices;
  const formOpen = frame >= F.formOpen && frame < F.created;
  const creatingQuickAdd = frame >= F.quickAdd && frame < F.quickAdded;
  const logoSelected = isBrandSearchEnabled && frame >= F.logoSelect;
  const query =
    isBrandSearchEnabled && !logoSelected ? typedText(LOGO_QUERY, frame, F.logoTyping) : '';

  const services = [
    ...(frame >= F.quickAdded ? [QUICK_ADD] : []),
    ...(frame >= F.created ? [{ name: NEW_NAME, iconUrl: BRAND.icon }] : []),
  ];

  // El formulario real se rellena según el frame (también al retroceder).
  useLayoutEffect(() => {
    if (!formOpen) return;
    form.setFieldsValue({
      name: typedText(NEW_NAME, frame, F.nameTyping),
      iconUrl: logoSelected ? BRAND.icon : undefined,
    });
  }, [form, formOpen, frame, logoSelected]);

  const focused =
    frame >= F.nameClick && frame <= typingEnd(NEW_NAME, F.nameTyping) + 6
      ? TARGETS.name
      : isBrandSearchEnabled && frame >= F.logoClick && frame < F.logoSelect
        ? TARGETS.logo
        : null;
  useSimulatedFocus(stage, focused);

  const points = useTargetPoints(stage, TARGETS);
  const cursor = cursorPosition(frame, MOVES, points, { x: width * 0.62, y: height * 0.72 });
  const caption = activeAt(CAPTIONS, frame);
  const captionFrom = caption ? realFrame(caption.from, HOLDS) : 0;
  // La escena se desenfoca bajo el subtítulo a pantalla completa y la tarjeta final.
  const blur = sceneBlur(caption ? videoFrame - captionFrom : null, frame - F.done);

  const content = !onServices ? (
    <>
      <SetupWelcome hasServices={false} hasAccounts={false} hasCustomers={false} />
    </>
  ) : (
    <>
      <PageHeader title="Servicios" subtitle="Catálogo de plataformas que ofreces" />
      {services.length ? (
        <ServicesGrid>
          {services.map(service => (
            <ServiceCard key={service.name} service={service} onEdit={noop} onDelete={noop} />
          ))}
          <AddServiceTile onClick={noop} />
        </ServicesGrid>
      ) : (
        <ServicesEmptyState
          onQuickAdd={noop}
          onCreate={noop}
          creatingName={creatingQuickAdd ? QUICK_ADD.name : undefined}
        />
      )}
      {variant === 'mobile' && services.length > 0 && <Fab label="Nuevo servicio" onClick={noop} />}
    </>
  );

  return (
    <TutorialStage ref={setStage}>
      {/* La escena (app, modal y cursor) va aparte para poder desenfocarla
          entera; los subtítulos quedan encima, nítidos. Se usa `filter` y no
          `backdrop-filter`, que dentro del Player escalado repite los bordes. */}
      <AbsoluteFill ref={setScene} style={{ filter: blur ? `blur(${blur}px)` : undefined }}>
        <PanelFrame variant={variant} activeRoute={onServices ? SERVICES_ROUTE : DASHBOARD_ROUTE}>
          {content}
        </PanelFrame>

        {scene && (
          <ResponsiveModal
            title="Nuevo servicio"
            open={formOpen}
            onCancel={noop}
            onOk={noop}
            okText="Crear"
            confirmLoading={frame >= F.create}
            getContainer={scene}
          >
            <ServiceFormFields
              form={form}
              logoPicker={
                <LogoPickerView
                  query={query}
                  onQueryChange={noop}
                  showResults={frame >= F.logoSearching}
                  results={frame >= F.logoResults ? [BRAND] : undefined}
                  isFetching={frame >= F.logoTyping + 4 && frame < F.logoResults}
                  manual={false}
                  onManualChange={noop}
                  onSelect={noop}
                  highlightedBrandId={frame >= F.logoHover ? BRAND.brandId : undefined}
                />
              }
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
        title="¡Listo! Ya tienes tus servicios"
        description="Siguiente paso: registra una cuenta de proveedor."
      />
      <SoundTrack cues={SOUND_CUES} />
    </TutorialStage>
  );
}

const noop = () => {};
