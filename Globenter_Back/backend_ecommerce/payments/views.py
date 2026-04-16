# payments/views.py
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status

import json

from .hesabpay import create_payment_session, HesabPayError


@api_view(["POST"])
def create_session_view(request):
    """
    Create HesabPay payment session

    POST /api/payments/hesabpay/create-session/

    Body example:
    {
      "items": [{"id":"item1","name":"Product","price":45}],
      "email":"customer@example.com"
    }
    """

    items = request.data.get("items")
    email = request.data.get("email")

    if not items or not isinstance(items, list):
        return Response(
            {"detail": "items (list) is required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    success_url = f"{settings.FRONTEND_URL}/payment/success"
    failure_url = f"{settings.FRONTEND_URL}/payment/fail"

    try:
        data = create_payment_session(
            api_key=settings.HESABPAY_API_KEY,     # ✅ unified env (sandbox/production)
            base_url=settings.HESABPAY_BASE_URL,
            items=items,
            email=email,
            redirect_success_url=success_url,
            redirect_failure_url=failure_url,
        )
    except HesabPayError as e:
        return Response(
            {"detail": str(e)},
            status=status.HTTP_502_BAD_GATEWAY
        )

    # HesabPay may return `payment_url` or `url`
    payment_url = data.get("payment_url") or data.get("url")

    return Response(
        {
            "session_id": data.get("session_id"),
            "payment_url": payment_url,
        },
        status=status.HTTP_200_OK
    )


# ------------------------------------------------------------------
# HESABPAY WEBHOOK
# ------------------------------------------------------------------
@api_view(["POST"])
@permission_classes([AllowAny])  # HesabPay has no auth
def hesabpay_webhook(request):
    """
    Webhook endpoint for HesabPay payment events

    POST /api/payments/hesabpay/webhook/
    """

    try:
        payload = request.data
    except Exception:
        payload = json.loads(request.body.decode("utf-8"))

    # 🔍 TEMP LOG (remove later)
    print("====== HESABPAY WEBHOOK RECEIVED ======")
    print(json.dumps(payload, indent=2))
    print("======================================")

    """
    Expected payload may include:
    - event
    - transaction_id
    - session_id
    - status (success / failed)
    - amount
    """

    # For now we only acknowledge receipt
    # DB update + verification comes next step

    return Response(
        {"received": True},
        status=status.HTTP_200_OK
    )
