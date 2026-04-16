from rest_framework import serializers
from .models import Brand

class BrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brand
        fields = ["id", "name", "user"]
        read_only_fields = ["id", "user"]

    def create(self, validated_data):
        request = self.context["request"]
        validated_data["user"] = request.user
        return super().create(validated_data)
