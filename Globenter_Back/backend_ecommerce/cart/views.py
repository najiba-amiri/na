from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Cart, CartItem
from products.models import Product
from .serializers import CartSerializer


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_cart(request):
    cart, _ = Cart.objects.get_or_create(user=request.user)
    serializer = CartSerializer(cart, context={"request": request})  # ✅ Add context
    return Response(serializer.data)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def add_to_cart(request):
    product_id = request.data.get("product_id")
    quantity = int(request.data.get("quantity", 1))
    product = Product.objects.get(id=product_id)

    cart, _ = Cart.objects.get_or_create(user=request.user)
    item, created = CartItem.objects.get_or_create(cart=cart, product=product)

    if not created:
        item.quantity += quantity
    else:
        item.quantity = quantity
    item.save()

    serializer = CartSerializer(cart, context={"request": request})
    return Response(serializer.data)



@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def update_cart_item(request):
    item_id = request.data.get("item_id")
    quantity = int(request.data.get("quantity", 1))
    item = CartItem.objects.get(id=item_id, cart__user=request.user)
    item.quantity = quantity
    item.save()

    # ✅ Return full updated cart with context
    cart = item.cart
    serializer = CartSerializer(cart, context={"request": request})
    return Response(serializer.data)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def remove_from_cart(request, item_id):
    try:
        item = CartItem.objects.get(id=item_id, cart__user=request.user)
        cart = item.cart
        item.delete()

        # ✅ Return updated cart after deletion with context
        serializer = CartSerializer(cart, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    except CartItem.DoesNotExist:
        return Response({"error": "Item not found"}, status=status.HTTP_404_NOT_FOUND)
