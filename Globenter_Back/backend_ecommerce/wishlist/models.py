from django.db import models
from django.contrib.auth import get_user_model
from products.models import Product

User = get_user_model()  # ensures compatibility with CustomUser

class Wishlist(models.Model):
    user = models.OneToOneField(User, related_name="wishlist", on_delete=models.CASCADE)
    updated_at = models.DateTimeField(auto_now=True)

    def total_items(self):
        return self.items.count()

    def __str__(self):
        return f"Wishlist ({self.user.username})"


class WishlistItem(models.Model):
    wishlist = models.ForeignKey(Wishlist, related_name="items", on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("wishlist", "product")

    def __str__(self):
        return f"{self.product.name} in {self.wishlist.user.username}'s wishlist"
