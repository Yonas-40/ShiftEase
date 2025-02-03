import React, {useEffect, useState} from 'react';
import {fetchEmployees, addEmployee, deleteEmployee} from '../../services/api';
import {Box, Typography, useTheme, Button, Modal, TextField} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import {useNavigate} from 'react-router-dom';
import {SitemarkIcon} from "../CustomIcons.jsx";

const EmployeeTable = () => {
    const [employees, setEmployees] = useState([]);
    const [open, setOpen] = useState(false); // State to manage modal visibility
    const [usernameError, setUsernameError] = useState(''); // State to track username error
    const [newEmployee, setNewEmployee] = useState({ // State to manage form input
        username: '',
        first_name: '',
        last_name: '',
        department: '',
        email: '',
        contact_number: '',
        address: '',
        designation: '',
    });
    const theme = useTheme(); // Get the current theme
    const navigate = useNavigate();

    const handleEditClick = (employeeName) => {
        navigate(`/employees/${employeeName}`);
    };

    const handleOpenModal = () => setOpen(true); // Open modal
    const handleCloseModal = () => setOpen(false); // Close modal

    const handleChange = (e) => {
        const {name, value} = e.target;

        // Check if the value has spaces for the username field
        if (name === 'username') {
            if (value.includes(' ')) {
                setUsernameError('Username cannot contain spaces');
            } else {
                setUsernameError('');
            }
        }

        setNewEmployee((prev) => ({...prev, [name]: value}));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formattedEmployee = {
            profile: {
                username: newEmployee.username.trim(),
                first_name: newEmployee.first_name,
                last_name: newEmployee.last_name,
                email: newEmployee.email,
                contact_number: newEmployee.contact_number,
                address: newEmployee.address,
                department: newEmployee.department,
            },
            designation: newEmployee.designation
        };

        try {
            await addEmployee(formattedEmployee); // Send formatted data
            setEmployees((prev) => [...prev, formattedEmployee]); // Add new employee to list
            alert("Employee added successfully!");
            // Reload employees after adding a new one
            const data = await fetchEmployees(); // Re-fetch employee list
            setEmployees(data); // Update state with new data
            handleCloseModal(); // Close modal after submission
        } catch (error) {
            console.error("Error adding employee:", error);
            alert("Failed to add employee.");
        }
    };

    useEffect(() => {
        const loadEmployees = async () => {
            const data = await fetchEmployees();
            // Sort the employees alphabetically by username
            const sortedEmployees = data.sort((a, b) => {
                return a.username.localeCompare(b.username);
            });
            setEmployees(sortedEmployees);
        };
        loadEmployees();
    }, []);

    const handleDeleteClick = async (username) => {
        if (window.confirm("Are you sure you want to delete this employee?")) {
            try {
                await deleteEmployee(username); // Call the delete API
                setEmployees((prev) => prev.filter((emp) => emp.username !== username)); // Remove from state
                alert("Employee deleted successfully!");
            } catch (error) {
                console.error("Error deleting employee:", error);
                alert("Failed to delete employee.");
            }
        }
    };

    return (
        <div>
            <Box sx={{
                boxShadow: 3,
                padding: '10px',
                margin: '20px 5px',
                backgroundColor: theme.palette.background.paper, // Adapts to theme
            }}>
                <Box sx={{display: 'flex', flexDirection:{xs: 'column', sm: 'row'}, justifyContent: 'space-between', alignItems: 'center', padding: '20px 0'}}>
                    <Typography variant="h4" sx={{color: theme.palette.text.primary, fontWeight: 'bolder'}}>
                        Employee List
                    </Typography>
                    <Button
                        variant="contained"
                        size="small"
                        color="success"
                        startIcon={<AddCircleIcon/>}
                        onClick={handleOpenModal} // Open modal when clicked
                    >
                        Add Employee
                    </Button>
                </Box>
                <Box sx={{
                    overflowX: 'auto',
                    display: 'block',
                    maxWidth: {xs:'100vh', sm:'100%'},
                }}>
                    <table className="table" style={{ minWidth: '100vh' }}>
                    <thead>
                    <tr>
                        <th style={{
                            backgroundColor: theme.palette.background.default,
                            color: theme.palette.text.primary
                        }}>
                            #
                        </th>
                        <th style={{
                            backgroundColor: theme.palette.background.default,
                            color: theme.palette.text.primary
                        }}>
                            Name
                        </th>
                        <th style={{
                            backgroundColor: theme.palette.background.default,
                            color: theme.palette.text.primary
                        }}>
                            Department
                        </th>
                        <th style={{
                            backgroundColor: theme.palette.background.default,
                            color: theme.palette.text.primary
                        }}>
                            Designation
                        </th>
                        <th style={{
                            backgroundColor: theme.palette.background.default,
                            color: theme.palette.text.primary
                        }}>
                            Date Joined
                        </th>
                        <th style={{
                            backgroundColor: theme.palette.background.default,
                            color: theme.palette.text.primary
                        }}>
                            Actions
                        </th>
                    </tr>
                    </thead>
                    <tbody>
                    {employees.map((emp, index) => (
                        <tr key={emp.id} style={{backgroundColor: theme.palette.background.default}}>
                            <td style={{
                                backgroundColor: theme.palette.background.default,
                                color: theme.palette.text.primary
                            }}>
                                {index + 1} {/* Sequence number starts from 1 */}
                            </td>
                            <td style={{
                                backgroundColor: theme.palette.background.default,
                                color: theme.palette.text.primary
                            }}>{emp.username}</td>
                            <td style={{
                                backgroundColor: theme.palette.background.default,
                                color: theme.palette.text.primary
                            }}>{emp.department}</td>
                            <td style={{
                                backgroundColor: theme.palette.background.default,
                                color: theme.palette.text.primary
                            }}>{emp.designation}</td>
                            <td style={{
                                backgroundColor: theme.palette.background.default,
                                color: theme.palette.text.primary
                            }}>{emp.date_joined}</td>
                            <td style={{
                                backgroundColor: theme.palette.background.default,
                                color: theme.palette.text.primary
                            }}>
                                <Button
                                    variant="contained" size="small" color="primary" startIcon={<EditIcon/>}
                                    onClick={() => handleEditClick(emp.username)} // Navigate to the employee's page
                                >
                                    Edit
                                </Button>
                                <Button
                                    variant="contained"
                                    size="small"
                                    color="error"
                                    startIcon={<DeleteIcon/>}
                                    sx={{ml: 1}}
                                    onClick={() => handleDeleteClick(emp.username)} // Call delete function with employee ID
                                >
                                    Delete
                                </Button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                </Box>
            </Box>
            {/* Add Employee Modal */}
            <Modal open={open} onClose={handleCloseModal}>
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    bgcolor: 'background.paper',
                    boxShadow: 24,
                    p: 4,
                    width: '400px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                }}>
                    {/* Use flexbox to position the header content */}
                    <Box sx={{position: 'fixed', top: '1rem', left: '1rem'}}>
                        <SitemarkIcon/>
                    </Box>
                    <Typography variant="h6" sx={{mb: 2, marginTop: 3}}>Add New Employee</Typography>
                    <form
                        onSubmit={handleSubmit}
                        style={{
                            maxWidth: "600px",
                            width: "100%",
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr", // Two equal columns
                            gap: "16px", // Space between grid items
                            alignItems: "center",
                        }}>
                        <TextField
                            fullWidth
                            label="Username"
                            name="username"
                            value={newEmployee.username}
                            onChange={handleChange}
                            error={!!usernameError} // Set error state if there's an error
                            helperText={usernameError} // Show error message
                            sx={{mb: 2}}
                        />
                        <TextField
                            fullWidth
                            label="First Name"
                            name="first_name"
                            value={newEmployee.first_name}
                            onChange={handleChange}
                            sx={{mb: 2}}
                        />
                        <TextField
                            fullWidth
                            label="Last Name"
                            name="last_name"
                            value={newEmployee.last_name}
                            onChange={handleChange}
                            sx={{mb: 2}}
                        />
                        <TextField
                            fullWidth
                            label="Department"
                            name="department"
                            value={newEmployee.department}
                            onChange={handleChange}
                            sx={{mb: 2}}
                        />
                        <TextField
                            fullWidth
                            label="Email"
                            name="email"
                            value={newEmployee.email}
                            onChange={handleChange}
                            sx={{mb: 2}}
                        />
                        <TextField
                            fullWidth
                            label="Contact Number"
                            name="contact_number"
                            value={newEmployee.contact_number}
                            onChange={handleChange}
                            sx={{mb: 2}}
                        />
                        <TextField
                            fullWidth
                            label="Address"
                            name="address"
                            value={newEmployee.address}
                            onChange={handleChange}
                            sx={{mb: 2}}
                        />
                        <TextField
                            fullWidth
                            label="Designation"
                            name="designation"
                            value={newEmployee.designation}
                            onChange={handleChange}
                            sx={{mb: 2}}
                        />
                        <Button variant="contained" type="submit" color="primary" sx={{
                            gridColumn: "span 2", // Center the button across both columns
                            textAlign: "center",
                            mt: 2
                        }}>
                            Add Employee
                        </Button>
                    </form>
                </Box>
            </Modal>
        </div>
    );
};

export default EmployeeTable;
