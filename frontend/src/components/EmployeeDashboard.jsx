import React, {useEffect, useState, useMemo} from 'react';
import {fetchEmployees} from '../services/api.jsx';
import PropTypes from 'prop-types';
import {Box, Typography, Avatar, createTheme, useTheme, darken, useMediaQuery} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import GroupsIcon from '@mui/icons-material/Groups';
import PersonIcon from '@mui/icons-material/Person';
import {AppProvider} from '@toolpad/core/AppProvider';
import {DashboardLayout} from '@toolpad/core/DashboardLayout';
import {useNavigate, Routes, Route} from "react-router-dom";
import MonthlyWorkingHoursTable from './MonthlyWorkingHoursTable.jsx'; // Import MonthlyWorkingHoursTable component
import Calendar from './Calendar'; // Import Calendar component
import Employees from "./Employees.jsx";
import EmployeeProfilePage from "./EmployeeProfilePage.jsx";
import axios from 'axios';
import MyIcon from '../../public/images/logo.svg';
import {colorSchemes} from "./shared-theme/themePrimitives.jsx";
import WorkHistoryIcon from "@mui/icons-material/WorkHistory";

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

function SidebarFooter({mini}) {
    return (
        <Typography
            variant="caption"
            component="div"
            sx={{m: 1, whiteSpace: 'nowrap', overflow: 'hidden'}}
        >
            {mini ? '© SMS' : `© ${new Date().getFullYear()} Made with love by Yonas`}
        </Typography>
    );
}

SidebarFooter.propTypes = {
    mini: PropTypes.bool.isRequired,
};

function EmployeeDashboard() {
    const [navigation, setNavigation] = useState([
        {
            segment: 'employee',
            title: 'Employee',
            path: '/employees',
            icon: <PersonIcon/>,
        },
        {
            segment: 'employee-dashboard/calendar',
            title: 'Calendar',
            icon: <CalendarMonthIcon/>,
            path: '/calendar',
        },
        {
            segment: 'employee-dashboard/monthlyworkinghourstable',
            title: 'Hours Report',
            icon: <WorkHistoryIcon/>,
            path: '/monthlyworkinghourstable',
        },
    ]);
    const navigate = useNavigate();

    const isSmallScreen = useMediaQuery(theme => theme.breakpoints.down('md')); // Check if the screen is small

    // Fetch user info with token
    const fetchUserInfo = async () => {
        try {
            const token = localStorage.getItem('access_token'); // Get the token from storage
            if (!token) {
                throw new Error('No access token found. Please sign in.');
            }

            const response = await axios.get(`${process.env.BACKEND_URL}/api/user-profile/`, {
                headers: {
                    Authorization: `Bearer ${token}`, // Include the token in the Authorization header
                },
            });


            // Ensure image URL is correct
            if (response.data.image) {
                response.data.image = `${process.env.BACKEND_URL}${response.data.image}`;
            }

            // Add role information to user data
            response.data.role = response.data.role || ''; // Set role, if available
            console.log(response.data); // Check if role is included
            return response.data;
        } catch (error) {
            console.error('Error fetching user info:', error);
            throw error;
        }
    };

    useEffect(() => {
        const loadEmployees = async () => {
            const userData = await fetchUserInfo();
            const employeeProfileTitle = `${userData.first_name} ${userData.last_name || ''}`.trim() || userData.username;
            const updatedSegment = `employee-dashboard/employees/${userData.username}`;

            setNavigation((prev) =>
                prev.map((item) =>
                    item.segment === 'employee' ? {
                        ...item,
                        segment: updatedSegment,
                        title: employeeProfileTitle,
                        path: `employee-dashboard/employees/${userData.username}`
                    } : item
                )
            );
        };

        loadEmployees();
    }, [navigate]);

    const [session, setSession] = useState(null);

    useEffect(() => {
        const loadUserInfo = async () => {
            try {
                const token = localStorage.getItem('access_token');
                if (token) {
                    const userData = await fetchUserInfo();
                    setSession({
                        user: {
                            name: `${userData.first_name} ${userData.last_name ? userData.last_name + ' (' + userData.role + ')' : ''}`.trim() || `${userData.username} (${userData.role})`.trim(),
                            email: userData.email,
                            image: userData.image ? userData.image : userData.username.charAt(0).toUpperCase(),
                        },
                    });
                    if (userData.role !== 'employee') {
                        navigate('/calendar');
                    }
                }

            } catch (error) {
                console.error('Failed to load user info:', error);
                navigate('/signin');
            }
        };

        loadUserInfo();
    }, [navigate]);

    const authentication = useMemo(() => {
        return {
            signIn: async () => {
                try {
                    const userData = await fetchUserInfo();
                    if (!userData || !userData.username) {
                        navigate('/signin');
                        return;
                    }
                    setSession({
                        user: {
                            name: `${userData.first_name} ${userData.last_name ? userData.last_name + ' (' + userData.role + ')' : ''}`.trim() || `${userData.username} (${userData.role})`.trim(),
                            email: userData.email,
                            image: userData.image ? userData.image : userData.username.charAt(0).toUpperCase(),
                        },
                    });
                } catch (error) {
                    console.error('Failed to fetch user data:', error);
                    navigate('/signin');
                }
            },
            signOut: () => {
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                setSession(null);
                navigate('/signin');

            },
        };
    }, [navigate]);

    return (
        <AppProvider
            session={session}
            authentication={authentication}
            navigation={navigation}
            theme={demoTheme}
        >
            <DashboardLayout
                defaultSidebarCollapsed
                slots={{
                    sidebarFooter: SidebarFooter,
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
                            <img src="../../public/images/logo.svg" alt="ShiftEase logo"/>
                            {!isSmallScreen && ( // Hide the text on small screens
                                <Typography variant="h4">ShiftEase</Typography>
                            )}
                            <Typography
                                variant="h5"
                                sx={{
                                    position: 'absolute',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    fontSize: 'clamp(0.9rem, 4vw, 2rem)',
                                }}
                            >
                                EMPLOYEE DASHBOARD
                            </Typography>
                        </Typography>
                    ),
                }}
            >
                <Routes>
                    <Route path="/monthlyworkinghourstable" element={<MonthlyWorkingHoursTable/>}/>
                    <Route path="/calendar" element={<Calendar/>}/>
                    <Route path="employees/:username" element={<EmployeeProfilePage/>}/>
                </Routes>
            </DashboardLayout>
        </AppProvider>
    );
}

export default EmployeeDashboard;
