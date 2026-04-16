from django.contrib import admin
from .models import CustomUser, Profile, Address, EmailVerificationToken
from django.contrib.auth.admin import UserAdmin

@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    model = CustomUser

    # Updated list_display
    list_display = ('username', 'email', 'get_phone', 'get_address', 'is_staff', 'is_active')
    search_fields = ('username', 'email', 'profile__phone')
    list_filter = ('is_staff', 'is_active', 'is_superuser')

    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('اطلاعات شخصی', {'fields': ('first_name', 'last_name', 'email', 'profile_pic')}),
        ('دسترسی‌ها', {'fields': ('is_staff', 'is_active', 'is_superuser', 'groups', 'user_permissions')}),
        ('تاریخ‌ها', {'fields': ('last_login', 'date_joined')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'password1', 'password2', 'is_staff', 'is_active')}
        ),
    )

    ordering = ('username',)

    # Helper methods to get phone and address from Profile/Address
    def get_phone(self, obj):
        return obj.profile.phone if hasattr(obj, 'profile') else '-'
    get_phone.short_description = 'Phone'

    def get_address(self, obj):
        if hasattr(obj, 'profile'):
            primary_address = obj.profile.addresses.filter(is_primary=True).first()
            if primary_address:
                return f"{primary_address.address_line}, {primary_address.city}"
        return '-'
    get_address.short_description = 'Address'


@admin.register(EmailVerificationToken)
class EmailVerificationTokenAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "created_at", "expires_at", "used_at")
    search_fields = ("user__username", "user__email", "token_hash")
    list_filter = ("used_at", "created_at", "expires_at")
