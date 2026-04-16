from rest_framework import serializers
from .models import Cart, CartItem
from products.serializers import ProductSerializer

class CartItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    subtotal = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = ["id", "product", "quantity", "subtotal"]

    def get_subtotal(self, obj):
        return obj.subtotal()

class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total_items = serializers.SerializerMethodField()
    total_price = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = ["id", "user", "items", "total_items", "total_price"]

    def get_total_items(self, obj):
        return obj.total_items()

    def get_total_price(self, obj):
        return obj.total_price()
