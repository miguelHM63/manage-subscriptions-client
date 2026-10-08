import { Player } from '@remotion/player';

import cn from '@/helpers/cn';
import { STAGE_SIZE, TUTORIAL_FPS, type Tutorial, type TutorialVariant } from '../tutorials';

interface TutorialPlayerProps {
  tutorial: Tutorial;
  variant: TutorialVariant;
  className?: string;
}

/** Reproduce un tutorial: la composición se dibuja en vivo con los componentes de la app. */
export function TutorialPlayer({ tutorial, variant, className }: TutorialPlayerProps) {
  const size = STAGE_SIZE[variant];
  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border border-border bg-surface shadow-sm',
        variant === 'mobile' && 'mx-auto w-full max-w-[390px]',
        className,
      )}
    >
      <Player
        // Al cambiar de tutorial o de variante se reinicia desde el principio.
        key={`${tutorial.id}-${variant}`}
        component={tutorial.component}
        inputProps={{ variant }}
        durationInFrames={tutorial.durationInFrames}
        fps={TUTORIAL_FPS}
        compositionWidth={size.width}
        compositionHeight={size.height}
        style={{ width: '100%' }}
        controls
        autoPlay
        loop
        clickToPlay
        doubleClickToFullscreen
        // Los navegadores bloquean el autoplay con sonido si aún no hubo un clic
        // en la página (p. ej. al abrirla directo): entonces empieza en silencio.
        initiallyMuted={!navigator.userActivation?.hasBeenActive}
        volumePersistenceKey="tutorials"
      />
    </div>
  );
}
