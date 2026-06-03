import { SettingFilled } from '@ant-design/icons';
import { Avatar } from 'antd';
import type React from 'react';

interface IHeader {
  children: React.ReactNode;
}

export function Header({ children }: IHeader) {
  return (
    <header className="w-full border-b border-slate-100 flex flex-col p-4">
      <div className="flex items-center">
        <div className="flex-1">{children}</div>
        <div className="flex items-center gap-4">
          <SettingFilled />
          <Avatar size="small" />
        </div>
      </div>
    </header>
  );
}
