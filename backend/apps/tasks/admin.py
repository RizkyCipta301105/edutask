from django.contrib import admin
from .models import Task, MataKuliah


@admin.register(MataKuliah)
class MataKuliahAdmin(admin.ModelAdmin):
    list_display  = ['nama', 'nama_dosen', 'user', 'created_at']
    search_fields = ['nama', 'user__email']
    list_filter   = ['created_at']


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display  = ['judul', 'status', 'prioritas', 'deadline', 'user', 'mata_kuliah', 'is_overdue']
    list_filter   = ['status', 'prioritas', 'created_at']
    search_fields = ['judul', 'user__email']
    ordering      = ['deadline', 'prioritas']
    readonly_fields = ['created_at', 'updated_at']
