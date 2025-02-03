import React, {useMemo} from 'react';
import {CssBaseline, Typography, createTheme, Button, Box} from '@mui/material';
import {AppProvider} from '@toolpad/core/AppProvider';
import {DashboardLayout} from '@toolpad/core/DashboardLayout';
import {Outlet, useNavigate} from 'react-router-dom';

const demoTheme = createTheme({
    cssVariables: {
        colorSchemeSelector: 'data-toolpad-color-scheme',
    },
    colorSchemes: {light: true, dark: true},
    breakpoints: {
        values: {
            xs: 0,
            sm: 600,
            md: 600,
            lg: 1200,
            xl: 1536,
        },
    },
});

function DashboardLayoutLanding() {
    const navigate = useNavigate();
    const authentication = useMemo(() => {
        return {
            signIn: () => navigate('/signin'),
            signOut: () => {},
        };
    }, [navigate]);
    return (
        <AppProvider
            authentication={authentication}
            theme={demoTheme}>
            <DashboardLayout
                hideNavigation
                slots={{
                    appTitle: () => (
                        <Typography
                            component="div"
                            sx={{
                                color: (theme) =>
                                    theme.palette.mode === 'dark' ? '#CBB26A' : '#5c4704',
                                fontWeight: 'bolder',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                            }}
                        >
                            <img src="/images/logo.svg" alt="ShiftEase logo" style={{height: 50}}/>
                            <Typography variant="h4">ShiftEase</Typography>
                        </Typography>
                    ),
                }}
            >
                <CssBaseline/>
                <Outlet/>
            </DashboardLayout>
        </AppProvider>
    )
        ;
}

export default DashboardLayoutLanding;
