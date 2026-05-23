import uuid
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class ChatThread(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255, blank=True, null=True, verbose_name='Judul Grup')
    is_group = models.BooleanField(default=False, verbose_name='Apakah Grup?')
    participants = models.ManyToManyField(User, related_name='chat_threads')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'inbox_thread'
        ordering = ['-updated_at']

    def __str__(self):
        if self.title:
            return self.title
        return f"Thread {self.id}"

class Message(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    thread = models.ForeignKey(ChatThread, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    text = models.TextField(blank=True, verbose_name='Isi Pesan')
    attachment = models.FileField(upload_to='chat_attachments/', blank=True, null=True)
    is_read = models.BooleanField(default=False)
    is_edited = models.BooleanField(default=False)
    reactions = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'inbox_message'
        ordering = ['created_at']

    def __str__(self):
        return f"Message from {self.sender.nama_lengkap} at {self.created_at}"
