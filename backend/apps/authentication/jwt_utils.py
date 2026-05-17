"""
Shared JWT claim helpers for EduTask access tokens.
"""
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User


def apply_user_claims(token, user):
    """Attach EduTask user metadata to a SimpleJWT token instance."""
    token['email'] = user.email
    token['role'] = user.role
    token['nama_lengkap'] = user.nama_lengkap
    token['tipe_akun'] = user.tipe_akun
    token['is_email_verified'] = user.is_email_verified
    return token


def build_auth_tokens(user):
    """Create refresh/access pair with consistent custom claims."""
    refresh = RefreshToken.for_user(user)
    apply_user_claims(refresh, user)
    apply_user_claims(refresh.access_token, user)
    return {
        'access': str(refresh.access_token),
        'refresh': str(refresh),
    }
