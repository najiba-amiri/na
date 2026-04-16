from rest_framework.permissions import BasePermission, SAFE_METHODS

class ReadOnlyOrAuthenticated(BasePermission):
    """
    اجازه دسترسی آزاد برای متدهای فقط خواندنی (GET, HEAD, OPTIONS)
    و نیاز به احراز هویت برای بقیه متدها (POST, PUT, DELETE)
    """
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return request.user and request.user.is_authenticated
