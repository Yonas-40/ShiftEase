import React, {useEffect, useState} from "react";
import {fetchMonthlyWorkingHours} from "../services/api";
import {
    Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Collapse, IconButton, Button, Box, Typography, TextField, Autocomplete
} from "@mui/material";
import {useMediaQuery, useTheme} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import PrintIcon from "@mui/icons-material/Print";

const MonthlyWorkingHoursTable = () => {
    const [workingHours, setWorkingHours] = useState([]);
    const [expandedRows, setExpandedRows] = useState({});
    const [searchQuery, setSearchQuery] = useState("");  // Search query state
    const [selectedEmployees, setSelectedEmployees] = useState([]); // Multi-select state
    const isSmallScreen = useMediaQuery(theme => theme.breakpoints.down("sm"));
    const theme = useTheme();

    useEffect(() => {
        const loadWorkingHours = async () => {
            try {
                const data = await fetchMonthlyWorkingHours();
                setWorkingHours(data.results || data);
            } catch (error) {
                console.error("Failed to load working hours data:", error);
            }
        };
        loadWorkingHours();
    }, []);

    const toggleExpand = (employee) => {
        setExpandedRows((prev) => ({
            ...prev,
            [employee]: !prev[employee],
        }));
    };

    const groupedByEmployee = workingHours.reduce((acc, entry) => {
        if (!acc[entry.employee]) acc[entry.employee] = [];
        acc[entry.employee].push(entry);
        return acc;
    }, {});

    const handlePrint = () => {
        window.print();
    };

    // Get all unique employee names for multi-select
    const employeeNames = Object.keys(groupedByEmployee);

    // Filter employees based on search and multi-select
    const filteredEmployees = employeeNames.filter(employee => {
        const matchesSearch = employee.toLowerCase().includes(searchQuery.toLowerCase());
        const isSelected = selectedEmployees.length === 0 || selectedEmployees.includes(employee);
        return matchesSearch && isSelected;
    });

    return (
        <Paper sx={{padding: "20px"}}>
            <Box sx={{display: "flex", flexDirection: "column", gap: 2, marginBottom: "20px"}}>
                {/* Search Bar */}
                <TextField
                    label="Search Employee"
                    variant="outlined"
                    fullWidth
                    size="medium"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />

                {/* Multi-Select Filter */}
                <Autocomplete
                    multiple
                    options={employeeNames}
                    getOptionLabel={(option) => option}
                    value={selectedEmployees}
                    onChange={(event, newValue) => setSelectedEmployees(newValue)}
                    renderInput={(params) => <TextField {...params} label="Filter Employees" variant="outlined"/>}
                />
            </Box>

            <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px"}}>
                <Typography variant="h4" sx={{fontSize: {xs: "1.25rem", sm: "1.5rem", md: "2rem"}}}>
                    Monthly Working Hours
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<PrintIcon/>}
                    sx={{padding: {xs: "4px 16px", sm: "8px 16px"}}}
                    onClick={handlePrint}
                >
                    {isSmallScreen ? "Print" : "Print or Save as PDF"}
                </Button>
            </div>
            {/* Print-specific Styles */}
            <style>
                {`
                  @media print {
                    @page {
                      size: 11in 17in;
                    }
                    
                    button, .MuiTextField-root, .MuiAutocomplete-root {
                      display: none !important;
                    }
                    h4 {
                        text-align: center !important;
                        width: 100%;
                        display: block;
                    }
                    /* Hide the arrow column in the print view */
                    th:first-child, td:first-child {
                      display: none;
                    }
                  }
                `}
            </style>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>History</TableCell>
                            <TableCell>#</TableCell>
                            <TableCell>Employee Name</TableCell>
                            <TableCell>Month</TableCell>
                            <TableCell>Total Hours</TableCell>
                            <TableCell>Weekday Hours</TableCell>
                            <TableCell>Weekend Hours</TableCell>
                            <TableCell>After 19:00 Hours</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredEmployees.map((employee, index) => {
                            const employeeData = groupedByEmployee[employee];
                            const isExpanded = expandedRows[employee] || false;

                            // Sort employee data by month descending
                            const sortedData = [...employeeData].sort(
                                (a, b) => new Date(b.month_year) - new Date(a.month_year)
                            );

                            const [latestMonth, ...otherMonths] = sortedData;

                            return (
                                <React.Fragment key={employee}>
                                    <TableRow>
                                        <TableCell>
                                            <IconButton onClick={() => toggleExpand(employee)}>
                                                {isExpanded ? <KeyboardArrowUpIcon/> : <KeyboardArrowDownIcon/>}
                                            </IconButton>
                                        </TableCell>
                                        <TableCell>{index+1}</TableCell> {/* Display sequence number */}
                                        <TableCell>{employee}</TableCell>
                                        <TableCell>
                                            {new Date(latestMonth.month_year).toLocaleString("default", {
                                                month: "long",
                                                year: "numeric",
                                            })}
                                        </TableCell>
                                        <TableCell>{latestMonth.formatted_total_working_hours}</TableCell>
                                        <TableCell>{latestMonth.formatted_weekday_working_hours}</TableCell>
                                        <TableCell>{latestMonth.formatted_weekend_working_hours}</TableCell>
                                        <TableCell>{latestMonth.formatted_after_19_working_hours}</TableCell>
                                    </TableRow>

                                    {/* Expandable Row */}
                                    <TableRow style={{backgroundColor: theme.palette.background.default}}>
                                        <TableCell style={{paddingBottom: 0, paddingTop: 0}} colSpan={7}>
                                            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                                                <Box sx={{margin: 1}}>
                                                    <Typography variant="h6" gutterBottom component="div">
                                                        History
                                                    </Typography>
                                                    <Table size="small" aria-label="history">
                                                        <TableHead>
                                                            <TableRow>
                                                                <TableCell>Month</TableCell>
                                                                <TableCell>Total Hours</TableCell>
                                                                <TableCell>Weekday Hours</TableCell>
                                                                <TableCell>Weekend Hours</TableCell>
                                                                <TableCell>After 19:00 Hours</TableCell>
                                                            </TableRow>
                                                        </TableHead>
                                                        <TableBody>
                                                            {otherMonths.map((monthData, index) => (
                                                                <TableRow key={index}>
                                                                    <TableCell>
                                                                        {new Date(monthData.month_year).toLocaleString("default", {
                                                                            month: "long",
                                                                            year: "numeric",
                                                                        })}
                                                                    </TableCell>
                                                                    <TableCell>{monthData.formatted_total_working_hours}</TableCell>
                                                                    <TableCell>{monthData.formatted_weekday_working_hours}</TableCell>
                                                                    <TableCell>{monthData.formatted_weekend_working_hours}</TableCell>
                                                                    <TableCell>{monthData.formatted_after_19_working_hours}</TableCell>
                                                                </TableRow>
                                                            ))}
                                                            {otherMonths.length === 0 && (
                                                                <TableRow>
                                                                    <TableCell colSpan={5} align="center">
                                                                        No history available
                                                                    </TableCell>
                                                                </TableRow>
                                                            )}
                                                        </TableBody>
                                                    </Table>
                                                </Box>
                                            </Collapse>
                                        </TableCell>
                                    </TableRow>
                                </React.Fragment>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );
};

export default MonthlyWorkingHoursTable;
