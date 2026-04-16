# payments/urls.py
from django.urls import path
from .views import (
    create_session_view,
    hesabpay_webhook,
)

urlpatterns = [
    # Create payment session
    path(
        "hesabpay/create-session/",
        create_session_view,
        name="hesabpay-create-session"
    ),

    # HesabPay webhook
    path(
        "hesabpay/webhook/",
        hesabpay_webhook,
        name="hesabpay-webhook"
    ),
]
