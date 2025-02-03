// static/js/shift_time_autofill.js
document.addEventListener("DOMContentLoaded", function() {
    const shiftTypeField = document.querySelector('[name="shift_type"]');
    const shiftStartField = document.querySelector('[name="shift_start_time"]');
    const shiftEndField = document.querySelector('[name="shift_end_time"]');

    // Function to update shift times based on selected shift type
    function updateShiftTimes() {
        const shiftType = shiftTypeField.value;
        let startTime, endTime;

        if (shiftType === 'DAY') {
            startTime = '07:00'; // Day Shift
            endTime = '15:00';
        } else if (shiftType === 'EVE') {
            startTime = '15:00'; // Evening Shift
            endTime = '22:00';
        } else {
            return; // Do nothing if the shift type is not recognized
        }

        // Set the start and end times
        shiftStartField.value = startTime;
        shiftEndField.value = endTime;
    }

    // Add event listener to update times when shift type changes
    if (shiftTypeField) {
        shiftTypeField.addEventListener('change', updateShiftTimes);

        // Initialize the times when the page loads (if a shift type is pre-selected)
        updateShiftTimes();
    }
});
