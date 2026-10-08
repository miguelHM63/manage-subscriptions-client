import { ArrowRightOutlined, PlayCircleFilled } from '@ant-design/icons';
import { Button } from 'antd';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { PageHeader } from '@/components/panel/page-header';
import cn from '@/helpers/cn';
import { withErrorBoundary } from '@/hoc/with-error-boundary';
import { useIsMobile } from '@/hooks/use-is-mobile';
import { TutorialPlayer } from '../components/tutorial-player';
import { TUTORIAL_FPS, TUTORIALS } from '../tutorials';

const seconds = (frames: number) => `${Math.round(frames / TUTORIAL_FPS)} s`;

function HowToPageComponent() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [selectedId, setSelectedId] = useState(TUTORIALS[0].id);
  const playerSection = useRef<HTMLElement>(null);

  // En móvil la lista queda bajo el reproductor: al elegir, sube hasta él.
  const select = (id: string) => {
    setSelectedId(id);
    if (isMobile) playerSection.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const tutorial = TUTORIALS.find(t => t.id === selectedId) ?? TUTORIALS[0];

  return (
    <>
      <PageHeader title="Cómo usarlo" subtitle="Tutoriales cortos para dar tus primeros pasos" />
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
        <section ref={playerSection} className="flex scroll-mt-18 flex-col gap-4">
          <TutorialPlayer tutorial={tutorial} variant={isMobile ? 'mobile' : 'desktop'} />
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-content">{tutorial.title}</h2>
              <p className="mt-0.5 text-sm text-content-muted">{tutorial.description}</p>
            </div>
            <Button
              type="primary"
              size="large"
              icon={<ArrowRightOutlined />}
              iconPlacement="end"
              className="shrink-0"
              onClick={() => navigate(tutorial.cta.to)}
            >
              {tutorial.cta.label}
            </Button>
          </div>
        </section>

        <aside className="flex flex-col gap-2">
          <h2 className="text-[11px] font-semibold tracking-wider text-content-subtle uppercase">
            Tutoriales
          </h2>
          <ol className="flex flex-col gap-2">
            {TUTORIALS.map((item, i) => {
              const active = item.id === tutorial.id;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => select(item.id)}
                    aria-current={active || undefined}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-xl bg-surface p-3 text-left transition-colors hover:bg-surface-hover',
                      active ? 'border-[1.5px] border-brand-500' : 'border border-border',
                    )}
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
                      {i + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold text-content">
                        {item.title}
                      </span>
                      <span className="block text-xs text-content-muted">
                        {seconds(item.durationInFrames)}
                      </span>
                    </span>
                    <PlayCircleFilled
                      className={cn('text-xl', active ? 'text-brand-ink' : 'text-content-subtle')}
                    />
                  </button>
                </li>
              );
            })}
          </ol>
        </aside>
      </div>
    </>
  );
}

export const HowToPage = withErrorBoundary(HowToPageComponent);
