from django.contrib.auth import get_user_model
from django.db.models import Q

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.generics import (
    RetrieveUpdateDestroyAPIView,
    CreateAPIView,
)

from rest_framework_simplejwt.tokens import RefreshToken

from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from dj_rest_auth.registration.views import SocialLoginView

from .models import Profile, Address
from .serializers import (
    AdminUserListSerializer,
    ProfileDetailsSerializer,
    ProfileSerializer,
    AddressSerializer,
)


User = get_user_model()


# ------------------------
# SOCIAL LOGIN (Google)
# ------------------------
class GoogleLogin(SocialLoginView):
    adapter_class = GoogleOAuth2Adapter

    def get_response(self):
        """
        Return access + refresh + user info after successful Google login.
        Add 'new_user': True if this is the first login (user just created).
        """
        user = self.user

        # Determine if this is a new user (first time login)
        # If last_login is None, user is logging in for the first time
        new_user = user.last_login is None

        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        data = {
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
            },
            "new_user": new_user,  # <-- flag for frontend
        }

        # Optional: Update last_login manually if needed
        # from django.utils import timezone
        # user.last_login = timezone.now()
        # user.save(update_fields=["last_login"])

        return Response(data, status=status.HTTP_200_OK)


# ------------------------
# Profile API
# ------------------------
class ProfileDetailsAPIView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get(self, request):
        profile, _ = Profile.objects.get_or_create(user=request.user)
        serializer = ProfileDetailsSerializer(profile, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request):
        profile, _ = Profile.objects.get_or_create(user=request.user)
        serializer = ProfileDetailsSerializer(
            profile,
            data=request.data,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request):
        profile, _ = Profile.objects.get_or_create(user=request.user)
        serializer = ProfileDetailsSerializer(
            profile,
            data=request.data,
            partial=True,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)


# ------------------------
# Address API
# ------------------------
class AddressListCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile, _ = Profile.objects.get_or_create(user=request.user)
        addresses = profile.addresses.all()
        serializer = AddressSerializer(addresses, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        profile, _ = Profile.objects.get_or_create(user=request.user)
        serializer = AddressSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(profile=profile)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class AddressDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, pk):
        profile, _ = Profile.objects.get_or_create(user=request.user)
        try:
            address = profile.addresses.get(pk=pk)
        except Address.DoesNotExist:
            return Response({"detail": "Address not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = AddressSerializer(address, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)

    def delete(self, request, pk):
        profile, _ = Profile.objects.get_or_create(user=request.user)
        try:
            address = profile.addresses.get(pk=pk)
        except Address.DoesNotExist:
            return Response({"detail": "Address not found"}, status=status.HTTP_404_NOT_FOUND)

        address.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# ------------------------
# Users List API (Admin only)
# ------------------------
class UsersListAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profiles = Profile.objects.select_related("user").all()
        serializer = ProfileSerializer(profiles, many=True, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)


# ------------------------
# Admin: Create / Update / Delete User Profile
# ------------------------
class UserCreateAPIView(CreateAPIView):
    """
    Admin can create a new user profile.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = ProfileSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def perform_create(self, serializer):
        serializer.save()


class UserDetailAPIView(RetrieveUpdateDestroyAPIView):
    """
    Admin can read, update, or delete a user profile by ID.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = ProfileSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    queryset = Profile.objects.select_related("user").all()


class AdminUsersListAPIView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        q = request.query_params.get("q", "").strip()

        qs = User.objects.select_related("profile").all().order_by("-id")

        if q:
            qs = qs.filter(
                Q(username__icontains=q) |
                Q(email__icontains=q)
            )

        data = AdminUserListSerializer(qs[:200], many=True).data
        return Response(data, status=status.HTTP_200_OK)