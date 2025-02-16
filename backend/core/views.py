from rest_framework import viewsets, permissions, status, generics
from .serializers import *
from django.core.mail import send_mail
from .models import Shift
from django.shortcuts import get_object_or_404
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.tokens import default_token_generator
from rest_framework.views import APIView
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated, BasePermission
from rest_framework_simplejwt.views import TokenObtainPairView
from django.db import IntegrityError
from rest_framework.exceptions import ValidationError
import logging
import socket
from django.conf import settings
logger = logging.getLogger(__name__)

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        serializer = UserProfileSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)

class SignInView(APIView):
    permission_classes = [IsAuthenticated]  # Open access for everyone

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        # Authenticate the user
        user = authenticate(request, username=username, password=password)

        if user is not None:
            profile = user.profile

            # Check if the user is an employee with the default password
            if (profile.role == 'employee' or profile.role == 'manager') and not profile.is_password_changed:
                logger.info(f"User {profile.username}: is_password_changed = {profile.is_password_changed}")
                return Response({
                    "message": "Please change your password on first login.",
                    "force_password_change": True
                }, status=status.HTTP_200_OK)

            # Generate the token
            refresh = RefreshToken.for_user(user)

            return Response({
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "role": profile.role,  # Assuming profile role is used for permissions
                    "image": profile.image.url if profile.image else None,  # Ensure image URL is included
                }
            })
        else:
            return Response({"error": "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST)

User = get_user_model()  # Dynamically get the custom user model

class ResetPasswordView(APIView):
    permission_classes = [AllowAny]  # Allow unauthenticated users

    def post(self, request):
        user_id = request.data.get('userId')
        token = request.data.get('token')
        new_password = request.data.get('newPassword')

        if not all([user_id, token, new_password]):
            return Response({"error": "Invalid data."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return Response({"error": "Invalid user."}, status=status.HTTP_400_BAD_REQUEST)

        if not default_token_generator.check_token(user, token):
            return Response({"error": "Invalid or expired token."}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()

        return Response({"message": "Password has been reset successfully."}, status=status.HTTP_200_OK)

class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]

    def get_server_ip(self):
        # Fetch the server's IP address dynamically (ensure your server is accessible via this IP)
        # This method can be changed to suit your needs (e.g., using a public IP for production)
        try:
            # Create a temporary socket connection to an external server
            with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as s:
                s.connect(("8.8.8.8", 80))  # Google's public DNS
                local_ip = s.getsockname()[0]  # Get the machine's actual local IP
            return local_ip
        except Exception as e:
            print(f"Error getting local IP: {e}")
            return "127.0.0.1"  # Fallback to localhost if error occurs

    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({"error": "Email is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            logger.error(f"User with email {email} does not exist.")
            return Response({"error": "No user found with this email."}, status=status.HTTP_400_BAD_REQUEST)

        # Generate password reset token
        token = default_token_generator.make_token(user)

        # Get the server IP (or use an environment variable if you set a specific IP)
        server_ip = self.get_server_ip()

        # Create password reset link
        reset_link = f'http://{server_ip}:5173/reset-password/{user.id}/{token}/'

        # Send email to user with the reset link
        try:
            send_mail(
                'Password Reset Request',
                f'Click the link to reset your password: {reset_link}',
                'jonasasmer40@gmail.com',  # Replace with your email
                [email],
            )
        except Exception as e:
            logger.error(f"Error sending password reset email: {e}")
            return Response({"error": "Failed to send email."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({"message": "Password reset link sent to your email."}, status=status.HTTP_200_OK)

class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        new_password = request.data.get('new_password')
        user = request.user
        # Validate the new password (optional: check minimum length, complexity, etc.)
        if len(new_password) < 8:
            return Response({"error": "Password must be at least 8 characters long."},
                            status=status.HTTP_400_BAD_REQUEST)

        # Set the new password
        user.set_password(new_password)
        user.is_password_changed = True  # Mark as changed
        user.save()

        # Return success message
        return Response({"message": "Password changed successfully!"}, status=status.HTTP_200_OK)

class ShiftViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    queryset = Shift.objects.all()
    serializer_class = ShiftSerializer

    # Optional: Overriding the default 'list' method to allow filtering for shifts based on the user's role
    def list(self, request, **kwargs):
        user = request.user
        if user.role == 'manager' or user.role == 'admin':
            # Admins and managers can see all shifts
            queryset = self.get_queryset()
        else:
            # Employees can only see their own shifts
            queryset = self.get_queryset().filter(employee=user.employee_data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

class ShiftCreateView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Shift.objects.all()
    serializer_class = ShiftCreateSerializer

    def create(self, request, *args, **kwargs):
        user = request.user
        data = request.data

        # Employees can only add their availability
        if user.role == 'employee':
            employee = user.employee_data  # Correct way to access the Employee instance
            data['employee'] = employee.id  # Set employee to the logged-in user
            data['is_available'] = data.get('is_available', True)  # Default to available

        # Managers and Admins can add shifts for other employees
        elif user.role in ['manager', 'admin']:
            employee_id = data.get('employee')
            if not employee_id:
                return Response(
                    {"errors": {"employee": "Employee must be specified."}},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        # Check for existing shifts for the same employee, date, and type
        employee = data.get('employee')
        shift_date = data.get('shift_date')
        shift_type = data.get('shift_type')

        if Shift.objects.filter(
            employee=employee, shift_date=shift_date, shift_type=shift_type
        ).exists():
            return Response(
                {"errors": {"shift_type": "Shift already exists for this employee on the selected date and time."}},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Proceed to serializer if validation passes
        try:
            serializer = self.get_serializer(data=data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except IntegrityError:
            return Response(
                {"errors": "A database error occurred. Please try again."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        except ValidationError as e:
            return Response({"errors": e.detail}, status=status.HTTP_400_BAD_REQUEST)
        if request.user != profile and not request.user.is_staff:
            return Response({"error": "You do not have permission to update this profile."},
                            status=status.HTTP_403_FORBIDDEN)

        serializer = self.get_serializer(profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(serializer.data, status=status.HTTP_200_OK)

class ApproveShiftView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, id):
        shift = get_object_or_404(Shift, pk=id)
        user = request.user

        # Check if the user is an admin or manager
        if user.role not in ['manager', 'admin']:
            return Response({"error": "You do not have permission to approve shifts."},
                            status=status.HTTP_403_FORBIDDEN)

        # Update shift availability to false (approved)
        shift.is_available = False
        shift.save()

        return Response({"message": "Shift approved successfully."}, status=status.HTTP_200_OK)

class RejectShiftView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, id):
        shift = get_object_or_404(Shift, pk=id)
        user = request.user

        # Check if the user is an admin or manager
        if user.role not in ['manager', 'admin']:
            return Response({"error": "You do not have permission to reject shifts."},
                            status=status.HTTP_403_FORBIDDEN)

        # Delete the shift
        shift.delete()

        return Response({"message": "Shift rejected successfully."}, status=status.HTTP_200_OK)

class MoveShiftView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, shift_id):
        user = request.user

        # Fetch the existing shift
        old_shift = get_object_or_404(Shift, pk=shift_id)

        # Authorization check
        if user.role not in ['manager', 'admin']:
            return Response({"error": "You do not have permission to move shifts."},
                            status=status.HTTP_403_FORBIDDEN)

        # Get the new date from the request
        new_date = request.data.get('new_date')

        if not new_date:
            return Response({'error': 'New date is required'}, status=status.HTTP_400_BAD_REQUEST)

        # Convert to date object
        try:
            new_date = datetime.strptime(new_date, '%Y-%m-%d').date()
        except ValueError:
            return Response({'error': 'Invalid date format. Expected YYYY-MM-DD.'}, status=status.HTTP_400_BAD_REQUEST)

        # Check if a shift already exists for the employee on the new date with the same shift type
        if Shift.objects.filter(employee=old_shift.employee, shift_date=new_date, shift_type=old_shift.shift_type).exists():
            return Response({"error": "A shift already exists for this employee on the new date with the same type."},
                            status=status.HTTP_400_BAD_REQUEST)

        # Prepare data for the new shift
        data = {
            'employee': old_shift.employee.id,
            'shift_date': new_date,
            'shift_type': old_shift.shift_type,
            'is_available': old_shift.is_available,
        }

        # Create a new shift using the serializer
        serializer = ShiftCreateSerializer(data=data, context={'request': request})

        if serializer.is_valid():
            try:
                new_shift = serializer.save()
                old_shift.delete()
                return Response({
                    "message": "Shift moved successfully.",
                    "new_shift": ShiftSerializer(new_shift).data
                }, status=status.HTTP_200_OK)

            except IntegrityError as e:  # In case of DB unique constraint issues
                return Response({
                    "error": "Database error while moving the shift.",
                    "details": str(e)
                }, status=status.HTTP_400_BAD_REQUEST)

        return Response({
            "error": "Validation failed when moving the shift.",
            "details": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

class CopyShiftView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        employee_id = request.data.get('employee')
        shift_date = request.data.get('shift_date')
        shift_type = request.data.get('shift_type')

        if not employee_id or not shift_date or not shift_type:
            return Response({'error': 'Employee, shift_date, and shift_type are required.'},
                            status=status.HTTP_400_BAD_REQUEST)

        if user.role not in ['manager', 'admin']:
            return Response({"error": "You do not have permission to copy shifts."},
                            status=status.HTTP_403_FORBIDDEN)

        try:
            shift_date = datetime.strptime(shift_date, '%Y-%m-%d').date()
        except ValueError:
            return Response({'error': 'Invalid shift_date format. Expected format: YYYY-MM-DD.'},
                            status=status.HTTP_400_BAD_REQUEST)

        employee = get_object_or_404(Employee, pk=employee_id)

        if Shift.objects.filter(employee=employee, shift_date=shift_date, shift_type=shift_type).exists():
            return Response({
                "error": "Shift already exists for this employee on the selected date and type."
            }, status=status.HTTP_400_BAD_REQUEST)

        data = {
            'employee': employee.id,
            'shift_date': shift_date,
            'shift_type': shift_type,
            'is_available': False,
        }

        serializer = ShiftCreateSerializer(data=data, context={'request': request})
        if serializer.is_valid():
            try:
                new_shift = serializer.save()
                return Response({
                    "message": "Shift copied successfully.",
                    "shift": ShiftSerializer(new_shift).data
                }, status=status.HTTP_201_CREATED)

            except IntegrityError as e:
                return Response({
                    "error": "Database error while copying the shift.",
                    "details": str(e)
                }, status=status.HTTP_400_BAD_REQUEST)

        return Response({
            "error": "Validation failed when copying the shift.",
            "details": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

class ManagerProfileView(viewsets.GenericViewSet):
    permission_classes = [permissions.IsAuthenticated]
    queryset = Profile.objects.all()
    serializer_class = UserProfileSerializer

    def retrieve(self, request, *args, **kwargs):
        username = kwargs.get('username')
        profile = get_object_or_404(Profile, username=username)
        serializer = self.get_serializer(profile)
        return Response(serializer.data)

    def update(self, request, *args, **kwargs):
        username = kwargs.get('username')
        profile = get_object_or_404(Profile, username=username)
        serializer = self.get_serializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class EmployeeViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.AllowAny]  # Adjust permissions as needed
    serializer_class = EmployeeSerializer

    def get_queryset(self):
        # Filter only profiles with the 'EMPLOYEE' role
        return Employee.objects.select_related('profile').filter(profile__role='employee')

        # Custom endpoint to retrieve an individual employee by username

    def retrieve(self, request, username=None, *args, **kwargs):
        queryset = self.get_queryset()
        employee = queryset.filter(profile__username=username).first()
        if employee is None:
            return Response(
                {"error": "Employee not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        serializer = self.get_serializer(employee)
        return Response(serializer.data, status=status.HTTP_200_OK)

        # Custom endpoint to update an individual employee by username

    def update(self, request, username=None, *args, **kwargs):
        queryset = self.get_queryset()
        employee = queryset.filter(profile__username=username).first()
        if employee is None:
            return Response(
                {"error": "Employee not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        serializer = self.get_serializer(employee, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)

    def delete(self, request, username=None, *args, **kwargs):
        """
        Delete an employee by username.
        """
        profile = request.user
        if profile.role not in ['manager', 'admin']:
            raise PermissionDenied("You do not have permission to delete employees.")

        queryset = self.get_queryset()
        employee = queryset.filter(profile__username=username).first()
        if not employee:
            return Response({"error": "Employee not found."}, status=status.HTTP_404_NOT_FOUND)

        employee.shifts.all().delete()
        # Delete the employee's user profile first
        employee.profile.delete()
        # Delete the employee instance
        employee.delete()

        return Response({"message": "Employee deleted successfully."}, status=status.HTTP_200_OK)

class EmployeeCreateView(generics.CreateAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = EmployeeCreateSerializer

    def create(self, request, *args, **kwargs):
        # Handle employee creation, ensure profile is linked
        serializer = self.get_serializer(data=request.data)

        # If serializer is valid, create the employee, otherwise return errors
        if serializer.is_valid():
            return super().create(request, *args, **kwargs)
        else:
            # Return specific error messages in a custom format
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class MonthlyWorkingHoursView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Access the Profile instance
        profile = request.user

        # Check the user's role
        if profile.role == 'employee':
            # Access the associated Employee instance
            try:
                employee = profile.employee_data  # Related name from Employee model
                working_hours = MonthlyWorkingHours.objects.filter(employee=employee)
            except Employee.DoesNotExist:
                return Response({"error": "Employee data not found"}, status=status.HTTP_404_NOT_FOUND)
        else:
            # If the user is a manager or admin, fetch all working hours
            working_hours = MonthlyWorkingHours.objects.all()

        # Serialize the data
        serializer = MonthlyWorkingHoursSerializer(working_hours, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
