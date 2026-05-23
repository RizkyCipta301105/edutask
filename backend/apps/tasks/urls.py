"""
EduTask Task URL Patterns
Base: /api/tasks/
"""
from django.urls import path
from . import views

urlpatterns = [
    # Mata Kuliah
    path('mata-kuliah/',        views.MataKuliahListCreateView.as_view(), name='mata-kuliah-list'),
    path('mata-kuliah/<uuid:pk>/', views.MataKuliahDetailView.as_view(),  name='mata-kuliah-detail'),

    # Task (FR-04, FR-05)
    path('',                    views.TaskListCreateView.as_view(), name='task-list'),
    path('<uuid:pk>/',          views.TaskDetailView.as_view(),     name='task-detail'),

    # Kanban (FR-07)
    path('kanban/',             views.KanbanBoardView.as_view(),   name='kanban-board'),
    path('<uuid:pk>/move/',     views.KanbanMoveView.as_view(),    name='kanban-move'),

    # Penugasan Dosen (Broadcast & Progress Tracker)
    path('penugasan/',          views.PenugasanDosenListCreateView.as_view(), name='penugasan-list'),
    path('penugasan/<uuid:pk>/', views.PenugasanDosenDetailView.as_view(), name='penugasan-detail'),
    path('penugasan/report/',   views.PenugasanReportView.as_view(), name='penugasan-report'),
    path('penugasan/<uuid:pk>/progress/', views.PenugasanProgressView.as_view(), name='penugasan-progress'),

    # Task Comments
    path('<uuid:pk>/comments/', views.TaskCommentListCreateView.as_view(), name='task-comments'),

    # Notifications (Using generic path since we are in /api/tasks/)
    path('notifications/', views.NotificationListView.as_view(), name='notification-list'),
    path('notifications/read/', views.NotificationMarkReadView.as_view(), name='notification-mark-all-read'),
    path('notifications/<uuid:pk>/read/', views.NotificationMarkReadView.as_view(), name='notification-mark-read'),
]
