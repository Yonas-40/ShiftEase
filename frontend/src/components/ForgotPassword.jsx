import * as React from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import OutlinedInput from '@mui/material/OutlinedInput';
import axios from 'axios';
import {CircularProgress} from "@mui/material";

function ForgotPassword({open, handleClose}) {
    const [email, setEmail] = React.useState('');
    const [error, setError] = React.useState('');
    const [loading, setLoading] = React.useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setLoading(true);


        try {
            const response = await axios.post('http://127.0.0.1:8000/forgot-password/', {email});
            if (response.status === 200) {
                alert('A password reset link has been sent to your email.');
                handleClose();
            }
        } catch (error) {
            setError('Error sending password reset email. Please try again.');
            console.error('Error resetting password:', error);
            alert('Error sending password reset email.');
        } finally {
            setLoading(false);
        }
    };
    return (
        <Dialog
            open={open}
            onClose={handleClose}
            PaperProps={{
                component: 'form',
                onSubmit: handleSubmit,
                sx: {backgroundImage: 'none'},
            }}
        >
            <DialogTitle>Reset password</DialogTitle>
            <DialogContent
                sx={{display: 'flex', flexDirection: 'column', gap: 2, width: '100%'}}
            >
                <DialogContentText>
                    Enter your account&apos;s email address, and we&apos;ll send you a link to
                    reset your password.
                </DialogContentText>
                <OutlinedInput
                    autoFocus
                    required
                    margin="dense"
                    id="email"
                    name="email"
                    label="Email address"
                    placeholder="Email address"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    fullWidth
                />
            </DialogContent>
            <DialogActions sx={{pb: 3, px: 3}}>
                <Button onClick={handleClose}>Cancel</Button>
                <Button variant="contained" disabled={loading} type="submit">
                    {loading ? (
                        <CircularProgress size={20}/> // Show spinner when loading
                    ) : (
                        'Continue' // Show text when not loading
                    )}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

ForgotPassword.propTypes = {
    handleClose: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
};

export default ForgotPassword;