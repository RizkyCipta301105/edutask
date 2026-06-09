from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User
from django.contrib.auth.models import Group

# Unregister Group (not used in EduTask)
admin.site.unregister(Group)

# Try to unregister 3rd party apps to clean up admin interface
try:
    from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken, OutstandingToken
    admin.site.unregister(BlacklistedToken)
    admin.site.unregister(OutstandingToken)
except Exception:
    pass

try:
    from django_apscheduler.models import DjangoJobExecution, DjangoJob
    admin.site.unregister(DjangoJobExecution)
    admin.site.unregister(DjangoJob)
except Exception:
    pass


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['email', 'nama_lengkap', 'role', 'tipe_akun', 'is_active', 'tanggal_daftar']
    list_filter = ['role', 'tipe_akun', 'is_active', 'is_email_verified', 'is_staff']
    search_fields = ['email', 'nama_lengkap', 'prodi', 'mata_kuliah']
    ordering = ['-tanggal_daftar']

    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Informasi Pribadi', {'fields': ('nama_lengkap', )}),
        ('Role & Data Akademik', {'fields': ('role', 'prodi', 'mata_kuliah')}),
        ('Tipe & Status Akun', {'fields': ('tipe_akun', 'is_active', 'is_email_verified')}),
        ('Hak Akses', {'fields': ('is_staff', 'is_superuser', 'user_permissions')}),
        ('Timestamps', {'fields': ('tanggal_daftar', 'last_login')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'nama_lengkap', 'role', 'tipe_akun', 'password1', 'password2'),
        }),
    )
    readonly_fields = ['tanggal_daftar', 'last_login']
