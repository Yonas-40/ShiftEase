from django.urls import path, re_path
from .views import *
from django.contrib.auth import views as auth_views
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

router = DefaultRouter()
router.register('shifts', ShiftViewSet, basename='shifts')
router.register('employees', EmployeeViewSet, basename='employees')

urlpatterns = [
    path('signin/', SignInView.as_view(), name='signin'),
    path('api/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('create_shifts/', ShiftCreateView.as_view(), name='create-shift'),
    path('api/add/employee/', EmployeeCreateView.as_view(), name='add-employee'),
    path('api/user-profile/', UserProfileView.as_view(), name='user-profile'),
    path('change-password/', ChangePasswordView.as_view(), name='change_password'),
    path('forgot-password/', ForgotPasswordView.as_view(), name='forgot_password'),
    path('reset-password/', ResetPasswordView.as_view(), name='reset-password'),
    path('api/monthly-working-hours/', MonthlyWorkingHoursView.as_view(), name='monthly-working-hours'),
    path('api/profile/<str:username>/', ManagerProfileView.as_view({'get': 'retrieve', 'put': 'update'}),name='manager-detail'),
    re_path(r'^api/employees/(?P<username>[\w.@+-]+)/$', EmployeeViewSet.as_view({'get': 'retrieve', 'put': 'update'}),
            name='employee-detail'),
    re_path(r'^api/employees/(?P<id>\d+)/$', EmployeeViewSet.as_view({'delete': 'destroy'}),
            name='employee-delete-by-id'),
    # New endpoints for approve and reject shift
    path('api/shift/approve/<int:id>/', ApproveShiftView.as_view(), name='approve-shift'),
    path('api/shift/reject/<int:id>/', RejectShiftView.as_view(), name='reject-shift'),
]

urlpatterns += router.urls
