import React, {useState, useEffect} from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import multiMonthPlugin from '@fullcalendar/multimonth';
import interactionPlugin from '@fullcalendar/interaction';
import PropTypes from 'prop-types';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import {IconButton, useMediaQuery} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import AddShiftModal from "../forms/AddShiftModal.jsx";
import AxiosInstance from '../AxiosInstance.jsx';
import dayjs from "dayjs";

const MyCalendar = ({myEvents, locale = 'sv', onAddShift}) => {
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null); // State for the Menu anchor element
    const [selectedEvent, setSelectedEvent] = useState(null); // To store the event for actions
    const [showApproveReject, setShowApproveReject] = useState(false); // State to show the menu type

    // Use MUI's `useMediaQuery` to track screen size
    const isMobile = useMediaQuery('(max-width:900px)');

    useEffect(() => {
        const role = localStorage.getItem('user_role');
        setUserRole(role);

    }, []);

    const handleDateClick = (info) => {
        setSelectedDate(info.dateStr);
        setModalOpen(true);
    };

    const handleModalClose = () => {
        setModalOpen(false);
        setSelectedDate(null);
    };

    const handleEventClick = (info) => {
        if (userRole === 'manager' || userRole === 'admin') {
            const eventEl = info.el; // DOM element for the clicked event
            eventEl.blur();
            const event = info.event;

            if (event) { // Ensure event exists
                setSelectedEvent(event);
                setAnchorEl(eventEl); // Set the event element as the menu anchor element

                // Determine which menu to show based on the class of the event
                if (event.classNames.includes('available')) {
                    setShowApproveReject(true); // Show approve/reject menu
                } else {
                    setShowApproveReject(false); // Show delete menu
                }
            }
        }
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const token = localStorage.getItem('access_token'); // Get the token from storage

    const approveShift = async () => {
        const shiftId = selectedEvent.id;

        try {
            await AxiosInstance.post(`${process.env.BACKEND_URL}/api/shift/approve/${shiftId}/`, {is_available: false}, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            selectedEvent.setExtendedProp('is_available', false);
            onAddShift(); // Refresh events
            handleMenuClose();
        } catch (error) {
            console.error('Error approving shift:', error);
        }
    };

    const rejectShift = async () => {
        const shiftId = selectedEvent.id;

        try {
            await AxiosInstance.post(`${process.env.BACKEND_URL}/api/shift/reject/${shiftId}/`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            selectedEvent.remove(); // Remove the event from the calendar
            handleMenuClose();
            window.location.reload();
        } catch (error) {
            console.error('Error rejecting shift:', error);
        }
    };

    const deleteShift = async () => {
        const shiftId = selectedEvent.id;

        try {
            await AxiosInstance.post(`${process.env.BACKEND_URL}/api/shift/reject/${shiftId}/`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            selectedEvent.remove(); // Remove the event from the calendar
            handleMenuClose();
            window.location.reload();
        } catch (error) {
            console.error('Error deleting shift:', error);
        }
    };

    return (
        <>
            <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, listPlugin, multiMonthPlugin, interactionPlugin]}
                initialView="dayGridWeek"
                locale={locale}
                weekNumberCalculation="ISO"
                weekNumbers={true}
                weekText="V"
                events={myEvents}
                dateClick={handleDateClick}
                eventClick={handleEventClick}
                headerToolbar={{
                    left: isMobile ? 'dayGridWeek,dayGridMonth' : 'prev,next',
                    center: 'title',
                    right: isMobile ? 'prev,next' : 'dayGridWeek,dayGridMonth',
                }}

                eventTimeFormat={{
                    hour: '2-digit',
                    minute: '2-digit',
                    meridiem: false,
                    hour12: false,
                }}
                displayEventEnd={true}
                contentHeight="auto" // Automatically adjusts the height
                eventContent={(arg) => {
                    const startHour = dayjs(arg.event.start).hour();

                    // Determine shift type
                    const shiftType = startHour >= 7 && startHour < 15
                        ? 'Day'
                        : startHour >= 15 && startHour < 22
                            ? 'Evening'
                            : 'Other';

                    return (
                        <div style={{display:'flex', flexDirection: 'column', alignItems: 'center', margin: '0 auto'}}>
                            {isMobile ? (
                                // Show "Day" or "Evening" with the employee's name
                                <>
                                    {shiftType}
                                    <div><strong>{arg.event.title}</strong></div>
                                </>
                            ) : (
                                // Default display for larger screens
                                <>
                                    <div style={{textWrap:'wrap', wordBreak:'break-word'}}>{arg.timeText} {arg.event.title}</div>
                                </>
                            )}
                        </div>
                    );
                }}
            />

            {/* Menu triggered by event click */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
            >
                {showApproveReject ? (
                    <>
                        <MenuItem onClick={approveShift}>
                            <IconButton>
                                <CheckIcon color="success"/>
                            </IconButton>
                            Approve Shift
                        </MenuItem>
                        <MenuItem onClick={rejectShift}>
                            <IconButton>
                                <ClearIcon color="error"/>
                            </IconButton>
                            Reject Shift
                        </MenuItem>
                    </>
                ) : (
                    <MenuItem onClick={deleteShift}>
                        <IconButton>
                            <ClearIcon color="error"/>
                        </IconButton>
                        Delete Shift
                    </MenuItem>
                )}
            </Menu>

            {modalOpen && (
                <AddShiftModal
                    open={modalOpen}
                    onClose={handleModalClose}
                    date={selectedDate}
                    onAddShift={onAddShift}
                />
            )}
        </>
    );
};

MyCalendar.propTypes = {
    myEvents: PropTypes.array.isRequired,
    locale: PropTypes.string,
    onAddShift: PropTypes.func.isRequired,
};

export default MyCalendar;

