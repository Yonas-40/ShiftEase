from django.contrib import admin
from django import forms
from .models import *
from django.contrib.auth.forms import UserChangeForm, UserCreationForm
from django.contrib.auth.admin import UserAdmin
from django.utils.html import format_html

class CustomUserCreationForm(UserCreationForm):
    class Meta:
        model = Profile
        fields = ('username', 'email', 'role')

class CustomUserChangeForm(UserChangeForm):
    class Meta:
        model = Profile
        fields = ('username', 'email', 'role', 'department', 'contact_number', 'image')

@admin.register(Profile)
class ProfileAdmin(UserAdmin):
    add_form = CustomUserCreationForm
    form = CustomUserChangeForm
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Personal Info', {'fields': ('first_name', 'last_name', 'email', 'contact_number', 'address', 'image')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Role and Department', {'fields': ('role', 'department', 'date_joined')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('role', 'username', 'email', 'department', 'password1', 'password2', ),
        }),
    )
    readonly_fields = ('date_joined',)  # Add this line
    list_display = ('username', 'email', 'role', 'department', 'date_joined', 'is_staff', 'image')

@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ('profile', 'designation', 'contact_number', 'address')
    search_fields = ('profile__username', 'designation', 'contact_number')
    list_filter = ('designation',)

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == "profile":
            kwargs["queryset"] = db_field.remote_field.model.objects.filter(role='employee')
        return super().formfield_for_foreignkey(db_field, request, **kwargs)

@admin.register(Shift)
class ShiftAdmin(admin.ModelAdmin):
    list_display = ('employee', 'formatted_shift_date', 'shift_type', 'shift_start_time', 'shift_end_time', 'is_weekend', 'is_available')
    # Search functionality based on employee's username
    search_fields = ('employee__profile__username',)
    # Filter options based on shift date and type
    list_filter = ('employee', 'shift_date', 'shift_type', 'is_weekend', 'is_available')
    # Alternatively, if you don't want the admin to change the `is_weekend` manually, you can make it readonly
    readonly_fields = ('is_weekend','is_available')


    # Custom method to display the day along with the date
    def formatted_shift_date(self, obj):
        # Format the shift_date as 'Day, YYYY-MM-DD'
        return format_html('<span>{}</span>', obj.shift_date.strftime("%A, %Y-%m-%d"))

    formatted_shift_date.admin_order_field = 'shift_date'  # Allows sorting by shift_date
    formatted_shift_date.short_description = 'Shift Date (Day)'

    class Media:
        js = ('js/shift_time_autofill.js',)  # Path to your custom JS file in the static directory

@admin.register(MonthlyWorkingHours)
class MonthlyWorkingHoursAdmin(admin.ModelAdmin):
    list_display = ('employee', 'month_year', 'formatted_total_working_hours',
                    'formatted_weekday_working_hours', 'formatted_weekend_working_hours',
                    'formatted_after_19_working_hours')
    list_filter = ('month_year', 'employee')
    search_fields = ('employee__profile__username',)
    list_per_page = 20

    def display_shift_types(self, obj):
        # Get all shifts for the employee in this month to display shift types
        shifts = Shift.objects.filter(employee=obj.employee, shift_date__month=obj.month_year.month,
                                      shift_date__year=obj.month_year.year)
        shift_types = ', '.join([shift.get_shift_type_display() for shift in shifts])
        return shift_types

    display_shift_types.short_description = 'Shift Types'