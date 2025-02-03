import React from 'react';
import {Box, Button, Typography, AppBar, Toolbar, Container, useTheme} from '@mui/material';
import {styled} from '@mui/system';
import {useNavigate} from 'react-router-dom';

const HeroSection = styled(Box)(({theme}) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '90vh',
    background: theme.palette.mode === 'dark'
        ? 'linear-gradient(90deg, rgba(38,30,0,1) 0%, rgba(203,178,106,0.5) 50%, rgba(38,30,0,1) 100%)'
        : 'linear-gradient(90deg, rgba(38,30,0,1) 0%, rgba(203,178,106,1) 50%, rgba(38,30,0,1) 100%)',
    textAlign: 'center',
    padding: theme.spacing(4),
}));

const Home = () => {
    const navigate = useNavigate();

    return (
        <>

            <HeroSection>
                <Typography variant="h2" gutterBottom sx={{fontWeight: 'bold'}}>
                    Effortless Shift Management
                </Typography>
                <Typography variant="h5" gutterBottom>
                    Simplify your team's shift scheduling with ease.
                </Typography>
                <Button
                    variant="contained"
                    size="large"
                    sx={{mt: 4, px: 4, py: 2, fontWeight: 'bold', fontSize: '18px'}}
                    onClick={() => navigate('/signin')}
                >
                    Get Started
                </Button>
            </HeroSection>

            <Container sx={{my: 8}}>
                <Typography variant="h4" gutterBottom textAlign="center">
                    Why Choose ShiftEase?
                </Typography>
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: {xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr'},
                        gap: 4,
                        mt: 4,
                    }}
                >
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            📅 Streamlined Scheduling
                        </Typography>
                        <Typography>
                            Create, manage, and adjust shifts quickly and effortlessly.
                        </Typography>
                    </Box>
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            👨‍👩‍👧 Team Collaboration
                        </Typography>
                        <Typography>
                            Empower your team with transparency and real-time updates.
                        </Typography>
                    </Box>
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            💾 Secure and Reliable
                        </Typography>
                        <Typography>
                            Built with robust security to keep your data safe.
                        </Typography>
                    </Box>
                </Box>
            </Container>

            <Box
                sx={{
                    background: (theme) => theme.palette.mode === 'dark'
                        ? 'linear-gradient(90deg, rgba(38,30,0,1) 0%, rgba(203,178,106,0.5) 50%, rgba(38,30,0,1) 100%)'
                        : 'linear-gradient(90deg, rgba(38,30,0,1) 0%, rgba(203,178,106,1) 50%, rgba(38,30,0,1) 100%)',
                    py: 4,
                    textAlign: 'center',
                }}
            >
                <Typography variant="h6">
                    &copy; {new Date().getFullYear()} ShiftEase. All rights reserved.
                </Typography>
            </Box>
        </>
    );
};

export default Home;
