# payments/hesabpay.py
import requests
from typing import Optional, List, Dict, Any


class HesabPayError(Exception):
    """Custom exception for HesabPay integration errors"""
    pass


def create_payment_session(
    *,
    api_key: str,
    base_url: str,
    items: List[Dict[str, Any]],
    email: Optional[str] = None,
    redirect_success_url: Optional[str] = None,
    redirect_failure_url: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Create a HesabPay payment session.

    Endpoint:
        POST {base_url}/api/v1/payment/create-session

    Headers:
        Authorization: API-KEY <your_api_key>
        Content-Type: application/json
        Accept: application/json
    """

    endpoint = f"{base_url}/api/v1/payment/create-session"

    headers = {
        "Authorization": f"API-KEY {api_key}",
        "Content-Type": "application/json",
        "Accept": "application/json",
    }

    payload: Dict[str, Any] = {
        "items": items
    }

    if email:
        payload["email"] = email

    if redirect_success_url:
        payload["redirect_success_url"] = redirect_success_url

    if redirect_failure_url:
        payload["redirect_failure_url"] = redirect_failure_url

    try:
        response = requests.post(
            endpoint,
            json=payload,
            headers=headers,
            timeout=30
        )
        response.raise_for_status()
        data = response.json()

    except requests.RequestException as e:
        raise HesabPayError(
            f"Request to HesabPay failed: {str(e)}"
        ) from e

    # ✅ SUCCESS CHECK (CORRECT LOGIC)
    # HesabPay does NOT always return `success=true`
    # A valid response MUST contain a checkout URL
    checkout_url = data.get("payment_url") or data.get("url")

    if not checkout_url:
        raise HesabPayError(
            f"HesabPay response missing checkout URL: {data}"
        )

    # Everything is OK
    return data
