from django.apps import AppConfig


class TasksConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.tasks'

    def ready(self):
        # Jalankan scheduler saat Django start (hanya di proses utama, bukan reloader)
        import os
        if os.environ.get('RUN_MAIN') == 'true':
            from apps.tasks.scheduler import start
            start()
