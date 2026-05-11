"""
EduTask Authentication URL Patterns
Base: /api/auth/
"""
from django.urls import path
from . import views

urlpatterns = [
    # Register & Login
    path('register/', views.RegisterView.as_view(), name='auth-register'),
    path('register/mahasiswa', views.RegisterMahasiswaView.as_view(), name='auth-register-mahasiswa'),
    path('register/mahasiswa/', views.RegisterMahasiswaView.as_view(), name='auth-register-mahasiswa-slash'),
    path('register/dosen', views.RegisterDosenView.as_view(), name='auth-register-dosen'),
    path('register/dosen/', views.RegisterDosenView.as_view(), name='auth-register-dosen-slash'),
    path('register/umum', views.RegisterUmumView.as_view(), name='auth-register-umum'),
    path('register/umum/', views.RegisterUmumView.as_view(), name='auth-register-umum-slash'),
    path('login', views.LoginView.as_view(), name='auth-login-no-slash'),
    path('login/', views.LoginView.as_view(), name='auth-login'),
    path('logout/', views.LogoutView.as_view(), name='auth-logout'),

    # Token management
    path('token/refresh/', views.TokenRefreshView.as_view(), name='token-refresh'),

    # Profile
    path('profile/', views.ProfileView.as_view(), name='auth-profile'),
    path('change-password/', views.ChangePasswordView.as_view(), name='auth-change-password'),
]
