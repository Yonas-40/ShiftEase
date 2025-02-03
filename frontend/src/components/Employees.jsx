import React, {useEffect, useState} from 'react';
import '../App.css';
import MultiSelectForm from './forms/MultiSelectForm.jsx';
import dayjs from 'dayjs';
import Box from '@mui/material/Box';
import DatePickerForm from './forms/DatePickerForm.jsx';
import EmployeeTable from '../components/calendars/EmployeeTable';


const Employees = () =>{
    return(
        <div>
            <EmployeeTable/>
        </div>
    )
}
export default Employees;