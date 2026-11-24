import axios from 'axios';
import { localMediaPath, MOCK_ONLY } from '../recovery_strategies_environment';
// Relative URLs are routed through Vite proxy, not directly to localhost:8000.
export const recoveryStrategiesHttp = axios.create({
    baseURL: '/api', withCredentials: true, timeout: 12000
});
export const recoveryStrategiesAuthHttp = axios.create({
    baseURL: '/api', withCredentials: true, timeout: 12000
});
// Pages has no backend. Even an accidental call must not send credentials or requests.
if (MOCK_ONLY) {
    for (const client of [recoveryStrategiesHttp, recoveryStrategiesAuthHttp]) {
        client.interceptors.request.use(() => {
            throw new Error('В режиме GitHub Pages доступен только mock.');
        });
    }
}

export function errorText(error: unknown): string {
    if (axios.isAxiosError(error)) {
        const detail = error.response?.data?.detail;
        return typeof detail === 'string' ? detail : Array.isArray(detail) ? detail.map(x => x.msg).join('; ') : error.message;
    }
    return error instanceof Error ? error.message : 'Неизвестная ошибка';
}
/** All S3 objects are loaded from the same origin through Vite /s3 proxy. */
export function mediaUrl(value: string | null | undefined): string | null {
    if (!value)
        return null;
    const raw = value.trim();
    if (!raw)
        return null;
    if (raw.startsWith('/media/'))
        return localMediaPath(raw.slice('/media/'.length));
    if (raw.startsWith('/s3/'))
        return raw;
    let path = raw;
    if (/^https?:\/\//i.test(raw)) {
        try {
            const url = new URL(raw);
            // MinIO URLs stored by earlier laboratories, including private bucket URLs,
            // must never be requested by the browser directly.
            if (url.port === '9000' || url.pathname.includes('recovery-strategies-media/') || url.pathname.includes('recovery-strategies/')) {
                path = url.pathname;
            }
            else if (url.pathname.startsWith('/api/recovery_strategies/media/')) {
                path = url.pathname;
            }
            else {
                return raw; // external public image only
            }
        }
        catch {
            return null;
        }
    }
    path = path.split('?')[0].split('#')[0];
    const parts = path.split('/').filter(Boolean);
    const encoded = parts[parts.length - 1];
    if (!encoded)
        return null;
    try {
        return `/s3/${encodeURIComponent(decodeURIComponent(encoded))}`;
    }
    catch {
        return null;
    }
}
