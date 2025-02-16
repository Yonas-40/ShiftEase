import React, {useEffect, useState} from 'react';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Checkbox from "@mui/material/Checkbox";
import {fetchEmployees} from '../../services/api.jsx';
import FormControlLabel from "@mui/material/FormControlLabel";
import AxiosInstance from "../AxiosInstance.jsx"; // Import AxiosInstance
import Alert from '@mui/material/Alert';
import {SitemarkIcon} from "../CustomIcons.jsx"; // Import custom icon

const shiftTypes = ['Day (7:00-15:00)', 'Evening (15:00-22:00)'];

const AddShiftModal = ({open, onClose, date, onAddShift}) => {
    const [employees, setEmployees] = useState([]); // State for employee data
    const [selectedEmployee, setSelectedEmployee] = useState('');
    const [selectedShift, setSelectedShift] = useState('');
    const [isAvailable, setIsAvailable] = useState(true);
    const [loading, setLoading] = useState(true);
    const [authError, setAuthError] = useState(false); // State to manage auth error
    const [errorMessage, setErrorMessage] = useState(''); // Custom error messages
    const [loggedInEmployee, setLoggedInEmployee] = useState(''); // State for logged-in employee's name

    const userRole = localStorage.getItem("user_role");

    // Fetch logged-in user's profile when modal opens
    useEffect(() => {
        const fetchUserProfile = async (token) => {
            try {
                const response = await AxiosInstance.get(`${process.env.BACKEND_URL}/api/user-profile/`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setLoggedInEmployee(response.data.username); // Set the logged-in employee's name
            } catch (error) {
                console.error('Error fetching user profile:', error);
            }
        };

        if (open && userRole === 'employee') {
            const token = localStorage.getItem("access_token");
            if (token) {
                fetchUserProfile(token);
            }
        }

        // Fetch employees if the user is a manager or admin
        if (open && userRole !== "employee") {
            const loadEmployees = async () => {
                try {
                    setLoading(true);
                    const token = localStorage.getItem("access_token"); // Ensure token is retrieved here

                    const response = await AxiosInstance.get(`${process.env.BACKEND_URL}/employees/`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                    });
                    setEmployees(response.data);
                } catch (error) {
                    console.error("Error fetching employees:", error);
                    setErrorMessage("Failed to load employees. Please try again.");
                } finally {
                    setLoading(false);
                }
            };
            loadEmployees();
        }
    }, [open, userRole]);

    const handleSubmit = async () => {
        const employeeId =
            userRole === "employee"
                ? null // Employee ID will be determined in the backend
                : employees.find((emp) => emp.username === selectedEmployee)?.id;

        const shiftTypeMap = {
            "Day (7:00-15:00)": "DAY",
            "Evening (15:00-22:00)": "EVE",
        };
        const shiftTypeCode =
            userRole === "employee"
                ? shiftTypeMap[selectedShift]
                : shiftTypeMap[selectedShift];

        const shiftPayload =
            userRole === "employee"
                ? {
                    employee: employeeId,
                    shift_date: date,
                    shift_type: shiftTypeCode,
                    is_available: isAvailable, // Include availability for employees
                }
                : {
                    employee: employeeId,
                    shift_date: date,
                    shift_type: shiftTypeCode,
                };
        try {
            const token = localStorage.getItem("access_token");
            if (!token) {
                setAuthError(true);
                setErrorMessage("No valid token found. Please sign in to continue.");
                return;
            }

            await AxiosInstance.post(`${process.env.BACKEND_URL}/create_shifts/`, shiftPayload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            onAddShift(shiftPayload);
            onClose();
        } catch (error) {
            if (error.response && error.response.status === 400) {
                const backendErrors = error.response.data.errors;
                const errorMessages = Object.values(backendErrors)
                    .flat()
                    .join(", ");
                setErrorMessage(errorMessages || "An error occurred while adding the shift.");
            } else if (error.response && error.response.status === 401) {
                setAuthError(true);
                setErrorMessage("Your session has expired. Please sign in again.");
            } else {
                setErrorMessage("A network error occurred. Please check your connection and try again.");
            }
        }
    };

    const handleSignInRedirect = () => {
        window.location.href = '/signin'; // Redirect to sign-in page
    };

    return (
        <Modal open={open} onClose={onClose}>
            <Box
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 400,
                    bgcolor: 'background.paper',
                    boxShadow: 24,
                    outline: 'none',
                    p: 4,
                }}
            >
                <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding:'0 0 25px'}}>
                    <Typography variant="h6" component="h2">
                        {userRole === "employee" ? "Add Availability" : "Add Shift"}
                    </Typography>
                    <SitemarkIcon sx={{cursor: 'pointer'}}/>
                </Box>
                {authError && (
                    <Alert
                        severity="error"
                        action={
                            <Button color="inherit" size="small" onClick={handleSignInRedirect}>
                                Sign In
                            </Button>
                        }
                        sx={{mb: 2}}
                    >
                        No valid token found. Please sign in to continue.
                    </Alert>
                )}
                {errorMessage && (
                    <Alert severity="error" sx={{mb: 2}}>
                        {errorMessage}
                    </Alert>
                )}
                <TextField
                    label="Date"
                    value={date}
                    fullWidth
                    margin="normal"
                    InputProps={{
                        readOnly: true,
                    }}
                />
                {userRole !== "employee" && (
                    <TextField
                        label="Employee"
                        value={selectedEmployee}
                        onChange={(e) => setSelectedEmployee(e.target.value)}
                        select
                        fullWidth
                        margin="normal"
                        disabled={loading}
                    >
                        {loading ? (
                            <MenuItem disabled>Loading employees...</MenuItem>
                        ) : (
                            employees.map((employee) => (
                                <MenuItem key={employee.id} value={employee.username}>
                                    {employee.username}
                                </MenuItem>
                            ))
                        )}
                    </TextField>
                )}
                {userRole === "employee" && (
                    <TextField
                        label="Employee"
                        value={loggedInEmployee} // Fill the text field with logged-in employee's name
                        fullWidth
                        margin="normal"
                        InputProps={{
                            readOnly: true,
                        }}
                    />
                )}
                <TextField
                    label="Shift Type"
                    value={selectedShift}
                    onChange={(e) => setSelectedShift(e.target.value)}
                    select
                    fullWidth
                    margin="normal"
                >
                    {shiftTypes.map((shift) => (
                        <MenuItem key={shift} value={shift}>
                            {shift}
                        </MenuItem>
                    ))}
                </TextField>
                {userRole === "employee" && (
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={true}
                                onChange={(e) => setIsAvailable(e.target.checked)}
                                disabled
                            />
                        }
                        label="Available"
                    />
                )}
                <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    sx={{mt: 2}}
                    onClick={handleSubmit}
                    disabled={!selectedShift && userRole === "employee"} // Disable if inputs are incomplete
                >
                    {userRole === "employee" ? "Submit Availability" : "Add Shift"}
                </Button>
            </Box>
        </Modal>
    );
};

export default AddShiftModal;
