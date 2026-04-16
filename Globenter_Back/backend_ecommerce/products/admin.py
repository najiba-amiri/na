from django.contrib import admin
from .models import Category, Product, Brand, Tag


# -----------------------------
# CATEGORY ADMIN
# -----------------------------
@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "parent", "slug")
    search_fields = ("name", "description")
    list_filter = ("parent",)
    prepopulated_fields = {"slug": ("name",)}  # ✅ Auto-fill slug
    ordering = ("name",)
    list_select_related = ("parent",)

    # ✅ Show hierarchy for child categories
    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.select_related("parent")

    def parent_name(self, obj):
        return obj.parent.name if obj.parent else "—"
    parent_name.short_description = "Parent Category"


# -----------------------------
# PRODUCT ADMIN
# -----------------------------
@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("name", "price", "category", "brand", "status", "stock", "featured")
    search_fields = ("name", "description", "category__name", "brand__name")
    list_filter = ("category", "brand", "status", "featured", "gender")
    list_select_related = ("category", "brand")
    autocomplete_fields = ("category", "brand", "tags")
    ordering = ("-created_at",)
    readonly_fields = ("created_at", "updated_at")

    fieldsets = (
        ("Basic Info", {
            "fields": (
                "name", "name_i18n", "description", "description_i18n", "price", "stock", "image",
                "category", "brand", "tags", "status", "featured"
            )
        }),
        ("Extra Details", {
            "fields": (
                "color", "size", "badge", "gender", "unit",
                "wholesale_price", "min_order_qty", "custom_fields"
            )
        }),
        ("Timestamps", {
            "fields": ("created_at", "updated_at"),
        }),
    )


# -----------------------------
# BRAND & TAG ADMIN (optional but nice)
# -----------------------------
@admin.register(Brand)
class BrandAdmin(admin.ModelAdmin):
    list_display = ("name", "slug")
    search_fields = ("name",)
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ("name", "slug")
    search_fields = ("name",)
    prepopulated_fields = {"slug": ("name",)}
