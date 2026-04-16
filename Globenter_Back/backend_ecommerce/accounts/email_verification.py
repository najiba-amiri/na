from urllib.parse import urlencode

from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string


def build_verification_url(raw_token: str, locale: str | None = None) -> str:
    frontend_url = getattr(settings, "FRONTEND_URL", "http://localhost:3000").rstrip("/")
    if locale:
        path = f"/{locale}/auth/verify-email"
    else:
        path = "/auth/verify-email"

    query = urlencode({"token": raw_token})
    return f"{frontend_url}{path}?{query}"


def send_verification_email(user, raw_token: str, locale: str | None = None):
    verification_url = build_verification_url(raw_token=raw_token, locale=locale)
    expiry_hours = int(getattr(settings, "EMAIL_VERIFICATION_TOKEN_EXPIRY_HOURS", 24))

    context = {
        "user": user,
        "verification_url": verification_url,
        "expiry_hours": expiry_hours,
    }
    subject = render_to_string("emails/verify_email_subject.txt", context).strip()
    text_body = render_to_string("emails/verify_email.txt", context)
    html_body = render_to_string("emails/verify_email.html", context)

    email = EmailMultiAlternatives(
        subject=subject,
        body=text_body,
        from_email=getattr(settings, "DEFAULT_FROM_EMAIL", None),
        to=[user.email],
    )
    email.attach_alternative(html_body, "text/html")
    email.send()
