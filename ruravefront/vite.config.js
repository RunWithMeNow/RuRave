import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
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
