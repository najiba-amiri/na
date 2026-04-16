# Auth API Contract (Backend -> Frontend)

This document is the source of truth for auth integration.

## Base

- Base URL: `/api/auth`
- Production aliases are also available under `/auth` with the same payloads and responses.
- Auth scheme: `Bearer <access_token>` (also accepts `JWT <access_token>`)
- Token transport: JSON body (not HttpOnly cookies)
- Access token lifetime: `15 minutes`
- Refresh token lifetime: `7 days`
- Refresh behavior: rotation enabled, blacklist after rotation enabled

## Endpoints

### `POST /api/auth/register`

Create a user account and send verification email. Login remains blocked until verification.

Request:

```json
{
  "email": "user@example.com",
  "full_name": "User Name",
  "password": "StrongPass123!",
  "confirm_password": "StrongPass123!",
  "username": "optional_username"
}
```

Success (`201`):

```json
{
  "message": "verification_email_sent"
}
```

Error (`400`, email exists):

```json
{
  "code": "email_exists",
  "message": "An account with this email already exists. Please log in.",
  "field_errors": {
    "email": [
      "An account with this email already exists. Please log in."
    ]
  }
}
```

Validation error (`400`):

```json
{
  "code": "validation_error",
  "message": "Validation failed.",
  "field_errors": {
    "confirm_password": [
      "Passwords do not match."
    ]
  }
}
```

### `POST /api/auth/login`

Email + password login only.

Request:

```json
{
  "email": "user@example.com",
  "password": "StrongPass123!"
}
```

Success (`200`):

```json
{
  "access": "eyJ...",
  "refresh": "eyJ...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "user",
    "first_name": "",
    "last_name": "",
    "full_name": "",
    "role": "buyer",
    "profile_image": null,
    "is_active": true
  }
}
```

Invalid credentials (`400`):

```json
{
  "code": "invalid_credentials",
  "message": "Invalid email or password."
}
```

Unverified/inactive (`403`):

```json
{
  "code": "email_not_verified",
  "message": "Email verification is required before login."
}
```

### `POST /api/auth/refresh`

Request:

```json
{
  "refresh": "eyJ..."
}
```

Success (`200`):

```json
{
  "access": "eyJ...",
  "refresh": "eyJ..."
}
```

`refresh` may be omitted in response if rotation is disabled in future.

Invalid refresh (`401`):

```json
{
  "code": "invalid_refresh_token",
  "message": "Refresh token is invalid or expired."
}
```

### `POST /api/auth/logout`

Blacklists the supplied refresh token.

Request:

```json
{
  "refresh": "eyJ..."
}
```

Success (`200`):

```json
{
  "message": "logout_success"
}
```

Invalid refresh (`401`):

```json
{
  "code": "invalid_refresh_token",
  "message": "Refresh token is invalid or expired."
}
```

### `GET /api/auth/me`

Requires Authorization header.

Success (`200`):

```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "user",
    "first_name": "",
    "last_name": "",
    "full_name": "",
    "role": "buyer",
    "profile_image": null,
    "is_active": true
  }
}
```

No token (`401`):

```json
{
  "code": "not_authenticated",
  "message": "Authentication credentials were not provided."
}
```

### `POST /api/auth/forgot-password`

Request:

```json
{
  "email": "user@example.com"
}
```

Success (`200`):

```json
{
  "message": "password_reset_sent"
}
```

Behavior is intentionally generic for unknown emails.

### `POST /api/auth/reset-password`

Request:

```json
{
  "uid": "MQ",
  "token": "set-password-token",
  "password1": "NewStrongPass123!",
  "password2": "NewStrongPass123!"
}
```

Success (`200`):

```json
{
  "message": "password_reset_success"
}
```

Invalid token (`400`):

```json
{
  "code": "invalid_or_expired_reset_token",
  "message": "invalid_or_expired_reset_token"
}
```

## Shared Error Contract

Auth endpoints use this standard error shape:

```json
{
  "code": "validation_error",
  "message": "Validation failed.",
  "field_errors": {
    "email": ["Enter a valid email address."]
  }
}
```

- `code`: machine-readable string
- `message`: frontend-displayable summary
- `field_errors` (optional): field-specific issues

## Pre-Register Flow Contract

### `POST /api/auth/pre-register`

Input:

```json
{
  "full_name": "User Name",
  "email": "user@example.com"
}
```

`username` is optional and auto-generated from email if omitted.

Success (`200`):

```json
{
  "message": "verification_email_sent"
}
```
