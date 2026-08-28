import type React from 'react';
import { ReactQueryProvider } from './react-query-provider';
import { LanguageProvider } from '@/context/language/language-context.provider';
import { AuthProvider } from '@/context/auth/auth-context.provider';
import { AbilityProvider } from '@/context/ability/ability-context.provider';
import { StyleProvider } from '@ant-design/cssinjs';
import { StorageProvider } from '@/context/storage/storage-context.provider';
import { ThemeProvider } from '@/context/theme/theme-context.provider';
import { AntDProvider } from './antd-provider';
import { GlobalMessageHandler } from './global-message-handler';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ReactQueryProvider>
      <StyleProvider layer>
        <StorageProvider>
          <ThemeProvider>
            <AntDProvider>
              <GlobalMessageHandler />
              <LanguageProvider>
                <AuthProvider>
                  <AbilityProvider>{children}</AbilityProvider>
                </AuthProvider>
              </LanguageProvider>
            </AntDProvider>
          </ThemeProvider>
        </StorageProvider>
      </StyleProvider>
    </ReactQueryProvider>
  );
}
