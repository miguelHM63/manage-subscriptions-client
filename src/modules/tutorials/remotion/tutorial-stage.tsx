import { ConfigProvider } from 'antd';
import type { ReactNode, Ref } from 'react';
import { AbsoluteFill } from 'remotion';

import './tutorial-stage.css';

interface TutorialStageProps {
  ref?: Ref<HTMLDivElement>;
  children: ReactNode;
}

/**
 * Raíz de cada composición. Es `inert` (solo se mira: no se puede escribir ni
 * hacer clic en la demo) y apaga las animaciones de AntD para que cada frame
 * dependa solo del tiempo del vídeo y se pueda avanzar o retroceder sin saltos.
 */
export function TutorialStage({ ref, children }: TutorialStageProps) {
  return (
    <ConfigProvider theme={{ token: { motion: false } }}>
      <AbsoluteFill
        ref={ref}
        inert
        className="tutorial-stage overflow-hidden bg-surface-muted text-content"
      >
        {children}
      </AbsoluteFill>
    </ConfigProvider>
  );
}
