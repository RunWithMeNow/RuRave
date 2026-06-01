import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// npm run dev:tunnel / preview:tunnel (--host) — слушать все интерфейсы, без HMR
const isTunnel = process.argv.includes('--host');

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        // localtunnel (*.loca.lt) — всегда, иначе блок при обычном npm run dev
        allowedHosts: true,
        proxy: {
            '/api': 'http://localhost:5080',
        },
        ...(isTunnel ? { host: true, hmr: false } : {}),
    },
    preview: {
        host: true,
        port: 4173,
        allowedHosts: true,
        proxy: {
            '/api': 'http://localhost:5080',
        },
    },
    optimizeDeps: {
        include: [
            'react',
            'react-dom',
            'react/jsx-runtime',
            '@emotion/react',
            '@emotion/styled',
            '@mui/material',
            '@mui/material/styles',
            '@mui/x-date-pickers',
            '@mui/x-date-pickers/LocalizationProvider',
            '@mui/x-date-pickers/AdapterDayjs',
            '@mui/x-date-pickers/DateCalendar',
            'dayjs',
            'dayjs/locale/ru',
        ],
    },
});
