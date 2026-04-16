from urllib.parse import urlencode

from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string


def build_password_reset_url(uid: str, token: str) -> str:
    frontend_url = getattr(settings, "FRONTEND_URL", "http://localhost:3000").rstrip("/")
    path = "/auth/reset-password"
    query = urlencode({"uid": uid, "token": token})
    return f"{frontend_url}{path}?{query}"


def send_password_reset_email(user, uid: str, token: str):
    reset_url = build_password_reset_url(uid=uid, token=token)

    context = {
        "user": user,
        "reset_url": reset_url,
    }
    subject = render_to_string("emails/password_reset_subject.txt", context).strip()
    text_body = render_to_string("emails/password_reset.txt", context)
    html_body = render_to_string("emails/password_reset.html", context)

    email = EmailMultiAlternatives(
        subject=subject,
        body=text_body,
        from_email=getattr(settings, "DEFAULT_FROM_EMAIL", None),
        to=[user.email],
    )
    email.attach_alternative(html_body, "text/html")
    email.send()
