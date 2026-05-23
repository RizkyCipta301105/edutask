from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.contrib.auth import get_user_model
from apps.common.utils import success_response, validation_error_response
from .models import ChatThread, Message
from .serializers import UserContactSerializer, ChatThreadSerializer, MessageSerializer

User = get_user_model()

class ContactListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        role = user.role

        if role == User.Role.UMUM:
            queryset = User.objects.filter(role=User.Role.UMUM, is_active=True).exclude(id=user.id)
        elif role in [User.Role.DOSEN, User.Role.MAHASISWA]:
            queryset = User.objects.filter(
                role__in=[User.Role.DOSEN, User.Role.MAHASISWA],
                is_active=True
            ).exclude(id=user.id)
        else:
            queryset = User.objects.filter(is_active=True).exclude(id=user.id)

        serializer = UserContactSerializer(queryset, many=True)
        return success_response(data=serializer.data, message='Daftar kontak berhasil diambil.')

class ThreadListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        threads = ChatThread.objects.filter(participants=request.user)
        serializer = ChatThreadSerializer(threads, many=True, context={'request': request})
        return success_response(data=serializer.data, message='Daftar percakapan berhasil diambil.')

    def post(self, request):
        participant_ids = request.data.get('participants', [])
        title = request.data.get('title', '')
        
        if not isinstance(participant_ids, list):
            return validation_error_response({'participants': ['Harus berupa list ID pengguna.']})

        participant_ids.append(str(request.user.id))
        participant_ids = list(set(participant_ids))

        if len(participant_ids) < 2:
            return validation_error_response({'participants': ['Percakapan harus melibatkan minimal 2 orang.']})

        users = User.objects.filter(id__in=participant_ids)
        if len(users) != len(participant_ids):
            return validation_error_response({'participants': ['Beberapa ID pengguna tidak valid.']})

        if len(participant_ids) == 2:
            threads = ChatThread.objects.filter(participants=request.user).filter(is_group=False)
            for t in threads:
                if t.participants.count() == 2 and t.participants.filter(id=participant_ids[0]).exists() and t.participants.filter(id=participant_ids[1]).exists():
                    serializer = ChatThreadSerializer(t, context={'request': request})
                    return success_response(data=serializer.data, message='Percakapan sudah ada.')

        is_group = len(participant_ids) > 2
        thread = ChatThread.objects.create(title=title, is_group=is_group)
        thread.participants.set(users)
        
        serializer = ChatThreadSerializer(thread, context={'request': request})
        return success_response(data=serializer.data, message='Percakapan berhasil dibuat.', status_code=status.HTTP_201_CREATED)

class MessageListCreateView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_thread(self, pk, user):
        try:
            return ChatThread.objects.get(pk=pk, participants=user)
        except ChatThread.DoesNotExist:
            return None

    def get(self, request, thread_id):
        thread = self.get_thread(thread_id, request.user)
        if not thread:
            return validation_error_response({'detail': ['Percakapan tidak ditemukan.']}, status_code=status.HTTP_404_NOT_FOUND)
            
        messages = thread.messages.all()
        serializer = MessageSerializer(messages, many=True, context={'request': request})
        return success_response(data=serializer.data, message='Pesan berhasil diambil.')

    def post(self, request, thread_id):
        thread = self.get_thread(thread_id, request.user)
        if not thread:
            return validation_error_response({'detail': ['Percakapan tidak ditemukan.']}, status_code=status.HTTP_404_NOT_FOUND)

        serializer = MessageSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save(thread=thread)
            thread.save()
            return success_response(data=serializer.data, message='Pesan berhasil dikirim.', status_code=status.HTTP_201_CREATED)
        return validation_error_response(serializer.errors)

class MarkReadView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, thread_id):
        try:
            thread = ChatThread.objects.get(pk=thread_id, participants=request.user)
        except ChatThread.DoesNotExist:
            return validation_error_response({'detail': ['Percakapan tidak ditemukan.']}, status_code=status.HTTP_404_NOT_FOUND)

        thread.messages.exclude(sender=request.user).update(is_read=True)
        return success_response(message='Pesan telah ditandai dibaca.')

class MessageDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_message(self, thread_id, message_id, user):
        try:
            thread = ChatThread.objects.get(pk=thread_id, participants=user)
            return Message.objects.get(pk=message_id, thread=thread, sender=user)
        except (ChatThread.DoesNotExist, Message.DoesNotExist):
            return None

    def patch(self, request, thread_id, message_id):
        message = self.get_message(thread_id, message_id, request.user)
        if not message:
            return validation_error_response({'detail': ['Pesan tidak ditemukan atau Anda bukan pengirimnya.']}, status_code=status.HTTP_404_NOT_FOUND)
        
        text = request.data.get('text')
        if not text:
            return validation_error_response({'text': ['Teks pesan tidak boleh kosong.']})
            
        message.text = text
        message.is_edited = True
        message.save()
        
        serializer = MessageSerializer(message, context={'request': request})
        return success_response(data=serializer.data, message='Pesan berhasil diedit.')

    def delete(self, request, thread_id, message_id):
        message = self.get_message(thread_id, message_id, request.user)
        if not message:
            return validation_error_response({'detail': ['Pesan tidak ditemukan atau Anda bukan pengirimnya.']}, status_code=status.HTTP_404_NOT_FOUND)
            
        message.delete()
        return success_response(message='Pesan berhasil dihapus.')

class MessageReactView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, thread_id, message_id):
        try:
            thread = ChatThread.objects.get(pk=thread_id, participants=request.user)
            message = Message.objects.get(pk=message_id, thread=thread)
        except (ChatThread.DoesNotExist, Message.DoesNotExist):
            return validation_error_response({'detail': ['Pesan tidak ditemukan.']}, status_code=status.HTTP_404_NOT_FOUND)
            
        emoji = request.data.get('emoji')
        if not emoji:
            return validation_error_response({'emoji': ['Emoji wajib diisi.']})
            
        user_id = str(request.user.id)
        reactions = message.reactions.copy()
        
        if emoji in reactions:
            if user_id in reactions[emoji]:
                reactions[emoji].remove(user_id)
                if not reactions[emoji]:
                    del reactions[emoji]
            else:
                reactions[emoji].append(user_id)
        else:
            reactions[emoji] = [user_id]
            
        message.reactions = reactions
        message.save()
        
        serializer = MessageSerializer(message, context={'request': request})
        return success_response(data=serializer.data, message='Reaksi berhasil diperbarui.')
