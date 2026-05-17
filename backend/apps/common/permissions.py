"""
Reusable DRF permission classes for role-based access.
"""
from rest_framework.permissions import BasePermission


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
