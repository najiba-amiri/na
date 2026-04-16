from rest_framework import serializers
from .models import Wishlist, WishlistItem
from products.serializers import ProductSerializer

class WishlistItemSerializer(serializers.ModelSerializer):
    # ✅ Pass context to ProductSerializer
    product = serializers.SerializerMethodField()

    class Meta:
        model = WishlistItem
        fields = ["id", "product", "added_at"]

    def get_product(self, obj):
        # Pass context so get_image() can build absolute URL
        serializer = ProductSerializer(obj.product, context=self.context)
        return serializer.data

class WishlistSerializer(serializers.ModelSerializer):
    items = WishlistItemSerializer(many=True, read_only=True)
    total_items = serializers.SerializerMethodField()

    class Meta:
        model = Wishlist
        fields = ["id", "user", "items", "total_items"]

    def get_total_items(self, obj):
        return obj.items.count()
