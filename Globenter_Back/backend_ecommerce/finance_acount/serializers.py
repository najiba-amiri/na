from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Wallet, Transaction, PayoutRequest, Order, FinancialAlert, InboundPayment

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email"]


class WalletSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Wallet
        fields = "__all__"
        read_only_fields = ["user"]


class TransactionSerializer(serializers.ModelSerializer):
    wallet_user = serializers.SerializerMethodField()

    class Meta:
        model = Transaction
        fields = "__all__"
        read_only_fields = ["status", "created_at", "updated_at"]

    def get_wallet_user(self, obj):
        u = getattr(obj.wallet, "user", None)
        if not u:
            return None
        return {"id": u.id, "username": getattr(u, "username", ""), "email": getattr(u, "email", "")}



class PayoutRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = PayoutRequest
        fields = "__all__"
        read_only_fields = ["wallet", "status", "created_at", "updated_at"]



class OrderSerializer(serializers.ModelSerializer):
    buyer = UserSerializer(read_only=True)

    class Meta:
        model = Order
        fields = "__all__"
        read_only_fields = ["buyer", "created_at"]


class FinancialAlertSerializer(serializers.ModelSerializer):
    class Meta:
        model = FinancialAlert
        fields = "__all__"


# ✅ STEP 3: InboundPayment serializer (Admin feature)
class InboundPaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = InboundPayment
        fields = "__all__"
        read_only_fields = ["status", "created_at", "updated_at", "created_by"]


class AdminWalletTopUpSerializer(serializers.Serializer):
    # allow admin to identify user by id OR email
    user_id = serializers.IntegerField(required=False)
    email = serializers.EmailField(required=False)

    amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    note = serializers.CharField(required=False, allow_blank=True)

    def validate(self, attrs):
        if not attrs.get("user_id") and not attrs.get("email"):
            raise serializers.ValidationError("Provide either user_id or email.")

        if attrs["amount"] <= 0:
            raise serializers.ValidationError("Amount must be greater than 0.")

        return attrs
