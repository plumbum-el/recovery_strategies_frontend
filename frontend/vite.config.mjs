import { readFileSync } from 'node:fs';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const pages = mode === 'pages';
    const lan = mode === 'lan';
    const https = lan ? {
        key: readFileSync(new URL('./certs/recovery-key.pem', import.meta.url)),
        cert: readFileSync(new URL('./certs/recovery-cert.pem', import.meta.url)),
    } : undefined;

    return {
        plugins: [react()],
        // Relative paths allow Pages to work under any repository name.
        base: pages ? './' : '/',
        server: {
            host: lan ? '0.0.0.0' : '127.0.0.1',
            port: 5173,
            strictPort: true,
            https,
            proxy: {
                '/api': {
                    target: 'http://127.0.0.1:8000',
                    changeOrigin: true,
                    xfwd: true,
                },
                '/s3': {
                    target: 'http://127.0.0.1:8000',
                    changeOrigin: true,
                    xfwd: true,
                    rewrite: path => '/api' + path,
                },
            },
        },
    };
});
