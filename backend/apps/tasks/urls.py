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
]
