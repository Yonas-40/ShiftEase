import AxiosInstance from '../components/AxiosInstance.jsx'

const token = localStorage.getItem('access_token');

import axios from 'axios';



// Employees
export const fetchEmployees = async () => {
    try {
        const response = await AxiosInstance.get(`${process.env.BACKEND_URL}/employees/`, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        return response.data;
    } catch (error) {
        console.error('Error fetching shifts:', error);
        throw error; // You can throw or return a custom error message
    }
};
export const addEmployee = async (employeeData) => {
    try {
        const response = await axios.post(`${process.env.BACKEND_URL}/api/add/employee/`, employeeData, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },

        });
        return response.data;
    } catch (error) {
        console.error('API Error:', error.response?.data || error.message);
        throw new Error(error.response?.data?.error || 'Failed to add employee');
    }
};
export const deleteEmployee = async (username) => {
    const response = await axios.delete(`${process.env.BACKEND_URL}/api/employees/${username}/`, {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    }); // Adjust endpoint as needed
    return response.data;
};
export const fetchMonthlyWorkingHours = async () => {
    try {
        const response = await axios.get(`${process.env.BACKEND_URL}/api/monthly-working-hours/`, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },

        });
        return response.data;
    } catch (error) {
        console.error("Error fetching monthly working hours:", error);
        throw error;
    }
};

// Add more APIs for shifts, departments, or other features as needed.
