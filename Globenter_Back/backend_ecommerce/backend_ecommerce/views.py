from django.shortcuts import render
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.response import Response
from django.http import JsonResponse

# -------------------
# Home view
# -------------------
def home(request):
    return render(request, 'home.html')


# Health check endpoint
def health(request):
    return JsonResponse({"status": "ok"})


# -------------------
# JWT login view with HttpOnly cookies
# -------------------
class CookieTokenObtainPairView(TokenObtainPairView):
    """
    Overrides default JWT login to set access and refresh tokens in HttpOnly cookies
    """
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        data = response.data
        refresh = data.get("refresh")
        access = data.get("access")

        res = Response({"detail": "Login successful"})

        # Set access token as HttpOnly cookie
        res.set_cookie(
            key="access",
            value=access,
            httponly=True,
            secure=False,  # True in production with HTTPS
            samesite="Lax"
        )

        # Set refresh token as HttpOnly cookie
        res.set_cookie(
            key="refresh",
            value=refresh,
            httponly=True,
            secure=False,
            samesite="Lax"
        )

        return res
