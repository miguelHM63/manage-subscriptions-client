import type { HttpError } from '@/api/config';
import type { Nullable } from '@/types/nullable.interfaces';
import { Button } from 'antd';
import type React from 'react';

interface IHttpFieldError {
  error?: Nullable<HttpError>;
  onRetry?: () => void;
}

export const HttpFieldError: React.FC<IHttpFieldError> = ({ error, onRetry }) => {
  if (!error) {
    return null;
  }

  return (
    <div className="text-red-500 relative">
      <>{error?.response?.data.message ?? error.message}</>
      {onRetry && (
        <Button type="text" danger size="small" className="autosize" onClick={onRetry}>
          Reintentar
        </Button>
      )}
    </div>
  );
};
