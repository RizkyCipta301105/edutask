from django.core.management.base import BaseCommand
from django.utils import timezone
from django.conf import settings
from datetime import timedelta
from apps.tasks.models import Task, Notification
from apps.common.email_utils import send_email


def send_reminder_email(user, subject, message):
    """Kirim email reminder ke user via Resend HTTP API."""
    if not user.email:
        return
    send_email(subject=subject, message=message, recipient_email=user.email, recipient_name=user.nama_lengkap)


def already_emailed_today(task, email_title):
    """Cek apakah email sudah dikirim hari ini untuk task ini."""
    today = timezone.now().date()
    return Notification.objects.filter(
        task=task,
        title=email_title,
        created_at__date=today,
    ).exists()


class Command(BaseCommand):
    help = 'Cek deadline task dan kirim notifikasi + email reminder ke user'

    def handle(self, *args, **options):
        today = timezone.now().date()
        tomorrow = today + timedelta(days=1)
        in_3_days = today + timedelta(days=3)

        count_h3 = count_h1 = count_overdue = 0

        # ── 1. Reminder H-3 ──────────────────────────────────────────────────
        for task in Task.objects.filter(
            deadline=in_3_days
        ).exclude(status=Task.Status.DONE).select_related('user'):

            notif_title = 'Pengingat Deadline: H-3'
            email_title = f'[EMAIL] {notif_title}'

            if not Notification.objects.filter(task=task, title=notif_title).exists():
                Notification.objects.create(
                    user=task.user, task=task, title=notif_title,
                    message=f'Task "{task.judul}" harus diselesaikan dalam 3 hari lagi.'
                )

            if not already_emailed_today(task, email_title):
                Notification.objects.create(
                    user=task.user, task=task, title=email_title,
                    message=f'[Email terkirim] Reminder H-3 untuk "{task.judul}".',
                    is_read=True,
                )
                send_reminder_email(
                    task.user,
                    subject=f'[EduTask] ⏰ Pengingat: "{task.judul}" — 3 Hari Lagi',
                    message=(
                        f'Halo {task.user.nama_lengkap},\n\n'
                        f'Pengingat: task berikut akan jatuh tempo dalam 3 hari:\n\n'
                        f'  Judul   : {task.judul}\n'
                        f'  Deadline: {task.deadline.strftime("%d %B %Y")}\n'
                        f'  Status  : {task.get_status_display()}\n\n'
                        f'Segera selesaikan sebelum deadline!\n\n— EduTask'
                    )
                )
                count_h3 += 1

        # ── 2. Reminder H-1 ──────────────────────────────────────────────────
        for task in Task.objects.filter(
            deadline=tomorrow
        ).exclude(status=Task.Status.DONE).select_related('user'):

            notif_title = 'Pengingat Deadline: H-1'
            email_title = f'[EMAIL] {notif_title}'

            if not Notification.objects.filter(task=task, title=notif_title).exists():
                Notification.objects.create(
                    user=task.user, task=task, title=notif_title,
                    message=f'Task "{task.judul}" harus diselesaikan paling lambat besok.'
                )

            if not already_emailed_today(task, email_title):
                Notification.objects.create(
                    user=task.user, task=task, title=email_title,
                    message=f'[Email terkirim] Reminder H-1 untuk "{task.judul}".',
                    is_read=True,
                )
                send_reminder_email(
                    task.user,
                    subject=f'[EduTask] ⚠️ Deadline Besok: "{task.judul}"',
                    message=(
                        f'Halo {task.user.nama_lengkap},\n\n'
                        f'PERHATIAN! Task berikut akan jatuh tempo BESOK:\n\n'
                        f'  Judul   : {task.judul}\n'
                        f'  Deadline: {task.deadline.strftime("%d %B %Y")}\n'
                        f'  Status  : {task.get_status_display()}\n\n'
                        f'Jangan sampai terlambat!\n\n— EduTask'
                    )
                )
                count_h1 += 1

        # ── 3. Overdue ───────────────────────────────────────────────────────
        for task in Task.objects.filter(
            deadline__lt=today
        ).exclude(status=Task.Status.DONE).select_related('user'):

            notif_title = 'Peringatan: Task Overdue!'
            email_title = f'[EMAIL] {notif_title}'

            if not Notification.objects.filter(task=task, title=notif_title).exists():
                Notification.objects.create(
                    user=task.user, task=task, title=notif_title,
                    message=f'Task "{task.judul}" telah melewati batas waktu deadline dan belum selesai.'
                )

            if not already_emailed_today(task, email_title):
                Notification.objects.create(
                    user=task.user, task=task, title=email_title,
                    message=f'[Email terkirim] Overdue reminder untuk "{task.judul}".',
                    is_read=True,
                )
                send_reminder_email(
                    task.user,
                    subject=f'[EduTask] 🔴 Task Overdue: "{task.judul}"',
                    message=(
                        f'Halo {task.user.nama_lengkap},\n\n'
                        f'Task berikut telah MELEWATI deadline dan belum diselesaikan:\n\n'
                        f'  Judul   : {task.judul}\n'
                        f'  Deadline: {task.deadline.strftime("%d %B %Y")}\n'
                        f'  Status  : {task.get_status_display()}\n\n'
                        f'Segera selesaikan atau hubungi dosen/pengajar terkait.\n\n— EduTask'
                    )
                )
                count_overdue += 1

        self.stdout.write(
            self.style.SUCCESS(
                f'Selesai! H-3: {count_h3} | H-1: {count_h1} | Overdue: {count_overdue} email terkirim.'
            )
        )
