from django.urls import path
from . import views

urlpatterns = [
    path('', views.JadwalKuliahListCreateView.as_view(), name='jadwal-list'),
    path('<uuid:pk>/', views.JadwalKuliahDetailView.as_view(), name='jadwal-detail'),
]
