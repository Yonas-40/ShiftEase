import {useState, useEffect} from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import multiMonthPlugin from '@fullcalendar/multimonth';
import interactionPlugin from '@fullcalendar/interaction';
import PropTypes from 'prop-types';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import {Alert, Button, IconButton, Snackbar, useMediaQuery, useTheme, Zoom} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import AddShiftModal from "../forms/AddShiftModal.jsx";
import AxiosInstance from '../AxiosInstance.jsx';
import {motion} from 'framer-motion';
import dayjs from "dayjs";
import Joyride from 'react-joyride';
import InfoIcon from "@mui/icons-material/Info";
import HelpIcon from "@mui/icons-material/Help";
import Tooltip from "@mui/material/Tooltip";

const MyCalendar = ({myEvents, locale = 'en', onAddShift}) => {
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [dropEventInfo, setDropEventInfo] = useState(null);
    const [showMoveCopyMenu, setShowMoveCopyMenu] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null); // State for the Menu anchor element
    const [selectedEvent, setSelectedEvent] = useState(null); // To store the event for actions
    const [showApproveReject, setShowApproveReject] = useState(false); // State to show the menu type
    const [errorMessage, setErrorMessage] = useState(null);
    const [runTour, setRunTour] = useState(false);
    // Use MUI's `useMediaQuery` to track screen size
    const isMobile = useMediaQuery('(max-width:900px)');
    // State to track if the action was selected
    const [actionSelected, setActionSelected] = useState(false);
    // State to track the current view
    const [currentView, setCurrentView] = useState(isMobile ? 'dayGridWeek' : 'dayGridMonth');
    const theme = useTheme(); // Get the current theme
    const role = localStorage.getItem('user_role');
    useEffect(() => {
        setUserRole(role);
        const hasSeenTour = localStorage.getItem('hasSeenCalendarTour');
        if (!hasSeenTour) {
            setRunTour(true);
        }

        // Update the view dynamically if screen size changes
        setCurrentView(isMobile ? 'dayGridWeek' : 'dayGridMonth');
    }, [isMobile, role]);

    const DragDropDemo = () => {
        const [isAnimating, setIsAnimating] = useState(false);

        useEffect(() => {
            setIsAnimating(true);
        }, []);

        return (
            <div style={{
                position: 'relative',
                padding: '10px',
                background: theme.palette.background.default,
                color: theme.palette.text.primary,
                borderRadius: '8px',
                border: '1px solid #ddd'
            }}>
                {/* Simple Calendar Table */}
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '5px'}}>
                    {Array.from({length: 28}, (_, i) => (
                        <div
                            key={i}
                            style={{
                                height: '50px',
                                border: '1px solid #ccc',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: theme.palette.background.default,
                            }}
                        >
                            {i + 1}
                        </div>
                    ))}
                </div>

                {/* Event Box Being Dragged */}
                <motion.div
                    initial={{x: 0, y: 0}}
                    animate={isAnimating ? {x: 235, y: 110} : {}}
                    transition={{duration: 2, ease: 'easeInOut'}}
                    style={{
                        position: 'absolute',
                        top: '5px',
                        left: '5px',
                        width: '90px',
                        height: '35px',
                        backgroundColor: '#ff2c00',
                        color:'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '5px',
                        pointerEvents: 'none',
                        boxShadow: '0 3px 6px rgba(0,0,0,0.2)',
                    }}
                >
                    Shift Event
                </motion.div>

                {/* Simulated Mouse Cursor */}
                <motion.div
                    initial={{x: 30, y: 30}}
                    animate={isAnimating ? {x: 265, y: 140} : {}}
                    transition={{duration: 2, ease: 'easeInOut'}}
                    style={{
                        position: 'absolute',
                        width: '24px',
                        top: '4px',
                        left: '5px',
                        height: '24px',
                        backgroundImage: `url('https://static.vecteezy.com/system/resources/previews/011/356/698/original/3d-arrow-cursor-png.png')`,
                        backgroundSize: 'cover',
                        pointerEvents: 'none',
                        zIndex: 10,
                    }}
                />
                <motion.div
                    initial={{opacity: 0, y: -10}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.5, delay: 2}}
                    style={{
                        position: 'absolute',
                        top: '5px',
                        left: '5px',
                        width: '125px',
                        height: '35px',
                        backgroundColor: '#2a4660',
                        color:'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        pointerEvents: 'none',
                        boxShadow: '0 3px 6px rgba(0,0,0,0.2)',
                    }}
                >
                    <div>
                        <SwapHorizIcon color="primary" sx={{marginRight: '5px'}}/>
                        Move shift
                    </div>

                </motion.div>
                <motion.div
                    initial={{opacity: 0, y: -10}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.5, delay: 2}}
                    style={{
                        position: 'absolute',
                        top: '40px',
                        left: '5px',
                        width: '125px',
                        height: '35px',
                        backgroundColor: '#4a4a4a',
                        color:'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        pointerEvents: 'none',
                        boxShadow: '0 3px 6px rgba(0,0,0,0.2)',
                    }}
                >
                    <ContentCopyIcon color="secondary" sx={{marginRight: '5px'}}/>
                    Copy Shift
                </motion.div>
            </div>
        );
    };

    const steps = userRole === 'manager' ? [
        {
            target: '.fc-daygrid-day', // Targets the calendar day cells
            content: 'Click on a date to add a new shift.',
            disableBeacon: true, // Automatically starts this step
            styles: {
                options: {
                    backgroundColor: theme.palette.background.default,
                    textColor: theme.palette.text.primary,
                },
            },
        },
        {
            target: 'a.Day', // Targets calendar events
            content: 'Click on assigned shift (Blue or Orange shift) to DELETE shift.',
            styles: {
                options: {
                    backgroundColor: theme.palette.background.default,
                    textColor: theme.palette.text.primary,
                },
            },
        },
        {
            target: 'a.available', // Targets calendar events
            content: 'Click on green event to APPROVE or REJECT Shift.',
            styles: {
                options: {
                    backgroundColor: theme.palette.background.default,
                    textColor: theme.palette.text.primary,
                },
            },
        },
        {
            target: '.fc-event',
            content: 'You can also drag and drop an assigned shift to move or copy it to a different date. Watch the next step!',
            placement: 'top',
            styles: {
                options: {
                    backgroundColor: theme.palette.background.default,
                    textColor: theme.palette.text.primary,
                },
            },
        },
        {
            target: '.fc-event', // Doesn't have to be accurate; it's just to keep the tour focused
            content: <DragDropDemo/>, // Custom component for animation
            placement: 'center',
            styles: {
                options: {
                    backgroundColor: theme.palette.background.default,
                    textColor: theme.palette.text.primary,
                },
            },
        },
    ] : [
        {target: '.fc-daygrid-day', content: 'Click on a date to set your availability.'}
    ];
    const handleTourFinish = (data) => {
        const {status} = data;
        if (status === 'finished' || status === 'skipped') {
            setRunTour(false);
            localStorage.setItem('hasSeenCalendarTour', 'true'); // Set the flag
        }
    };

    const handleApiError = (error) => {
        console.error('API Error:', error);
        if (error.response && error.response.data && error.response.data.detail) {
            setErrorMessage(error.response.data.detail); // Django REST Framework style
        } else if (error.response && error.response.data && typeof error.response.data === 'object') {
            const errors = Object.entries(error.response.data).map(([key, value]) => `${key}: ${value}`).join(', ');
            setErrorMessage(errors);
        } else {
            setErrorMessage('An unexpected error occurred. Please try again later.');
        }
    };

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
            const eventEl = info.jsEvent.target; // DOM element for the clicked event
            if (!eventEl) return; // Prevent errors if the element is missing
            setAnchorEl(eventEl);
            const event = info.event;

            if (event) { // Ensure event exists
                setSelectedEvent(event);
                setAnchorEl(eventEl); // Set the event element as the menu anchor element
                setShowMoveCopyMenu(false);
                // Determine which menu to show based on the class of the event
                if (event.classNames.includes('available')) {
                    setShowApproveReject(true); // Show approve/reject menu
                } else {
                    setShowApproveReject(false); // Show delete menu
                }
            }
        }
    };

    const handleEventDrop = (info) => {
        if (userRole === 'manager' || userRole === 'admin') {
            setSelectedEvent(info.event);
            setDropEventInfo(info);
            setAnchorEl(info.el);
            setShowApproveReject(false);
            setShowMoveCopyMenu(true);
            setActionSelected(false);
        }
    };

    const handleMenuClose = () => {
        console.log(actionSelected);
        // Prevent closing if no action is selected
        if (!actionSelected) {
            return; // Don't close the menu if no action selected
        }
        setAnchorEl(null);
        setActionSelected(false); // Reset action state
    };

    const token = localStorage.getItem('access_token'); // Get the token from storage

    const approveShift = async () => {
        const shiftId = selectedEvent.id;

        try {
            // eslint-disable-next-line no-undef
            await AxiosInstance.post(`${process.env.BACKEND_URL}/api/shift/approve/${shiftId}/`, {is_available: false}, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            selectedEvent.setExtendedProp('is_available', false);
            onAddShift(); // Refresh events
            handleMenuClose();
        } catch (error) {
            handleApiError(error);
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
            setAnchorEl(null);
            setSelectedEvent(null);
            handleMenuClose();
        } catch (error) {
            handleApiError(error);
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
            setAnchorEl(null);
            setSelectedEvent(null);
            handleMenuClose();

        } catch (error) {
            handleApiError(error);
        }
    };

    const moveShift = async () => {
        if (!dropEventInfo) return;
        const {event, revert} = dropEventInfo;
        const shiftId = event.id;
        const newDate = dayjs(event.start).format('YYYY-MM-DD');

        try {
            await AxiosInstance.post(`${process.env.BACKEND_URL}/api/shift/move/${shiftId}/`, {new_date: newDate}, {
                headers: {Authorization: `Bearer ${token}`},
            });
            // Reset the state to ensure the correct menu is shown
            setActionSelected(true);
            setShowMoveCopyMenu(false);
            setSelectedEvent(null);
            setAnchorEl(null);
            onAddShift();
        } catch (error) {
            revert();
            handleApiError(error);
            setActionSelected(true);
            setShowMoveCopyMenu(false);
            setSelectedEvent(null);
            setAnchorEl(null);
            handleMenuClose();
        }
    };

    const copyShift = async () => {
        if (!dropEventInfo) return;
        const {event} = dropEventInfo;
        const shiftData = {
            employee: event.extendedProps?.employee,
            shift_date: dayjs(event.start).format('YYYY-MM-DD'),
            shift_type: event.extendedProps?.shift_type,
        };
        console.log('shift data: ', shiftData)

        try {
            await AxiosInstance.post(`${process.env.BACKEND_URL}/api/shift/copy/`, shiftData, {
                headers: {Authorization: `Bearer ${token}`},
            });
            // Reset the state to ensure the correct menu is shown
            setActionSelected(true);
            setShowMoveCopyMenu(false);
            setSelectedEvent(null);
            setAnchorEl(null);
            onAddShift();
        } catch (error) {
            dropEventInfo.revert();
            setActionSelected(true);
            setShowMoveCopyMenu(false);
            setSelectedEvent(null);
            setAnchorEl(null);
            handleApiError(error);
            handleMenuClose();
        }
    };

    return (
        <>
            <Joyride
                steps={steps}
                run={runTour}
                continuous
                scrollToFirstStep
                showProgress
                showSkipButton
                styles={{
                    options: {zIndex: 10000},
                }}
                callback={handleTourFinish}
            />
            <Tooltip
                title={"Need help? Start Tour"} placement="left" arrow
                slots={{
                    transition: Zoom,
                }}
            >
                <Button
                    variant="outlined"
                    style={{
                        position: 'fixed',
                        bottom: '20px',
                        right: '25px',
                        minWidth: '50px',
                        height: '50px',
                        padding: 0,
                        zIndex: 20,
                        borderRadius: '50px',
                        borderColor: theme.palette.mode === 'dark' ? 'white' : 'darkblue',
                        borderWidth: '2px',
                        borderStyle: 'solid',
                        color: theme.palette.mode === 'dark' ? '#ffffff' : 'darkblue',
                    }}
                    onClick={() => setRunTour(true)}
                >
                    <HelpIcon fontSize="large"/>

                </Button>
            </Tooltip>
            {/* Your FullCalendar setup below */}
            <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, listPlugin, multiMonthPlugin, interactionPlugin]}
                initialView={currentView}
                locale={locale}
                weekNumberCalculation="ISO"
                weekNumbers={true}
                // weekText="V"
                events={myEvents}
                dateClick={handleDateClick}
                eventClick={handleEventClick}
                editable={true}
                eventDrop={handleEventDrop}
                eventAllow={(dropInfo, draggedEvent) => {
                    // Prevent dragging if the event has 'available' className
                    return !draggedEvent.classNames.includes('available');
                }}
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
                        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '0 auto'}}>
                            {isMobile ? (
                                // Show "Day" or "Evening" with the employee's name
                                <>
                                    {shiftType}
                                    <div style={{textWrap: 'wrap', wordBreak: 'break-word', textAlign: 'center'}}>
                                        <strong>{arg.event.title}</strong></div>
                                </>
                            ) : (
                                // Default display for larger screens
                                <>
                                    <div style={{
                                        textWrap: 'wrap',
                                        wordBreak: 'break-word'
                                    }}>{arg.timeText} {arg.event.title}</div>
                                </>
                            )}
                        </div>
                    );
                }}
            />

            {/* Menu triggered by event click */}
            <Menu
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                anchorReference="anchorPosition"
                anchorPosition={
                    anchorEl ? {
                        top: anchorEl.getBoundingClientRect().top,
                        left: anchorEl.getBoundingClientRect().left
                    } : undefined
                }
                onClose={handleMenuClose}
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
                    // Only show delete button if move/copy menu is not visible
                    !showMoveCopyMenu && (
                        <MenuItem onClick={deleteShift}>
                            <IconButton>
                                <ClearIcon color="error"/>
                            </IconButton>
                            Delete Shift
                        </MenuItem>
                    )
                )}
                {showMoveCopyMenu && (
                    <>
                        <MenuItem onClick={moveShift}>
                            <IconButton>
                                <SwapHorizIcon color="primary"/>
                            </IconButton>
                            Move Shift
                        </MenuItem>
                        <MenuItem onClick={copyShift}>
                            <IconButton>
                                <ContentCopyIcon color="secondary"/>
                            </IconButton>
                            Copy Shift
                        </MenuItem>
                    </>
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
            {/* Your calendar component and menu stuff here */}

            {/* MUI Snackbar + Alert */}
            <Snackbar open={Boolean(errorMessage)} autoHideDuration={6000} onClose={() => setErrorMessage(null)}>
                <Alert severity="error" onClose={() => setErrorMessage(null)}>
                    {errorMessage}
                </Alert>
            </Snackbar>
        </>

    );
};

MyCalendar.propTypes = {
    myEvents: PropTypes.array.isRequired,
    locale: PropTypes.string,
    onAddShift: PropTypes.func.isRequired,
};

export default MyCalendar;

