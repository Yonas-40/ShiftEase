from datetime import datetime
from rest_framework import serializers
from rest_framework.serializers import ModelSerializer
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate
from .models import *


class ShiftSerializer(ModelSerializer):
    title = serializers.CharField(source='employee.profile.username')  # Display employee's name
    start = serializers.SerializerMethodField()  # Combine date and start time
    end = serializers.SerializerMethodField()  # Combine date and end time
    classNames = serializers.SerializerMethodField()  # Use readable shift type

    class Meta:
        model = Shift
        fields = ('id', 'start', 'end', 'classNames', 'title')

    def get_start(self, obj):
        # Combine date and start time for FullCalendar
        return datetime.combine(obj.shift_date, obj.shift_start_time)

    def get_end(self, obj):
        # Combine date and end time for FullCalendar
        return datetime.combine(obj.shift_date, obj.shift_end_time)

    def get_classNames(self, obj):
        # Check if the event is an availability or a shift and assign different classNames
        if obj.is_available:  # Assuming you have a boolean field `is_availability` in your Shift model
            return 'available'  # Use a different class for availability events
        else:
            return obj.get_shift_type_display()  # Use readable shift type for shift events

# serializers.py
class ShiftCreateSerializer(serializers.ModelSerializer):
    employee = serializers.PrimaryKeyRelatedField(queryset=Employee.objects.all())
    shift_start_time = serializers.TimeField(read_only=True)
    shift_end_time = serializers.TimeField(read_only=True)
    is_weekend = serializers.BooleanField(read_only=True)

    class Meta:
        model = Shift
        fields = [
            'employee',
            'is_available',
            'shift_date',
            'shift_type',
            'shift_start_time',
            'shift_end_time',
            'is_weekend',
        ]

    def validate(self, attrs):
        """
        Custom validation logic:
        - If the user is an employee, restrict the fields they can set.
        """
        request = self.context['request']
        profile = request.user

        # Employees can only set their own availability
        if profile.role == 'employee':
            if attrs.get('employee') and attrs['employee'].profile != profile:
                raise serializers.ValidationError(
                    {"employee": "Employees can only set their own availability."}
                )
            if 'shift_type' not in attrs:
                raise serializers.ValidationError(
                    {"shift_type": "Shift type must be specified for availability."}
                )
            attrs['is_available'] = attrs.get('is_available', True)  # Default to True

        return super().validate(attrs)

    def create(self, validated_data):
        # Automatically set the start and end times based on shift_type
        shift_type = validated_data.get('shift_type')
        if shift_type in Shift.SHIFT_TIMINGS:
            shift_start_time, shift_end_time = Shift.SHIFT_TIMINGS[shift_type]
            validated_data['shift_start_time'] = shift_start_time
            validated_data['shift_end_time'] = shift_end_time

        # Automatically set `is_weekend` based on the shift_date
        shift_date = validated_data.get('shift_date')
        is_weekend = shift_date.weekday() >= 5  # Saturday (5) or Sunday (6)
        validated_data['is_weekend'] = is_weekend

        # Create the shift instance
        shift = Shift.objects.create(**validated_data)
        return shift

class UserProfileSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = Profile
        fields = ['id', 'username', 'role', 'email', 'contact_number', 'department', 'address', 'first_name',
                  'last_name', 'image', 'date_joined']

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        if instance.image:
            # Ensure the image URL is a full URL, not just a path
            print(instance.image.url)
            representation['image'] = instance.image.url
        return representation

    def update(self, instance, validated_data):
        # Handle image removal separately
        image = validated_data.get('image', None)
        if image is None:  # If frontend sends `image: null`, delete existing image
            instance.image.delete(save=False)  # Delete the image file from storage
            instance.image = None  # Set the image field to None

        # Update other fields normally
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()  # Save changes
        return instance
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")

        # Authenticate the user with email and password
        if email and password:
            user = authenticate(request=self.context.get("request"), email=email, password=password)
            if not user:
                raise serializers.ValidationError({"error": "Invalid email or password"})

            if not user.is_active:
                raise serializers.ValidationError({"error": "User account is disabled"})
        else:
            raise serializers.ValidationError({"error": "Email and password must be provided"})

        # Add user to attrs for the base serializer
        attrs["user"] = user
        data = super().validate(attrs)

        # Add `force_password_change` flag
        data["force_password_change"] = (user.role == 'employee' and not user.is_password_changed)

        return data

class EmployeeSerializer(serializers.ModelSerializer):
    # Add role field from Profile
    role = serializers.CharField(source='profile.role')

    # Profile fields (username, email, department, date_joined)
    username = serializers.CharField(source='profile.username')
    email = serializers.EmailField(source='profile.email')
    department = serializers.CharField(source='profile.department')
    date_joined = serializers.DateField(source='profile.date_joined')
    image = serializers.ImageField(source='profile.image', required=False, allow_null=True)
    first_name = serializers.CharField(source='profile.first_name')
    last_name = serializers.CharField(source='profile.last_name')
    contact_number = serializers.CharField(source='profile.contact_number')
    address = serializers.CharField(source='profile.address')

    # Employee fields
    designation = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = Employee
        fields = [
            'id', 'username', 'first_name', 'last_name', 'image',
            'email', 'department', 'date_joined', 'contact_number',
            'address', 'designation', 'role'
        ]

    def update(self, instance, validated_data):
        # Extract and update profile data
        profile_data = validated_data.pop('profile', {})

        # If an image is provided or set to null, handle image removal
        if 'image' in profile_data:
            image = profile_data['image']
            if image is None:  # If image is set to None, remove it
                instance.profile.image.delete(save=False)  # Delete the image from storage
                profile_data['image'] = None  # Set the image field to None

        if profile_data:
            profile = instance.profile  # Get the related profile instance
            for attr, value in profile_data.items():
                # Only update fields if a new value is provided
                if value is not None:
                    setattr(profile, attr, value)
            profile.save()  # Save changes to the profile instance

        # Update Employee fields (contact_number, address, designation, etc.)
        for attr, value in validated_data.items():
            # Only update fields if a new value is provided
            if value is not None:
                setattr(instance, attr, value)

        instance.save()  # Save changes to the Employee instance
        return instance


class EmployeeCreateSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer()

    class Meta:
        model = Employee
        fields = ['profile', 'designation']

    def create(self, validated_data):
        profile_data = validated_data.pop('profile')
        # Create profile first
        profile = Profile.objects.create(**profile_data)
        # Assign employee role to the profile
        profile.role = 'employee'
        profile.is_password_changed = False  # Default to False for new employees
        profile.save()
        # Set the default password for the Profile (which is also the User instance)
        profile.set_password('Tesia123')  # This will hash the password
        profile.save()
        # Then create the Employee instance
        employee = Employee.objects.create(profile=profile, **validated_data)
        return employee


class MonthlyWorkingHoursSerializer(serializers.ModelSerializer):
    formatted_total_working_hours = serializers.ReadOnlyField()
    formatted_weekday_working_hours = serializers.ReadOnlyField()
    formatted_weekend_working_hours = serializers.ReadOnlyField()
    formatted_after_19_working_hours = serializers.ReadOnlyField()
    employee = serializers.CharField(source='employee.profile.username', read_only=True)

    class Meta:
        model = MonthlyWorkingHours
        fields = [
            'employee',
            'month_year',
            'formatted_total_working_hours',
            'formatted_weekday_working_hours',
            'formatted_weekend_working_hours',
            'formatted_after_19_working_hours',
        ]
