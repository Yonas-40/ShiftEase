import * as React from 'react';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import 'dayjs/locale/sv';

export default function DatePickerForm({ label, value, onChange, adapterLocale = 'sv' }) {
  const handleDateChange = (newValue) => {
    if (newValue?.isValid?.()) {
      onChange(newValue);
    } else {
      console.error("Invalid date selected");
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={adapterLocale}>
      <DemoContainer components={['DatePicker']}>
        <DatePicker
          label={label}
          sx={{ width: '100%' }}
          value={value}
          onChange={handleDateChange}
        />
      </DemoContainer>
    </LocalizationProvider>
  );
}
