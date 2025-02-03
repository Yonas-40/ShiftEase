import * as React from 'react';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import ListItemText from '@mui/material/ListItemText';
import Select from '@mui/material/Select';
import Checkbox from '@mui/material/Checkbox';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

export default function MultiSelectForm({ label, options, setSelectedValue, selectedValue, width }) {
  const handleChange = (event) => {
    const {
      target: { value },
    } = event;

    if (value.includes('all')) {
      setSelectedValue(selectedValue.length === options.length ? [] : options);
    } else {
      setSelectedValue(typeof value === 'string' ? value.split(',') : value);
    }
  };

  if (!options || options.length === 0) return <p>No options available</p>;

  return (
    <div>
      <FormControl sx={{ m: 1, width: width || '100%' }}>
        <InputLabel id={`multi-select-${label}-label`}>{label}</InputLabel>
        <Select
          labelId={`multi-select-${label}-label`}
          id={`multi-select-${label}`}
          multiple
          value={selectedValue}
          onChange={handleChange}
          input={<OutlinedInput label={label} />}
          // Render "Select All" if all options are selected
          renderValue={(selected) =>
            selected.length === options.length
              ? 'Select All'
              : selected.join(', ')
          }
          MenuProps={MenuProps}
        >
          <MenuItem value="all">
            <Checkbox
              checked={selectedValue.length === options.length}
              indeterminate={selectedValue.length > 0 && selectedValue.length < options.length}
            />
            <ListItemText primary="Select All" />
          </MenuItem>
          {options.map((option) => (
            <MenuItem key={option} value={option}>
              <Checkbox checked={selectedValue.includes(option)} />
              <ListItemText primary={option} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
}
