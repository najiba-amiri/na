from django.conf import settings
from django.db import models
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.utils.text import slugify

User = get_user_model()


# -----------------------------
# Category (parent/child support + slug auto-generation)
# -----------------------------
class Category(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(null=True, blank=True)

    parent = models.ForeignKey(
        "self",
        related_name="children",
        null=True,
        blank=True,
        on_delete=models.SET_NULL
    )

    slug = models.SlugField(max_length=120, unique=True, null=True, blank=True)

    class Meta:
        verbose_name_plural = "Categories"
        ordering = ["name"]

    def __str__(self):
        return self.name

    # ✅ Prevent circular reference
    def clean(self):
        if self.parent == self:
            raise ValidationError("A category cannot be its own parent.")

    # ✅ Auto-generate slug if missing, handle duplicates
    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.name)
            slug_candidate = base_slug
            num = 1
            while Category.objects.filter(slug=slug_candidate).exclude(id=self.id).exists():
                slug_candidate = f"{base_slug}-{num}"
                num += 1
            self.slug = slug_candidate
        super().save(*args, **kwargs)

    # ✅ Recursive function to get all descendant IDs
    def get_descendants_ids(self) -> list[int]:
        """Return a list of this category's ID + all descendant category IDs."""
        ids = [self.id]
        for child in self.children.all():
            ids.extend(child.get_descendants_ids())
        return ids


# -----------------------------
# Brand & Tag (with slug auto-generation)
# -----------------------------
class Brand(models.Model):
    name = models.CharField(max_length=150, unique=True)
    slug = models.SlugField(max_length=160, unique=True, null=True, blank=True)
    description = models.TextField(null=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.name)
            slug_candidate = base_slug
            num = 1
            while Brand.objects.filter(slug=slug_candidate).exclude(id=self.id).exists():
                slug_candidate = f"{base_slug}-{num}"
                num += 1
            self.slug = slug_candidate
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Tag(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True, null=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.name)
            slug_candidate = base_slug
            num = 1
            while Tag.objects.filter(slug=slug_candidate).exclude(id=self.id).exists():
                slug_candidate = f"{base_slug}-{num}"
                num += 1
            self.slug = slug_candidate
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


# -----------------------------
# Product (core model)
# -----------------------------
class Product(models.Model):
    category = models.ForeignKey(
        Category,
        related_name="products",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    owner = models.ForeignKey(User, related_name="products", on_delete=models.CASCADE)

    name = models.CharField(max_length=255)
    description = models.TextField()
    name_i18n = models.JSONField(default=dict, blank=True)
    description_i18n = models.JSONField(default=dict, blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.PositiveIntegerField()
    image = models.ImageField(upload_to="products/", null=True, blank=True)
    color = models.CharField(max_length=50, null=True, blank=True)
    size = models.CharField(max_length=50, null=True, blank=True)
    badge = models.CharField(max_length=50, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # -------------------------
    # Extended Fields
    # -------------------------
    GENDER_CHOICES = [
        ("male", "Male"),
        ("female", "Female"),
        ("kids", "Kids"),
        ("all", "All"),
    ]
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, null=True, blank=True)

    brand = models.ForeignKey(
        Brand, null=True, blank=True, related_name="products", on_delete=models.SET_NULL
    )
    tags = models.ManyToManyField(Tag, blank=True, related_name="products")

    wholesale_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    min_order_qty = models.PositiveIntegerField(default=1, null=True, blank=True)

    UNIT_CHOICES = [
        ("piece", "Piece"),
        ("pack", "Pack"),
        ("pair", "Pair"),
        ("meter", "Meter"),
        ("kg", "Kilogram"),
        ("liter", "Liter"),
        ("other", "Other"),
    ]
    unit = models.CharField(max_length=20, choices=UNIT_CHOICES, null=True, blank=True)

    STATUS_CHOICES = [
        ("draft", "Draft"),
        ("inactive", "Inactive"),
        ("active", "Active"),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="active")
    featured = models.BooleanField(default=False)
    custom_fields = models.JSONField(default=dict, blank=True)

    def __str__(self):
        return self.name


# -----------------------------
# Product Attributes (optional)
# -----------------------------
class ProductAttribute(models.Model):
    product = models.ForeignKey(Product, related_name="attributes", on_delete=models.CASCADE)
    name = models.CharField(max_length=120, db_index=True)
    value = models.CharField(max_length=255, null=True, blank=True)
    attribute_type = models.CharField(max_length=100, null=True, blank=True)

    class Meta:
        indexes = [
            models.Index(fields=["name", "value"]),
        ]

    def __str__(self):
        return f"{self.product.name} — {self.name}: {self.value}"


# -----------------------------
# Product Images (main + gallery)
# -----------------------------
class ProductImage(models.Model):
    product = models.ForeignKey(Product, related_name="images", on_delete=models.CASCADE)
    image = models.ImageField(upload_to="products/images/")
    alt_text = models.CharField(max_length=255, null=True, blank=True)
    is_main = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"Image for {self.product.name} (main={self.is_main})"


# -----------------------------
# Favorites & Orders
# -----------------------------
class FavoriteProduct(models.Model):
    user = models.ForeignKey(User, related_name="favorites", on_delete=models.CASCADE)
    product = models.ForeignKey(Product, related_name="favorited_by", on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "product")
        verbose_name = "Favorite Product"
        verbose_name_plural = "Favorite Products"

    def __str__(self):
        return f"{self.user.username} ❤️ {self.product.name}"


class Order(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("processing", "Processing"),
        ("completed", "Completed"),
        ("cancelled", "Cancelled"),
    ]
    user = models.ForeignKey(User, related_name="orders", on_delete=models.CASCADE)
    total_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Order #{self.id} - {self.user.username}"

    def calculate_total(self):
        total = sum(item.subtotal() for item in self.items.all())
        self.total_price = total
        self.save()
        return total


class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name="items", on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.product.name} × {self.quantity}"

    def subtotal(self):
        return (self.price or 0) * (self.quantity or 0)
