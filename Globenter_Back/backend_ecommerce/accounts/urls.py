from django.urls import path
from .views import (
    ProfileDetailsAPIView,
    UsersListAPIView,
    UserCreateAPIView,
    UserDetailAPIView,
    GoogleLogin,
)
from .views import AdminUsersListAPIView


urlpatterns = [
    # Profile (current user)
    path("profile/", ProfileDetailsAPIView.as_view(), name="profile"),
    path("profile/details/", ProfileDetailsAPIView.as_view(), name="profile-details"),
    path("admin/users/", AdminUsersListAPIView.as_view(), name="admin-users-list"),
    path("profile/update/", ProfileDetailsAPIView.as_view(), name="profile-update"),

    # Admin: Users management
    path("users/", UsersListAPIView.as_view(), name="users-list"),
    path("users/create/", UserCreateAPIView.as_view(), name="user-create"),
    path("users/<int:pk>/", UserDetailAPIView.as_view(), name="user-detail"),

    path('google/', GoogleLogin.as_view(), name='google_login'),
]
