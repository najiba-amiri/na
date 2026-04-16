from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import NotFound
from rest_framework_simplejwt.authentication import JWTAuthentication

from .models import Brand
from .serializers import BrandSerializer


class BrandViewSet(ModelViewSet):
    serializer_class = BrandSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]  # ✅ FORCE JWT ONLY

    def get_queryset(self):
        # ✅ ONLY brands owned by the JWT user
        return Brand.objects.filter(user_id=self.request.user.id)

    def perform_create(self, serializer):
        # ✅ Always attach to JWT user
        serializer.save(user=self.request.user)

    def get_object(self):
        """
        Extra safety: even if someone guesses an ID, they can’t access other users' brands.
        """
        obj = super().get_object()
        if obj.user_id != self.request.user.id:
            raise NotFound("Brand not found.")
        return obj
