from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _
from django.conf import settings
from datetime import time, timedelta


class Profile(AbstractUser):
    ROLE_CHOICES = [
        ('employee', 'Employee'),
        ('manager', 'Manager'),
        ('admin', 'Admin'),
    ]

    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='employee')
    department = models.CharField(max_length=50, blank=True, null=True)
    date_joined = models.DateField(auto_now_add=True)
    contact_number = models.CharField(max_length=15, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    email = models.EmailField(unique=True)
    image = models.ImageField(upload_to='Pictures/', blank=True, null=True)
    is_password_changed = models.BooleanField(default=False)  # New flag

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def save(self, *args, **kwargs):
        if self.username:
            self.username = self.username.capitalize()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.username} ({self.email})"


class EmployeeQuerySet(models.QuerySet):
    def for_employees(self):
        return self.filter(profile__role='employee')


class Employee(models.Model):
    profile = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='employee_data',
        limit_choices_to={'role': 'employee'}
    )
    designation = models.CharField(max_length=100)

    objects = EmployeeQuerySet.as_manager()

    def __str__(self):
        return self.profile.username

    @property
    def contact_number(self):
        return self.profile.contact_number

    @contact_number.setter
    def contact_number(self, value):
        self._contact_number = value

    @property
    def address(self):
        return self.profile.address

    @address.setter
    def address(self, value):
        self._address = value


from datetime import time
from django.db import models

class Shift(models.Model):
    SHIFT_TYPES = [
        ('DAY', 'Day Shift'),
        ('EVE', 'Evening Shift'),
    ]
    SHIFT_TIMINGS = {
        'DAY': (time(7, 0), time(15, 0)),  # Start and end times for Day Shift
        'EVE': (time(15, 0), time(22, 0)),  # Start and end times for Evening Shift
    }

    employee = models.ForeignKey('Employee', on_delete=models.CASCADE, related_name='shifts')
    shift_date = models.DateField()
    shift_type = models.CharField(max_length=5, choices=SHIFT_TYPES)
    shift_start_time = models.TimeField(blank=True, null=True)
    shift_end_time = models.TimeField(blank=True, null=True)
    is_weekend = models.BooleanField(default=False)  # Automatically set based on shift_date
    is_available = models.BooleanField(default=False)  # Employee can toggle this to mark availability

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['employee', 'shift_date', 'shift_type'], name='unique_shift_for_employee')
        ]

    def save(self, *args, **kwargs):
        # Automatically set start and end times based on shift type
        if self.shift_type in self.SHIFT_TIMINGS:
            self.shift_start_time, self.shift_end_time = self.SHIFT_TIMINGS[self.shift_type]

        # Automatically set the `is_weekend` flag based on the shift date
        self.is_weekend = self.shift_date.weekday() >= 5  # Saturday (5) or Sunday (6)

        super().save(*args, **kwargs)

    def __str__(self):
        formatted_date = self.shift_date.strftime("%A, %Y-%m-%d")  # Format the shift_date
        return (f"{self.employee.profile.username} - {self.get_shift_type_display()} on {formatted_date} - "
                f"{'Available' if self.is_available else 'Not Available'}")

class MonthlyWorkingHours(models.Model):
    employee = models.ForeignKey('Employee', on_delete=models.CASCADE)
    month_year = models.DateField()  # Store the month and year (e.g., '2024-12-01')

    total_working_hours = models.FloatField(default=0)  # Store working hours as float (hours)
    weekday_working_hours = models.FloatField(default=0)
    weekend_working_hours = models.FloatField(default=0)
    after_19_working_hours = models.FloatField(default=0)

    def __str__(self):
        # Get all shifts for the employee in this month to display shift types
        shifts = Shift.objects.filter(employee=self.employee, shift_date__month=self.month_year.month,
                                      shift_date__year=self.month_year.year)

        # Get shift types from the related shifts
        shift_types = ', '.join([shift.get_shift_type_display() for shift in shifts])

        return f"{self.employee.profile.username} - {self.month_year.strftime('%B %Y')} - Shifts: {shift_types}"

    @property
    def formatted_total_working_hours(self):
        # Convert total working hours (stored in float) to hours and minutes for display
        hours = int(self.total_working_hours)
        minutes = round((self.total_working_hours - hours) * 60)
        return f"{hours} hours {minutes} minutes"

    @property
    def formatted_weekday_working_hours(self):
        hours = int(self.weekday_working_hours)
        minutes = round((self.weekday_working_hours - hours) * 60)
        return f"{hours} hours {minutes} minutes"

    @property
    def formatted_weekend_working_hours(self):
        hours = int(self.weekend_working_hours)
        minutes = round((self.weekend_working_hours - hours) * 60)
        return f"{hours} hours {minutes} minutes"

    @property
    def formatted_after_19_working_hours(self):
        hours = int(self.after_19_working_hours)
        minutes = round((self.after_19_working_hours - hours) * 60)
        return f"{hours} hours {minutes} minutes"
