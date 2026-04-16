from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Wishlist, WishlistItem
from products.models import Product
from .serializers import WishlistSerializer

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_wishlist(request):
    """
    Get the current user's wishlist with full product image URLs
    """
    wishlist, _ = Wishlist.objects.get_or_create(user=request.user)
    serializer = WishlistSerializer(wishlist, context={'request': request})  # ✅ Pass request context
    return Response(serializer.data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def add_to_wishlist(request):
    """
    Add a product to the user's wishlist
    """
    product_id = request.data.get("product_id")
    product = Product.objects.get(id=product_id)

    wishlist, _ = Wishlist.objects.get_or_create(user=request.user)
    item, created = WishlistItem.objects.get_or_create(wishlist=wishlist, product=product)

    serializer = WishlistSerializer(wishlist, context={'request': request})  # ✅ Pass request context
    return Response(serializer.data)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def remove_from_wishlist(request, item_id):
    """
    Remove a product from the user's wishlist
    """
    try:
        wishlist = Wishlist.objects.get(user=request.user)
        item = WishlistItem.objects.get(id=item_id, wishlist=wishlist)
        item.delete()
        serializer = WishlistSerializer(wishlist, context={'request': request})  # ✅ Return updated wishlist
        return Response(serializer.data, status=status.HTTP_200_OK)
    except WishlistItem.DoesNotExist:
        return Response({"error": "Item not found"}, status=status.HTTP_404_NOT_FOUND)
