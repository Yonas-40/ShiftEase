import React, {useEffect, useState} from "react";
import {useParams, useNavigate} from "react-router-dom";
import {Box, Button, TextField, Typography, Snackbar, Alert} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";

const EmployeeProfilePage = () => {
    const {username} = useParams(); // Get username from URL
    const navigate = useNavigate();
    const [employee, setEmployee] = useState(null);
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        department: "",
        date_joined: "",
        email: "",
        contact_number: "",
        address: "",
        designation: "",
        image: null,
    });
    const [previewImage, setPreviewImage] = useState(null); // State for image preview
    const [alert, setAlert] = useState({open: false, message: "", severity: "success"});
    const userRole = localStorage.getItem("user_role");
    // Fetch employee data by username
    useEffect(() => {
        const fetchEmployee = async () => {
            try {
                const response = await axios.get(
                    `${process.env.BACKEND_URL}/api/employees/${username}/`
                );
                setEmployee(response.data);
                setFormData({
                    first_name: response.data.first_name,
                    last_name: response.data.last_name,
                    department: response.data.department,
                    date_joined: response.data.date_joined,
                    email: response.data.email,
                    contact_number: response.data.contact_number,
                    address: response.data.address,
                    designation: response.data.designation,
                    image: null, // Reset file input for security reasons
                });
                setPreviewImage(response.data.image); // Set the preview image
            } catch (error) {
                console.error("Error fetching employee data:", error);
            }
        };

        fetchEmployee();
    }, [username]);

    // Handle form changes
    const handleChange = (e) => {
        const {name, value} = e.target;

        // Handle file input for image separately
        if (name === "image") {
            const file = e.target.files[0];
            setFormData((prev) => ({...prev, [name]: file}));
            setPreviewImage(URL.createObjectURL(file)); // Show a preview of the selected file
        } else {
            setFormData((prev) => ({...prev, [name]: value}));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = new FormData(); // Use FormData for file uploads

        for (const key in formData) {
            if (formData[key]) {
                payload.append(key, formData[key]);
            }
        }

        // If image is removed, append a special key to indicate deletion
        if (!formData.image && previewImage !== employee.image) {
            payload.append("image", ""); // Indicate image removal
        }

        try {
            await axios.put(
                `${process.env.BACKEND_URL}/api/employees/${username}/`,
                payload,
                {
                    headers: {"Content-Type": "multipart/form-data"},
                }
            );
            setAlert({
                open: true,
                message: "Employee details updated successfully!",
                severity: "success",
            });

            setTimeout(() => navigate("/employees"), 2000); // Redirect after 2 seconds
        } catch (error) {
            console.error("Error updating employee data:", error);
            setAlert({
                open: true,
                message: "Failed to update employee details.",
                severity: "error",
            });
        }
    };

    if (!employee) return <Typography>Loading...</Typography>;

    return (
        <Box
            sx={{
                py: 4,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
            }}
        >
            <Typography variant="h4" sx={{mb: 1, marginTop: -2,}}>
                {userRole === "employee"
                    ? `Welcome to your profile`
                    : `Edit Employee Profile`}
            </Typography>
            <Typography variant="h5" sx={{fontWeight: "bold"}}>
                {employee.first_name} {employee.last_name}
            </Typography>

            <form
                onSubmit={handleSubmit}
                style={{
                    maxWidth: "600px",
                    width: "100%",
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr", // Two equal columns
                    gap: "16px", // Space between grid items
                    alignItems: "center",
                }}
            >
                {/* Image centered above the form */}
                <Box
                    sx={{
                        gridColumn: "span 2", // Make the image span both columns
                        textAlign: "center",
                        alignItems: "center",
                        position: "relative", // To position the "Add Image" text over the image
                    }}
                >
                    {/* Circular Profile Container */}
                    <Box
                        sx={{
                            width: "150px",
                            height: "150px",
                            borderRadius: "50%",
                            position: "relative",
                            overflow: "hidden", // Ensures text stays within the circle
                            margin: "10px auto",
                            border: "2px solid #ddd",
                            "&:hover .hover-text": {
                                opacity: 1, // Show text on hover
                            },
                        }}
                    >
                        {previewImage ? (
                            <>
                                <img
                                    src={previewImage}
                                    alt="Current"
                                    style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover",
                                    }}
                                />
                            </>
                        ) : (
                            <Box
                                sx={{
                                    width: "100%",
                                    height: "100%",
                                    backgroundColor: "#3f3f3f",
                                    color: "white",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "60px",
                                    fontWeight: "bold",
                                }}
                            >
                                {employee.username[0]?.toUpperCase() || ""}
                            </Box>
                        )}

                        {/* Add Image Text */}
                        <Typography
                            className="hover-text"
                            sx={{
                                position: "absolute",
                                bottom: 0, // Positioned at the bottom of the circle
                                left: 0,
                                width: "100%", // Spans the entire width of the circle
                                height: "20%",
                                backgroundColor: "#c6c6c6",
                                color: "#5a5a5a",
                                textAlign: "center",
                                fontSize: "14px",
                                fontWeight: "bold",
                                cursor: "pointer",
                                lineHeight: "2",
                                opacity: previewImage ? 0 : 1, // Hidden by default if there's an image
                                transition: ".5s",
                                ":hover": {
                                    backgroundColor: "#9d9d9d",
                                },
                            }}
                            onClick={() => document.getElementById("imageInput").click()}
                        >
                            {previewImage ? "Edit Image" : "Add Image"}
                        </Typography>
                    </Box>
                    {/* 'X' Icon for Removing Image */}
                    {previewImage && (
                        <Box
                            sx={{
                                position: "absolute",
                                top: "10px",  // Position it slightly outside the circle
                                right: "200px", // Position it slightly outside the circle
                                backgroundColor: "white",
                                color: "black",
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                                boxShadow: "0 0 5px rgba(0,0,0,0.2)",
                                transition: "0.3s",
                                width: "25px",
                                height: "25px",
                                zIndex: 10, // Make sure it's above other content
                                ":hover": {
                                    backgroundColor: "red",
                                    color: "white",
                                },
                            }}
                            onClick={() => {
                                setPreviewImage(null);
                                setFormData((prev) => ({...prev, image: null}));
                            }}
                        >
                            <CloseIcon fontSize="small"/>
                        </Box>
                    )}
                    {/* Hidden file input */}
                    <input
                        id="imageInput"
                        type="file"
                        name="image"
                        accept="image/*"
                        onChange={handleChange}
                        style={{display: "none"}}
                    />
                </Box>

                {/* First Name and Last Name */}
                <TextField
                    fullWidth
                    margin="normal"
                    label="First Name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                />
                <TextField
                    fullWidth
                    margin="normal"
                    label="Last Name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                />

                {/* Department and Designation */}
                <TextField
                    fullWidth
                    margin="normal"
                    label="Department"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                />
                <TextField
                    fullWidth
                    margin="normal"
                    label="Designation"
                    name="designation"
                    value={formData.designation}
                    onChange={handleChange}
                />

                {/* Contact Number and Email */}
                <TextField
                    fullWidth
                    margin="normal"
                    label="Contact Number"
                    name="contact_number"
                    value={formData.contact_number}
                    onChange={handleChange}
                />
                <TextField
                    fullWidth
                    margin="normal"
                    label="Email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                />

                {/* Address and Date Joined */}
                <TextField
                    fullWidth
                    margin="normal"
                    label="Address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                />
                <TextField
                    fullWidth
                    margin="normal"
                    label="Date Joined"
                    name="date_joined"
                    value={formData.date_joined}
                    onChange={handleChange}
                />

                {/* Save Button centered */}
                <Box
                    sx={{
                        gridColumn: "span 2", // Center the button across both columns
                        textAlign: "center",
                    }}
                >
                    <Button
                        variant="contained"
                        color="primary"
                        type="submit"
                        sx={{mt: 2}}
                    >
                        Save Changes
                    </Button>
                </Box>
            </form>
            {/* Snackbar for Alerts */}
            <Snackbar open={alert.open} autoHideDuration={3000} onClose={() => setAlert({ ...alert, open: false })}>
                <Alert onClose={() => setAlert({ ...alert, open: false })} severity={alert.severity} sx={{ width: "100%" }}>
                    {alert.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default EmployeeProfilePage;
