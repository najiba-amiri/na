from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings
from datetime import timedelta
import hashlib
import secrets


class CustomUser(AbstractUser):
    # Add any extra fields you want for your users
    is_seller = models.BooleanField(default=False)
    phone = models.CharField(max_length=20, blank=True, null=True)

    def __str__(self):
        return self.username


class Profile(models.Model):
    ROLE_CHOICES = [
        ('buyer', 'Buyer'),
        ('seller', 'Seller'),
        ('admin', 'Admin'),  # ← add admin role
    ]

    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='profile')
    first_name = models.CharField(max_length=100, blank=True, null=True)
    last_name = models.CharField(max_length=100, blank=True, null=True)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    profile_image = models.ImageField(upload_to='profile/', blank=True, null=True)
    social_links = models.JSONField(default=dict, blank=True)
    joined_date = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.user.username


class Address(models.Model):
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='addresses')
    address_line = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100, blank=True, null=True)
    country = models.CharField(max_length=100)
    zip_code = models.CharField(max_length=20, blank=True, null=True)
    is_primary = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.address_line}, {self.city}"


class EmailVerificationToken(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="email_verification_tokens",
    )
    token_hash = models.CharField(max_length=64, unique=True, db_index=True)
    expires_at = models.DateTimeField(db_index=True)
    used_at = models.DateTimeField(blank=True, null=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"EmailVerificationToken(user={self.user_id}, used={self.used_at is not None})"

    @staticmethod
    def hash_token(raw_token: str) -> str:
        return hashlib.sha256(raw_token.encode("utf-8")).hexdigest()

    @classmethod
    def issue_token(cls, user):
        raw_token = secrets.token_urlsafe(32)
        expiry_hours = int(getattr(settings, "EMAIL_VERIFICATION_TOKEN_EXPIRY_HOURS", 24))
        expires_at = timezone.now() + timedelta(hours=expiry_hours)

        instance = cls.objects.create(
            user=user,
            token_hash=cls.hash_token(raw_token),
            expires_at=expires_at,
        )
        return instance, raw_token

    def is_expired(self) -> bool:
        return self.expires_at <= timezone.now()

    def mark_used(self):
        self.used_at = timezone.now()
        self.save(update_fields=["used_at"])

@receiver(post_save, sender=CustomUser)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        # If superuser, role = "admin", otherwise leave blank
        role = "admin" if instance.is_superuser else None
        Profile.objects.create(user=instance, role=role)
