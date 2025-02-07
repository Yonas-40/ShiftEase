import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import CssBaseline from '@mui/material/CssBaseline';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import MuiCard from '@mui/material/Card';
import {styled} from '@mui/material/styles';
import ForgotPassword from './ForgotPassword';
import {SitemarkIcon} from './CustomIcons';
import AppTheme from './shared-theme/AppTheme';
import ColorModeSelect from './shared-theme/ColorModeSelect';
import {useNavigate} from "react-router-dom";
import axios from 'axios';
import {CircularProgress} from "@mui/material";

const Card = styled(MuiCard)(({theme}) => ({
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

const FormContainer = styled(Box)(({theme}) => ({
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    gap: theme.spacing(2),
    transition: 'transform 0.6s', // Animation for flipping form
    transformStyle: 'preserve-3d',
    position: 'relative',
}));

export default function SignIn(props) {
    const [emailError, setEmailError] = React.useState(false);
    const [emailErrorMessage, setEmailErrorMessage] = React.useState('');
    const [passwordError, setPasswordError] = React.useState(false);
    const [passwordErrorMessage, setPasswordErrorMessage] = React.useState('');
    const [open, setOpen] = React.useState(false);
    const [loading, setLoading] = React.useState(false); // For handling loading state
    const [errorMessage, setErrorMessage] = React.useState(''); // To display any errors from the server
    const [showChangePassword, setShowChangePassword] = React.useState(false); // State to toggle form
    const [isForgotPassword, setIsForgotPassword] = React.useState(false);
    const navigate = useNavigate();

    // Function to refresh the access token
    // const refreshAccessToken = async () => {
    //     const refreshToken = localStorage.getItem('refresh_token');
    //     if (refreshToken) {
    //         try {
    //             const response = await axios.post('http://127.0.0.1:8000/api/token/refresh/', {
    //                 refresh: refreshToken,
    //             });
    //             const {access} = response.data;
    //             localStorage.setItem('access_token', access); // Store new access token
    //         } catch (error) {
    //             console.error('Error refreshing token:', error);
    //             setIsLoggedIn(false); // Log out the user if token refresh fails
    //             navigate('/login'); // Redirect to login page
    //         }
    //     }
    // };

    const handleClickOpen = () => {
        setIsForgotPassword(true);
        setOpen(true);
    };

    const handleClose = () => {
        setIsForgotPassword(false);
        setOpen(false);
    };

    const validateInputs = () => {
        const email = document.getElementById('email');
        const password = document.getElementById('password');

        let isValid = true;

        if (!email.value || !/\S+@\S+\.\S+/.test(email.value)) {
            setEmailError(true);
            setEmailErrorMessage('Please enter a valid email address.');
            isValid = false;
        } else {
            setEmailError(false);
            setEmailErrorMessage('');
        }

        if (!password.value || password.value.length < 6) {
            setPasswordError(true);
            setPasswordErrorMessage('Password must be at least 6 characters long.');
            isValid = false;
        } else {
            setPasswordError(false);
            setPasswordErrorMessage('');
        }

        return isValid;
    };

    const handleSubmit = async (event) => {
        event.preventDefault(); // Prevent default form submission

        if (!validateInputs()) return;

        const data = new FormData(event.currentTarget);
        const email = data.get('email');
        const password = data.get('password');

        try {
            setLoading(true); // Start loading state

            // Send credentials to backend to get the JWT token
            const response = await axios.post(`${process.env.BACKEND_URL}/api/token/`, {
                email: email,
                password: password,
            });

            // Assuming backend returns { access: <JWT access token>, refresh: <refresh token> }
            const {access, refresh, force_password_change} = response.data;

            // Store tokens in localStorage (or cookies)
            localStorage.setItem('access_token', access);
            localStorage.setItem('refresh_token', refresh);

            // Check if the user is required to change their password
            if (force_password_change) {
                setShowChangePassword(true); // Show change password form
                setLoading(false);
            } else {
                console.log('User authenticated!');
                navigate('/calendar'); // Redirect to DashboardLayout
            }
        } catch (error) {
            setLoading(false); // End loading state
            setErrorMessage('Invalid email or password.');
            console.error('Authentication error', error);
        }
    };
    const handlePasswordChange = async (event) => {
        event.preventDefault(); // Prevent default form submission

        const data = new FormData(event.currentTarget);
        const newPassword = data.get('new-password');
        const confirmPassword = data.get('confirm-password');
        const email = data.get('email');

        // Reset error state
        setPasswordError(false);
        setPasswordErrorMessage('');

        // Validate passwords
        if (!newPassword || !confirmPassword) {
            setPasswordError(true);
            setPasswordErrorMessage('Both fields are required.');
            return;
        }

        // Validate the new password and confirm password
        if (newPassword !== confirmPassword) {
            setPasswordError(true);
            setPasswordErrorMessage('Passwords do not match');
            return;
        }

        try {
            setLoading(true); // Start loading state

            // Get the access token from localStorage
            const accessToken = localStorage.getItem('access_token');
            let apiUrl = 'http://127.0.0.1:8000/change-password/';

            // Make the PATCH request
            const response = await axios.patch(
                apiUrl,
                {new_password: newPassword},
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`, // Add Authorization header
                    },
                }
            );

            // Assuming the response confirms the password change
            setLoading(false);

            // Handle the response for the first login password change
            setShowChangePassword(false);
            // Redirect to home after changing password
            navigate('/calendar');
        } catch (error) {
            setLoading(false); // End loading state
            setErrorMessage('Error changing password. Please try again.');
            console.error('Error changing password', error);
        }
    };

    return (
        <AppTheme {...props}>
            <CssBaseline enableColorScheme/>
            <SignInContainer direction="column" justifyContent="space-between">
                <ColorModeSelect sx={{position: 'fixed', top: '1rem', right: '1rem'}}/>
                <FormContainer
                    sx={{transform: showChangePassword ? 'rotateY(180deg)' : 'rotateY(0deg)', margin: ' 150px auto'}}>
                    {/* Sign In Card */}
                    <Card variant="outlined" sx={{
                        position: 'absolute',
                        display: showChangePassword ? 'none' : 'flex', // Toggle display based on state
                    }}>
                        <SitemarkIcon/>
                        <Typography
                            component="h1"
                            variant="h4"
                            sx={{width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)'}}
                        >
                            Sign in
                        </Typography>
                        <Box
                            component="form"
                            onSubmit={handleSubmit}
                            noValidate
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                width: '100%',
                                gap: 2,
                            }}
                        >
                            <FormControl>
                                <FormLabel htmlFor="email">Email</FormLabel>
                                <TextField
                                    error={emailError}
                                    helperText={emailErrorMessage}
                                    id="email"
                                    type="email"
                                    name="email"
                                    placeholder="your@email.com"
                                    autoComplete="email"
                                    autoFocus
                                    required
                                    fullWidth
                                    variant="outlined"
                                    color={emailError ? 'error' : 'primary'}
                                />
                            </FormControl>
                            <FormControl>
                                <FormLabel htmlFor="password">Password</FormLabel>
                                <TextField
                                    error={passwordError}
                                    helperText={passwordErrorMessage}
                                    name="password"
                                    placeholder="••••••"
                                    type="password"
                                    id="password"
                                    autoComplete="current-password"
                                    autoFocus
                                    required
                                    fullWidth
                                    variant="outlined"
                                    color={passwordError ? 'error' : 'primary'}
                                />
                            </FormControl>
                            <FormControlLabel
                                control={<Checkbox value="remember" color="primary"/>}
                                label="Remember me"
                            />
                            <ForgotPassword open={open} handleClose={handleClose}/>
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                disabled={loading} // Disable button while loading
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center', // Ensures content is always centered
                                }}
                            >
                                {loading ? (
                                    <CircularProgress size={20}/> // Show spinner when loading
                                ) : (
                                    'Sign in' // Show text when not loading
                                )}
                            </Button>
                            {errorMessage && (
                                <Typography color="error" variant="body2" sx={{textAlign: 'center'}}>
                                    {errorMessage}
                                </Typography>
                            )}
                            <Link
                                component="button"
                                type="button"
                                onClick={handleClickOpen}
                                variant="body2"
                                sx={{alignSelf: 'center'}}
                            >
                                Forgot your password?
                            </Link>
                        </Box>
                    </Card>

                    {/* Change Password Card */}
                    <Card variant="outlined" sx={{
                        position: 'absolute',
                        display: showChangePassword ? 'flex' : 'none', // Toggle display based on state
                        transform: 'rotateY(180deg)', // Ensure it's flipped when displayed
                    }}>
                        <SitemarkIcon/>
                        <Typography
                            component="h1"
                            variant="h4"
                            sx={{width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)'}}
                        >
                            {isForgotPassword ? 'Reset Password' : 'Change Password'}
                        </Typography>

                        <Box
                            component="form"
                            onSubmit={handlePasswordChange}
                            noValidate
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                width: '100%',
                                gap: 2,
                            }}
                        >
                            <FormControl>
                                <FormLabel htmlFor="new-password">New Password</FormLabel>
                                <TextField
                                    error={passwordError}
                                    helperText={passwordErrorMessage}
                                    name="new-password"
                                    placeholder="••••••"
                                    type="password"
                                    id="new-password"
                                    autoFocus
                                    required
                                    fullWidth
                                    variant="outlined"
                                    color={passwordError ? 'error' : 'primary'}
                                />
                            </FormControl>
                            <FormControl>
                                <FormLabel htmlFor="confirm-password">Confirm Password</FormLabel>
                                <TextField
                                    error={passwordError}
                                    helperText={passwordErrorMessage}
                                    name="confirm-password"
                                    placeholder="••••••"
                                    type="password"
                                    id="confirm-password"
                                    autoFocus
                                    required
                                    fullWidth
                                    variant="outlined"
                                    color={passwordError ? 'error' : 'primary'}
                                />
                            </FormControl>
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                disabled={loading} // Disable button while loading
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center', // Ensures content is always centered
                                }}
                            >
                                {loading ? (
                                    <CircularProgress size={20}/> // Show spinner when loading
                                ) : (
                                    isForgotPassword ? 'Reset Password' : 'Change Password' // Show text when not loading
                                )}
                            </Button>
                            <Button fullWidth variant="outlined" onClick={handleClose}>
                                Back to Sign In
                            </Button>
                            {errorMessage && (
                                <Typography color="error" variant="body2" sx={{textAlign: 'center'}}>
                                    {errorMessage}
                                </Typography>
                            )}
                        </Box>
                    </Card>
                </FormContainer>
            </SignInContainer>
        </AppTheme>
    );
}
