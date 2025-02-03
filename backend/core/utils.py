from django.core.management.base import BaseCommand
from .models import *
from django.utils import timezone
from datetime import timedelta, time


def calculate_monthly_hours(employee):
    # Your function logic here (as you've provided)
    # This function will calculate and store the monthly hours for each employee
    today = timezone.now()
    first_day_of_month = today.replace(day=1)
    # Handle the case when the current month is December
    if first_day_of_month.month == 12:
        # If it's December, set the last day of the month to the last day of December
        last_day_of_month = first_day_of_month.replace(month=12, day=31)
    else:
        # Otherwise, get the last day of the current month
        last_day_of_month = (first_day_of_month.replace(month=first_day_of_month.month + 1) - timedelta(days=1))

    # Get all shifts for the employee in the current month
    shifts = Shift.objects.filter(
        employee=employee,
        shift_date__gte=first_day_of_month,
        shift_date__lte=last_day_of_month
    )

    total_working_hours = 0
    weekday_working_hours = 0
    weekend_working_hours = 0
    after_19_working_hours = 0

    for shift in shifts:
        # Calculate total working hours
        working_hours = (shift.shift_end_time.hour - shift.shift_start_time.hour) + \
                        (shift.shift_end_time.minute - shift.shift_start_time.minute) / 60.0

        # Subtract 30 minutes break time (unless the shift ends after 19:00)
        break_time = timedelta(minutes=30)
        working_hours -= break_time.total_seconds() / 3600.0

        total_working_hours += working_hours

        if shift.shift_date.weekday() < 5:  # Weekdays
            weekday_working_hours += working_hours
        else:  # Weekends
            weekend_working_hours += working_hours

            # After 19:00 calculation
        if shift.shift_end_time >= time(19, 0):  # If shift ends after 19:00
            # Check if the shift is on a weekday or weekend
            if shift.shift_date.weekday() == 4:  # Friday
                # For Friday, count hours from 19:00 to 22:00 as weekend hours
                 # Calculate the hours worked after 19:00 on Friday and treat it as weekend hours
                weekend_hours = (shift.shift_end_time.hour - 19) + (shift.shift_end_time.minute / 60.0)
                weekend_working_hours += weekend_hours

            elif shift.shift_date.weekday() < 4:
                after_19_duration = (shift.shift_end_time.hour - 19) + (shift.shift_end_time.minute / 60.0)
                after_19_working_hours += after_19_duration

    MonthlyWorkingHours.objects.update_or_create(
        employee=employee,
        month_year=first_day_of_month,
        defaults={
            'total_working_hours': total_working_hours,
            'weekday_working_hours': weekday_working_hours,
            'weekend_working_hours': weekend_working_hours,
            'after_19_working_hours': after_19_working_hours,
        }
    )


class Command(BaseCommand):
    help = 'Calculate monthly working hours for each employee'

    def handle(self, *args, **kwargs):
        employees = Employee.objects.all()
        for employee in employees:
            calculate_monthly_hours(employee)
        self.stdout.write(self.style.SUCCESS('Monthly working hours calculated successfully!'))
