from rest_framework import serializers
from .models import Category, Brand, Tag, Product, ProductImage, ProductAttribute
from django.conf import settings
from .i18n import build_i18n_payload, resolve_localized_text, resolve_request_locale


# ----------------------------------------------------
# 🔹 Utility: Clean empty values
# ----------------------------------------------------
def validate_non_empty(value, field_name="Field"):
    if not value.strip():
        raise serializers.ValidationError(f"{field_name} cannot be empty.")
    return value


# ----------------------------------------------------
# 🔹 Utility: Generate absolute image URL
# ----------------------------------------------------
def get_absolute_image_url(obj, context):
    if not obj or not obj.image:
        return None

    url = obj.image.url

    # Fix paths like /images/images/
    if url.startswith("/images/images/"):
        url = url.replace("/images/images/", "/images/")

    request = context.get("request")
    return request.build_absolute_uri(url) if request else url


# ----------------------------------------------------
# 🔹 Category Nested Serializer
# ----------------------------------------------------
class NestedCategorySerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField()
    parent_name = serializers.CharField(source="parent.name", read_only=True)
    slug = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ["id", "name", "description", "slug", "parent", "parent_name", "children"]

    def get_children(self, obj):
        children_qs = obj.children.all().order_by("name")
        return NestedCategorySerializer(children_qs, many=True, context=self.context).data

    def get_slug(self, obj):
        if obj.slug:
            return obj.slug
        from django.utils.text import slugify
        return slugify(obj.name)


# ----------------------------------------------------
# 🔹 Brand
# ----------------------------------------------------
class BrandSerializer(serializers.ModelSerializer):
    slug = serializers.CharField(read_only=True)

    class Meta:
        model = Brand
        fields = ["id", "name", "slug", "description"]

    def validate_name(self, value):
        return validate_non_empty(value, "Brand name")


# ----------------------------------------------------
# 🔹 Tag
# ----------------------------------------------------
class TagSerializer(serializers.ModelSerializer):
    slug = serializers.CharField(read_only=True)

    class Meta:
        model = Tag
        fields = ["id", "name", "slug"]

    def validate_name(self, value):
        return validate_non_empty(value, "Tag name")


# ----------------------------------------------------
# 🔹 Product Attribute
# ----------------------------------------------------
class ProductAttributeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductAttribute
        fields = ["id", "name", "value", "attribute_type"]


# ----------------------------------------------------
# 🔹 Product Image Serializer (ONLY image)
# ----------------------------------------------------
class ProductImageSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = ProductImage
        fields = ["id", "image", "alt_text", "is_main", "order"]

    def get_image(self, obj):
        return get_absolute_image_url(obj, self.context)


# ----------------------------------------------------
# 🔹 Product Serializer (Create / Update / Detail)
# ----------------------------------------------------
class ProductSerializer(serializers.ModelSerializer):
    owner_name = serializers.CharField(source="owner.username", read_only=True)
    category_name = serializers.CharField(source="category.name", read_only=True)
    category_slug = serializers.CharField(source="category.slug", read_only=True)
    brand_name = serializers.CharField(source="brand.name", read_only=True)
    brand_slug = serializers.CharField(source="brand.slug", read_only=True)

    # INPUT FIELDS
    tags = serializers.ListField(
        child=serializers.CharField(), required=False, allow_empty=True, write_only=True
    )
    attributes = ProductAttributeSerializer(many=True, required=False, write_only=True)

    image = serializers.ImageField(required=False)  # main image upload only
    images = serializers.ListField(
        child=serializers.ImageField(), required=False, write_only=True
    )

    custom_fields = serializers.JSONField(required=False)
    name_i18n = serializers.JSONField(required=False)
    description_i18n = serializers.JSONField(required=False)

    class Meta:
        model = Product
        fields = "__all__"
        read_only_fields = ["owner", "created_at", "updated_at"]

    # ------------------------
    # CREATE PRODUCT
    # ------------------------
    def create(self, validated_data):
        tags_data = validated_data.pop("tags", [])
        images_data = validated_data.pop("images", [])
        main_image = validated_data.pop("image", None)
        attributes_data = validated_data.pop("attributes", [])
        custom_fields = validated_data.pop("custom_fields", {})
        name_i18n_manual = validated_data.pop("name_i18n", None)
        description_i18n_manual = validated_data.pop("description_i18n", None)

        product = Product.objects.create(**validated_data)

        product.name_i18n = build_i18n_payload(
            base_text=product.name,
            existing={},
            manual_overrides=name_i18n_manual,
        )
        product.description_i18n = build_i18n_payload(
            base_text=product.description,
            existing={},
            manual_overrides=description_i18n_manual,
        )

        if main_image:
            product.image = main_image
        product.custom_fields = custom_fields
        product.save()

        # Tags
        if tags_data:
            tag_objs = [Tag.objects.get_or_create(name=t.strip())[0] for t in tags_data]
            product.tags.set(tag_objs)

        # Attributes
        for attr in attributes_data:
            ProductAttribute.objects.create(product=product, **attr)

        # Extra images
        for img_file in images_data:
            ProductImage.objects.create(product=product, image=img_file)

        return product

    # ------------------------
    # UPDATE PRODUCT
    # ------------------------
    def update(self, instance, validated_data):
        tags_data = validated_data.pop("tags", None)
        images_data = validated_data.pop("images", None)
        main_image = validated_data.pop("image", None)
        attributes_data = validated_data.pop("attributes", None)
        custom_fields = validated_data.pop("custom_fields", None)
        name_i18n_manual = validated_data.pop("name_i18n", None)
        description_i18n_manual = validated_data.pop("description_i18n", None)

        incoming_name = validated_data.get("name", instance.name)
        incoming_description = validated_data.get("description", instance.description)

        # Update fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        name_changed = "name" in validated_data
        description_changed = "description" in validated_data

        if name_changed or name_i18n_manual is not None:
            instance.name_i18n = build_i18n_payload(
                base_text=incoming_name,
                existing=instance.name_i18n,
                manual_overrides=name_i18n_manual,
            )
        if description_changed or description_i18n_manual is not None:
            instance.description_i18n = build_i18n_payload(
                base_text=incoming_description,
                existing=instance.description_i18n,
                manual_overrides=description_i18n_manual,
            )

        if main_image:
            instance.image = main_image
        if custom_fields is not None:
            instance.custom_fields = custom_fields

        instance.save()

        # Tags
        if tags_data is not None:
            tag_objs = [Tag.objects.get_or_create(name=t.strip())[0] for t in tags_data]
            instance.tags.set(tag_objs)

        # Attributes
        if attributes_data is not None:
            instance.attributes.all().delete()
            for attr in attributes_data:
                ProductAttribute.objects.create(product=instance, **attr)

        # Images
        if images_data is not None:
            instance.images.all().delete()
            for img_file in images_data:
                ProductImage.objects.create(product=instance, image=img_file)

        return instance

    # ------------------------
    # OUTPUT (Representation)
    # ------------------------
    def to_representation(self, instance):
        rep = super().to_representation(instance)
        request = self.context.get("request")
        locale = resolve_request_locale(request)

        rep["name"] = resolve_localized_text(instance.name, instance.name_i18n, locale)
        rep["description"] = resolve_localized_text(
            instance.description, instance.description_i18n, locale
        )

        # Main image always returns absolute URL
        rep["image"] = get_absolute_image_url(instance, self.context)

        # Child images
        rep["images"] = ProductImageSerializer(
            instance.images.all(), many=True, context=self.context
        ).data

        # Tags
        rep["tags"] = [t.name for t in instance.tags.all()]

        # Attributes
        rep["attributes"] = ProductAttributeSerializer(
            instance.attributes.all(), many=True
        ).data

        return rep



# ----------------------------------------------------
# 🔹 Product Summary Serializer (Used for listing)
# ----------------------------------------------------
class ProductSummarySerializer(serializers.ModelSerializer):
    owner_name = serializers.CharField(source="owner.username", read_only=True)
    category_name = serializers.CharField(source="category.name", read_only=True)
    brand_name = serializers.CharField(source="brand.name", read_only=True)
    tags = serializers.SlugRelatedField(many=True, read_only=True, slug_field="name")

    # SerializerMethodField to get full image URL
    image = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "name_i18n",
            "description",
            "description_i18n",
            "price",
            "stock",
            "unit",
            "status",
            "badge",
            "color",
            "size",
            "image",        # ✅ include image
            "owner_name",
            "category_name",
            "brand_name",
            "tags",
            "created_at",
            "updated_at",
        ]

    def get_image(self, obj):
        """
        Returns the absolute URL of the main product image.
        If no image exists, returns None.
        """
        request = self.context.get("request")
        if hasattr(obj, "image") and obj.image:
            return request.build_absolute_uri(obj.image.url)
        # fallback: first from related images (if you use a related images table)
        if hasattr(obj, "images") and obj.images.exists():
            return request.build_absolute_uri(obj.images.first().image.url)
        return None

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        request = self.context.get("request")
        locale = resolve_request_locale(request)
        rep["name"] = resolve_localized_text(instance.name, instance.name_i18n, locale)
        rep["description"] = resolve_localized_text(
            instance.description, instance.description_i18n, locale
        )
        return rep
