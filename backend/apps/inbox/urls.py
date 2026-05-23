from django.urls import path
from . import views

urlpatterns = [
    path('contacts/', views.ContactListView.as_view(), name='inbox-contacts'),
    path('threads/', views.ThreadListCreateView.as_view(), name='inbox-threads'),
    path('threads/<uuid:thread_id>/messages/', views.MessageListCreateView.as_view(), name='message-list'),
    path('threads/<uuid:thread_id>/messages/<uuid:message_id>/', views.MessageDetailView.as_view(), name='message-detail'),
    path('threads/<uuid:thread_id>/messages/<uuid:message_id>/react/', views.MessageReactView.as_view(), name='message-react'),
    path('threads/<uuid:thread_id>/read/', views.MarkReadView.as_view(), name='inbox-mark-read'),
]
