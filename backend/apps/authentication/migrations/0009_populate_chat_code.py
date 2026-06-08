# Migration: Generate chat_code untuk semua user yang belum memilikinya
# Diperlukan karena migration 0007 hanya menambah field nullable,
# tidak mengisi data untuk user yang sudah ada.

import random
import string
from django.db import migrations


def generate_unique_code(existing_codes):
    """Generate kode 6 karakter unik yang belum ada di set existing_codes."""
    chars = string.ascii_uppercase + string.digits
    while True:
        code = ''.join(random.choices(chars, k=6))
        if code not in existing_codes:
            return code


def populate_chat_codes(apps, schema_editor):
    User = apps.get_model('authentication', 'User')
    existing_codes = set(
        User.objects.exclude(chat_code__isnull=True)
                    .exclude(chat_code='')
                    .values_list('chat_code', flat=True)
    )

    users_without_code = User.objects.filter(chat_code__isnull=True) | \
                         User.objects.filter(chat_code='')

    to_update = []
    for user in users_without_code:
        code = generate_unique_code(existing_codes)
        existing_codes.add(code)
        user.chat_code = code
        to_update.append(user)

    if to_update:
        User.objects.bulk_update(to_update, ['chat_code'])


def reverse_populate(apps, schema_editor):
    # Tidak perlu rollback — biarkan kode tetap ada
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('authentication', '0008_remove_user_nip_remove_user_nrp'),
    ]

    operations = [
        migrations.RunPython(populate_chat_codes, reverse_populate),
    ]
