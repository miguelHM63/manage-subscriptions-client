import React, { useMemo } from 'react';
import { Button, Card, Typography } from 'antd';
import { WarningOutlined } from '@ant-design/icons';
import type { Nullable } from '@/types/nullable.interfaces';
import type { HttpError } from '@/api/config';
import cn from '@/helpers/cn';
const { Title } = Typography;

interface IErrorAction {
  error?: Nullable<HttpError>;
  message?: string;
  extra?: React.ReactNode;
  onRetry?: () => void;
  borderless?: boolean;
  transparent?: boolean;
  inCard?: boolean;
}

export const ErrorAction: React.FC<IErrorAction> = ({
  error,
  message,
  extra,
  onRetry,
  borderless,
  transparent,
  inCard,
}) => {
  const computedMessage = useMemo(() => {
    if (!error) {
      return message;
    }

    return error.response?.data?.message || error.message;
  }, [error, message]);

  const classes = useMemo(
    () => cn({ 'border-0': borderless, 'bg-transparent': transparent }),
    [borderless, transparent],
  );

  const Frame = inCard ? Card : 'div';

  return (
    <Frame className={`text-center px-4 py-8 ${classes}`}>
      <WarningOutlined className="text-[64px]" />
      <Title level={3} className="my-4 mx-0">
        <>{computedMessage}</>
      </Title>
      {onRetry && <Button onClick={onRetry}>Reintentar</Button>}
      {extra && <div className="text-left ">{extra}</div>}
    </Frame>
  );
};
