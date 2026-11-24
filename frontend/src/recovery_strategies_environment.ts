// The Pages build is an explicitly static, guest-only application.
export const MOCK_ONLY = import.meta.env.MODE === 'pages';

export function localMediaPath(filename: string): string {
    return `${import.meta.env.BASE_URL}media/${filename}`;
}
