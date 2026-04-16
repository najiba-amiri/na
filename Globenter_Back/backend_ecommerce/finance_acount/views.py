from decimal import Decimal

from django.db import transaction as db_transaction
from django.contrib.auth import get_user_model
from django.db import models
from django.utils.dateparse import parse_date

from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response

from .models import Wallet, Transaction, PayoutRequest, Order, FinancialAlert, InboundPayment
from .serializers import (
    WalletSerializer,
    TransactionSerializer,
    PayoutRequestSerializer,
    OrderSerializer,
    FinancialAlertSerializer,
    AdminWalletTopUpSerializer,
    InboundPaymentSerializer,
)

User = get_user_model()


# ============================================================
# Wallet
# ============================================================
class WalletViewSet(viewsets.ModelViewSet):
    serializer_class = WalletSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        Wallet.objects.get_or_create(user=self.request.user)
        return Wallet.objects.filter(user=self.request.user)

    # ✅ Admin Top-up
    @action(
        detail=False,
        methods=["post"],
        url_path="admin/topup",
        permission_classes=[permissions.IsAdminUser],
    )
    def admin_topup(self, request):
        """
        POST /finance/api/wallets/admin/topup/
        Body: { user_id?: number, email?: string, amount: number, note?: string }
        """
        ser = AdminWalletTopUpSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        data = ser.validated_data

        if data.get("user_id"):
            user = User.objects.filter(id=data["user_id"]).first()
        else:
            user = User.objects.filter(email__iexact=data["email"]).first()

        if not user:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        amount: Decimal = data["amount"]
        note: str = data.get("note") or "Admin top-up"

        with db_transaction.atomic():
            wallet, _ = Wallet.objects.get_or_create(user=user)

            wallet.balance_total = (wallet.balance_total or Decimal("0")) + amount
            wallet.balance_available = (wallet.balance_available or Decimal("0")) + amount
            wallet.save(update_fields=["balance_total", "balance_available"])

            tx = Transaction.objects.create(
                wallet=wallet,
                amount=amount,
                type="in",
                category="adjustment",
                payment_method="internal",
                status="approved",
                admin_note=note,
            )

            FinancialAlert.objects.create(
                alert_type="pending_payment",
                message=f"Admin top-up: {amount} to user {user.id}",
                is_read=False,
            )

        return Response(
            {
                "wallet": WalletSerializer(wallet).data,
                "transaction": TransactionSerializer(tx).data,
            },
            status=status.HTTP_200_OK,
        )


# ============================================================
# Transactions (User sees own, Admin sees all with filters)
# ============================================================
class TransactionViewSet(viewsets.ModelViewSet):
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = Transaction.objects.all().select_related("wallet__user", "related_order")

        # ✅ Non-admin: only own wallet
        if not self.request.user.is_staff:
            return qs.filter(wallet__user=self.request.user).order_by("-created_at")

        # ✅ Admin: can see all + filters
        params = self.request.query_params

        status_q = params.get("status")
        type_q = params.get("type")  # in/out
        category_q = params.get("category")
        method_q = params.get("payment_method")
        wallet_q = params.get("wallet")  # wallet id
        date_from = params.get("from")   # YYYY-MM-DD
        date_to = params.get("to")       # YYYY-MM-DD

        if status_q:
            qs = qs.filter(status=status_q)
        if type_q:
            qs = qs.filter(type=type_q)
        if category_q:
            qs = qs.filter(category=category_q)
        if method_q:
            qs = qs.filter(payment_method=method_q)
        if wallet_q:
            qs = qs.filter(wallet_id=wallet_q)

        if date_from:
            d = parse_date(date_from)
            if d:
                qs = qs.filter(created_at__date__gte=d)

        if date_to:
            d = parse_date(date_to)
            if d:
                qs = qs.filter(created_at__date__lte=d)

        return qs.order_by("-created_at")


# ============================================================
# Payout Requests
# ============================================================
class PayoutRequestViewSet(viewsets.ModelViewSet):
    serializer_class = PayoutRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # user sees own, admin sees all
        if self.request.user.is_staff:
            return PayoutRequest.objects.all().select_related("wallet__user")
        return PayoutRequest.objects.filter(wallet__user=self.request.user)

    def perform_create(self, serializer):
        """
        ✅ Security:
        - user cannot choose wallet
        - wallet always current user's wallet
        - validate available balance
        """
        wallet, _ = Wallet.objects.get_or_create(user=self.request.user)

        amount = Decimal(str(serializer.validated_data.get("amount")))
        if amount <= 0:
            raise ValidationError({"amount": "Amount must be greater than 0."})

        if (wallet.balance_available or Decimal("0")) < amount:
            raise ValidationError({"amount": "Insufficient available balance."})

        serializer.save(wallet=wallet, status="pending")

        FinancialAlert.objects.create(
            alert_type="payout_request",
            message=f"New payout request pending. User: {self.request.user.id} Amount: {amount}",
            is_read=False,
        )

    # ✅ Immutable after paid
    def update(self, request, *args, **kwargs):
        pr = self.get_object()
        if pr.status == "paid":
            raise ValidationError({"detail": "This payout request is paid and cannot be edited."})
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        pr = self.get_object()
        if pr.status == "paid":
            raise ValidationError({"detail": "This payout request is paid and cannot be edited."})
        return super().partial_update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        pr = self.get_object()
        if pr.status == "paid":
            raise ValidationError({"detail": "This payout request is paid and cannot be deleted."})
        return super().destroy(request, *args, **kwargs)

    # ✅ Admin approve
    @action(detail=True, methods=["post"], url_path="approve", permission_classes=[permissions.IsAdminUser])
    def approve(self, request, pk=None):
        pr = self.get_object()

        if pr.status != "pending":
            return Response({"detail": "Only pending requests can be approved."}, status=400)

        pr.status = "approved"
        pr.save(update_fields=["status"])

        return Response(PayoutRequestSerializer(pr).data, status=200)

    # ✅ Admin reject
    @action(detail=True, methods=["post"], url_path="reject", permission_classes=[permissions.IsAdminUser])
    def reject(self, request, pk=None):
        pr = self.get_object()

        if pr.status != "pending":
            return Response({"detail": "Only pending requests can be rejected."}, status=400)

        note = request.data.get("note", "")
        pr.status = "rejected"
        pr.save(update_fields=["status"])

        return Response(
            {"detail": "Payout request rejected.", "id": pr.id, "status": pr.status, "note": note},
            status=200,
        )

    # ✅ Admin mark-paid + wallet math + transaction
    @action(detail=True, methods=["post"], url_path="mark-paid", permission_classes=[permissions.IsAdminUser])
    def mark_paid(self, request, pk=None):
        pr = self.get_object()

        if pr.status != "approved":
            return Response({"detail": "Only approved requests can be marked as paid."}, status=400)

        wallet = pr.wallet
        amount = Decimal(str(pr.amount))

        with db_transaction.atomic():
            if (wallet.balance_available or Decimal("0")) < amount:
                return Response({"detail": "Insufficient available balance in wallet."}, status=400)

            wallet.balance_available = (wallet.balance_available or Decimal("0")) - amount
            wallet.balance_total = (wallet.balance_total or Decimal("0")) - amount
            wallet.save(update_fields=["balance_available", "balance_total"])

            pr.status = "paid"
            pr.save(update_fields=["status"])

            tx = Transaction.objects.create(
                wallet=wallet,
                amount=amount,
                type="out",
                category="payout",
                payment_method=pr.payment_method,
                status="paid",
                related_order=None,
                admin_note=f"Payout paid (PayoutRequest #{pr.id})",
            )

        return Response(
            {
                "payout_request": PayoutRequestSerializer(pr).data,
                "wallet": WalletSerializer(wallet).data,
                "transaction": TransactionSerializer(tx).data,
            },
            status=200,
        )


# ============================================================
# Orders (Admin release escrow funds)
# ============================================================
class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff:
            return Order.objects.all().select_related("buyer")
        return Order.objects.filter(buyer=self.request.user)

    @action(detail=True, methods=["post"], url_path="release-funds", permission_classes=[permissions.IsAdminUser])
    def release_funds(self, request, pk=None):
        order = self.get_object()

        if order.payment_status != "paid":
            raise ValidationError({"detail": "Order is not paid yet."})

        if order.fund_release_status != "locked":
            raise ValidationError({"detail": "Funds already released or not lockable."})

        wallet, _ = Wallet.objects.get_or_create(user=order.buyer)
        amount = Decimal(str(order.seller_share or order.total_amount))

        with db_transaction.atomic():
            if (wallet.balance_escrow or Decimal("0")) < amount:
                raise ValidationError({"detail": "Insufficient escrow balance in wallet."})

            wallet.balance_escrow = (wallet.balance_escrow or Decimal("0")) - amount
            wallet.balance_available = (wallet.balance_available or Decimal("0")) + amount
            wallet.save(update_fields=["balance_escrow", "balance_available"])

            order.fund_release_status = "released"
            order.save(update_fields=["fund_release_status"])

            tx = Transaction.objects.create(
                wallet=wallet,
                amount=amount,
                type="in",
                category="adjustment",
                payment_method="internal",
                status="approved",
                related_order=order,
                admin_note=f"Escrow released for Order #{order.order_number}",
            )

        return Response(
            {
                "order": OrderSerializer(order).data,
                "wallet": WalletSerializer(wallet).data,
                "transaction": TransactionSerializer(tx).data,
            },
            status=200,
        )


# ============================================================
# Inbound Payments (Admin)
# ============================================================
class InboundPaymentViewSet(viewsets.ModelViewSet):
    queryset = InboundPayment.objects.all().select_related("order", "user")
    serializer_class = InboundPaymentSerializer
    permission_classes = [permissions.IsAdminUser]

    def perform_create(self, serializer):
        inbound = serializer.save(created_by=self.request.user)

        FinancialAlert.objects.create(
            alert_type="pending_payment",
            message=f"New inbound payment pending approval. Order: {inbound.order.order_number} | Amount: {inbound.amount}",
            is_read=False,
        )

    @action(detail=True, methods=["post"], url_path="approve")
    def approve(self, request, pk=None):
        inbound = self.get_object()

        if inbound.status != "pending":
            return Response({"detail": "Only pending inbound payments can be approved."}, status=400)

        with db_transaction.atomic():
            inbound.status = "approved"
            inbound.save(update_fields=["status"])

            wallet, _ = Wallet.objects.get_or_create(user=inbound.user)
            amount = Decimal(str(inbound.amount))

            wallet.balance_total = (wallet.balance_total or Decimal("0")) + amount
            wallet.balance_escrow = (wallet.balance_escrow or Decimal("0")) + amount
            wallet.save(update_fields=["balance_total", "balance_escrow"])

            order = inbound.order
            order.paid_amount = amount
            order.payment_status = "paid"
            order.fund_release_status = "locked"
            order.save(update_fields=["paid_amount", "payment_status", "fund_release_status"])

            tx = Transaction.objects.create(
                wallet=wallet,
                amount=amount,
                type="in",
                category="order_payment",
                payment_method=inbound.payment_method,
                status="approved",
                related_order=order,
                admin_note=f"Inbound payment approved (#{inbound.id})",
            )

        return Response(
            {
                "inbound_payment": InboundPaymentSerializer(inbound).data,
                "wallet": WalletSerializer(wallet).data,
                "transaction": TransactionSerializer(tx).data,
                "order": OrderSerializer(order).data,
            },
            status=200,
        )

    @action(detail=True, methods=["post"], url_path="reject")
    def reject(self, request, pk=None):
        inbound = self.get_object()

        if inbound.status != "pending":
            return Response({"detail": "Only pending inbound payments can be rejected."}, status=400)

        inbound.status = "rejected"
        inbound.admin_note = request.data.get("note", "")
        inbound.save(update_fields=["status", "admin_note"])

        return Response(InboundPaymentSerializer(inbound).data, status=200)


# ============================================================
# Alerts (Admin) + Dashboard KPIs
# ============================================================
class FinancialAlertViewSet(viewsets.ModelViewSet):
    queryset = FinancialAlert.objects.all()
    serializer_class = FinancialAlertSerializer
    permission_classes = [permissions.IsAdminUser]

    @action(
        detail=False,
        methods=["get"],
        url_path="admin/dashboard",
        permission_classes=[permissions.IsAdminUser],
    )
    def dashboard(self, request):
        total_platform_income = (
            Order.objects.all().aggregate(total=models.Sum("commission"))["total"]
            or Decimal("0")
        )
        total_escrow_balance = (
            Wallet.objects.all().aggregate(total=models.Sum("balance_escrow"))["total"]
            or Decimal("0")
        )
        total_pending_inbound_payments = InboundPayment.objects.filter(status="pending").count()
        payout_requests_pending_count = PayoutRequest.objects.filter(status="pending").count()
        payout_requests_rejected_count = PayoutRequest.objects.filter(status="rejected").count()
        unread_alerts_count = FinancialAlert.objects.filter(is_read=False).count()

        return Response(
            {
                "total_platform_income": str(total_platform_income),
                "total_escrow_balance": str(total_escrow_balance),
                "total_pending_inbound_payments": total_pending_inbound_payments,
                "payout_requests_pending_count": payout_requests_pending_count,
                "payout_requests_rejected_count": payout_requests_rejected_count,
                "unread_alerts_count": unread_alerts_count,
            },
            status=200,
        )
