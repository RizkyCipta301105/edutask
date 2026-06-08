"""
Reusable DRF permission classes and throttle classes for EduTask.
"""
from rest_framework.permissions import BasePermission
from rest_framework.throttling import AnonRateThrottle, UserRateThrottle


# ─── Throttle Classes ────────────────────────────────────────────────────────

class LoginRateThrottle(AnonRateThrottle):
    """Max 10 percobaan login per menit per IP."""
    scope = 'login'
    rate = '10/min'


class RegisterRateThrottle(AnonRateThrottle):
    """Max 5 registrasi per menit per IP."""
    scope = 'register'
    rate = '5/min'


class PasswordResetRateThrottle(AnonRateThrottle):
    """Max 5 permintaan reset password per jam per IP."""
    scope = 'password_reset'
    rate = '5/hour'


class GoogleLoginRateThrottle(AnonRateThrottle):
    """Max 10 percobaan Google login per menit per IP."""
    scope = 'google_login'
    rate = '10/min'


class ChangePasswordRateThrottle(UserRateThrottle):
    """Max 5 ganti password per jam per user."""
    scope = 'change_password'
    rate = '5/hour'


# ─── Permission Classes ───────────────────────────────────────────────────────

class IsRole(BasePermission):
    """
    Allow only authenticated users whose `role` is in allowed_roles.

    Set on a view: permission_classes = [IsAuthenticated, IsRole]
    allowed_roles = ('mahasiswa',)
    """

    allowed_roles = ()

    def has_permission(self, request, view):
        roles = getattr(view, 'allowed_roles', None) or self.allowed_roles
        if not roles:
            return False
        user = request.user
        return bool(
            user
            and user.is_authenticated
            and getattr(user, 'role', None) in roles
        )


class IsMahasiswa(IsRole):
    allowed_roles = ('mahasiswa',)


class IsDosen(IsRole):
    allowed_roles = ('dosen',)


class IsUmum(IsRole):
    allowed_roles = ('umum',)
