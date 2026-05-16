"""
Base serializers and mixins for common validation logic.
"""
import re

from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.utils import timezone
from rest_framework import serializers

from apps.common.utils import validate_resource_ownership

HEX_COLOR_PATTERN = re.compile(r'^#[0-9A-Fa-f]{6}$')
SCHEDULE_TIME_PATTERN = re.compile(r'^\d{2}:\d{2}\s*-\s*\d{2}:\d{2}$')


def sanitize_collapsed_whitespace(value):
    """Collapse repeated whitespace and strip ends."""
    return ' '.join(str(value).split())


def sanitize_optional_text(value):
    """Strip optional text fields; empty string stays empty."""
    if value is None:
        return value
    return value.strip()


def validate_non_empty_text(value, field_label):
    """Strip text and reject empty values with a consistent message."""
    cleaned = value.strip() if value is not None else ''
    if not cleaned:
        raise serializers.ValidationError(f'{field_label} tidak boleh kosong.')
    return cleaned


def validate_hex_color(value):
    """Validate 6-digit hex color codes (e.g. #1A2B3C)."""
    if not HEX_COLOR_PATTERN.fullmatch(value):
        raise serializers.ValidationError(
            'Warna harus berupa kode hex 6 digit yang valid (contoh: #1A2B3C).'
        )
    return value.upper()


def validate_schedule_jam(value):
    """Validate schedule time slot format (e.g. 08:00-10:00)."""
    cleaned = value.strip()
    if not cleaned:
        raise serializers.ValidationError('Jam jadwal tidak boleh kosong.')
    if not SCHEDULE_TIME_PATTERN.match(cleaned):
        raise serializers.ValidationError(
            'Format jam tidak valid. Gunakan format HH:MM-HH:MM (contoh: 08:00-10:00).'
        )
    return cleaned


class DatetimeValidationMixin:
    """Reusable deadline validation for task serializers."""

    def validate_deadline(self, value):
        if self.instance is None and value < timezone.now().date():
            raise serializers.ValidationError(
                'Deadline tidak boleh di masa lalu.'
            )
        return value


class OwnershipValidationMixin:
    """Validate that a related resource belongs to the authenticated user."""

    def validate_resource_owner(self, value, resource_name='Resource'):
        request = self.context.get('request')
        if request:
            return validate_resource_ownership(value, request, resource_name)
        return value


class NamaLengkapValidationMixin:
    """Sanitize and validate full name fields."""

    def validate_nama_lengkap(self, value):
        cleaned = sanitize_collapsed_whitespace(value)
        if not cleaned:
            raise serializers.ValidationError('Nama lengkap tidak boleh kosong.')
        return cleaned


class PasswordValidationMixin:
    """Django password policy validation for registration serializers."""

    def validate_password(self, value):
        try:
            validate_password(value)
        except DjangoValidationError as exc:
            raise serializers.ValidationError(list(exc.messages))
        return value


class TaskInputValidationMixin:
    """Shared judul/deskripsi/mata_kuliah rules for task serializers."""

    def validate_judul(self, value):
        return validate_non_empty_text(value, 'Judul task')

    def validate_deskripsi(self, value):
        return sanitize_optional_text(value)

    def validate_mata_kuliah(self, value):
        return self.validate_resource_owner(value, 'Mata kuliah')


class MataKuliahInputValidationMixin:
    """Shared nama/warna rules for mata kuliah serializers."""

    def validate_nama(self, value):
        cleaned = validate_non_empty_text(value, 'Nama mata kuliah')
        request = self.context.get('request')
        if not request:
            return cleaned

        from apps.tasks.models import MataKuliah

        qs = MataKuliah.objects.filter(user=request.user, nama__iexact=cleaned)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError('Mata kuliah dengan nama ini sudah ada.')
        return cleaned

    def validate_warna(self, value):
        return validate_hex_color(value)


class ScheduleInputValidationMixin:
    """Shared field rules for jadwal kuliah serializers."""

    def validate_jam(self, value):
        return validate_schedule_jam(value)

    def validate_ruangan(self, value):
        return validate_non_empty_text(value, 'Ruangan')

    def validate_dosen(self, value):
        return validate_non_empty_text(value, 'Nama dosen')

    def validate_mata_kuliah(self, value):
        return validate_non_empty_text(value, 'Nama mata kuliah')
