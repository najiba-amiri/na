from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.db import transaction
from .models import Profile, Address

# ✅ Always use get_user_model() for custom user compatibility
User = get_user_model()


class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = [
            "id",
            "address_line",
            "city",
            "state",
            "country",
            "zip_code",
            "is_primary",
        ]


class AdminUserListSerializer(serializers.ModelSerializer):
    role = serializers.CharField(source="profile.role", read_only=True)

    class Meta:
        model = User
        fields = ["id", "username", "email", "is_active", "is_staff", "is_superuser", "role"]


class UserCreateNestedSerializer(serializers.ModelSerializer):
    """Minimal nested serializer for creating a User when admin creates a Profile."""
    password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ("username", "email", "password")


class ProfileSerializer(serializers.ModelSerializer):
    addresses = AddressSerializer(many=True, required=False)
    username = serializers.CharField(source="user.username", read_only=True)
    profile_image_url = serializers.SerializerMethodField(read_only=True)

    # ✅ Admin helpers:
    user_id = serializers.PrimaryKeyRelatedField(
        source="user",
        queryset=User.objects.all(),
        write_only=True,
        required=False
    )
    user = UserCreateNestedSerializer(write_only=True, required=False)

    class Meta:
        model = Profile
        fields = [
            "id",
            "username",
            "user_id",  # optional: link existing user
            "user",  # optional: nested user creation
            "first_name",
            "last_name",
            "role",
            "phone",
            "profile_image",
            "profile_image_url",
            "social_links",
            "joined_date",
            "addresses",
        ]
        read_only_fields = ["joined_date", "username"]

    def get_profile_image_url(self, obj):
        """Return absolute URL for profile image."""
        if not obj.profile_image:
            return None
        request = self.context.get("request")
        if request:
            return request.build_absolute_uri(obj.profile_image.url)
        return obj.profile_image.url

    def create(self, validated_data):
        """Support nested user + addresses creation."""
        addresses_data = validated_data.pop("addresses", None)
        user_data = validated_data.pop("user", None)

        # --- Nested user creation ---
        if user_data:
            username = user_data.get("username")
            email = user_data.get("email", "")
            password = user_data.get("password")
            user = User.objects.create(username=username, email=email)
            user.set_password(password)
            user.save()
            validated_data["user"] = user

        # --- Create Profile ---
        profile = Profile.objects.create(**validated_data)

        # --- Create nested addresses ---
        if addresses_data:
            for addr in addresses_data:
                Address.objects.create(profile=profile, **addr)

        return profile

    def update(self, instance, validated_data):
        """Update profile info and nested addresses in one request."""
        addresses_data = validated_data.pop("addresses", None)
        social_links_data = validated_data.pop("social_links", None)
        user_data = validated_data.pop("user", None)

        # --- Handle nested user creation (rare) ---
        if user_data:
            username = user_data.get("username")
            email = user_data.get("email", "")
            password = user_data.get("password")
            new_user = User.objects.create(username=username, email=email)
            new_user.set_password(password)
            new_user.save()
            instance.user = new_user

        # --- If linked user_id was passed ---
        if "user" in validated_data:
            instance.user = validated_data.pop("user")

        # --- Update simple fields ---
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        # --- Merge social links ---
        if social_links_data is not None:
            current_links = instance.social_links or {}
            current_links.update(social_links_data)
            instance.social_links = current_links

        instance.save()

        # --- Handle nested address updates ---
        if addresses_data is not None:
            existing_ids = [addr.get("id") for addr in addresses_data if addr.get("id")]
            instance.addresses.exclude(id__in=existing_ids).delete()

            for addr_data in addresses_data:
                addr_id = addr_data.get("id")
                if addr_id:
                    try:
                        address = Address.objects.get(id=addr_id, profile=instance)
                    except Address.DoesNotExist:
                        continue
                    for key, value in addr_data.items():
                        setattr(address, key, value)
                    address.save()
                else:
                    Address.objects.create(profile=instance, **addr_data)

        return instance


class ProfileAddressSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False)

    class Meta:
        model = Address
        fields = [
            "id",
            "address_line",
            "city",
            "state",
            "country",
            "zip_code",
            "is_primary",
        ]


class ProfileDetailsSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(source="user.id", read_only=True)
    username = serializers.CharField(source="user.username", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)
    full_name = serializers.SerializerMethodField(read_only=True)
    profile_image_url = serializers.SerializerMethodField(read_only=True)
    addresses = ProfileAddressSerializer(many=True, required=False)

    class Meta:
        model = Profile
        fields = [
            "user_id",
            "username",
            "email",
            "first_name",
            "last_name",
            "full_name",
            "role",
            "phone",
            "profile_image",
            "profile_image_url",
            "social_links",
            "joined_date",
            "addresses",
        ]
        read_only_fields = ["user_id", "username", "email", "joined_date"]

    def get_full_name(self, obj):
        return f"{obj.first_name or ''} {obj.last_name or ''}".strip()

    def get_profile_image_url(self, obj):
        if not obj.profile_image:
            return None
        request = self.context.get("request")
        if request:
            return request.build_absolute_uri(obj.profile_image.url)
        return obj.profile_image.url

    def validate_social_links(self, value):
        if value is None:
            return {}
        if not isinstance(value, dict):
            raise serializers.ValidationError("social_links must be a JSON object.")
        return value

    def validate_addresses(self, value):
        primary_count = sum(1 for item in value if item.get("is_primary"))
        if primary_count > 1:
            raise serializers.ValidationError("Only one address can be primary.")
        return value

    @transaction.atomic
    def update(self, instance, validated_data):
        addresses_data = validated_data.pop("addresses", None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if addresses_data is not None:
            existing_by_id = {addr.id: addr for addr in instance.addresses.all()}
            keep_ids = set()

            for address_payload in addresses_data:
                address_id = address_payload.get("id")
                if address_id and address_id in existing_by_id:
                    address = existing_by_id[address_id]
                    for key, value in address_payload.items():
                        if key != "id":
                            setattr(address, key, value)
                    address.save()
                    keep_ids.add(address.id)
                else:
                    created = Address.objects.create(
                        profile=instance,
                        **{k: v for k, v in address_payload.items() if k != "id"},
                    )
                    keep_ids.add(created.id)

            instance.addresses.exclude(id__in=keep_ids).delete()

            current_addresses = list(instance.addresses.all().order_by("id"))
            primary_addresses = [addr for addr in current_addresses if addr.is_primary]
            if len(primary_addresses) > 1:
                keep_primary_id = primary_addresses[-1].id
                instance.addresses.exclude(id=keep_primary_id).update(is_primary=False)

        return instance
