from django.db.models import Q
from rest_framework import viewsets, status, filters
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from django.shortcuts import get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.contrib import messages

from .models import Category, Product, Brand, Tag, FavoriteProduct, Order, OrderItem
from .serializers import (
    NestedCategorySerializer,
    ProductSerializer,
    ProductSummarySerializer,
    BrandSerializer,
    TagSerializer,
)

# ---------------------------------------------------
# CATEGORY (Public Read + Authenticated CRUD)
# ---------------------------------------------------
class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = NestedCategorySerializer

    def get_queryset(self):
        """Return only top-level categories."""
        return (
            Category.objects.filter(parent__isnull=True)
            .prefetch_related("children")
            .order_by("name")
        )

    def get_serializer_context(self):
        return {"request": self.request}

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [AllowAny()]
        return [IsAuthenticated()]


# ---------------------------------------------------
# BRAND (Public Read + Authenticated CRUD)
# ---------------------------------------------------
class BrandViewSet(viewsets.ModelViewSet):
    queryset = Brand.objects.all().order_by("name")
    serializer_class = BrandSerializer

    def get_serializer_context(self):
        return {"request": self.request}

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [AllowAny()]
        return [IsAuthenticated()]


# ---------------------------------------------------
# TAG (Public Read + Authenticated CRUD)
# ---------------------------------------------------
class TagViewSet(viewsets.ModelViewSet):
    queryset = Tag.objects.all().order_by("name")
    serializer_class = TagSerializer

    def get_serializer_context(self):
        return {"request": self.request}

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [AllowAny()]
        return [IsAuthenticated()]


# ---------------------------------------------------
# PRODUCT (Public Read Only)
# ---------------------------------------------------
class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]
    parser_classes = [MultiPartParser, FormParser]

    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name", "description", "brand__name", "category__name", "tags__name"]
    ordering_fields = ["created_at", "price", "name"]

    def get_serializer_context(self):
        return {"request": self.request}

    def get_queryset(self):
        queryset = (
            Product.objects.select_related("category", "brand", "owner")
            .prefetch_related("tags", "images", "attributes")
            .all()
        )

        params = self.request.query_params
        category_slugs = params.get("category")
        brand = params.get("brand")
        tag = params.get("tag")
        status = params.get("status", "active")
        owner = params.get("owner")

        # -----------------------------
        # 🔹 Category Slug Filtering
        # -----------------------------
        if category_slugs:
            slugs = [s.strip() for s in category_slugs.split(",")]
            queryset = queryset.filter(category__slug__in=slugs)

        # -----------------------------
        # 🔹 Other Filters
        # -----------------------------
        if brand:
            queryset = queryset.filter(brand__slug__iexact=brand)

        if tag:
            queryset = queryset.filter(tags__slug__iexact=tag)

        if owner:
            queryset = queryset.filter(owner__username__iexact=owner)

        if status:
            queryset = queryset.filter(status=status)

        return queryset.order_by("-created_at")


# ---------------------------------------------------
# PRODUCT ADMIN (Seller/Admin CRUD)
# ---------------------------------------------------
class ProductAdminViewSet(viewsets.ModelViewSet):
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        user = self.request.user
        base = Product.objects.select_related("category", "brand", "owner").prefetch_related(
            "tags", "images", "attributes"
        )
        return base if user.is_staff else base.filter(owner=user)

    def get_serializer_context(self):
        return {"request": self.request}

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    def perform_update(self, serializer):
        serializer.save()


# ---------------------------------------------------
# FAVORITES (Private)
# ---------------------------------------------------
@login_required
def toggle_favorite(request, product_id):
    product = get_object_or_404(Product, id=product_id)
    favorite, created = FavoriteProduct.objects.get_or_create(
        user=request.user, product=product
    )

    if created:
        messages.success(request, "Added to your wishlist.")
    else:
        favorite.delete()
        messages.success(request, "Removed from your wishlist.")

    return redirect("product_detail", product_id=product.id)


# ---------------------------------------------------
# ORDER CREATION (Private)
# ---------------------------------------------------
@login_required
def create_order(request):
    cart = request.session.get("cart", [])
    if not cart:
        messages.warning(request, "Your cart is empty!")
        return redirect("cart_page")

    order = Order.objects.create(user=request.user)

    for item in cart:
        product = get_object_or_404(Product, id=item["id"])
        OrderItem.objects.create(
            order=order,
            product=product,
            quantity=item["quantity"],
            price=product.price,
        )

    order.calculate_total()
    request.session.pop("cart", None)
    messages.success(request, "Your order has been created successfully.")
    return redirect("order_detail", order.id)


# ---------------------------------------------------
# SELLER STATS API (Private)
# ---------------------------------------------------
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def seller_stats(request):
    user = request.user
    limit = request.query_params.get("limit")

    products = Product.objects.filter(owner=user).order_by("-created_at")
    product_count = products.count()

    if limit:
        try:
            products = products[: int(limit)]
        except ValueError:
            pass

    serializer = ProductSummarySerializer(
        products, many=True, context={"request": request}
    )

    return Response(
        {"product_count": product_count, "products": serializer.data},
        status=status.HTTP_200_OK,
    )
