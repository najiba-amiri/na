from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    WalletViewSet,
    TransactionViewSet,
    PayoutRequestViewSet,
    OrderViewSet,
    FinancialAlertViewSet,
    InboundPaymentViewSet,
)

router = DefaultRouter()
router.register(r"wallets", WalletViewSet, basename="wallet")
router.register(r"transactions", TransactionViewSet, basename="transaction")
router.register(r"payout-requests", PayoutRequestViewSet, basename="payout")
router.register(r"orders", OrderViewSet, basename="order")
router.register(r"alerts", FinancialAlertViewSet, basename="alert")

# ✅ STEP 4: inbound payments (Admin)
router.register(r"inbound-payments", InboundPaymentViewSet, basename="inbound-payment")

urlpatterns = [
    path("api/", include(router.urls)),
]
