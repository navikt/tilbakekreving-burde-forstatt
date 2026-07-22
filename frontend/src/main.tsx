import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import './index.css';

import App from './App.tsx';
import { hentKravgrunnlagFraApi, hentKravgrunnlagMutationKey } from './api/kravgrunnlag.ts';
import { AuthProvider } from './hooks/AuthProvider.tsx';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // 5 minutter
            refetchOnWindowFocus: false,
        },
    },
});

queryClient.setMutationDefaults(hentKravgrunnlagMutationKey, {
    mutationFn: hentKravgrunnlagFraApi,
});

const container = document.getElementById('root');

if (!container) {
    throw new Error('Fant ikke rot-element: "root"');
}

createRoot(container).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <App />
                <ReactQueryDevtools initialIsOpen={false} />
            </AuthProvider>
        </QueryClientProvider>
    </StrictMode>
);
