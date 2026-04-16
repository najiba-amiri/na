from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CategoryViewSet,
    ProductViewSet,
    ProductAdminViewSet,
    TagViewSet,
    BrandViewSet,
    toggle_favorite,
    create_order,
    seller_stats,
)

router = DefaultRouter()

# -------------------------------
# Public endpoints
# -------------------------------
# Category: now full CRUD but public read allowed
router.register(r'categories', CategoryViewSet, basename='category')

# Product: public read-only
router.register(r'products', ProductViewSet, basename='product')

# Tag: authenticated CRUD
router.register(r'tags', TagViewSet, basename='tag')

# Brand: authenticated CRUD
router.register(r'brands', BrandViewSet, basename='brand')

# Seller/Admin endpoints
router.register(r'seller/products', ProductAdminViewSet, basename='seller-product')

urlpatterns = [
    path('', include(router.urls)),

    # Favorites & Orders
    path('product/<int:product_id>/favorite/', toggle_favorite, name='toggle_favorite'),
    path('order/create/', create_order, name='create_order'),

    # Seller stats
    path('seller/stats/', seller_stats, name='seller-stats'),
]
