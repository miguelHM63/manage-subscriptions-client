import type { HttpError } from '@/api/config';
import { ErrorAction } from './error-action';
import type React from 'react';
import { IS_PROD } from '@/config';
import type { FallbackProps } from 'react-error-boundary';

export const ErrorBoundaryMessage: React.FC<FallbackProps> = ({ error }) => {
  const httpError = error as HttpError;

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <ErrorAction
        error={IS_PROD ? undefined : httpError}
        message={IS_PROD ? 'Ocurrió un error en la escena' : undefined}
        extra={IS_PROD ? null : httpError.stack}
      />
    </div>
  );
};
