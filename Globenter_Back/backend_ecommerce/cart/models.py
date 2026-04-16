from django.db import models
from django.contrib.auth import get_user_model
from products.models import Product

User = get_user_model()  # ensures compatibility with CustomUser

class Cart(models.Model):
    user = models.OneToOneField(User, related_name="cart", on_delete=models.CASCADE)
    updated_at = models.DateTimeField(auto_now=True)

    def total_items(self):
        return sum(item.quantity for item in self.items.all())

    def total_price(self):
        return sum(item.subtotal() for item in self.items.all())

    def __str__(self):
        return f"Cart ({self.user.username})"


class CartItem(models.Model):
    cart = models.ForeignKey(Cart, related_name="items", on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)

    def subtotal(self):
        # Ensure product has a price before calculating
        return (self.product.price or 0) * self.quantity

    class Meta:
        unique_together = ("cart", "product")

    def __str__(self):
        return f"{self.product.name} × {self.quantity}"
