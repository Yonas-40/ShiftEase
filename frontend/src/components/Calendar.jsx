import React, {useEffect, useState} from 'react';
import MyCalendar from './calendars/MyCalendar.jsx';
import AxiosInstance from "./AxiosInstance.jsx";
import '../App.css';
import MultiSelectForm from './forms/MultiSelectForm.jsx';
import dayjs from 'dayjs';
import Box from '@mui/material/Box';
import DatePickerForm from './forms/DatePickerForm.jsx';
import EmployeeTable from '../components/calendars/EmployeeTable';

const Calendar = () => {
    const [events, setEvents] = useState([]);
    const [statusOptions, setStatusOptions] = useState([]);
    const [employeeOptions, setEmployeeOptions] = useState([]);
    const [selectedStatus, setSelectedStatus] = useState([]);
    const [selectedEmployees, setSelectedEmployees] = useState([]);
    const [fromDate, setFromDate] = useState(null);
    const [toDate, setToDate] = useState(null);
    const [loading, setLoading] = useState(true);

    const fromDateChange = (newDate) => setFromDate(newDate);
    const toDateChange = (newDate) => setToDate(newDate);

    const token = localStorage.getItem('access_token'); // Get the token from storage
    const GetShiftData = () => {
        AxiosInstance.get(`${process.env.BACKEND_URL}/shifts/`, {
                headers: {
                    Authorization: `Bearer ${token}`, // Include the token in the Authorization header
                },
            })
            .then((res) => {
                setEvents(res.data);
                setStatusOptions([...new Set(res.data.map((event) => event.classNames))]);
                setSelectedStatus([...new Set(res.data.map((event) => event.classNames))]);

                setEmployeeOptions([...new Set(res.data.map((event) => event.title))]);
                setSelectedEmployees([...new Set(res.data.map((event) => event.title))]);

                setLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching shifts:', error);
                setLoading(false);
            });
    };
    useEffect(() => {
        GetShiftData();
    }, []);

    const filterEvents = (events) => {
        return events.filter((event) =>
            selectedStatus.includes(event.classNames) &&
            selectedEmployees.includes(event.title) &&
            (!fromDate || dayjs(event.start).isAfter(fromDate, 'day')) &&
            (!toDate || dayjs(event.end).isBefore(toDate, 'day'))
        );
    };

    const filteredEvents = filterEvents(events);
    // console.log('Filtered events:', filteredEvents);

    return (
        <div>
            {loading ? (
                <p>Loading data...</p>
            ) : (
                <>
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-md-12">
                                <Box
                                    sx={{
                                        boxShadow: 3,
                                        padding: '10px',
                                        display: 'flex',
                                        flexDirection: {xs: 'column', sm: 'row'}, // Column on small screens, row on larger screens
                                        justifyContent: 'space-evenly',
                                        alignItems: 'center',
                                        margin: '0 auto',
                                    }}
                                >
                                    <Box
                                        sx={{
                                            width: {
                                                xs: '100%', sm: '20%'
                                            },
                                            margin:0,
                                            padding:0,
                                        }}
                                    >
                                        <MultiSelectForm
                                            label="Status"
                                            options={statusOptions}
                                            setSelectedValue={setSelectedStatus}
                                            selectedValue={selectedStatus}
                                        />
                                    </Box>
                                    <Box
                                        sx={{
                                            width: {xs: '100%', sm: '20%'},
                                            margin:0,
                                            padding:0,// Full width on xs, 20% on larger screens
                                        }}
                                    >
                                        <MultiSelectForm
                                            label="Employees"
                                            options={employeeOptions}
                                            setSelectedValue={setSelectedEmployees}
                                            selectedValue={selectedEmployees}

                                        />
                                    </Box>
                                    <Box
                                        sx={{
                                            width: {xs: '100%', sm: '25%'}, // Full width on xs, 25% on larger screens
                                        }}
                                    >
                                        <DatePickerForm label="From date" value={fromDate} onChange={fromDateChange}/>
                                    </Box>
                                    <Box
                                        sx={{
                                            width: {xs: '100%', sm: '25%'}, // Full width on xs, 25% on larger screens
                                        }}
                                    >
                                        <DatePickerForm label="To date" value={toDate} onChange={toDateChange}/>
                                    </Box>
                                </Box>

                                <Box sx={{boxShadow: 3, padding: {xs: '0', sm: '20px'}}}>
                                    <MyCalendar myEvents={filteredEvents} onAddShift={GetShiftData}/>
                                </Box>
                            </div>

                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Calendar;
