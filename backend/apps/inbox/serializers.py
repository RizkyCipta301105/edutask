from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import ChatThread, Message

User = get_user_model()

class UserContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'nama_lengkap', 'email', 'role']

class MessageSerializer(serializers.ModelSerializer):
    sender_detail = UserContactSerializer(source='sender', read_only=True)
    
    class Meta:
        model = Message
        fields = ['id', 'thread', 'sender', 'sender_detail', 'text', 'attachment', 'is_read', 'is_edited', 'reactions', 'created_at', 'updated_at']
        read_only_fields = ['id', 'thread', 'sender', 'is_read', 'is_edited', 'reactions', 'created_at', 'updated_at']

    def create(self, validated_data):
        validated_data['sender'] = self.context['request'].user
        return super().create(validated_data)

class ChatThreadSerializer(serializers.ModelSerializer):
    participants = UserContactSerializer(many=True, read_only=True)
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()

    class Meta:
        model = ChatThread
        fields = ['id', 'title', 'is_group', 'participants', 'last_message', 'unread_count', 'updated_at']

    def get_last_message(self, obj):
        request = self.context.get('request')
        messages = obj.messages.all()
        if request:
            from .models import ThreadClearHistory
            try:
                ch = ThreadClearHistory.objects.get(thread=obj, user=request.user)
                messages = messages.filter(created_at__gt=ch.cleared_at)
            except ThreadClearHistory.DoesNotExist:
                pass
        last = messages.order_by('-created_at').first()
        if last:
            return MessageSerializer(last, context=self.context).data
        return None

    def get_unread_count(self, obj):
        request = self.context.get('request')
        if not request:
            return 0
        messages = obj.messages.exclude(sender=request.user).filter(is_read=False)
        try:
            from .models import ThreadClearHistory
            ch = ThreadClearHistory.objects.get(thread=obj, user=request.user)
            messages = messages.filter(created_at__gt=ch.cleared_at)
        except ThreadClearHistory.DoesNotExist:
            pass
        return messages.count()
