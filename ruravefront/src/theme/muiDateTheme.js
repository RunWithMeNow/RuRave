import { createTheme } from '@mui/material/styles';

export const createRuRaveMuiTheme = (mode = 'dark') =>
    createTheme({
        palette: {
            mode,
            primary: {
                main: mode === 'dark' ? '#9b59b6' : '#7d3c98',
                contrastText: mode === 'dark' ? '#0f0f1a' : '#ffffff',
            },
            background: {
                paper: mode === 'dark' ? '#0f0f1a' : '#ffffff',
                default: mode === 'dark' ? '#1e1428' : '#f0edf5',
            },
            text: {
                primary: mode === 'dark' ? '#e8eaf6' : '#1a1225',
                secondary: mode === 'dark' ? '#a0a4b8' : '#5c5470',
            },
            divider: mode === 'dark' ? 'rgba(160, 164, 184, 0.35)' : 'rgba(155, 89, 182, 0.25)',
        },
        typography: {
            fontFamily: '"Rubik", sans-serif',
        },
        shape: {
            borderRadius: 14,
        },
        components: {
            MuiPickersDay: {
                styleOverrides: {
                    root: {
                        fontFamily: '"Rubik", sans-serif',
                    },
                },
            },
        },
    });
