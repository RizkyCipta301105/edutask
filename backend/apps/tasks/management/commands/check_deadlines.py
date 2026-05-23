from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from apps.tasks.models import Task, Notification

class Command(BaseCommand):
    help = 'Cek deadline task dan buat notifikasi pengingat untuk user'

    def handle(self, *args, **options):
        today = timezone.now().date()
        tomorrow = today + timedelta(days=1)

        # 1. Cek Deadline H-1 (Besok)
        tasks_h1 = Task.objects.filter(
            deadline=tomorrow,
        ).exclude(status=Task.Status.DONE)

        count_h1 = 0
        for task in tasks_h1:
            # Cegah duplikasi notifikasi H-1
            title = 'Pengingat Deadline: H-1'
            if not Notification.objects.filter(task=task, title=title).exists():
                Notification.objects.create(
                    user=task.user,
                    task=task,
                    title=title,
                    message=f'Task "{task.judul}" harus diselesaikan paling lambat besok.'
                )
                count_h1 += 1

        # 2. Cek Overdue (Lewat Deadline)
        tasks_overdue = Task.objects.filter(
            deadline__lt=today,
        ).exclude(status=Task.Status.DONE)

        count_overdue = 0
        for task in tasks_overdue:
            title = 'Peringatan: Task Overdue!'
            if not Notification.objects.filter(task=task, title=title).exists():
                Notification.objects.create(
                    user=task.user,
                    task=task,
                    title=title,
                    message=f'Task "{task.judul}" telah melewati batas waktu deadline dan belum selesai.'
                )
                count_overdue += 1

        self.stdout.write(
            self.style.SUCCESS(
                f'Selesai! Dibuat {count_h1} notif H-1 dan {count_overdue} notif Overdue.'
            )
        )
