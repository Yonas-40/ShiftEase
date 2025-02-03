import React, {useState} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import axios from 'axios';
import {
    Box,
    Button,
    CircularProgress,
    FormControl,
    FormLabel,
    TextField,
    Typography,
    Card,
    styled
} from '@mui/material';
import AppTheme from './shared-theme/AppTheme';
import ColorModeSelect from './shared-theme/ColorModeSelect';
import CssBaseline from "@mui/material/CssBaseline";
import Stack from "@mui/material/Stack";
import {SitemarkIcon} from "./CustomIcons.jsx";

const SignInContainer = styled(Stack)(({theme}) => ({
    height: 'calc((1 - var(--template-frame-height, 0)) * 100dvh)',
    minHeight: '100%',
    padding: theme.spacing(2),
    [theme.breakpoints.up('sm')]: {
        padding: theme.spacing(4),
    },
    '&::before': {
        content: '""',
        display: 'block',
        position: 'absolute',
        zIndex: -1,
        inset: 0,
        backgroundImage:
            'radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))',
        backgroundRepeat: 'no-repeat',
        ...theme.applyStyles('dark', {
            backgroundImage:
                'radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))',
        }),
    },
    position: 'relative',
}));
const StyledCard = styled(Card)(({theme}) => ({
    display: 'flex',
    flexDirection: 'column',
    alignSelf: 'center',
    width: '100%',
    padding: theme.spacing(4),
    gap: theme.spacing(2),
    margin: 'auto',
    [theme.breakpoints.up('sm')]: {
        maxWidth: '450px',
    },
    boxShadow:
        'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
    ...theme.applyStyles('dark', {
        boxShadow:
            'hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px',
    }),
}));

const FormContainer = styled(Box)(({theme}) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    width: '100%',
}));

export default function ResetPassword() {
    const {userId, token} = useParams();
    const navigate = useNavigate();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');

        if (newPassword !== confirmPassword) {
            setErrorMessage('Passwords do not match.');
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post('http://127.0.0.1:8000/reset-password/', {
                userId,
                token,
                newPassword,
            });

            if (response.status === 200) {
                setSuccessMessage('Password reset successful! Redirecting to login...');
                setTimeout(() => navigate('/signin'), 3000);
            }
        } catch (error) {
            setErrorMessage('Failed to reset password. Please try again or check the link.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AppTheme>
            <CssBaseline enableColorScheme/>
            <SignInContainer direction="column" justifyContent="space-between">
                <ColorModeSelect sx={{position: 'fixed', top: '1rem', right: '1rem'}}/>
                <StyledCard variant="outlined">
                    <SitemarkIcon/>
                    <Typography variant="h4" align="center">Reset Password</Typography>
                    <FormContainer component="form" onSubmit={handleSubmit}>
                        {errorMessage && (
                            <Typography color="error" variant="body2" align="center">
                                {errorMessage}
                            </Typography>
                        )}
                        {successMessage && (
                            <Typography color="primary" variant="body2" align="center">
                                {successMessage}
                            </Typography>
                        )}
                        <FormControl>
                            <FormLabel>New Password</FormLabel>
                            <TextField
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                fullWidth
                            />
                        </FormControl>
                        <FormControl>
                            <FormLabel>Confirm Password</FormLabel>
                            <TextField
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                fullWidth
                            />
                        </FormControl>
                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            disabled={loading}
                            sx={{display: 'flex', justifyContent: 'center'}}
                        >
                            {loading ? <CircularProgress size={20}/> : 'Reset Password'}
                        </Button>
                    </FormContainer>
                </StyledCard>
            </SignInContainer>
        </AppTheme>
    );
}
