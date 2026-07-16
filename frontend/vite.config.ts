import type { Plugin } from 'vite';

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

/**
 * Mock API-endepunkter for lokal utvikling uten backend.
 * Deaktiver med: VITE_USE_BACKEND=true pnpm dev
 */
function devMockApi(): Plugin {
    return {
        name: 'dev-mock-api',
        configureServer(server) {
            server.middlewares.use('/api/me', (_req, res) => {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ name: 'Lokal Utvikler' }));
            });
            server.middlewares.use('/api/tilbakekreving', (req, res) => {
                if ((req as { method?: string }).method === 'POST') {
                    res.setHeader('Content-Type', 'application/json');
                    res.end(
                        JSON.stringify({
                            data: '',
                            frontendFeilmelding: '',
                            melding: 'OK (mock)',
                            stacktrace: '',
                            status: 'OK',
                        })
                    );
                } else {
                    res.statusCode = 405;
                    res.end();
                }
            });
        },
    };
}

const useBackend =
    (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env
        ?.VITE_USE_BACKEND === 'true';

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), tailwindcss(), ...(!useBackend ? [devMockApi()] : [])],
    server: {
        host: '0.0.0.0',
        ...(useBackend && {
            proxy: {
                '/api': {
                    target: 'http://localhost:8080/',
                    changeOrigin: true,
                    secure: false,
                },
            },
        }),
    },
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './src/test/setup.ts',
        css: true,
    },
});
