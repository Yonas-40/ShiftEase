# core/signals.py
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import *
from .utils import calculate_monthly_hours  # Assuming you put your function in utils.py

@receiver(post_save, sender=Shift)
def update_monthly_hours(sender, instance, created, **kwargs):
    # Only recalculate if a new shift is created or updated
    if created:
        calculate_monthly_hours(instance.employee)

@receiver(post_delete, sender=Shift)
def remove_shift_from_monthly_hours(sender, instance, **kwargs):
    """
    Recalculate monthly hours when a shift is deleted.
    This ensures the MonthlyWorkingHours table remains accurate.
    """
    calculate_monthly_hours(instance.employee)  # Recalculate without the deleted shift
@receiver(post_save, sender=Profile)
def sync_contact_and_address_to_employee(sender, instance, created, **kwargs):
    if hasattr(instance, 'employee_data'):
        employee = instance.employee_data
        if employee.contact_number != instance.contact_number or employee.address != instance.address:
            # Update Employee only if data is different
            employee.save(update_fields=[])  # Avoid triggering Employee's save signal


@receiver(post_save, sender=Employee)
def sync_contact_and_address_to_profile(sender, instance, created, **kwargs):
    profile = instance.profile
    if profile.contact_number != instance.contact_number or profile.address != instance.address:
        # Update Profile only if data is different
        profile.save(update_fields=[])  # Avoid triggering Profile's save signal