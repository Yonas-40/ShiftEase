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
import WorkHistoryIcon from '@mui/icons-material/WorkHistory';
import axios from 'axios';
import Tooltip from '@mui/material/Tooltip';
import ManagerProfilePage from "./ManagerProfilePage.jsx";

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
            {mini ? (
                <Tooltip title="Shift Management System" arrow>
                    <span>© SMS</span>
                </Tooltip>
            ) : (
                `© ${new Date().getFullYear()} Made by Yonas Zeratsion`
            )}
        </Typography>
    );
}

SidebarFooter.propTypes = {
    mini: PropTypes.bool.isRequired,
};

function ManagerDashboard() {
    const isSmallScreen = useMediaQuery(theme => theme.breakpoints.down('md')); // Check if the screen is small
    const isSmScreen = useMediaQuery(theme => theme.breakpoints.down('sm')); // Only for Employees menu
    const [navigation, setNavigation] = useState([
        {
            segment: 'Manager',
            title: 'Manager',
            path: '/manager',
            icon: <PersonIcon/>,
        },
        {
            segment: 'calendar',
            title: 'Calendar',
            icon: <CalendarMonthIcon/>,
            path: '/calendar',
        },
        {
            segment: 'employees',
            title: 'Employees',
            path: '/employees',
            icon: <GroupsIcon/>,
            children: [], // Will be dynamically populated
        },
        {
            segment: 'monthlyworkinghourstable',
            title: 'Hours Report',
            icon: <WorkHistoryIcon/>,
            path: '/monthlyworkinghourstable',
        },
    ]);
    const navigate = useNavigate();
    const userRole = localStorage.getItem("user_role");
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
            return response.data;
        } catch (error) {
            console.error('Error fetching user info:', error);
            throw error;
        }
    };

    // Fetch employee data and update the navigation menu
    useEffect(() => {
    const loadEmployees = async () => {
        const data = await fetchEmployees();
        const employeeChildren = data.map((emp) => ({
            segment: emp.username,
            title: emp.username,
            icon: <PersonIcon />,
        }));

        setNavigation((prev) => {
            return prev.map((item) => {
                if (item.segment === 'employees' || item.segment === 'employees_small') {
                    if (isSmScreen) {
                        // On small screens, show simplified menu
                        return {
                            segment: 'employees_small',
                            title: 'Employees',
                            path: '/employees_small',
                            icon: <GroupsIcon />,
                        };
                    } else {
                        // On larger screens, restore the full Employees menu
                        return {
                            segment: 'employees',
                            title: 'Employees',
                            path: '/employees',
                            icon: <GroupsIcon />,
                            children: employeeChildren,
                        };
                    }
                }
                return item;
            });
        });
    };

    loadEmployees();
}, [navigate, isSmScreen]); // Ensure effect triggers on screen size change

    useEffect(() => {
        const loadUserProfile = async () => {
            try {
                const userData = await fetchUserInfo(); // Fetch the logged-in manager's data
                const profileTitle = `${userData.first_name} ${userData.last_name || ''}`.trim() || userData.username;
                const updatedSegment = `profile/${userData.username}`;
                const {role} = userData;
                localStorage.setItem('user_role', role);
                setNavigation((prev) =>
                    prev.map((item) =>
                        item.segment === 'Manager' ? {
                            ...item,
                            segment: updatedSegment,
                            title: profileTitle + ' (' + localStorage.getItem('user_role') + ')', // Add "user role" for clarity
                            path: `profile/${userData.username}`
                        } : item
                    )
                );
            } catch (error) {
                console.error('Error loading manager profile:', error);
            }
        };

        loadUserProfile();
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
                    // Redirect based on role
                    if (userData.role !== 'manager' && userData.role !== 'admin') {
                        navigate('/employee-dashboard/calendar'); // Redirect to EmployeeDashboard if not manager/admin
                    }

                }
            } catch (error) {
                console.error('Failed to load user info:', error);

                // Optionally redirect to the sign-in page if fetching user info fails
                navigate('/signin');
            }
        };

        loadUserInfo();
    }, [navigate]);

    const authentication = useMemo(() => {
        return {
            signIn: async () => {
                try {
                    // Attempt to fetch user information
                    const userData = await fetchUserInfo();

                    // If no user data is returned or role is not 'manager' or 'admin', redirect to sign-in page
                    if (!userData || !userData.username || (userData.role !== 'manager' && userData.role !== 'admin')) {
                        navigate('/signin');  // Redirect to sign-in page if role is not manager/admin
                        return;
                    }

                    // If user data is found, set session state
                    setSession({
                        user: {
                            name: `${userData.first_name} ${userData.last_name ? userData.last_name + ' (' + userData.role + ')' : ''}`.trim() || `${userData.username} (${userData.role})`.trim(),
                            email: userData.email,
                            image: userData.image ? userData.image : userData.username.charAt(0).toUpperCase(),
                        },
                    });
                } catch (error) {
                    console.error('Failed to fetch user data:', error);

                    // Optionally redirect to sign-in page if there's an error fetching user data
                    navigate('/signin');
                } // Fetch user info upon signing in
            },
            signOut: () => {
                // Clear tokens from localStorage
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');

                // Clear session state
                setSession(null);

                // Redirect to sign-in page
                navigate('/signin');
            },
        };
    }, [navigate]);

    return (
        <AppProvider
            session={session}
            authentication={authentication}
            navigation={navigation}
            // router={router}
            theme={demoTheme}
        >
            <DashboardLayout
                defaultSidebarCollapsed
                slots={{
                    sidebarFooter: SidebarFooter,
                    appTitle: () => ( // Use this slot to render your branding layout
                        <Typography
                            component="div"
                            sx={{
                                color: (theme) =>
                                    theme.palette.mode === 'dark' ? '#CBB26A' : '#5c4704', // Use different colors for light and dark modes
                                fontWeight: 'bolder',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                            }}
                        >
                            <img src="../../public/images/logo.svg" alt="ShiftEase logo"></img>
                            {!isSmallScreen && ( // Hide the text on small screens
                                <Typography variant="h4">ShiftEase</Typography>
                            )}
                            <Typography
                                variant="h5"
                                sx={{
                                    position: 'absolute', // Center element
                                    left: '50%',
                                    transform: 'translateX(-50%)', // Offset to truly center
                                    fontSize: 'clamp(0.9rem, 4vw, 2rem)',
                                }}
                            >
                                {userRole === "manager"
                                    ? `MANAGER DASHBOARD`
                                    : `ADMIN DASHBOARD`}
                            </Typography>
                        </Typography>
                    ),
                }}>

                <Routes>
                    <Route path="/monthlyworkinghourstable" element={<MonthlyWorkingHoursTable/>}/>
                    <Route path="/employees" element={<Employees/>}/>
                    <Route path="/employees_small" element={<Employees/>}/>
                    <Route path="/calendar" element={<Calendar/>}/>
                    {navigation
                        .find((item) => item.segment === "employees")
                        ?.children.map((emp) => (
                            <Route
                                key={emp.segment}
                                path={`/employees/:username`}
                                element={<EmployeeProfilePage/>}
                            />
                        ))}
                    <Route path="profile/:username" element={<ManagerProfilePage/>}/>
                </Routes>

            </DashboardLayout>
        </AppProvider>
    );
}


export default ManagerDashboard;
