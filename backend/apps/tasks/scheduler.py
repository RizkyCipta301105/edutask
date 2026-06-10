"""
EduTask Reminder Scheduler
Menggunakan APScheduler via django_apscheduler untuk menjalankan
check_deadlines 4x sehari: 07:00, 12:00, 17:00, 21:00 WIB.

Deduplication: email hanya terkirim SEKALI per hari per task per tipe reminder.
In-app notification tetap dibuat sekali selamanya (tidak duplikat).

Diaktifkan dari apps/tasks/apps.py → ready()
"""
import logging
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from django_apscheduler.jobstores import DjangoJobStore
from django_apscheduler.models import DjangoJobExecution
from django.conf import settings

logger = logging.getLogger(__name__)


def _send_email(user, subject, message):
    """Kirim email ke user via Resend HTTP API."""
    if not user.email:
        return
    try:
        import requests as req
        api_key = getattr(settings, 'RESEND_API_KEY', None)
        if not api_key:
            logger.error("RESEND_API_KEY tidak dikonfigurasi.")
            return
        url = "https://api.resend.com/emails"
        payload = {
            "from": f"EduTask <{settings.EMAIL_HOST_USER}>",
            "to": [user.email],
            "subject": subject,
            "text": message,
        }
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }
        resp = req.post(url, json=payload, headers=headers, timeout=15)
        if resp.status_code not in (200, 201):
            logger.error(f"Resend API error {resp.status_code}: {resp.text}")
    except Exception as e:
        logger.error(f"Email failed to send: {e}")


def _already_emailed_today(task, email_title):
    """
    Cek apakah email dengan judul ini sudah dikirim hari ini untuk task ini.
    Menggunakan Notification sebagai log — cek created_at__date == today.
    """
    from django.utils import timezone
    from apps.tasks.models import Notification
    today = timezone.now().date()
    return Notification.objects.filter(
        task=task,
        title=email_title,
        created_at__date=today,
    ).exists()


def run_check_deadlines():
    """
    Cek deadline task dan kirim:
    - In-app Notification (sekali selamanya per tipe per task)
    - Email reminder (sekali per hari per tipe per task)

    Dipanggil 4x sehari: 07:00, 12:00, 17:00, 21:00 WIB.
    """
    try:
        from django.utils import timezone
        from datetime import timedelta
        from apps.tasks.models import Task, Notification

        today = timezone.now().date()
        tomorrow = today + timedelta(days=1)
        in_3_days = today + timedelta(days=3)

        count = {'h3': 0, 'h1': 0, 'overdue': 0}

        # ── H-3 ──────────────────────────────────────────────────────────
        for task in Task.objects.filter(
            deadline=in_3_days
        ).exclude(status=Task.Status.DONE).select_related('user'):

            notif_title = 'Pengingat Deadline: H-3'
            email_title = f'[EMAIL] {notif_title}'

            # In-app: buat sekali selamanya
            if not Notification.objects.filter(task=task, title=notif_title).exists():
                Notification.objects.create(
                    user=task.user, task=task, title=notif_title,
                    message=f'Task "{task.judul}" harus diselesaikan dalam 3 hari lagi.'
                )

            # Email: kirim sekali per hari
            if not _already_emailed_today(task, email_title):
                Notification.objects.create(
                    user=task.user, task=task, title=email_title,
                    message=f'[Email terkirim] Reminder H-3 untuk "{task.judul}".',
                    is_read=True,  # Tidak muncul di dropdown notifikasi user
                )
                _send_email(
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
                count['h3'] += 1

        # ── H-1 ──────────────────────────────────────────────────────────
        for task in Task.objects.filter(
            deadline=tomorrow
        ).exclude(status=Task.Status.DONE).select_related('user'):

            notif_title = 'Pengingat Deadline: H-1'
            email_title = f'[EMAIL] {notif_title}'

            # In-app: buat sekali selamanya
            if not Notification.objects.filter(task=task, title=notif_title).exists():
                Notification.objects.create(
                    user=task.user, task=task, title=notif_title,
                    message=f'Task "{task.judul}" harus diselesaikan paling lambat besok.'
                )

            # Email: kirim sekali per hari
            if not _already_emailed_today(task, email_title):
                Notification.objects.create(
                    user=task.user, task=task, title=email_title,
                    message=f'[Email terkirim] Reminder H-1 untuk "{task.judul}".',
                    is_read=True,
                )
                _send_email(
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
                count['h1'] += 1

        # ── Overdue ───────────────────────────────────────────────────────
        for task in Task.objects.filter(
            deadline__lt=today
        ).exclude(status=Task.Status.DONE).select_related('user'):

            notif_title = 'Peringatan: Task Overdue!'
            email_title = f'[EMAIL] {notif_title}'

            # In-app: buat sekali selamanya
            if not Notification.objects.filter(task=task, title=notif_title).exists():
                Notification.objects.create(
                    user=task.user, task=task, title=notif_title,
                    message=f'Task "{task.judul}" telah melewati batas waktu deadline dan belum selesai.'
                )

            # Email: kirim sekali per hari
            if not _already_emailed_today(task, email_title):
                Notification.objects.create(
                    user=task.user, task=task, title=email_title,
                    message=f'[Email terkirim] Overdue reminder untuk "{task.judul}".',
                    is_read=True,
                )
                _send_email(
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
                count['overdue'] += 1

        logger.info(
            f'[EduTask Scheduler] check_deadlines selesai — '
            f'H-3: {count["h3"]} | H-1: {count["h1"]} | Overdue: {count["overdue"]} email terkirim.'
        )

    except Exception as exc:
        logger.exception(f'[EduTask Scheduler] Error saat check_deadlines: {exc}')


def delete_old_job_executions(max_age=604_800):
    """Hapus log eksekusi APScheduler yang lebih dari 7 hari (604800 detik)."""
    DjangoJobExecution.objects.delete_old_job_executions(max_age)


def start():
    """
    Inisialisasi dan jalankan scheduler.
    Dipanggil dari TasksConfig.ready() agar hanya berjalan sekali.
    """
    scheduler = BackgroundScheduler(timezone=settings.TIME_ZONE)
    scheduler.add_jobstore(DjangoJobStore(), 'default')

    # Jalankan check_deadlines 4x sehari: 07:00, 12:00, 17:00, 21:00 WIB
    scheduler.add_job(
        run_check_deadlines,
        trigger=CronTrigger(hour='7,12,17,21', minute=0),
        id='check_deadlines_4x_daily',
        name='Check Deadlines & Send Reminders (4x/day)',
        jobstore='default',
        replace_existing=True,
    )

    # Bersihkan log lama setiap Senin pukul 00:00
    scheduler.add_job(
        delete_old_job_executions,
        trigger=CronTrigger(day_of_week='mon', hour=0, minute=0),
        id='delete_old_job_executions',
        name='Delete Old Job Executions',
        jobstore='default',
        replace_existing=True,
    )

    logger.info(
        '[EduTask Scheduler] Scheduler dimulai. '
        'check_deadlines berjalan 4x sehari: 07:00, 12:00, 17:00, 21:00 WIB.'
    )
    scheduler.start()
