import { useMemo, type ReactNode } from 'react';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';

interface IReactQueryProvider {
  children: ReactNode;
}
export function ReactQueryProvider({ children }: IReactQueryProvider) {
  const client = useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            staleTime: 30000,
            retry: false,
          },
        },
      }),
    [],
  );

  return (
    <QueryClientProvider client={client}>
      {children}
      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
    </QueryClientProvider>
  );
}
