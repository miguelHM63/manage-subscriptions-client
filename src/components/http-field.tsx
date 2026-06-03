import { Select, type SelectProps } from 'antd';
import { HttpFieldError } from './http-field-error';
import type { HttpError } from '@/api/config';
import type { Nullable } from '@/types/nullable.interfaces';
import type React from 'react';

interface IHttpField extends Omit<SelectProps, 'loading'> {
  error: Nullable<HttpError>;
  isLoading?: boolean;
  refetch?: () => void;
}

export const HttpField: React.FC<IHttpField> = props => {
  const { error, isLoading, options, refetch, ...rest } = props;

  return (
    <>
      <Select
        {...rest}
        disabled={isLoading || rest.disabled || !!error}
        options={options}
        loading={isLoading}
      />
      <HttpFieldError error={error} onRetry={refetch} />
    </>
  );
};
